const path = require('path')
const fs = require('fs-extra')
const precinct = require('precinct')
const utils = require('../utils')

module.exports = class PageDepsPlugin {

    constructor(ana) {
        this.ana = ana
        this.precinctCache = {}
        this.depCache = {}
        this.mainDepCache = {}
        this.usingDepCache = {}
        this.currentPkg = 'main'
    }

    async run(onMessage) {
        let works = 0
        const pageDeps = this.ana.result.pageDeps = {
            pkgs: {
                main: {
                    totalSize: 0,
                    app: null,
                    pages: {},
                }
            }
        }
        const pkgDepCacheMap = { main: {} }

        // app.js
        const appDepResult = await this.anaAppJsDeps(pkgDepCacheMap.main, (text) => {
            works ++
            onMessage(`${works} (app.js) ${text}`)
        })
        pageDeps.pkgs.main.app = appDepResult
        pageDeps.pkgs.main.totalSize += appDepResult.totalSize



        // pages
        let pageProgress = 0
        let totalPage = 0
        await this.ana.asyncForEachPage(_ => {
            totalPage ++
        })
        pageDeps.cache = this.usingDepCache
        await this.ana.asyncForEachPage(async item => {
            const pkg = pageDeps.pkgs[item.pkg] = pageDeps.pkgs[item.pkg] || { totalSize: 0, pages: {} }
            const pkgDepCache = pkgDepCacheMap[item.pkg] || {}
            this.currentPkg = pkg
            pkgDepCacheMap[item.pkg] = pkgDepCache
            const pageResult = await this.anaPageDeps(item, pkgDepCache, (text) => {
                onMessage(`${pageProgress}/${totalPage} ${works++} (${item.page})  ${text}`)
            })
            pkg.pages[item.page] = pageResult
            pkg.totalSize += pageResult.totalSize
            pageProgress ++
        })

        onMessage(`done`)
    }

    async anaAppJsDeps(pkgDepCache, onMessage) {
        return this.anaDeps('app.js', pkgDepCache, null, [], onMessage)
    }

    async anaPageDeps(pageData, pkgDepCache, onMessage) {
        const pageNode = {
            file: pageData.file,
            page: true,
            deps: [],
            totalSize: 0,
        }
        const subFiles = this.getComponentFiles(pageData.file)
        const result = await this.anaListDeps(subFiles, pkgDepCache, pageNode, [], onMessage)
        pageNode.deps = result || []
        if (result.length > 0) {
            pageNode.totalSize = this.computeTotalSize(pageNode)
        }
        return pageNode
    }

    async anaComponentDeps(file, pkgDepCache, parentNode, parentDeps, onMessage) {
        onMessage(file)

        const componentNode = {
            file,
            component: true,
            deps: [],
            totalSize: 0,
            cache: false
        }

        const depCacheItem = this.getDepCacheData(file, pkgDepCache, 0)
        if (depCacheItem) {
            componentNode.cache = true
            componentNode.mainDep = depCacheItem.mainDep
            componentNode.totalSize = depCacheItem.totalSize
            return componentNode
        }

        const subFiles = this.getComponentFiles(file)
        const result = await this.anaListDeps(subFiles, pkgDepCache, componentNode, parentDeps, onMessage)
        componentNode.deps = result || []
        if (result.length > 0) {
            componentNode.totalSize = this.computeTotalSize(componentNode)
        }
        this.depCache[file] = componentNode
        if (this.currentPkg === 'main') {
            this.mainDepCache[file] = componentNode
        }
        return componentNode
    }

    async anaListDeps(list, pkgDepCache, parentNode, parentDeps, onMessage) {
        let result = []
        for (let i=0; i<list.length; i++) {
            const file = list[i]
            result[i] = await this.anaDeps(file, pkgDepCache, parentNode, parentDeps, onMessage)
        }
        return result
    }

    async anaDeps(file, pkgDepCache, parentNode, parentDeps, onMessage) {

        // component
        if (file === 'usingComponents') {
            onMessage(parentNode.file + ' ' + file)
            const usingComponentsNode = {
                file,
                usingComponents: true,
                deps: [],
                totalSize: 0,
            }

            const usingComponents = this.getUsingComponents(parentNode.file)
            let result = []
            for (let i=0; i<usingComponents.length; i++) {
                const file = usingComponents[i]
                result[i] = await this.anaComponentDeps(file, pkgDepCache, usingComponentsNode, parentDeps, onMessage)
            }
            usingComponentsNode.deps = result || []
            if (result.length > 0) {
                usingComponentsNode.totalSize = this.computeTotalSize(usingComponentsNode)
            }
            return usingComponentsNode
        }


        onMessage(file)

        const base = this.ana.options.directory
        const fullFile = path.join(base, file)
        let newFullFile = fullFile
        let newFile = file

        if (fs.existsSync(newFullFile) && fs.statSync(newFullFile).isDirectory()) {
            newFullFile = fullFile + '/index.js'
            newFile = file + '/index.js'
        }

        if (!fs.existsSync(newFullFile)) {
            newFullFile = fullFile + '.js'
            newFile = file + '.js'
        }

        if (!fs.existsSync(newFullFile)) {
            return {
                file,
                size: 0,
                totalSize: 0,
                noExists: true,
                deps: []
            }
        }

        file = newFile

        const size = fs.statSync(newFullFile).size

        const depCacheItem = this.getDepCacheData(file, pkgDepCache, size)
        if (depCacheItem) {
            return depCacheItem
        }

        parentDeps = (parentDeps || []).slice(0)
        // 循环依赖
        if (parentDeps.indexOf(file) !== -1) {
            return {
                file,
                size,
                totalSize: 0,
                recursive: true,
            }
        }
        parentDeps.push(file)

        const depData = {
            file,
            size,
            totalSize: 0,
            deps: [],
        }

        let deps = this.getFileDeps(file)
        for (let i=0; i<deps.length; i++) {
            const dep = deps[i]
            deps[i] = await this.anaDeps(dep, pkgDepCache, depData, parentDeps, onMessage)
        }
        depData.deps = deps
        depData.totalSize = size + this.computeTotalSize(depData)
        pkgDepCache[file] = depData
        this.depCache[file] = depData
        if (this.currentPkg === 'main') {
            this.mainDepCache[file] = depData
        }
        return depData
    }

    getDepCacheData(file, pkgDepCache, size) {
        const depCacheItem = this.depCache[file]
        if (depCacheItem) {
            this.usingDepCache[file] = depCacheItem
            let totalSize = 0
            let isMainDep = false
            if (pkgDepCache[file]) {
                totalSize = 0
            } else {
                pkgDepCache[file] = depCacheItem
                totalSize = size
                
            }
            if (this.currentPkg !== 'main' && this.mainDepCache[file]) {
                totalSize = 0
                isMainDep = true
            } 
            return {
                file,
                totalSize: totalSize,
                cache: true,
                mainDep: isMainDep
            }
        }
    }
    
    computeTotalSize(node) {
        if (node.deps.length === 0) {
            return 0
        }
        return node.deps.map(_ => _.totalSize).reduce((a, b) => a + b)
    }

    getComponentFiles(file) {
        const base = this.ana.options.directory
        const fullFile = path.resolve(base, file)
        const jsonFile = fullFile + '.json'
        const wxmlFile = fullFile + '.wxml'
        const wxssFile = fullFile + '.wxss'
        const deps = [file + '.js']
        if (fs.existsSync(wxmlFile)) {
            deps.push(path.relative(base, wxmlFile))
        }
        if (fs.existsSync(wxssFile)) {
            deps.push(path.relative(base, wxssFile))
        }
        if (fs.existsSync(jsonFile)) {
            deps.push(path.relative(base, jsonFile))
        }
        deps.push('usingComponents')
        return deps
    }

    getFileDeps(file) {
        const base = this.ana.options.directory
        const fullFile = path.resolve(base, file)
        let ext = path.extname(file)

        if (ext === '.json') {
            return []
        }

        if (ext === '.wxml') {
            return []
        }

        if (ext === '.wxss') {
            return []
        }

        if (ext !== '.js') {
            throw new Error('Unsupported file ' + file)
        }
 
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
        return deps
    }

    getUsingComponents(file) {
        const base = this.ana.options.directory
        const fullFile = path.resolve(base, file)
        const jsonFile = fullFile + '.json'
        if (!fs.existsSync(jsonFile)) {
            return []
        }
        const json = fs.readJSONSync(jsonFile)
        if (!json.usingComponents) {
            return []
        }
        return Object.keys(json.usingComponents).filter(key => {
            const compPath = json.usingComponents[key]
            return compPath.indexOf('recursive') === -1
        }).map(key => {
            let compPath = json.usingComponents[key]
            if (compPath.indexOf('/') !== 0) {
                const dir = path.dirname(jsonFile)
                const compFile = path.join(dir, compPath)
                compPath = path.relative(base, compFile)
            }
            return compPath.substr(1)
        }).filter(compPath => {
            return compPath !== file
        })
    }

}