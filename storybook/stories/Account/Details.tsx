import React, { useCallback, useMemo, useState } from 'react'
import { Dimensions, LayoutChangeEvent, StyleProp, StyleSheet, View, ViewStyle } from 'react-native'
import Animated, { Extrapolate, interpolate, useAnimatedStyle, useDerivedValue, useSharedValue } from 'react-native-reanimated'
import {
  createMaterialTopTabNavigator,
  MaterialTopTabBarProps,
  MaterialTopTabBar,
  MaterialTopTabNavigationProp,
  MaterialTopTabScreenProps
} from '@react-navigation/material-top-tabs'
import { BottomSheetHandleProps } from '@gorhom/bottom-sheet'
import Clipboard from '@react-native-community/clipboard'
import * as Linking from 'expo-linking'
import { AccountId } from 'src/types/subsocial'
import { useCreateReloadProfile, useSelectKeypair, useSelectProfile } from 'src/rtk/app/hooks'
import { createThemedStylesHook, Theme, useTheme } from '~comps/Theming'
import { useInit } from '~comps/hooks'
import { Preview } from './Preview'
import { BalanceData, Markdown, useBalance } from '~stories/Misc'
import { Button, Divider } from '~comps/Typography'
import { Icon } from '~comps/Icon'
import { IpfsAvatar } from '~comps/IpfsImage'
import { ActionMenuItem, FollowAccountButton } from '~stories/Actions'
import { BottomSheet } from '~stories/Modals/BottomSheet'
import { DetailsHeaderProvider, useDetailsHeader } from './DetailsHeaderContext'
import { Address } from './Address'
import { Posts } from './Posts'
import { Comments } from './Comments'
import { Upvotes } from './Upvotes'
import { Follows } from './Follows'
import { Spaces } from './Spaces'
import Collapsible from 'react-native-collapsible'
import Elevations from 'react-native-elevation'
import SubIDIcon from 'assets/subid-logo.svg'
import { snack } from 'src/util/snack'
import { QRCodeModal } from '~stories/Modals/QRCodeModal'

export type DetailsRoutes = {
  posts:    {}
  comments: {}
  upvotes:  {}
  follows:  {}
  spaces:   {}
}

export type DetailsNavProps = MaterialTopTabNavigationProp<DetailsRoutes>
export type DetailsScreenProps<S extends keyof DetailsRoutes> = MaterialTopTabScreenProps<DetailsRoutes, S>

const Tabs = createMaterialTopTabNavigator<DetailsRoutes>()

export type DetailsProps = {
  id: AccountId
}
export function Details({ id }: DetailsProps) {
  const theme = useTheme()
  const styles = useThemedStyle()
  
  const AccountPosts    = useMemo(() => ({}: {}) => <WrappedPosts    id={id} />, [ id ])
  const AccountComments = useMemo(() => ({}: {}) => <WrappedComments id={id} />, [ id ])
  const AccountUpvotes  = useMemo(() => ({}: {}) => <WrappedUpvotes  id={id} />, [ id ])
  const AccountFollows  = useMemo(() => ({}: {}) => <WrappedFollows  id={id} />, [ id ])
  const AccountSpaces   = useMemo(() => ({}: {}) => <WrappedSpaces   id={id} />, [ id ])
  
  return (
    <DetailsHeaderProvider>
      <Tabs.Navigator
        tabBar={(props: MaterialTopTabBarProps) => <DetailsTabBar id={id} {...props} />}
        screenOptions={{
          tabBarStyle: styles.tabBar,
          tabBarLabelStyle: styles.tabLabel,
          tabBarInactiveTintColor: theme.colors.textSecondary,
          tabBarActiveTintColor: theme.colors.primary,
          tabBarItemStyle: styles.tabItem,
          tabBarScrollEnabled: true,
          lazy: true,
          lazyPreloadDistance: 0, // do not preload, because loading a single tab takes long enough
        }}
      >
        <Tabs.Screen name='posts'    component={AccountPosts}    options={{ tabBarLabel: 'Posts' }}    />
        <Tabs.Screen name='comments' component={AccountComments} options={{ tabBarLabel: 'Comments' }} />
        <Tabs.Screen name='upvotes'  component={AccountUpvotes}  options={{ tabBarLabel: 'Upvotes' }}  />
        <Tabs.Screen name='follows'  component={AccountFollows}  options={{ tabBarLabel: 'Follows' }}  />
        <Tabs.Screen name='spaces'   component={AccountSpaces}   options={{ tabBarLabel: 'Spaces' }}   />
      </Tabs.Navigator>
    </DetailsHeaderProvider>
  )
}

