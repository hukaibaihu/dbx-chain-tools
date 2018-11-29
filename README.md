# API

``` js
  /**
   * 生成助记词
   *
   * @return {String} brainKey 16个助记词
   */
  generatorBrainKey()

  /**
   * 生成公私钥对
   *
   * @param  {String} seed 必传。助记词或密码
   *
   * @return {Object} {privateKey: 私钥, publicKey: 公钥, address: 钱包地址}
   *
   * @example
   *    generatorKeyFromSeed({seed: 'sjfhdj sjhdfhjdf shdfhjd'})
   *
   *    =>
   *
   *    {
   *      address: "DBX68HQ81ouwXi755F17cjfyj9qtWa7kop7H",
   *      privateKey: "5KjFvS1Bkd9zVurRtAaa7Nv2Ls1qSuKEL81s9Ft7HasKMsQ4VK4",
   *      publicKey: "DBX6iJ5JpAEnjBsDY1DQvY98BLoiYVgJSWxkiPcDkAc45QFHiXYag"
   *    }
   */
  generatorKeyFromSeed({seed})

  /**
   * 通过私钥生成公私钥对
   *
   * @param  {String} privKey 输入的私钥，必传
   *
   * @return {Object}         {privateKey: 私钥, publicKey: 公钥, address: 钱包地址}
   *
   * @example
   *    generatorKeyFromSeed({privKey: '5KjFvS1Bkd9zVurRtAaa7Nv2Ls1qSuKEL81s9Ft7HasKMsQ4VK4'})
   *
   *    =>
   *
   *    {
   *      address: "DBX68HQ81ouwXi755F17cjfyj9qtWa7kop7H",
   *      privateKey: "5KjFvS1Bkd9zVurRtAaa7Nv2Ls1qSuKEL81s9Ft7HasKMsQ4VK4",
   *      publicKey: "DBX6iJ5JpAEnjBsDY1DQvY98BLoiYVgJSWxkiPcDkAc45QFHiXYag"
   *    }
   */
  generatorKeyByPrivKey({privKey})

  /**
   * 加密备注信息
   *
   * @param  {String|PrivateKey} pKey 当前账户的私钥
   * @param  {String} fromKey  源账户的 memoKey 公钥
   * @param  {String} toKey 目标账户的 memoKey 公钥
   * @param  {String} memo 备注信息
   *
   * @return {Object} 加密后的备注信息 { from, to, nonce, message }
   */
  encodeMemo({pKey, fromKey, toKey, memo})

  /**
   * 解密备注信息
   *
   * @param  {String} privKey 当前账户的私钥
   * @param  {Object} memo 备注信息
   *
   * @return {String} 解密后的备注
   *
   * @example
   *          decodeMemo({
   *            privKey: "5JMujMZEZDbR6p8ZpEvf6Xpf5w9najS9Gkg3eLsPDYFshTzxTjR",
   *            memo: {
   *              from: "DBX7XNQEh5MXfbrVB8prkmDsS9dLuazesuhgTwRLYYtTqFmCZEy1W",
   *              to: "DBX5wYceNjjamwgBMXimJLPggvN6peiAvp9NYhwEkubg6rrLeNQQP",
   *              nonce: "393139950650709",
   *              message: "98889eb50931bea00fbed1089d28254376b59a5b3122271797ff9789161ecc08"
   *            }
   *          })
   *
   *          => ddjdidnd测试
   */
  decodeMemo({privKey, memo})

  /**
   * 交易数据签名
   *
   * @param  {String} privKey 当前账户的私钥
   * @param  {Object} from 源账户 { id: 账户ID，必传, memoKey: memo公钥 }
   * @param  {Object} to 目标账户 { id: 账户ID，必传, memoKey: memo公钥 }
   * @param  {Object} fee 手续费 { amount: 金额, assetId: 资产ID（币种）}
   * @param  {Object} amount 交易金额 { amount: 金额, assetId: 资产ID（币种）}
   * @param  {String} memo 备注信息
   * @param  {Object} blockHeader 交易块的块头信息 { time, head_block_number, head_block_id }
   * @param  {String} chainId 链ID
   *
   * @return {String} 签名后的JSON串
   */
  buildTransaction({privKey, from, to, fee, amount, memo, blockHeaer, chainId})
```
