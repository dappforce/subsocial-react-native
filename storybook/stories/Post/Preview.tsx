//////////////////////////////////////////////////////////////////////
// Post Preview - assembled from Post Base components
import React, { useMemo } from 'react'
import { Pressable, StyleSheet, View } from 'react-native'
import { useCreateReloadPost, useSelectPost, useSelectProfile, useSelectSpace } from 'src/rtk/app/hooks'
import { useAccount } from '~stories/Account'
import { useInit } from '~comps/hooks'
import { Head, Body } from './Post'
import { Header } from '~stories/Misc'
import { ActionPanel } from './ActionPanel'
import { ActionMenu, IconDescriptor } from '~stories/Actions'
import { AccountId, PostId, SpaceId, PostWithSomeDetails } from 'src/types/subsocial'
import { Age } from 'src/util'
import BN from 'bn.js'

const ICON_REACTIONS: IconDescriptor = {name: 'bulb-outline',      family: 'ionicon'}
const ICON_IPFS:      IconDescriptor = {name: 'analytics-outline', family: 'ionicon'}

export type PostPreviewProps = Omit<PreviewDataProps, 'id' | 'state' | 'data'> & {
  id: PostId
}
export const Preview = React.memo(({id, ...props}: PostPreviewProps) => {
  console.log('render post id', id)
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
  onPressOwner?: (postId: PostId, ownerId: AccountId | undefined) => void
  onPressSpace?: (postId: PostId, spaceId: SpaceId   | undefined) => void
};
export function PreviewData({id, data, onPressMore, onPressOwner, onPressSpace}: PreviewDataProps) {
  const renderActions = ({size}: {size: number}) => <>
    <ActionMenu.Secondary label="View reactions" icon={{...ICON_REACTIONS, size}} onPress={() => alert('not yet implemented, sorry')} />
    <ActionMenu.Secondary label="View on IPFS"   icon={{...ICON_IPFS,      size}} onPress={() => alert('not yet implemented, sorry')} />
  </>;
  
  const {title = 'loading', body: content = '', image} = data?.post?.content ?? {};
  const {avatar, ownerName, spaceName, age} = getTitle(data);
  
  return (
    <View style={styles.container}>
      <Header
        title={ownerName??''}
        subtitle={`${spaceName} · ${age}`}
        avatar={avatar}
        actionMenuProps={{
          secondary: renderActions
        }}
        onPressTitle={() => onPressOwner?.(id, data?.owner?.id)}
        onPressSubtitle={() => onPressSpace?.(id, data?.space?.id)}
        onPressAvatar={() => onPressOwner?.(id, data?.owner?.id)}
      />
      <Pressable onPress={() => onPressMore?.(id)}>
        <Head {...{title, image}} titleStyle={[!data && styles.italic]} preview />
        <Body content={content} preview />
      </Pressable>
      <ActionPanel
        liked={false}
        numLikes={data?.post?.struct?.upvotesCount ?? 0}
        numComments={data?.post?.struct?.repliesCount ?? 0}
        onPressLike={   () => alert('sorry, not yet implemented')}
        onPressComment={() => alert('sorry, not yet implemented')}
        onPressShare={  () => alert('sorry, not yet implemented')}
      />
    </View>
  )
}

type TitleData = {
  avatar: string | undefined // CID
  ownerName: string | undefined
  spaceName: string | undefined
  age: Age
}
function getTitle(data: PostWithSomeDetails | undefined): TitleData {
  const owner = useSelectProfile(data?.post?.struct?.createdByAccount)
  return {
    avatar: owner?.content?.avatar,
    ownerName: owner?.content?.name,
    spaceName: data?.space?.content?.name,
    age: new Age(new BN(data?.post?.struct?.createdAtTime ?? 0)),
  }
}

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
