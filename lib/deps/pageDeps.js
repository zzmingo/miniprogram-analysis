const path = require('path')
const fs = require('fs-extra')

function analysis(file, results, options) {
    const json = fs.readJsonSync(file)
    if (!json.usingComponents) {
        return
    }
    Object.keys(json.usingComponents).map(key => {
        const compPath = json.usingComponents[key]
        if (compPath.indexOf('/') !== 0) {
            throw new Error('Unsupported comp path: ' + compPath)
        }
        const compFullPath = path.join(options.directory, compPath.substr(1))
        const compJson = compFullPath + '.json'
        if (results.indexOf(compJson) !== -1) {
            return
        }
        results.push(compJson)
        const compCss = compFullPath + '.wxss'
        const compXml = compFullPath + '.wxml'
        const compJs = compFullPath + '.js'
        if (fs.existsSync(compCss)) results.push(compCss)
        if (fs.existsSync(compXml)) results.push(compXml)
        if (fs.existsSync(compJs)) results.push(compJs)
        analysis(compJson, results, options)
    })
}

module.exports.toList = function(options) {
    if (!fs.existsSync(options.filename)) {
        return []
    }
    const results = []
    analysis(options.filename, results, options)
    return results
}