const path = require('path')
const glob = require('glob')

let files = []

function mapFileToIndex(base, file) {
    if (file.startsWith(base)) {
        file = file.substr(base.length + 1)
    }
    const index = files.indexOf(file)
    if (index == -1) {
        throw new Error('Can not map index for: ' + file)
    }
    return index
}

module.exports = {
    globFiles(base) {
        if (files.length === 0) {
            files = glob.sync(base + '/**/*.*').map(file => path.relative(base, file))
        }
        return files
    },
    mapFileToIndex: mapFileToIndex,
}