export type DetailsHeaderProps = {
  id: AccountId
  style?: StyleProp<ViewStyle>
  onLayout?: (event: LayoutChangeEvent) => void
}

export function DetailsHeader({ id, style, onLayout }: DetailsHeaderProps) {
  const { address: myAddress } = useSelectKeypair() ?? {}
  const isMyAccount = myAddress === id
  const theme = useTheme()
  const styles = useThemedStyle()
  const data = useSelectProfile(id)
  const reloadProfile = useCreateReloadProfile()
  
  useInit(async () => {
    if (!reloadProfile) return false
    
    if (!data) await reloadProfile({ id })
    return true
  }, [ id ], [ reloadProfile ])
  
  return (
    <View {...{style, onLayout}}>
      <Preview
        id={id}
        showFollowButton={false}
        actionMenu={() => <DetailsActionMenu id={id} />}
      />
      
      {!!data?.content?.about && <Markdown containerStyle={styles.about}>{data?.content?.about}</Markdown>}
      
      <Button
        mode="outlined"
        icon={() => <IpfsAvatar cid={data?.content?.avatar} size={24} />}
        style={styles.subidButton}
        labelStyle={{ color: theme.colors.textPrimary }}
        onPress={() => showOnSubID(id)}
      >
        Show on Sub.ID
      </Button>
      {!isMyAccount && <View style={styles.buttonRow}>
        <FollowAccountButton
          id={id}
          style={styles.followButton}
          showIcon
        />
        <Button
          mode="outlined"
          color={theme.colors.divider}
          icon={() => <Icon
            icon={{
              family: 'subicon',
              name: 'send-tip',
            }}
            color={theme.colors.textPrimary}
          />}
          style={styles.tipButton}
          labelStyle={{ color: theme.colors.textPrimary }}
          onPress={() => alert('not yet implemented')}
        >
          Send tips
        </Button>
      </View>}
    </View>
  )
}

type DetailsActionMenuProps = {
  id: AccountId
}
function DetailsActionMenu({ id }: DetailsActionMenuProps) {
  const theme = useTheme()
  const styles = useThemedStyle()
  const data = useSelectProfile(id)
  const balance = useBalance(id)
  const [ showQRCode, setShowQRCode ] = useState(false)
  
  return (
    <BottomSheet
      height={280}
      TriggerComponent={BottomSheet.trigger.MoreVertical}
      HandleComponent={(props) => <AvatarBottomSheetHandle cid={data?.content?.avatar ?? ''} {...props} />}
    >
      <BottomSheet.View>
        <View style={styles.menuHeader}>
          <Address id={id} style={styles.address} />
          <BalanceData
            balance={balance}
            truncate={3}
            labelStyle={styles.balance}
            currencyStyle={styles.balance}
            integerBalanceStyle={styles.balance}
            decimalBalanceStyle={styles.balance}
          />
        </View>
        <View style={styles.menuContent}>
          <ActionMenuItem
            label="Copy address"
            icon={{
              family: 'subicon',
              name: 'copy',
            }}
            onPress={() => {
              Clipboard.setString(id)
              snack({ text: 'Address copied to clipboard' })
            }}
            containerStyle={styles.menuItem}
          />
          <ActionMenuItem
            label="Show QR code"
            icon={{
              family: 'subicon',
              name: 'qr-code',
            }}
            onPress={() => setShowQRCode(true)}
            containerStyle={styles.menuItem}
          />
          <ActionMenuItem
            label="View on Sub.ID"
            icon={({ size }) => (
              <SubIDIcon
                width={size}
                height={size}
                color={theme.colors.line}
              />
            )}
            onPress={() => showOnSubID(id)}
            containerStyle={styles.menuItem}
          />
          
          <QRCodeModal
            data={id}
            visible={showQRCode}
            onClose={() => setShowQRCode(false)}
          />
        </View>
      </BottomSheet.View>
    </BottomSheet>
  )
}

type AvatarBottomSheetHandleProps = BottomSheetHandleProps & {
  cid: string
}
function AvatarBottomSheetHandle({ cid, animatedIndex, animatedPosition }: AvatarBottomSheetHandleProps) {
  const SIZE = 70
  const HALF_SIZE = SIZE / 2
  const theme = useTheme()
  
  const offsetX = useSharedValue(Dimensions.get('window').width / 2 - HALF_SIZE);
  const offsetY = useDerivedValue(() => {
    return interpolate(animatedIndex.value, [-1, 0], [0, -HALF_SIZE], Extrapolate.CLAMP)
  }, [ animatedPosition, HALF_SIZE ])
  
  const animstyle = useAnimatedStyle(() => {
    return {
      transform: [
        { translateX: offsetX.value },
        { translateY: offsetY.value },
      ],
    }
  })
  
  return (
    <Animated.View style={[
      animstyle,
      {
        height: HALF_SIZE,
        marginBottom: theme.consts.spacing,
      }
    ]}>
      <IpfsAvatar
        cid={cid}
        size={SIZE}
        style={{
          ...Elevations[6],
        }}
      />
    </Animated.View>
  )
}


