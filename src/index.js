import { Buffer } from 'safe-buffer'
import DICTIONARY from './dictionary'
import { ChainConfig } from 'bitsharesjs-ws'
import { PrivateKey, Signature, TransactionBuilder, TransactionHelper, key, Aes, ops } from 'bitsharesjs'

const ADDRESS_PREFIX = 'DBX'

ChainConfig.setPrefix(ADDRESS_PREFIX)

function timeStringToDate(timeString) {
  if (!timeString) {
    return new Date('1970-01-01T00:00:00.000Z')
  }

  if (!/Z$/.test(timeString)) {
    timeString += 'Z'
  }

  return new Date(timeString)
}

function baseExpirationSec(timeString) {
  let headBlockSec = Math.ceil(timeStringToDate(timeString).getTime() / 1000)
  let nowSec = Math.ceil(Date.now() / 1000)

  if (nowSec - headBlockSec > 30) {
    return headBlockSec
  }

  return Math.max(nowSec, headBlockSec)
}

/**
 * 生成助记词
 *
 * @param {String} dict 非必传。词典
 * @param {String} ecpoy 非必传。
 *
 * @return {String} brainKey 16个助记词
 */
export const generatorBrainKey = function({dict = DICTIONARY, ecpoy} = {}) {
  return key.suggest_brain_key(dict, ecpoy)
}

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
export const generatorKeyFromSeed = function({seed}) {
  let pKey = PrivateKey.fromSeed(seed)
  let pubKey = pKey.toPublicKey()

  return {
    privateKey: pKey.toWif(),
    address: pubKey.toAddressString(ADDRESS_PREFIX),
    publicKey: pubKey.toPublicKeyString(ADDRESS_PREFIX)
  }
}

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
export const generatorKeyByPrivKey = function({privKey}) {
  try {
    let pKey = PrivateKey.fromWif(privKey)
    let pubKey = pKey.toPublicKey()

    return {
      privateKey: privKey,
      address: pubKey.toAddressString(ADDRESS_PREFIX),
      publicKey: pubKey.toPublicKeyString(ADDRESS_PREFIX)
    }
  } catch (e) {
    console.log(e)
  }

  return null
}

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
export const decodeMemo = function({privKey, memo}) {
  try {
    let pKey = PrivateKey.fromWif(privKey)
    let pubKey = pKey.toPublicKey().toPublicKeyString(ADDRESS_PREFIX)

    pubKey = pubKey === memo.to ? memo.from : memo.to

    return Aes.decrypt_with_checksum(
      pKey,
      pubKey,
      memo.nonce,
      memo.message,
      // true
    ).toString('utf-8')
  } catch (e) {
    console.log('[decodeMemo error]: ' + e.message)
  }

  return ''
}

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
export const encodeMemo = function({pKey, fromKey, toKey, memo}) {
  let nonce = TransactionHelper.unique_nonce_uint64()
  let message = ''

  if (typeof pKey === 'string') {
    pKey = PrivateKey.fromWif(pKey)
  }

  try {
    message = Aes.encrypt_with_checksum(pKey, toKey, nonce, Buffer.from(memo, 'utf-8'))
  } catch (e) {
    console.log(e)
  }

  return {
    nonce,
    message,
    to: toKey,
    from: fromKey
  }
}

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
export const buildTransaction = function({privKey, from, to, fee, amount, memo, blockHeader, chainId}) {
  let pKey = PrivateKey.fromWif(privKey)
  let tr = new TransactionBuilder()

  let data = {
    fee: {
      amount: fee.amount,
      asset_id: fee.assetId
    },
    from: from.id,
    to: to.id,
    amount: {
      amount: amount.amount,
      asset_id: amount.assetId
    }
  }

  if (memo) {
    data.memo = encodeMemo({pKey, memo, fromKey: from.memoKey, toKey: to.memoKey})
  }

  tr.add_type_operation('transfer', data)

  tr.add_signer(pKey, pKey.toPublicKey().toPublicKeyString(ADDRESS_PREFIX))

  tr.expiration = baseExpirationSec(blockHeader.time) + 15 // 15
  tr.ref_block_num = blockHeader.head_block_number & 0xffff
  tr.ref_block_prefix = Buffer.from(blockHeader.head_block_id, 'hex').readUInt32LE(4)
  tr.tr_buffer = ops.transaction.toBuffer(tr)

  tr.sign(chainId)

  data = ops.signed_transaction.toObject(tr)

  delete data.signatures

  data.from_key = from.memoKey
  data.to_key = to.memoKey

  const buf = Buffer.from(JSON.stringify(data), 'utf-8')
  const sign = Signature.signBuffer(buf, pKey)

  data.signatures = [ sign.toHex() ]

  return data
}
