const tools = require('../dist/main.js')

let privKey = '5J3JFXA1yYt6VSq9kd9HXiSbRw6zKmUdKyUSvCzm24CH7th24f2'
let fromKey = 'DBX6bwcHmtucvNqxD2FTvc4bNZFaUX2N7xD8tA8AxHwJo33GovEUK'
let toKey = 'DBX6p714p2D3pb8tVZxDjo9DQsMXRQqppBHeZeorpFbxzZ33P9s4g'
let memo = 'ahha'

let obj = tools.encodeMemo({
  pKey: privKey,
  fromKey,
  toKey,
  memo
})

console.log(obj)
