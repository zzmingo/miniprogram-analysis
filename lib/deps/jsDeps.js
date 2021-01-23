const dependencyTree = require('dependency-tree')

function walkTree(tree, options) {
    const keys = Object.keys(tree).filter(file => !!file)
    keys.forEach(file => {
        const subTree = tree[file]
        options.onNode(tree, file, subTree)
        walkTree(subTree, options)
    })
    return tree
}

module.exports.toTree = function(options) {
    const tree = dependencyTree(options)
    return walkTree(tree, options)
}

module.exports.toList = function(options) {
    return dependencyTree.toList(options)
}