const path = require('path')
const jsDeps = require('./jsDeps');
const pageDeps = require('./pageDeps')

module.exports =  function(base, file, includeComps) {
    let compDeps = []
    if (includeComps) {
        compDeps = pageDeps.toList({
            filename: path.join(base, file.replace('.js', '.json')),
            directory: base,
        })
    }
    const jsFileDeps = jsDeps.toList({ 
        filename: path.join(base, file),
        directory: base,
    })

    const deps = compDeps.concat(jsFileDeps)
    return deps.filter(function(item, pos) {
        return deps.indexOf(item) == pos
    })
}