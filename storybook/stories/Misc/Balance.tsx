import React from 'react'
import { StyleProp, TextStyle } from 'react-native'
import { useSubsocialInit } from '~comps/SubsocialContext'
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

export type BalanceProps = Omit<BalanceDataProps, 'balance'> & {
  address: string
}
export function Balance({ address, ...props }: BalanceProps)
{
  const balance = useBalance(address)
  return <BalanceData balance={balance} {...props} />
}

export type BalanceDataProps = {
  balance: number | BN
  labelStyle?: StyleProp<TextStyle>
  integerBalanceStyle?: StyleProp<TextStyle>
  decimalBalanceStyle?: StyleProp<TextStyle>
  currencyStyle?: StyleProp<TextStyle>
  decimals?: number
  truncate?: number
  currency?: string
  formatter?: (value: BN, decimals: number, currency: string) => React.ReactElement
}
export function BalanceData({
  balance,
  labelStyle,
  integerBalanceStyle,
  decimalBalanceStyle,
  currencyStyle,
  decimals,
  truncate,
  currency,
}: BalanceDataProps) {
  const { decimals: defaultDecimals, unit: defaultCurrency } = formatBalance.getDefaults()
  const formatted = defaultBalanceFormat(new BN(balance), decimals || defaultDecimals || 1, currency ?? defaultCurrency, truncate)
  
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
    decimal: (fractional + '0'.repeat(decimals)).substr(0, truncate),
    currency,
  }
}


export function useBalance(address: AccountId) {
  const [ balance, setBalance ] = React.useState<BN>(new BN(0))
  
  useSubsocialInit((isMounted, { substrate }) => {
    if (!address) return false
    
    substrate.derive.balances.all(address)
      .then(data => {
        if (isMounted())
          setBalance(data.freeBalance)
      })
    
    return true
  }, [ address ], [ setBalance ])
  
  return balance
}
