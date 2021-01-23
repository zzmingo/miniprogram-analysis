const path = require('path')
const fs = require('fs-extra')
const glob = require('glob')
const cliProgress = require('cli-progress')
const colors = require('colors')
const workerpool = require('workerpool')
const filesize = require('filesize')
const anaPkg = require('./pkg')
const pool = workerpool.pool(__dirname + '/worker.js')

const mpSourceDir = path.join(__dirname, '../versions/5.27.7')
const appJson = fs.readJsonSync(path.join(mpSourceDir, 'app.json'))
const fileList = glob.sync(mpSourceDir + '/**/*.*').map(file => path.relative(mpSourceDir, file))
const tasks = []
const resultJson = {
    pkgSizes: {},
    sizes: fileList.map(file => fs.statSync(path.join(mpSourceDir, file)).size),
    pkgs: {},
    deps: {
        main: {}
    },
    files: fileList,
}

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

function collectTasks() {
    tasks.push(() => {
        resultJson.pkgs = anaPkg(mpSourceDir)
        Object.keys(resultJson.pkgs).forEach(key => {
            const pkg = resultJson.pkgs[key]
            const files = pkg.files
            pkg.size = 0
            files.forEach((file, idx) => {
                const index = mapFileToIndex(mpSourceDir, file)
                files[idx] = index
                pkg.size += resultJson.sizes[index]
            })
            resultJson.pkgSizes[key] = filesize(pkg.size)
        })
    })
    tasks.push({ pkg: 'main', page: 'app', file: 'app.js', includeComps: false })
    appJson.pages.forEach(page => {
        tasks.push({ pkg: 'main', page: page, file: page + '.js', includeComps: true })
    })
    appJson.subPackages.forEach(pkg => {
        resultJson.deps[pkg.root] = {}
        pkg.pages.forEach(page => {
            const file = path.join(pkg.root, page + '.js')
            tasks.push({ pkg: pkg.root, page: page, file: file, includeComps: true })
        })
    })
}

async function runOneQueue(pool, bar) {
    while (true) {
        const task = tasks.shift()
        if (!task) {
            break
        }
        if (typeof task === 'function') {
            await task()
            bar.increment()
            continue
        }
        const result = await pool.exec('runOneTask', [mpSourceDir, task])
        resultJson.deps[task.pkg] = resultJson.deps[task.pkg] || {}
        resultJson.deps[task.pkg][task.page] = result
        bar.increment()
    }
}

function stopPool() {
    const timmer = setInterval(() => {
        const poolStats = pool.stats();
        if (poolStats.busyWorkers === 0) {
            pool.terminate(true);
            clearInterval(timmer);
        }
    }, 100);
}

async function main() {
    collectTasks()

    const allQueues = []
    const queue = 8

    const bar = new cliProgress.SingleBar({
        format: 'Analysis |' + colors.cyan('{bar}') + '| {value}/{total}',
        barCompleteChar: '\u2588',
        barIncompleteChar: '\u2591',
        hideCursor: true
    })
    bar.start(tasks.length, 0)
    for (let i=0; i<queue; i++) {
        allQueues.push(runOneQueue(pool, bar))
    }
    try {
        await Promise.all(allQueues)
        fs.writeFileSync(mpSourceDir + '.deps.json', JSON.stringify(resultJson, null, '  '))
    } finally {
        bar.stop()
        stopPool()
    }

}

main()






