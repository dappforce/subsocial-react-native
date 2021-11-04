import React from 'react'
import { StyleProp, TextStyle } from 'react-native'
import { useSubsocialEffect } from '~comps/SubsocialContext'
import { AccountId } from 'src/types/subsocial'
import { Text } from '~comps/Typography'
import { formatBalance } from '@polkadot/util'
import BN from 'bn.js'

export type BalanceFormat = {
  value: BN
  decimals: number
  currency: string
}

export type FormattedBalance = {
  integer: string
  decimal: string
  currency: string
}

export type BalanceProps = {
  address: string
  labelStyle?: StyleProp<TextStyle>
  integerBalanceStyle?: StyleProp<TextStyle>
  decimalBalanceStyle?: StyleProp<TextStyle>
  currencyStyle?: StyleProp<TextStyle>
  decimals?: number
  truncate?: number
  currency?: string
  formatter?: (value: BN, decimals: number, currency: string) => React.ReactElement
}

export function Balance({
  address,
  labelStyle,
  integerBalanceStyle,
  decimalBalanceStyle,
  currencyStyle,
  decimals,
  truncate,
  currency,
}: BalanceProps)
{
  const { decimals: defaultDecimals, unit: defaultCurrency } = formatBalance.getDefaults()
  const balance = useBalance(address)
  
  const formatted = defaultBalanceFormat(balance, decimals || defaultDecimals || 1, currency ?? defaultCurrency, truncate)
  
  return (
    <Text style={labelStyle}>
      <Text style={integerBalanceStyle}>
        {formatted.integer}
      </Text>
      <Text mode="secondary" style={decimalBalanceStyle}>
        .{formatted.decimal}
      </Text>&nbsp;
      <Text style={currencyStyle}>
        {formatted.currency}
      </Text>
    </Text>
  )
}

function defaultBalanceFormat(balance: BN, decimals: number, currency: string, truncate: number = decimals): FormattedBalance {
  const divisor = new BN(10).pow(new BN(decimals))
  const fractional = balance.mod(divisor).toString().replace(/0+$/, '')
  
  // TODO: i18n probably
  return {
    integer: balance.div(divisor).toNumber().toLocaleString('en'),
    decimal: '0'.repeat(truncate).substr(fractional.length) + fractional.substr(0, truncate),
    currency,
  }
}


export function useBalance(address: AccountId) {
  const [ balance, setBalance ] = React.useState<BN>(new BN(0))
  
  useSubsocialEffect(async ({ substrate }) => {
    if (!address) return
    
    const api = await substrate.api
    
    const data = await api.derive.balances.all(address)
    setBalance(data.freeBalance)
  }, [ address ])
  
  return balance
}
