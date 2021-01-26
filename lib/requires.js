const data = require('../versions/5.27.12.ana.json')

const map = {}
const mainPkg = data.pageDeps.pkgs.main
const entry = {
    file: 'entry',
    deps: [mainPkg.app, ...Object.keys(mainPkg.pages).map(_ => mainPkg.pages[_])],
    totalSize: 1
}

function countRequires(item) {
    map[item.file] = map[item.file] || 0
    map[item.file] ++
    item.deps && item.deps.forEach(_ => countRequires(_))
}

countRequires(entry)

const repeats = Object.keys(map).filter(_ => map[_] > 1).map(_ => (map[_] - 1) * _.length).reduce((a, b) => a + b)
console.log(map)
console.log(repeats)

// Object.keys(data.pageDeps.pkgs).forEach(key => {
//     map = {}
//     countRequires({
//         file: key,
//         deps: Object.keys(data.pageDeps.pkgs[key].pages).map(_ => data.pageDeps.pkgs[key].pages[_]),
//         totalSize: 1
//     })
// })


