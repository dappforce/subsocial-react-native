import React from 'react'
import { Pressable, StyleProp, StyleSheet, View, ViewProps, ViewStyle } from 'react-native'
import { useSelectPost, useSelectProfile } from 'src/rtk/app/hooks'
import { ProfileData, PostData, PostId, AccountId, CommentStruct } from 'src/types/subsocial'
import { useInit, useOptionalCallback } from '~comps/hooks'
import { IpfsAvatar } from '~comps/IpfsImage'
import { createThemedStylesHook } from '~comps/Theming'
import { Text } from '~comps/Typography'
import { getDisplayName } from '~stories/Account/util'
import { Markdown } from '~stories/Misc'
import { Panel as ActionPanel } from '~stories/Actions'
import { LikeAction } from '~stories/Post/Likes'
import { SharePostAction } from '~stories/Post/Share'
import { logger as createLogger } from '@polkadot/util'
import { useSubsocial } from '~comps/SubsocialContext'
import { useAppDispatch } from 'src/rtk/app/hooksCommon'
import { fetchPost } from 'src/rtk/features/posts/postsSlice'
import { fetchProfile } from 'src/rtk/features/profiles/profilesSlice'
import { Opt } from 'src/types'
import Age from 'src/util/Age'

const log = createLogger('Comment')

export type CommentProps = Omit<CommentDataProps, 'post' | 'profile'> & {
  id: PostId
}
export const Comment = React.memo(({ id, ...props }: CommentProps) => {
  const { api } = useSubsocial()
  const dispatch = useAppDispatch()
  
  const post = useSelectPost(id)
  const profileId = post?.post.struct.ownerId
  const profile = useSelectProfile(profileId)
  const rootId = (post?.post.struct as Opt<CommentStruct>)?.rootPostId
  
  useInit(async () => {
    if (post) return true
    
    if (!post) {
      dispatch(fetchPost({ api, id, reload: true }))
    }
    return true
  }, [ id ], [])
  
  useInit(async () => {
    if (profile) return true
    
    if (profileId) {
      dispatch(fetchProfile({ api, id: profileId, reload: true }))
    }
    return true
  }, [ profileId ], [])

  useInit(async () => {
    if (rootId) {
      dispatch(fetchPost({ api, id: rootId, reload: false }))
    }
    
    return true
  }, [ rootId ], [])
  
  return <CommentData {...props} post={post?.post} profile={profile} />
})

export type CommentDataProps = {
  post?: PostData
  profile?: ProfileData
  preview?: boolean
  containerStyle?: StyleProp<ViewStyle>
  panelStyle?: StyleProp<ViewStyle>
  onPressMore?: () => void
  onPressProfile?: (accountId: AccountId) => void
  onLayout?: ViewProps['onLayout']
}
export const CommentData = React.memo(({
  post,
  profile,
  preview,
  containerStyle,
  panelStyle,
  onPressMore,
  onPressProfile: _onPressProfile,
  onLayout,
}: CommentDataProps) =>
{
  const styles = useThemedStyles()
  
  const onPressProfile = useOptionalCallback(() => {
    if (post) {
      _onPressProfile?.(post.struct.ownerId)
    }
  }, [ post?.struct.ownerId, _onPressProfile ], [])
  
  if (post && !post.struct.isComment) {
    log.warn(`Post ${post.id} is not a comment`)
    
    return (
      <View style={containerStyle}>
        <Text mode="secondary" style={styles.notAComment}>Post is not a comment.</Text>
      </View>
    )
  }
  
  else {
    return (
      <View style={[styles.container, containerStyle]} onLayout={onLayout}>
        <View style={styles.left}>
          <IpfsAvatar cid={profile?.content?.avatar} onPress={onPressProfile} size={30} />
        </View>
        <View style={styles.right}>
          <View style={styles.headline}>
            <Text style={styles.name} onPress={onPressProfile}>{getDisplayName(post?.struct.ownerId, profile)}</Text>
            <Text mode="secondary" style={styles.headlineSep}>·</Text>
            <Text mode="secondary" style={styles.age}>
              {new Age(post?.struct.createdAtTime ?? 0).toString()}
            </Text>
            {/* TODO: Action Menu */}
          </View>
          
          <Pressable onPress={onPressMore}>
            <Markdown summary={preview}>
              {post?.content?.body ?? ''}
            </Markdown>
          </Pressable>
          
          <ActionPanel style={[styles.panel, panelStyle]}>
            <LikeAction
              postId={post?.id.toString() ?? ''}
              containerStyle={styles.panelIcon}
            />
            <ActionPanel.ReplyItem
              replyCount={post?.struct.visibleRepliesCount ?? 0}
              onPress={() => alert('not yet implemented')}
              containerStyle={styles.panelIcon}
            />
            <SharePostAction
              postId={post?.id.toString() ?? ''}
              containerStyle={styles.panelIcon}
            />
          </ActionPanel>
        </View>
      </View>
    )
  }
})


const useThemedStyles = createThemedStylesHook((theme) => StyleSheet.create({
  container: {
    display: 'flex',
    flexDirection: 'row',
  },
  left: {
    marginRight: 10,
  },
  right: {
    flex: 1,
  },
  
  notAComment: {
    textAlign: 'center',
    margin: 10,
  },
  
  headline: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
  },
  name: {
    fontFamily: 'RobotoMedium',
  },
  headlineSep: {
    marginHorizontal: 5,
  },
  age: {
    
  },
  actions: {
    marginLeft: 'auto',
  },
  
  panel: {
    justifyContent: 'flex-start',
    marginVertical: 15,
  },
  panelIcon: {
    marginRight: 20,
  },
}))
