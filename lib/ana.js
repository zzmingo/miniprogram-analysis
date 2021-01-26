const path = require('path')
const glob = require('glob')
const fs = require('fs-extra')
const cliProgress = require('cli-progress')
const colors = require('colors')

class Ana {

    constructor(options) {
        this.options = options
        this.plugins = this.options.plugins.map(name => {
            const plugin = new (require('./plugins/' + name))(this)
            plugin.name = name
            return plugin
        })
    }

    mapFileToIndex(file) {
        const base = this.options.directory
        if (file.startsWith(base)) {
            file = file.substr(base.length + 1)
        }
        const index = this.result.files.indexOf(file)
        if (index == -1) {
            throw new Error('Can not map index for: ' + file)
        }
        return index
    }

    async asyncForEachPage(func) {
        const appJson = this.result.appJson
        for (let i=0; i<appJson.pages.length; i++) {
            const page = appJson.pages[i]
            await func({ pkg: 'main', page: page, file: page })
        }
        for (let i=0; i<appJson.subPackages.length; i++) {
            const pkg = appJson.subPackages[i]
            for (let j=0; j<pkg.pages.length; j++) {
                const page = pkg.pages[j]
                await func({ pkg: pkg.root, page: page, file: path.join(pkg.root, page) })
            }
        }
    }

    async run() {
        const result = {}
        this.result = result
        const base = this.options.directory
        result.appJson = fs.readJsonSync(path.join(base, 'app.json'))
        result.files = glob.sync(base + '/**/*.*').map(file => path.relative(base, file))
        const plugins = this.plugins

        const showBar = true
        const bar = new cliProgress.SingleBar({
            format: `Analysis | ${colors.cyan('{bar}')} | {value}/{total} ${colors.yellow('[{plugin}]')} {text}`,
            barCompleteChar: '\u2588',
            barIncompleteChar: '\u2591',
            hideCursor: true,
            fps: 60
        })
        showBar && bar.start(plugins.length, 0)

        try {
            for (let i=0; i<plugins.length; i++) {
                const plugin = plugins[i]
                await plugin.run((text) => {
                    showBar && bar.update({ plugin: plugin.name, text: text || 'working'})
                })
                showBar && bar.increment()
            }
        } catch (error) {
            showBar && bar.stop()
            throw error
        }
        showBar && bar.render()
        showBar && bar.stop()
        delete result.files
        delete result.appJson
        fs.writeFileSync(this.options.directory + '.ana.json', JSON.stringify(result, null, '  '))
    }

}

module.exports = Ana