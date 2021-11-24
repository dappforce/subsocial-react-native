//////////////////////////////////////////////////////////////////////
// Post Details Page
import React from 'react'
import { ScrollView, StyleProp, StyleSheet, TextStyle, View } from 'react-native'
import { ActivityIndicator } from 'react-native-paper'
import { useInit } from '~comps/hooks'
import { useCreateReloadPost, useCreateReloadProfile, useCreateReloadSpace, useSelectPost } from 'src/rtk/app/hooks'
import { PostId } from 'src/types/subsocial'
import { Head, Body, PostOwner } from './Post'
import { LikeAction, LikeEvent } from './Likes'
import { Preview as SpacePreview } from '../Space/Preview'
import { Divider } from '~comps/Typography'
import { Panel as ActionPanel } from '../Actions'
import { Tags } from '~stories/Misc'

export type DetailsProps = {
  id: PostId
  containerStyle?: StyleProp<TextStyle>
  onPressOwner?: () => void
  onPressSpace?: () => void
  onPressLike?: (evt: LikeEvent) => void
  onLike?: (evt: LikeEvent) => void
  onUnlike?: (evt: LikeEvent) => void
}
export function Details({ id, containerStyle, onPressOwner, onPressSpace, onPressLike, onLike, onUnlike }: DetailsProps) {
  const reloadPost    = useCreateReloadPost()
  const reloadProfile = useCreateReloadProfile()
  const reloadSpace   = useCreateReloadSpace()
  
  const data = useSelectPost(id)
  const { spaceId, ownerId } = data?.post?.struct ?? {}
  
  useInit(async () => {
    if (!data) {
      reloadPost({ id })
      return false
    }
    
    await Promise.all([
      spaceId && reloadSpace({ id: spaceId }),
      ownerId && reloadProfile({ id: ownerId }),
    ])
    
    return true
  }, [ id ], [ spaceId, ownerId ])
  
  if (!data) {
    return (
      <View style={[ styles.loadingContainer, containerStyle ]}>
        <ActivityIndicator size="large" />
      </View>
    )
  }
  
  else {
    return (
      <ScrollView style={[ styles.container, containerStyle ]}>
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
          <ActionPanel.ShareItem label onPress={() => alert('not yet implemented, sorry')} />
        </ActionPanel>
        
        <Divider style={[{marginTop: 0, marginBottom: 20}]} />
        
        <SpacePreview
          id={data?.post?.struct?.spaceId ?? ''}
          showFollowButton
          showAbout
          onPressSpace={onPressSpace}
        />
        
        <Divider style={styles.divider} />
        
        {/* TODO: Comments! */}
      </ScrollView>
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
    padding: 20,
  },
  divider: {
    marginVertical: 10,
  },
})
