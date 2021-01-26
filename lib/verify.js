const data = require('../versions/5.27.12.ana.json')

let map = {}
const mainPkg = data.pageDeps.pkgs.main
const entry = {
    file: 'entry',
    deps: [mainPkg.app, ...Object.keys(mainPkg.pages).map(_ => mainPkg.pages[_])],
    totalSize: 1
}

function verify(item, stack) {
    if (map[item.file] && item.totalSize > 0 && !item.usingComponents) {
        console.log(stack)
        console.log(map[item.file])
        throw new Error('冗余：' + item.file)
    }
    stack.push(item.file)
    map[item.file] = stack
    item.deps && item.deps.forEach(_ => verify(_, stack.slice(0)))
}

verify(entry, [])

Object.keys(data.pageDeps.pkgs).forEach(key => {
    map = {}
    verify({
        file: key,
        deps: Object.keys(data.pageDeps.pkgs[key].pages).map(_ => data.pageDeps.pkgs[key].pages[_]),
        totalSize: 1
    }, [])
})


