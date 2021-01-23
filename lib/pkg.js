const fs = require('fs-extra')
const glob = require('glob')
const path = require('path')

module.exports = function anaPkg(base) {
    const pkgData = {
        main: { files: [] }
    }

    const appJson = fs.readJsonSync(path.join(base, 'app.json'))
    appJson.subPackages.forEach(pkg => {
        pkgData[pkg.root] = { files: [] }
    })

    const fileList = glob.sync(base + '/**/*.*')
    fileList.forEach(file => {
        const pkg = appJson.subPackages.find(pkg => {
            const pkgFullPath = path.join(base, pkg.root)
            return file.startsWith(pkgFullPath)
        })
        let data
        if (pkg) {
            data = pkgData[pkg.root]
        } else {
            data = pkgData.main
        }
        data.files.push(file)
    })

    return pkgData
}