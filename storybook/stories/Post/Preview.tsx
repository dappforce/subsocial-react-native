//////////////////////////////////////////////////////////////////////
// Post Preview - assembled from Post Base components
import React, { useCallback, useEffect } from 'react'
import { StyleProp, StyleSheet, View, ViewStyle } from 'react-native'
import { useNavigation } from '@react-navigation/native'
import { useCreateReloadPost, useSelectPost } from 'src/rtk/app/hooks'
import { PostId, PostWithSomeDetails } from 'src/types/subsocial'
import { ExploreStackNavigationProp } from '~comps/ExploreStackNav'
import { Divider } from '~comps/Typography'
import { Head, Body, PostOwner, PostOwnerProps } from './Post'
import { LikeAction, LikeEvent } from './Likes'
import { ReplyAction } from './Reply'
import { SharePostAction } from './Share'
import { ActionMenu, Panel as ActionPanel, ShareEvent } from '../Actions'
import { WithSize } from 'src/types'
import { useInit } from '~comps/hooks'
import { createThemedStylesHook } from '~comps/Theming'

export type PostPreviewProps = Omit<PreviewDataProps, 'data' | 'loading'>
export const Preview = ({ id, ...props }: PostPreviewProps) => {
  const reloadPost = useCreateReloadPost()
  const data = useSelectPost(id)
  
  const loading = !useInit(async () => {
    await reloadPost({ id, reload: true })
    return true
  }, [ id ], [])
  
  return <PreviewData {...props} {...{ id, data, loading }} />
}


type PreviewDataProps = {
  id: PostId
  data: PostWithSomeDetails | undefined
  loading: boolean
  containerStyle?: StyleProp<ViewStyle>
  onPressMore?: (id: PostId) => void
  onPressOwner?: PostOwnerProps['onPressOwner']
  onPressSpace?: PostOwnerProps['onPressSpace']
  onPressLike?: (evt: LikeEvent) => void
  onLike?: (evt: LikeEvent) => void
  onUnlike?: (evt: LikeEvent) => void
  onPressShare?: (evt: ShareEvent) => void
  onShare?: (evt: ShareEvent) => void
}
export const PreviewData = ({
  id,
  data,
  loading,
  containerStyle,
  onPressMore: _onPressMore,
  onPressOwner,
  onPressSpace,
  onPressLike,
  onLike,
  onUnlike,
  onPressShare,
  onShare,
}: PreviewDataProps) =>
{
  const nav = useNavigation<ExploreStackNavigationProp | undefined>()
  const styles = useThemedStyles();
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
        loading={loading}
        actionMenuProps={{
          secondary: renderActions
        }}
      />
      <Head {...{ title, image }} preview loading={loading} />
      <Body content={content} preview loading={loading} onPressMore={() => onPressMore?.(id)} />
      
      <Divider style={{ marginTop: 16 }} />
      
      <ActionPanel style={{ marginVertical: 16 }}>
        <LikeAction
          postId={id}
          onPress={onPressLike}
          onLike={onLike}
          onUnlike={onUnlike}
        />
        <ReplyAction postId={id} />
        <SharePostAction
          postId={id}
          onPress={onPressShare}
          onShare={onShare}
        />
        <ActionPanel.TipItem />
      </ActionPanel>
    </View>
  )
}

const useThemedStyles = createThemedStylesHook(({ consts }) => StyleSheet.create({
  container: {
    width: '100%',
    padding: 2 * consts.spacing,
    paddingBottom: 0,
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
}))
