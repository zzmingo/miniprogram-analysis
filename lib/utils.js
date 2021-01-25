module.exports = {
    indent(num, text) {
        for (let i=0; i<num; i++) {
            text = '  ' + text
        }
        return text
    }
}