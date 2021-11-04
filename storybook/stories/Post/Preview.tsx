//////////////////////////////////////////////////////////////////////
// Post Preview - assembled from Post Base components
import React, { useCallback } from 'react'
import { Pressable, StyleProp, StyleSheet, View, ViewStyle } from 'react-native'
import { useNavigation } from '@react-navigation/native'
import { useCreateReloadPost, useSelectPost } from 'src/rtk/app/hooks'
import { useInit } from '~comps/hooks'
import { PostId, PostWithSomeDetails } from 'src/types/subsocial'
import { ExploreStackNavigationProp } from '~comps/ExploreStackNav'
import { Divider } from '~comps/Typography'
import { Head, Body, PostOwner, PostOwnerProps } from './Post'
import { Panel as ActionPanel } from '../Actions'
import { ActionMenu } from '~stories/Actions'
import { WithSize } from 'src/types'

export type PostPreviewProps = Omit<PreviewDataProps, 'data'>
export const Preview = React.memo(({ id, ...props }: PostPreviewProps) => {
  const reloadPost = useCreateReloadPost()
  const data = useSelectPost(id)
  
  useInit(() => {
    if (data) return true
    
    if (!reloadPost) return false
    
    reloadPost({ id })
    return true
  }, [id], [reloadPost])
  
  return <PreviewData {...props} {...{ id, data }} />
})


type PreviewDataProps = {
  id: PostId
  data: PostWithSomeDetails | undefined
  containerStyle?: StyleProp<ViewStyle>
  onPressMore?: (id: PostId) => void
  onPressOwner?: PostOwnerProps['onPressOwner']
  onPressSpace?: PostOwnerProps['onPressSpace']
}
export const PreviewData = React.memo(({
  id,
  data,
  containerStyle,
  onPressMore: _onPressMore,
  onPressOwner,
  onPressSpace,
}: PreviewDataProps) =>
{
  const nav = useNavigation<ExploreStackNavigationProp | undefined>()
  const renderActions = ({ size }: WithSize) => {
    return <>
      <ActionMenu.Secondary
        label="View reactions"
        icon={{
          family: 'ionicon',
          name: 'bulb-outline',
          size,
        }}
        onPress={() => alert('not yet implemented, sorry')}
      />
      <ActionMenu.Secondary
        label="View on IPFS"
        icon={{
          family: 'ionicon',
          name: 'analytics-outline',
          size,
        }}
        onPress={() => alert('not yet implemented, sorry')}
      />
    </>
  }
  
  const { title = '', body: content = '', image } = data?.post?.content ?? {}
  
  const onPressMore = useCallback((id: PostId) => {
    if (_onPressMore) {
      _onPressMore(id)
    }
    else if (nav?.push) {
      nav.push('Post', { postId: id })
    }
  }, [ _onPressMore ])
  
  return (
    <View style={[ styles.container, containerStyle ]}>
      <PostOwner
        {...{ onPressOwner, onPressSpace }}
        postId={id}
        postData={data?.post}
        actionMenuProps={{
          secondary: renderActions
        }}
      />
      <Pressable onPress={() => onPressMore?.(id)}>
        <Head {...{ title, image }} preview />
        <Body content={content} preview />
      </Pressable>
      
      <Divider style={{ marginTop: 16 }} />
      
      <ActionPanel style={{ marginVertical: 16 }}>
        <ActionPanel.LikeItem
          liked={false}
          likesCount={data?.post?.struct?.upvotesCount ?? 0}
          onPress={() => alert('not yet implemented, sorry')}
        />
        <ActionPanel.ReplyItem
          replyCount={data?.post?.struct?.visibleRepliesCount ?? 0}
          onPress={() => alert('not yet implemented, sorry')}
        />
        <ActionPanel.ShareItem
          label={data?.post?.struct?.sharesCount}
          onPress={() => alert('not yet implemented, sorry')}
        />
        <ActionPanel.TipItem />
      </ActionPanel>
    </View>
  )
})

const styles = StyleSheet.create({
  container: {
    width: '100%',
    padding: 20,
    paddingBottom: 0,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  titleWrapper: {
    paddingTop: 6,
  },
  title: {
    fontWeight: 'bold',
    textAlignVertical: 'bottom',
  },
  italic: {
    fontStyle: 'italic',
  },
})
