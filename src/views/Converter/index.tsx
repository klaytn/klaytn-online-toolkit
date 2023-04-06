import { ReactElement, useState } from 'react'
import styled from 'styled-components'
import BigNumber from 'bignumber.js'

import { Card, Container } from 'components'
import SimpleUnitConverter from './SimpleConverter'
import ExtendedUnitConverter from './ExtendedConverter'

BigNumber.config({ EXPONENTIAL_AT: 1e9 })

export interface ConverterProps {
  handleChange: (value: string, decimal: number) => void
  getValue: (decimal: number) => string
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

  const [value, setValue] = useState({ decimal: 0, value: '' })

  const getValue = (decimal: number): string => {
    if (!value) return ''
    const rateDown = new BigNumber(10).exponentiatedBy(-decimal)
    const rateUp = new BigNumber(10).exponentiatedBy(value.decimal)

    const decimalPlaces = decimal === value.decimal ? 1e9 : 18 + decimal
    if (/^[0-9]+([.][0-9]+)?$/.test(value.value))
      return rateDown
        .multipliedBy(value.value)
        .multipliedBy(rateUp)
        .decimalPlaces(decimalPlaces)
        .toString()
    if (/^[0-9]+([.]+)?$/.test(value.value)) {
      if (decimal === value.decimal) return value.value
      return rateDown
        .multipliedBy(value.value.replace('.', ''))
        .multipliedBy(rateUp)
        .decimalPlaces(decimalPlaces)
        .toString()
    }
    return ''
  }

  const handleChange = (value: string, decimal: number): void => {
    if (!value || value === '.') setValue({ decimal, value })
    if (/^\d*\.?\d*$/.test(value)) setValue({ decimal, value })
  }

  const handleChangeTabs = (value: string): void => {
    setCurrentTab(value)
    setValue({ decimal: 0, value: '' })
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
