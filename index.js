// const tools = require('./tools.js')
const tools = require('./dist/main.js')

var brainkey = tools.generatorBrainKey()

console.log(tools.generatorKeyFromSeed({seed: brainkey}))
