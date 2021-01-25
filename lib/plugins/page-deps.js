const path = require('path')
const fs = require('fs-extra')
const precinct = require('precinct')
const utils = require('../utils')

module.exports = class PageDepsPlugin {

    constructor(ana) {
        this.ana = ana
        this.precinctCache = {}
        this.depCache = {}
        this.usingDepCache = {}
    }

    async run(onMessage) {
        let pageCount = 0
        await this.ana.asyncForEachPage(async item => {
            pageCount ++
        })

        let pageIndex = 0
        let depCount = 0
        const pageDeps = this.ana.result.pageDeps = { pkgs: {} }
        pageDeps.cache = this.usingDepCache
        await this.ana.asyncForEachPage(async item => {
            const pkg = pageDeps.pkgs[item.pkg] = pageDeps.pkgs[item.pkg] || { totalSize: 0, pages: {} }
            const depResult = await this.anaDeps(0, {}, item.file, item.page !== "app", (text) => {
                onMessage(`${pageIndex}/${pageCount} (${item.page}) ${depCount++} ${text}`)
            })
            pageIndex ++
            pkg.pages[item.page] = depResult
            if (depResult.deps.length > 0) {
                pkg.totalSize += depResult.deps.map(_ => _.totalSize).reduce((a, b) => a + b)
            }
        })

        onMessage(`done`)
    }

    getFileDeps(file, includeComps) {
        const base = this.ana.options.directory
        const fullFile = path.resolve(base, file)
        let deps = this.precinctCache[file]
        if (!deps) {
            deps = precinct(fs.readFileSync(fullFile, 'utf8')) || []
            this.precinctCache[file] = deps
        }
        deps = deps.map(dep => {
            const dir = path.dirname(fullFile)
            const depFullFile = path.resolve(dir, dep)
            return path.relative(base, depFullFile)
        })
        const jsonFile = fullFile.replace('.js', '.json')
        if (fs.existsSync(jsonFile) && includeComps) {
            const json = fs.readJSONSync(jsonFile)
            if (json && json.usingComponents) {
                Object.keys(json.usingComponents).map(key => {
                    const compPath = json.usingComponents[key]
                    if (compPath.indexOf('/') !== 0) {
                        throw new Error('Unsupported comp path: ' + compPath)
                    }
                    if (compPath.indexOf('/recursive/')) {
                        return
                    }
                    deps.push(compPath.substr(1) + '.js')
                })
            }
        }
        return deps
    }

    async anaDeps(depth, pageDepsCache, file, includeComps, onMessage, parent) {
        onMessage(file)

        const base = this.ana.options.directory
        const fullFile = path.join(base, file)
        const size = fs.statSync(fullFile).size

        if (this.depCache[file]) {
            this.usingDepCache[file] = this.depCache[file]
            let fileSize = size
            if (pageDepsCache[file]) {
                fileSize = 0
            } else {
                pageDepsCache[file] = this.depCache[file]
            }
            return {
                file,
                size,
                totalSize: fileSize,
                cache: true
            }
        }

        parent = (parent || []).slice(0)
        // 循环依赖
        if (parent.indexOf(file) !== -1) {
            return {
                file,
                size,
                totalSize: 0,
                recursive: true
            }
        }
        parent.push(file)

        let deps = this.getFileDeps(file, includeComps)
        for (let i=0; i<deps.length; i++) {
            const dep = deps[i]
            deps[i] = await this.anaDeps(depth + 1, pageDepsCache, dep, includeComps, onMessage, parent)
        }
    
        const depData = {
            file,
            size,
            totalSize: deps.length === 0 ? 0 : deps.map(_ => _.totalSize).reduce((a, b) => a + b),
            deps
        }
        this.depCache[file] = depData
        return depData
    }

}