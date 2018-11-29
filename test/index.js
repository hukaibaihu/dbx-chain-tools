const tools = require('../dist/main.js')

var brainkey = tools.generatorBrainKey()

var pKey = tools.generatorKeyFromSeed({seed: brainkey})

console.log(pKey)
