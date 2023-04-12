import { Card, Container } from 'components'
import { ReactElement, useState } from 'react'
import styled from 'styled-components'
import SimpleUnitConverter from './SimpleConverter'
import ExtendedUnitConverter from './ExtendedConverter'
import Caver, { Unit } from 'caver-js'
import BigNumber from 'bignumber.js'
BigNumber.config({ EXPONENTIAL_AT: 1e9 })
const caver = new Caver(window.klaytn)

export interface ConverterProps {
  handleChange: (value: string, unit: Unit) => void
  getValue: (unit: Unit) => string
}

const TabWraper = styled.div`
  margin-top: 1rem;
  display: flex;
  background: #27293d;
  width: 100%;
  gap: 15px;
  padding: 20px;
  color: #696969;
  cursor: pointer;
`
const TabsBox = styled.div`
  font-size: 16px;
  font-weight: 700;
  padding: 0.5em 1em 0.5em 1em;
  &.active {
    background: #444;
    color: #fff;
    border-radius: 6px;
  }
`

const TABSCONVERTER = {
  Simple: 'Simple',
  Extended: 'Extended',
}

const TABS = [
  {
    key: TABSCONVERTER.Simple,
    label: 'Simple Converter',
    value: TABSCONVERTER.Simple,
  },
  {
    key: TABSCONVERTER.Extended,
    label: 'Extended Converter',
    value: TABSCONVERTER.Simple,
  },
]

const KlaytnUnitConverter = (): ReactElement => {
  const [currentTab, setCurrentTab] = useState<string>(TABSCONVERTER.Simple)
  const defaultTabs = currentTab === TABSCONVERTER.Simple

  const [value, setValue] = useState<{ unit: Unit; value: string }>({
    unit: 'peb',
    value: '',
  })

  const getValue = (unit: Unit): string => {
    const decimalUnit = caver.utils.unitMap[value.unit]
  
    if (!value.value) return ''
    if (/^[0-9]+([.][0-9]+)?$/.test(value.value)) {
      const isDecimalUnit = new BigNumber(
        new BigNumber(decimalUnit).multipliedBy(value.value).toFixed(0)
      )
      .dividedBy(decimalUnit).toString();
      return caver.utils
        .convertFromPeb(caver.utils.convertToPeb(isDecimalUnit, value.unit), unit).toString()
    }
    if (/^[0-9]+([.]+)?$/.test(value.value)) {
      if (unit === value.unit) return value.value
      const isDecimalUnit = new BigNumber(
        new BigNumber(decimalUnit)
          .multipliedBy(value.value.replace('.', ''))
          .toFixed(0)
      )
        .dividedBy(decimalUnit)
        .toString()
      return caver.utils
        .convertFromPeb(caver.utils.convertToPeb(isDecimalUnit, value.unit), unit).toString()
    }
    return ''
  }

  const handleChange = (value: string, unit: Unit): void => {
    if (!value || value === '.') setValue({ unit, value })
    if (/^\d*\.?\d*$/.test(value)) setValue({ unit, value })
  }

  const handleChangeTabs = (value: string): void => {
    setCurrentTab(value)
    setValue({ unit: 'peb', value: '' })
  }

  return (
    <Container>
      <Card>
        <TabWraper>
          {TABS.map((tab) => (
            <TabsBox
              key={tab.key}
              className={`${currentTab === tab.key && 'active'}`}
              onClick={(): void => handleChangeTabs(tab.key)}
            >
              {tab.label}
            </TabsBox>
          ))}
        </TabWraper>
        {defaultTabs ? (
          <SimpleUnitConverter
            handleChange={handleChange}
            getValue={getValue}
          />
        ) : (
          <ExtendedUnitConverter
            handleChange={handleChange}
            getValue={getValue}
          />
        )}
      </Card>
    </Container>
  )
}

export default KlaytnUnitConverter
