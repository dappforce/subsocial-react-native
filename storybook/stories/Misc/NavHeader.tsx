//////////////////////////////////////////////////////////////////////
// NavHeader component to be used with stack navigators
import React from 'react'
import { StyleSheet, View } from 'react-native'
import { StackHeaderProps as StackBaseProps } from '@react-navigation/stack'
import { BottomTabHeaderProps as BottomTabBaseProps } from '@react-navigation/bottom-tabs'
import { getHeaderTitle } from '@react-navigation/elements'
import { Icon } from '~comps/Icon'
import { Title } from '~comps/Typography'
import { Theme, ThemeContext } from '~comps/Theming'

const ASIDE_SIZE = 40

export type StackHeaderProps = StackBaseProps & {}
export function StackHeader({navigation, route, options, back}: StackHeaderProps) {
  const title = getHeaderTitle(options, route.name)
  
  return (
    <ThemeContext.Consumer>
      {(theme) => {
        const themedStyles = createThemedStyles(theme)
        return (
          <View style={[styles.container, themedStyles.container]}>
            <View style={styles.leftContainer}>
              {back && <Icon
                family="ionicon"
                name="chevron-back-outline"
                color={theme.colors.primary}
                size={20}
                onPress={() => navigation.goBack()}
                rippleBorderless
                rippleSize={20}
              />}
            </View>
            <View style={styles.titleContainer}>
              <Title preview style={styles.title}>{title}</Title>
            </View>
          </View>
        )
      }}
      </ThemeContext.Consumer>
  )
}

export type BottomTabHeaderProps = BottomTabBaseProps & {}
export function BottomTabHeader({route, options}: BottomTabHeaderProps) {
  const title = getHeaderTitle(options, route.name)
  
  return (
    <ThemeContext.Consumer>
      {(theme) => {
        const themedStyles = createThemedStyles(theme)
        return (
          <View style={[styles.container, themedStyles.container]}>
            <View style={styles.leftContainer}>
              {/* TODO: Drawer menu icon */}
            </View>
            <View style={styles.titleContainer}>
              <Title preview style={styles.title}>{title}</Title>
            </View>
          </View>
        )
      }}
    </ThemeContext.Consumer>
  )
}

const styles = StyleSheet.create({
  container: {
    height: 50,
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    // borderBottomColor: colors.line,
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

const createThemedStyles = ({colors}: Theme) => StyleSheet.create({
  container: {
    borderBottomColor: colors.line
  },
})
