const glob = require('glob')
const path = require('path')
const workerpool = require('workerpool')
const deps = require('./deps')

let fileList = []

function mapFileToIndex(base, file) {
    if (file.startsWith(base)) {
        file = file.substr(base.length + 1)
    }
    const index = fileList.indexOf(file)
    if (index == -1) {
        throw new Error('Can not map index for: ' + file)
    }
    return index
}

function runOneTask(base, task) {
    if (fileList.length === 0) {
        fileList = glob.sync(base + '/**/*').map(file => path.relative(base, file))
    }
    return deps(base, task.file, task.includeComps).map(file => mapFileToIndex(base, file))
}

workerpool.worker({
    runOneTask: runOneTask
})