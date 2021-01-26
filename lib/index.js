const path = require('path')
const { program } = require('commander')
const Ana = require('./ana')


program.version('0.0.1')

program
  .option('-d, --directory <directory>', 'specify analysis directory')
  .option('-p, --plugins <plugins...>', 'specify plugins')


program.parse(process.argv)

const options = program.opts();

options.directory = path.isAbsolute(options.directory) ? options.directory : path.resolve(process.cwd(), options.directory)

console.log(`analysis ${options.directory}`)
console.log(`with plugins: ${options.plugins}`)

async function main() {
    new Ana(options).run()
}

main()
