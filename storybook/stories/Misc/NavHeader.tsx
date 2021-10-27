//////////////////////////////////////////////////////////////////////
// NavHeader component to be used with stack navigators
import React, { useMemo } from 'react'
import { StyleSheet, View } from 'react-native'
import { StackHeaderProps as BaseProps } from '@react-navigation/stack'
import { getHeaderTitle } from '@react-navigation/elements'
import { Icon } from 'react-native-elements'
import { Title } from '~comps/Typography'
import { Theme, useTheme } from '~comps/Theming'

const ASIDE_SIZE = 40

export type StackHeaderProps = BaseProps & {
  
}
export function StackHeader({navigation, route, options, back}: StackHeaderProps) {
  const title = getHeaderTitle(options, route.name)
  const theme = useTheme()
  const styles = useMemo(() => createStyles(theme), [ theme ])
  
  return (
    <View style={styles.container}>
      <View style={styles.leftContainer}>
        {back && <Icon
          name="chevron-back-outline"
          type="ionicon"
          color={theme.colors.primary}
          size={20}
          onPress={() => navigation.goBack()}
        />}
      </View>
      <View style={styles.titleContainer}>
        <Title preview style={styles.title}>{title}</Title>
      </View>
    </View>
  )
}

const createStyles = ({colors}: Theme) => StyleSheet.create({
  container: {
    height: 50,
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: colors.line,
  },
  titleContainer: {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: ASIDE_SIZE,
  },
  title: {
    textAlign: 'center',
  },
  leftContainer: {
    width: ASIDE_SIZE,
  },
})
