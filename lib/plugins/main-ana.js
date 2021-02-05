const path = require('path')
const fs = require('fs')

module.exports = class MainAnaPlugin {

    constructor(ana) {
        this.ana = ana
    }

    async run() {
        const mainAna = {}
        const appJson = this.ana.result.appJson
        this.ana.result.files.forEach(file => {
            const pkg = appJson.subPackages.find(pkg => {
                return file.startsWith(pkg.root + '/')
            })
            if (pkg) {
                return
            }
            if (appJson.pages.find(page => page + '.js' === file)) {
                return
            }
            const size = fs.statSync(path.join(this.ana.options.directory, file)).size
            mainAna[file] = mainAna[file] || { count: 0, main: 0, size: size }
        })

        const entries = []
        const mainPkg = this.ana.result.pageDeps.pkgs.main
        entries.push({
            file: 'entry',
            deps: [mainPkg.app, ...Object.keys(mainPkg.pages).map(_ => mainPkg.pages[_])],
            totalSize: 1
        })

        Object.keys(this.ana.result.pageDeps.pkgs).forEach(key => {
            entries.push({
                file: key,
                deps: Object.keys(this.ana.result.pageDeps.pkgs[key].pages).map(_ => this.ana.result.pageDeps.pkgs[key].pages[_]),
                totalSize: 1
            })
        })

        function countDeps(item, main) {
            if (mainAna[item.file]) {
                mainAna[item.file].count ++
                if(item.file === "app.json") {
                    mainAna[item.file].main ++
                } else {
                    if (main) {
                        mainAna[item.file].main ++
                    }
                }
            }
            item.deps && item.deps.forEach(_ => countDeps(_, main))
        }

        entries.forEach((entry, idx) => countDeps(entry, idx === 0))

        this.ana.result.mainAna = mainAna
    }

}