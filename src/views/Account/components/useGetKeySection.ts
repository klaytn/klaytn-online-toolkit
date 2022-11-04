import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import Caver, { Keyring, Keystore } from 'caver-js'
import _ from 'lodash'

import { UTIL } from 'consts'

export type UseGetKeySectionReturn = {
  getKeyFrom: GetKeyFrom
  setGetKeyFrom: React.Dispatch<React.SetStateAction<GetKeyFrom>>
  keystoreJSON: Keystore | undefined
  setKeystoreJSON: React.Dispatch<React.SetStateAction<Keystore | undefined>>
  keystorePassword: string
  setKeystorePassword: React.Dispatch<React.SetStateAction<string>>
  privateKey: string
  setPrivateKey: React.Dispatch<React.SetStateAction<string>>

  keyring: Keyring | undefined
  keyringErrMsg: string | undefined
  handleKeystoreChange: (files?: FileList) => void
}

export type GetKeyFrom = 'input' | 'keystore'

const useGetKeySection = ({ caver }: { caver: Caver }) => {
  const [params] = useSearchParams()

  const [getKeyFrom, setGetKeyFrom] = useState<GetKeyFrom>('input')
  const [keystoreJSON, setKeystoreJSON] = useState<Keystore>()
  const [keystorePassword, setKeystorePassword] = useState('')
  const [privateKey, setPrivateKey] = useState(params.get('pkey') || '')

  const { keyring, keyringErrMsg } = useMemo(() => {
    try {
      if (getKeyFrom === 'input' && privateKey) {
        return {
          keyring: caver.wallet.keyring.createFromPrivateKey(privateKey),
        }
      } else if (getKeyFrom === 'keystore' && keystoreJSON) {
        return {
          keyring: caver.wallet.keyring.decrypt(keystoreJSON, keystorePassword),
        }
      }
    } catch (error) {
      return {
        keyringErrMsg: _.toString(error),
      }
    }

    return {}
  }, [privateKey, keystoreJSON, getKeyFrom, keystorePassword])

  const handleKeystoreChange = (files?: FileList) => {
    if (files && files.length > 0) {
      const fileReader = new FileReader()
      fileReader.readAsText(files[0], 'UTF-8')
      fileReader.onload = (event) => {
        if (typeof event.target?.result === 'string') {
          const json = UTIL.jsonTryParse<Keystore>(event.target.result)
          setKeystoreJSON(json)
        }
      }
    }
  }

  useEffect(() => {
    setKeystorePassword('')
  }, [keystoreJSON])

  return {
    getKeyFrom,
    setGetKeyFrom,
    keystoreJSON,
    setKeystoreJSON,
    keystorePassword,
    setKeystorePassword,
    privateKey,
    setPrivateKey,

    keyring,
    keyringErrMsg,
    handleKeystoreChange,
  }
}

export default useGetKeySection
