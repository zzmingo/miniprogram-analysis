const path = require('path')
const fs = require('fs')

module.exports = class PkgSizePlugin {

    constructor(ana) {
        this.ana = ana
    }

    async run() {
        const pkgData = {
            main: { size: 0, files: [] }
        }
    
        const base = this.ana.options.directory
        const appJson = this.ana.result.appJson
        appJson.subPackages.forEach(pkg => {
            pkgData[pkg.root] = { size: 0, files: [] }
        })
    
        this.ana.result.files.forEach(file => {
            const pkg = appJson.subPackages.find(pkg => {
                return file.startsWith(pkg.root + '/')
            })
            let data
            if (pkg) {
                data = pkgData[pkg.root]
            } else {
                data = pkgData.main
            }
            data.files.push(this.ana.mapFileToIndex(file))
            data.size += fs.statSync(path.join(base, file)).size
        })
        
        this.ana.result.pkgSize = pkgData
    }

}