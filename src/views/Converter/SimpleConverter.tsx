import { ReactElement } from 'react'
import styled from 'styled-components'
import { CopyToClipboard } from 'react-copy-to-clipboard'
import { IconCopy } from '@tabler/icons'

import useToast from 'hooks/useToast'
import { FormInput, View } from 'components'
import { STYLE } from 'consts'
import { ConverterProps } from '.'

const Title = styled.p`
  font-size: 24px;
  font-weight: 700;
  padding: 15px 15px 0;
  border: 0;
  color: rgba(255, 255, 255, 0.8);
`
const Description = styled.p`
  font-size: 14px;
  font-weight: 400;
  padding: 15px 15px 0;
  border: 0;
  color: rgba(255, 255, 255, 0.8);
`
const NameConverter = styled.div`
  color: #ffffff;
  font-size: 16px;
  font-weight: 400;
  padding-bottom: 15px;
  min-width: 140px;
`

const SFormInput = styled(FormInput)`
  margin-bottom: 10px;
  width: 100%;
`
const CardBodyConverter = styled.div`
  padding: 20px 15px;
`
const FormGroup = styled.div`
  display: flex;
  align-items: center;
  position: relative;
`

const StyledCopyIconBox = styled(View)`
  ${STYLE.clickable}
  position: absolute;
  transform: translateY(-30%);
  right: 10px;
`

const optionsSimple: { key: string; label: string; decimal: number }[] = [
  { key: 'Peb', label: 'Peb', decimal: -18 },
  { key: 'ston', label: 'ston', decimal: -9 },
  { key: 'KLAY', label: 'KLAY', decimal: 0 },
]

const SimpleUnitConverter = (props: ConverterProps): ReactElement => {
  const { toast } = useToast()

  const { handleChange, getValue } = props

  return (
    <>
      <Title>Simple Unit Converter</Title>
      <Description>
        The Peb converter from Klaytn is a simple and easy-to-use tool for
        converting between {optionsSimple.map((item) => item.label).join(', ')}.
        The page housing this tool provides a comprehensive explanation of these
        different units and their relationship to the expenditure of Gas in the
        Klaytn ecosystem.
      </Description>
      <CardBodyConverter>
        {optionsSimple.map((item) => {
          return (
            <FormGroup key={item.key}>
              <NameConverter>{item.label}</NameConverter>
              <SFormInput
                placeholder={item.label}
                onChange={(value): void => handleChange(value, item.decimal)}
                value={getValue(item.decimal)}
              />
              <StyledCopyIconBox>
                <CopyToClipboard
                  text={getValue(item.decimal)}
                  onCopy={(): void => {
                    toast('Copied')
                  }}
                >
                  <IconCopy color={'black'} size={16} />
                </CopyToClipboard>
              </StyledCopyIconBox>
            </FormGroup>
          )
        })}
      </CardBodyConverter>
    </>
  )
}

export default SimpleUnitConverter
