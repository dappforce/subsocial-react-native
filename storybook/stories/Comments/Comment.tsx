import React from 'react'
import { StyleProp, StyleSheet, View, ViewStyle } from 'react-native'
import { useSelectPost, useSelectProfile } from 'src/rtk/app/hooks'
import { ProfileData, PostData, PostId, AccountId } from 'src/types/subsocial'
import { Age } from 'src/util'
import { useInit, useOptionalCallback } from '~comps/hooks'
import { IpfsAvatar } from '~comps/IpfsImage'
import { createThemedStylesHook } from '~comps/Theming'
import { Text } from '~comps/Typography'
import { getDisplayName } from '~stories/Account'
import { Markdown } from '~stories/Misc'
import { Panel as ActionPanel } from '~stories/Actions'
import { LikeAction } from '~stories/Post/Likes'
import { SharePostAction } from '~stories/Post/Share'
import { logger as createLogger } from '@polkadot/util'
import { useSubsocial } from '~comps/SubsocialContext'
import { useAppDispatch } from 'src/rtk/app/hooksCommon'
import { fetchPost } from 'src/rtk/features/posts/postsSlice'
import { fetchProfile } from 'src/rtk/features/profiles/profilesSlice'

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
  
  useInit(async () => {
    if (post && profile) return true
    
    if (!post) {
      dispatch(fetchPost({ api, id, reload: true }))
      return false
    }
    
    if (!profile && profileId) {
      dispatch(fetchProfile({ api, id: profileId, reload: true }))
    }
    
    return true
  }, [ id ], [ profileId ])
  
  return <CommentData {...props} post={post?.post} profile={profile} />
})

export type CommentDataProps = {
  post?: PostData
  profile?: ProfileData
  preview?: boolean
  containerStyle?: StyleProp<ViewStyle>
  onPressMore?: () => void
  onPressProfile?: (accountId: AccountId) => void
}
export const CommentData = React.memo(({
  post,
  profile,
  preview,
  containerStyle,
  onPressMore,
  onPressProfile: _onPressProfile,
}: CommentDataProps) =>
{
  const styles = useThemedStyles()
  
  const onPressProfile = useOptionalCallback(() => {
    if (profile) {
      _onPressProfile?.(profile.id)
    }
  }, [ profile, _onPressProfile ], [ _onPressProfile ])
  
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
      <View style={[styles.container, containerStyle]}>
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
          
          <Markdown
            onPressMore={onPressMore}
            summary={preview}
          >
            {post?.content?.body ?? ''}
          </Markdown>
          
          <ActionPanel style={styles.panel}>
            <LikeAction postId={post?.id.toString() ?? ''} containerStyle={styles.panelIcon} />
            <ActionPanel.ReplyItem replyCount={0} onPress={() => alert('not yet implemented')} containerStyle={styles.panelIcon} />
            <SharePostAction postId={post?.id.toString() ?? ''} containerStyle={styles.panelIcon} />
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
  },
  panelIcon: {
    marginRight: 20,
  },
}))
