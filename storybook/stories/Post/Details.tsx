//////////////////////////////////////////////////////////////////////
// Post Details Page
import React from 'react'
import { ScrollView, StyleProp, StyleSheet, View, ViewStyle } from 'react-native'
import { ActivityIndicator } from 'react-native-paper'
import { useInit } from '~comps/hooks'
import { useSubsocial } from '~comps/SubsocialContext'
import { useAppDispatch } from 'src/rtk/app/hooksCommon'
import { useSelectPost, useSelectReplyIds, useReplyTo } from 'src/rtk/app/hooks'
import { fetchPost } from 'src/rtk/features/posts/postsSlice'
import { fetchSpace } from 'src/rtk/features/spaces/spacesSlice'
import { fetchProfile } from 'src/rtk/features/profiles/profilesSlice'
import { fetchPostReplyIds } from 'src/rtk/features/replies/repliesSlice'
import { AccountId, PostId } from 'src/types/subsocial'
import { Divider } from '~comps/Typography'
import { Head, Body, PostOwner } from './Post'
import { LikeAction, LikeEvent } from './Likes'
import { SharePostAction } from './Share'
import { Preview as SpacePreview } from '../Space/Preview'
import { CommentThread } from '../Comments'
import { Panel as ActionPanel, ShareEvent } from '../Actions'
import { Tags } from '../Misc'

export type DetailsProps = {
  id: PostId
  containerStyle?: StyleProp<ViewStyle>
  scrollerStyle?: StyleProp<ViewStyle>
  contentContainerStyle?: StyleProp<ViewStyle>
  commentContainerStyle?: StyleProp<ViewStyle>
  onPressOwner?: () => void
  onPressSpace?: () => void
  onPressLike?: (evt: LikeEvent) => void
  onLike?: (evt: LikeEvent) => void
  onUnlike?: (evt: LikeEvent) => void
  onPressShare?: (evt: ShareEvent) => void
  onShare?: (evt: ShareEvent) => void
  onPressReply?: (id: PostId) => void
  onPressReplyOwner?: (id: AccountId) => void
}
export function Details({
  id,
  containerStyle,
  scrollerStyle,
  contentContainerStyle,
  commentContainerStyle,
  onPressOwner,
  onPressSpace,
  onPressLike,
  onLike,
  onUnlike,
  onPressShare,
  onShare,
  onPressReply,
  onPressReplyOwner,
}: DetailsProps) {
  const { api } = useSubsocial()
  const dispatch = useAppDispatch()
  
  const data = useSelectPost(id)
  const { spaceId, ownerId } = data?.post?.struct ?? {}
  const replies = useSelectReplyIds(id)
  
  useReplyTo(id)
  
  useInit(async () => {
    dispatch(fetchPost({ api, id, reload: true }))
    return true
  }, [ id ], [])
  
  useInit(async () => {
    if (!spaceId) return false
    
    dispatch(fetchSpace({ api, id: spaceId }))
    return true
  }, [ id ], [ spaceId ])
  
  useInit(async () => {
    if (!ownerId) return false
    
    dispatch(fetchProfile({ api, id: ownerId, reload: true }))
    return true
  }, [ id ], [ ownerId ])
  
  const loadingReplies = !useInit(async () => {
    await dispatch(fetchPostReplyIds({ api, id }))
    return true
  }, [ id ], [])
  
  if (!data) {
    return (
      <View style={[ styles.loadingContainer, containerStyle ]}>
        <ActivityIndicator size="large" />
      </View>
    )
  }
  
  else {
    return (
      <View style={styles.container}>
        <ScrollView style={[ styles.scroller, scrollerStyle ]}>
          <View style={[ styles.content, contentContainerStyle ]}>
            <PostOwner
              postId={id}
              postData={data?.post}
              {...{ onPressOwner, onPressSpace }}
            />
            <Head 
              title={data?.post?.content?.title}
              titleStyle={{ marginBottom: 0 }} // Markdown adds indents as well
              image={data?.post?.content?.image}
            />
            <Body
              content={data?.post?.content?.body ?? ''}
            />
            <Tags tags={data?.post?.content?.tags ?? []} />
            <ActionPanel style={{ marginVertical: 20, justifyContent: 'space-between' }}>
              <LikeAction
                postId={id}
                onPress={onPressLike}
                onLike={onLike}
                onUnlike={onUnlike}
              />
              <SharePostAction
                postId={id}
                onPress={onPressShare}
                onShare={onShare}
              />
            </ActionPanel>
            
            <Divider style={[{ marginTop: 0, marginBottom: 20 }]} />
            
            <SpacePreview
              id={data?.post?.struct?.spaceId ?? ''}
              showFollowButton
              showAbout
              onPressSpace={onPressSpace}
            />
          </View>
          
          <Divider style={styles.divider} />
          
          {loadingReplies
          ? <View style={styles.loadingReplies}><ActivityIndicator /></View>
          : replies.map(id => (
              <View key={id}>
                <CommentThread
                  id={id}
                  onPressReply={onPressReply}
                  onPressProfile={onPressReplyOwner}
                  containerStyle={[ styles.comment, commentContainerStyle ]}
                />
                <Divider style={styles.commentDivider} />
              </View>
            ))
          }
        </ScrollView>
      </View>
    )
  }
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  container: {
    flex: 1,
  },
  scroller: {
    flex: 1,
  },
  content: {
    padding: 20,
  },
  divider: {
    marginVertical: 0,
  },
  comment: {
    padding: 20,
    paddingBottom: 0,
  },
  commentDivider: {
    marginVertical: 0,
  },
  loadingReplies: {
    width: '100%',
    height: 80,
    alignItems: 'center',
    justifyContent: 'center',
  },
})
