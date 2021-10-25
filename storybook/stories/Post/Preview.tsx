//////////////////////////////////////////////////////////////////////
// Post Preview - assembled from Post Base components
import React from 'react'
import { Pressable, StyleSheet, View } from 'react-native'
import { useCreateReloadPost, useSelectPost, useSelectProfile } from 'src/rtk/app/hooks'
import { useInit } from '~comps/hooks'
import { Head, Body, PostOwner, PostOwnerProps } from './Post'
import { Panel as ActionPanel } from '../Actions'
import { ActionMenu, IconDescriptor } from '~stories/Actions'
import { PostId, PostWithSomeDetails } from 'src/types/subsocial'

const ICON_REACTIONS: IconDescriptor = {name: 'bulb-outline',      family: 'ionicon'}
const ICON_IPFS:      IconDescriptor = {name: 'analytics-outline', family: 'ionicon'}

export type PostPreviewProps = Omit<PreviewDataProps, 'data'>
export const Preview = React.memo(({id, ...props}: PostPreviewProps) => {
  const reloadPost = useCreateReloadPost()
  const data = useSelectPost(id)
  
  useInit(() => {
    if (data) return true;
    if (!reloadPost) return false
    reloadPost({id})
    return true
  }, [id], [reloadPost])
  
  return <PreviewData {...props} {...{id, data}} />
})


type PreviewDataProps = {
  id: PostId
  data: PostWithSomeDetails | undefined
  onPressMore?: (id: PostId) => void
  onPressOwner?: PostOwnerProps['onPressOwner']
  onPressSpace?: PostOwnerProps['onPressSpace']
};
export const PreviewData = React.memo(({id, data, onPressMore, onPressOwner, onPressSpace}: PreviewDataProps) => {
  const renderActions = ({size}: {size: number}) => <>
    <ActionMenu.Secondary label="View reactions" icon={{...ICON_REACTIONS, size}} onPress={() => alert('not yet implemented, sorry')} />
    <ActionMenu.Secondary label="View on IPFS"   icon={{...ICON_IPFS,      size}} onPress={() => alert('not yet implemented, sorry')} />
  </>
  
  const {title = '', body: content = '', image} = data?.post?.content ?? {}
  
  return (
    <View style={styles.container}>
      <PostOwner
        {...{onPressOwner, onPressSpace}}
        postId={id}
        postData={data?.post}
        actionMenuProps={{
          secondary: renderActions
        }}
      />
      <Pressable onPress={() => onPressMore?.(id)}>
        <Head {...{title, image}} titleStyle={[!data && styles.italic]} preview />
        <Body content={content} preview />
      </Pressable>
      <ActionPanel>
        <ActionPanel.LikeItem
          liked={false}
          likesCount={data?.post?.struct?.upvotesCount ?? 0}
          onPress={() => alert('not yet implemented, sorry')}
        />
        <ActionPanel.ReplyItem
          replyCount={data?.post?.struct?.visibleRepliesCount ?? 0}
          onPress={() => alert('not yet implemented, sorry')}
        />
        <ActionPanel.ShareItem />
      </ActionPanel>
    </View>
  )
})

const styles = StyleSheet.create({
  container: {
    width: '100%',
    padding: 10,
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
});
