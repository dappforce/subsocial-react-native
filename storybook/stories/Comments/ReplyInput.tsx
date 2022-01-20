import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Animated, StyleProp, StyleSheet, TextInput, TextStyle, View, ViewStyle } from 'react-native'
import { useStore } from 'react-redux'
import { fetchPost, insertReply, replaceReply, setPrompt, upsertPost } from 'src/rtk/app/actions'
import { useMyProfile, useSelectKeypair, useSelectPost } from 'src/rtk/app/hooks'
import { useAppDispatch } from 'src/rtk/app/hooksCommon'
import type { RootState } from 'src/rtk/app/rootReducer'
import { createComment } from 'src/tx'
import { PostId } from 'src/types/subsocial'
import { createMockStruct } from 'src/util/post'
import { snack } from 'src/util/snack'
import { MyIpfsAvatar } from '~comps/IpfsImage'
import { useSubsocial } from '~comps/SubsocialContext'
import { createThemedStylesHook, useTheme } from '~comps/Theming'
import { getDisplayName } from '~stories/Account/util'
import { logger as createLogger } from '@polkadot/util'

const log = createLogger('ReplyInput')
const SUMMARY_LENGTH = 120

export type ReplyInputProps = {
  postId: PostId
  containerStyle?: StyleProp<ViewStyle>
  inputStyle?: StyleProp<TextStyle>
  autoFocus?: boolean
}

export const ReplyInput = React.memo(({ postId, containerStyle, inputStyle, autoFocus }: ReplyInputProps) => {
  const { api } = useSubsocial()
  const store = useStore<RootState>()
  const dispatch = useAppDispatch()
  const theme = useTheme()
  const styles = useThemedStyles()
  const keypair = useSelectKeypair()
  const address = keypair?.address
  const post = useSelectPost(postId)
  const myProfile = useMyProfile()
  const input = useRef<TextInput>()
  
  const alpha = useMemo(() => new Animated.Value(0), [])
  const bgc = alpha.interpolate({
    inputRange: [0, 1],
    outputRange: [theme.colors.input, theme.colors.background],
  })
  
  const [ comment, setComment ] = useState('')
  
  const onFocus = useCallback(() => {
    if (!keypair) {
      dispatch(setPrompt('login'))
    }
    else if (keypair.isLocked()) {
      dispatch(setPrompt('unlock'))
    }
    else {
      Animated.timing(alpha, {
        toValue: 1,
        duration: 500,
        useNativeDriver: false,
      }).start()
    }
  }, [ alpha ])
  
  const onBlur = useCallback(() => {
    Animated.timing(alpha, {
      toValue: 0,
      duration: 500,
      useNativeDriver: false,
    }).start()
  }, [ alpha ])
  
  const onSubmit = useCallback(() => {
    if (!keypair) {
      dispatch(setPrompt('login'))
    }
    else if (keypair.isLocked()) {
      dispatch(setPrompt('unlock'))
    }
    
    else if (post && comment.trim()) {
      const cmnt = comment.trim()
      
      createComment({
        api,
        store,
        parent: post.post.struct,
        content: {
          body: cmnt,
          isShowMore: cmnt.length > SUMMARY_LENGTH,
          summary: cmnt.substring(0, SUMMARY_LENGTH),
          format: 'md',
        },
        onCreateTemporary: (tmpId, cid) => {
          dispatch(upsertPost(createMockStruct({
            id: tmpId,
            address: address ?? '0',
            type: 'comment',
            contentId: cid,
          })))
          
          dispatch(insertReply({ parentId: postId, postId: tmpId }))
          setComment('')
        },
        onCreatePost: (tmpId, id) => {
          dispatch(replaceReply({ parentId: postId, oldPostId: tmpId, newPostId: id }))
          dispatch(fetchPost({ api, id, reload: true }))
        }
      })
      .catch(err => {
        snack({ text: 'Failed to post comment', textColor: theme.colors.rejection })
        log.error('Failed to create reply', err)
      })
    }
  }, [ keypair, post, postId, api, store, comment ])
  
  useEffect(() => {
    if (autoFocus && input) {
      input.current?.focus()
    }
  }, [ postId ])
  
  return (
    <View style={[styles.container, containerStyle]}>
      <MyIpfsAvatar size={30} color={theme.colors.divider} style={styles.avatar} />
      
      <Animated.View style={[styles.inputContainer, { backgroundColor: bgc }]}>
        <TextInput
          onFocus={onFocus}
          onBlur={onBlur}
          ref={ref => input.current = ref || undefined}
          placeholder={address ? 'Add comment as ' + getDisplayName(address, myProfile) : 'Please login to comment'}
          style={[styles.input, inputStyle]}
          blurOnSubmit
          value={comment}
          onChangeText={v => setComment(v)}
          onSubmitEditing={onSubmit}
        />
      </Animated.View>
    </View>
  )
})

const useThemedStyles = createThemedStylesHook(({ colors }) => StyleSheet.create({
  container: {
    display: 'flex',
    flexDirection: 'row',
  },
  avatar: {
    marginRight: 10,
  },
  inputContainer: {
    flex: 1,
    paddingHorizontal: 20,
    borderRadius: 40,
  },
  input: {
    width: '100%',
  },
}))
