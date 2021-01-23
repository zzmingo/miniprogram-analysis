const glob = require('glob')
const path = require('path')
const workerpool = require('workerpool')
const deps = require('./deps')
const files = require('./files')

function runOneTask(base, task) {
    files.globFiles(base)
    return deps(base, task.file, task.includeComps).map(file => files.mapFileToIndex(base, file))
}

workerpool.worker({
    runOneTask: runOneTask
})