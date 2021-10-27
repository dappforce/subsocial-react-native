//////////////////////////////////////////////////////////////////////
// Post Details Page
import React from 'react'
import { ScrollView, StyleProp, StyleSheet, TextStyle, View } from 'react-native'
import { ActivityIndicator } from 'react-native-paper'
import { useInit } from '~comps/hooks'
import { useCreateReloadPost, useCreateReloadProfile, useCreateReloadSpace, useSelectPost } from 'src/rtk/app/hooks'
import { PostId } from 'src/types/subsocial'
import { Head, Body, PostOwner } from './Post'
import { Preview as SpacePreview } from '../Space/Preview'
import { Divider } from '~comps/Typography'
import { Panel as ActionPanel } from '../Actions'
import { Tags } from '~stories/Misc'

export type DetailsProps = {
  id: PostId
  containerStyle?: StyleProp<TextStyle>
  onPressOwner?: () => void
  onPressSpace?: () => void
}
export function Details({id, containerStyle, onPressOwner, onPressSpace}: DetailsProps) {
  const reloadPost    = useCreateReloadPost()
  const reloadProfile = useCreateReloadProfile()
  const reloadSpace   = useCreateReloadSpace()
  
  const data = useSelectPost(id)
  
  useInit(async () => {
    if (!reloadPost || !reloadProfile || !reloadSpace) return false
    
    if (!data) {
      reloadPost({id})
      return false
    }
    
    const {spaceId, ownerId} = data.post.struct
    
    await Promise.all([
      spaceId && reloadSpace({id: spaceId}),
      ownerId && reloadProfile({id: ownerId}),
    ])
    
    return true
  }, [ id ], [ data, reloadPost, reloadProfile, reloadSpace ])
  
  if (!data) {
    return (
      <View style={[styles.loadingContainer, containerStyle]}>
        <ActivityIndicator size="large" />
      </View>
    )
  }
  else {
    return (
      <ScrollView style={[styles.container, containerStyle]}>
        <PostOwner
          postId={id}
          postData={data?.post}
          {...{onPressOwner, onPressSpace}}
        />
        <Head
          title={data?.post?.content?.title}
          titleStyle={{marginTop: 15, marginBottom: 0}} // Markdown adds indents as well
          image={data?.post?.content?.image}
        />
        <Body
          content={data?.post?.content?.body ?? ''}
        />
        <Tags tags={data?.post?.content?.tags ?? []} />
        <ActionPanel>
          <ActionPanel.LikeItem liked={false} likesCount={data?.post?.struct?.upvotesCount ?? 0} onPress={() => alert('not yet implemented, sorry')} />
          <ActionPanel.ShareItem onPress={() => alert('not yet implemented, sorry')} />
        </ActionPanel>
        <SpacePreview
          id={data?.post?.struct?.spaceId ?? ''}
          showFollowButton
          showAbout
          preview
        />
        <Divider style={{marginVertical: 10}} />
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
    padding: 10,
  },
})