type DetailsTabBarProps = MaterialTopTabBarProps & {
  id: AccountId
}
function DetailsTabBar({ id, ...props }: DetailsTabBarProps) {
  const styles = useThemedStyle()
  const { collapsed } = useDetailsHeader()
  
  const [ headerHeight, setHeaderHeight ] = useState(0)
  
  const onHeaderLayout = useCallback((event: LayoutChangeEvent) => {
    const { height } = event.nativeEvent.layout
    setHeaderHeight(height)
  }, [])
  
  return (
    <>
      <Collapsible collapsed={collapsed}>
        <DetailsHeader id={id} style={styles.header} onLayout={onHeaderLayout} />
      </Collapsible>
      <MaterialTopTabBar {...props} />
      <Divider />
    </>
  )
}


type CommonDetailsScreenProps = {
  id: AccountId
}

const WrappedPosts = React.memo(({ id }: CommonDetailsScreenProps) => {
  const { onScroll, onScrollBeginDrag, onScrollEndDrag } = useDetailsHeader()
  return <Posts {...{ id, onScroll, onScrollBeginDrag, onScrollEndDrag }} />
})
const WrappedComments = React.memo(({ id }: CommonDetailsScreenProps) => {
  const { onScroll, onScrollBeginDrag, onScrollEndDrag } = useDetailsHeader()
  return <Comments {...{ id, onScroll, onScrollBeginDrag, onScrollEndDrag }} />
})
const WrappedUpvotes = React.memo(({ id }: CommonDetailsScreenProps) => {
  const { onScroll, onScrollBeginDrag, onScrollEndDrag } = useDetailsHeader()
  return <Upvotes {...{ id, onScroll, onScrollBeginDrag, onScrollEndDrag }} />
})
const WrappedFollows = React.memo(({ id }: CommonDetailsScreenProps) => {
  const { onScroll, onScrollBeginDrag, onScrollEndDrag } = useDetailsHeader()
  return <Follows {...{ id, onScroll, onScrollBeginDrag, onScrollEndDrag }} />
})
const WrappedSpaces = React.memo(({ id }: CommonDetailsScreenProps)   => {
  const { onScroll, onScrollBeginDrag, onScrollEndDrag } = useDetailsHeader()
  return <Spaces {...{ id, onScroll, onScrollBeginDrag, onScrollEndDrag }} />
})


function showOnSubID(id: AccountId) {
  Linking.openURL(`https://sub.id/#/${id}`)
}


const useThemedStyle = createThemedStylesHook(({ colors, consts, fonts }: Theme) => StyleSheet.create({
  container: {
    flex: 1,
  },
  padded: {
    padding: consts.spacing,
  },
  
  header: {
    margin: 2 * consts.spacing,
    marginBottom: 0,
  },
  tabBar: {
    backgroundColor: colors.background,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.divider,
    ...Elevations[0],
  },
  tabItem: {
    width: 100,
  },
  tabLabel: {
    ...fonts.secondary,
    textTransform: 'none',
  },
  
  about: {
    marginTop: 2 * consts.spacing,
  },
  
  //#region Buttons
  subidButton: {
    marginTop: 2 * consts.spacing,
    borderRadius: 40,
  },
  buttonRow: {
    display: 'flex',
    flexDirection: 'row',
    marginTop: 1.5 * consts.spacing,
  },
  tipButton: {
    flex: 1,
    borderRadius: 40,
  },
  followButton: {
    flex: 1,
    borderRadius: 40,
    marginRight: 2 * consts.spacing,
  },
  //#endregion
  
  //#region Bottom Sheet
  menuHeader: {
    marginHorizontal: 2 * consts.spacing,
    marginBottom: consts.spacing,
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
  },
  address: {
    fontFamily: 'RobotoBold',
    fontSize: fonts.titlePreview.fontSize,
    textAlign: 'center',
    marginBottom: consts.spacing,
  },
  balance: {
    fontSize: fonts.primary.fontSize,
    color: colors.textSecondary,
    marginBottom: 2 * consts.spacing,
    textAlign: 'center',
  },
  menuContent: {
    
  },
  menuItem: {
    paddingVertical: consts.spacing,
  },
  //#endregion
}))
