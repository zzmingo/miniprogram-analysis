// return depsTree({
//     filename: path.join(mpSourceDir, file),
//     directory: mpSourceDir,
//     onNode: (tree, nodeKey, node) => {
//         if (parseInt(nodeKey) == nodeKey) {
//             return
//         }
//         let newNodeKey = nodeKey
//         if (nodeKey.startsWith(mpSourceDir)) {
//             newNodeKey = nodeKey.substr(mpSourceDir.length + 1)
//         }
//         const index = fileList.indexOf(newNodeKey)
//         if (index == -1) {
//             throw new Error('Can not map index for: ' + newNodeKey)
//         }
//         delete tree[nodeKey]
//         tree[index] = node
//     }
// })