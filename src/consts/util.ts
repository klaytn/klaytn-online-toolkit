import BigNumber from 'bignumber.js'
import _ from 'lodash'

import { Token, pToken, uToken } from 'types'

const P_DECIMAL = 1e18
const U_DECIMAL = 1e6

const truncate = (text: string, [h, t]: number[] = [10, 10]): string => {
  const head = text.slice(0, h)
  const tail = text.slice(-1 * t, text.length)
  return text.length > h + t ? [head, tail].join('...') : text
}

const jsonTryParse = <T>(value: string): T | undefined => {
  try {
    return JSON.parse(value) as T
  } catch {
    return undefined
  }
}

const setComma = (str: string | number): string => {
  const parts = _.toString(str).split('.')
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',')
  return parts.join('.')
}

const delComma = (str: string): string => {
  return _.toString(str).replace(/,/g, '')
}

const extractNumber = (str: string): string => str.replace(/\D+/g, '')

const isNumberString = (value: number | string): boolean =>
  false === new BigNumber(value || '').isNaN()

const toBn = (value?: number | string): BigNumber => new BigNumber(value || 0)

const isEven = (value: number): boolean => value % 2 === 0

const isOdd = (value: number): boolean => !isEven(value)

const microfyU2P = (value: uToken): pToken =>
  toBn(value).multipliedBy(P_DECIMAL).div(U_DECIMAL).toString(10) as pToken

const microfyU = (value: Token): uToken =>
  toBn(value).multipliedBy(U_DECIMAL).toString(10) as uToken

const microfyP = (value: Token): pToken =>
  toBn(value).multipliedBy(P_DECIMAL).toString(10) as pToken

const demicrofyU = (value: uToken): Token =>
  toBn(value).div(U_DECIMAL).toString(10) as Token

const demicrofyP = (value: pToken): Token =>
  toBn(value).div(P_DECIMAL).toString(10) as Token

const formatAmountU = (
  value: uToken,
  option?: {
    abbreviate?: boolean
    toFix?: number
  }
): string => formatAmountP(microfyP(demicrofyU(value)), option)

const formatAmountP = (
  value: pToken,
  option?: {
    abbreviate?: boolean
    toFix?: number
  }
): string => {
  const demicrofyValue = toBn(demicrofyP(value))
  let strValue = '0'
  if (option?.toFix !== undefined) {
    strValue = demicrofyValue.toFixed(option?.toFix, BigNumber.ROUND_DOWN)
  } else {
    strValue = demicrofyValue.toString(10)
  }

  if (option?.abbreviate) {
    const abbreviated = abbreviateNumber(strValue, { toFix: option?.toFix })
    return `${setComma(abbreviated.value)}${abbreviated.unit}`
  }
  return setComma(strValue)
}

const abbreviateNumber = (
  value: string,
  option?: {
    toFix?: number
  }
): { value: string; unit: string } => {
  const toFix = option?.toFix || 2
  const bn = toBn(value)
  if (bn.gte(1e12)) {
    return {
      value: bn.div(1e12).toFixed(toFix, BigNumber.ROUND_DOWN),
      unit: 'T',
    }
  } else if (bn.gte(1e9)) {
    return {
      value: bn.div(1e9).toFixed(toFix, BigNumber.ROUND_DOWN),
      unit: 'B',
    }
  } else if (bn.gte(1e6)) {
    return {
      value: bn.div(1e6).toFixed(toFix, BigNumber.ROUND_DOWN),
      unit: 'M',
    }
  }
  return { value, unit: '' }
}

const getPriceChange = ({
  from,
  to,
}: {
  from: BigNumber
  to: BigNumber
}): {
  isIncreased: boolean
  rate: BigNumber
} => {
  const isIncreased = to.isGreaterThanOrEqualTo(from)
  const rate = isIncreased
    ? to.div(from).minus(1)
    : new BigNumber(1).minus(to.div(from))
  return {
    isIncreased,
    rate,
  }
}

const toBase64 = (value: string): string =>
  Buffer.from(value).toString('base64')

const fromBase64 = (value: string): string =>
  Buffer.from(value, 'base64').toString()

const formatPercentage = (per: BigNumber): string => {
  return per.lt(0.01)
    ? '<0.01'
    : per.gt(99.9)
    ? '>99.9'
    : per.multipliedBy(100).toFixed(2)
}

const isURL = (value: string): boolean => {
  try {
    new URL(value)
    return true
  } catch {
    return false
  }
}

export default {
  truncate,
  jsonTryParse,
  setComma,
  delComma,
  extractNumber,
  isNumberString,
  toBn,
  isEven,
  isOdd,
  microfyU2P,
  microfyU,
  microfyP,
  demicrofyU,
  demicrofyP,
  formatAmountU,
  formatAmountP,
  abbreviateNumber,
  getPriceChange,
  toBase64,
  fromBase64,
  formatPercentage,
  isURL,
}
