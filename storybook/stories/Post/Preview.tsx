//////////////////////////////////////////////////////////////////////
// Post Preview - assembled from Post Base components
import React, { useMemo } from 'react'
import { Pressable, StyleProp, StyleSheet, TextStyle, View } from 'react-native'
import { SubsocialInitializerState } from 'src/components/SubsocialContext'
import { Head, Body, usePost } from './Post'
import { ActionPanel } from './ActionPanel'
import { ActionMenu, IconDescriptor } from '~stories/Actions'
import { useAccount } from '~stories/Account'
import { Header } from '~stories/Misc'
import { useSpace } from '~stories/Space'
import { AccountId } from '@polkadot/types/interfaces'
import { AnyPostId, PostData } from '@subsocial/types'
import { SpaceId } from '@subsocial/types/substrate/interfaces'
import { Age } from 'src/util'
import BN from 'bn.js'

const ICON_REACTIONS: IconDescriptor = {name: 'bulb-outline',      family: 'ionicon'}
const ICON_IPFS:      IconDescriptor = {name: 'analytics-outline', family: 'ionicon'}

export type PostPreviewProps = Omit<PreviewDataProps, 'id' | 'state' | 'data'> & {
  id: AnyPostId | number
}
export default function Preview({id, ...props}: PostPreviewProps) {
  const bnid = useMemo(() => new BN(id), [id]);
  const [state, data] = usePost(bnid);
  return <Preview.Data {...props} {...{id: bnid, state, data}} />
}

type PreviewDataProps = {
  id: BN
  state: SubsocialInitializerState
  data: PostData | undefined
  onPressMore?: (id: AnyPostId) => void
  onPressOwner?: (postId: AnyPostId, ownerId: AccountId | undefined) => void
  onPressSpace?: (postId: AnyPostId, spaceId: SpaceId   | undefined) => void
};
Preview.Data = function({id, state, data, onPressMore, onPressOwner, onPressSpace}: PreviewDataProps) {
  const [ownerid, spaceid] = useMemo(() => {
    const {owner: _ownerid, space_id: _spaceid} = data?.struct ?? {};
    return [
      _ownerid,
      _spaceid?.isSome ? (_spaceid!.value as SpaceId) : undefined
    ]
  }, [data]);
  
  const renderActions = ({size}: {size: number}) => <>
    <ActionMenu.Secondary label="View reactions" icon={{...ICON_REACTIONS, size}} onPress={() => alert('not yet implemented, sorry')} />
    <ActionMenu.Secondary label="View on IPFS"   icon={{...ICON_IPFS,      size}} onPress={() => alert('not yet implemented, sorry')} />
  </>;
  
  const {title, content, image, titleStyle, contentPreviewStyle} = getContent(state, data);
  const {avatar, ownerName, spaceName, age} = getTitle(ownerid, spaceid, data);
  
  return (
    <View style={styles.container}>
      <Header
        title={ownerName??''}
        subtitle={`${spaceName} · ${age}`}
        avatar={avatar}
        actionMenuProps={{
          secondary: renderActions
        }}
        onPressTitle={() => onPressOwner?.(id, ownerid)}
        onPressSubtitle={() => onPressSpace?.(id, spaceid)}
        onPressAvatar={() => onPressOwner?.(id, ownerid)}
      />
      <Pressable onPress={() => onPressMore?.(id)}>
        <Head {...{title, image, titleStyle}} preview />
        <Body content={content} previewStyle={contentPreviewStyle} preview />
      </Pressable>
      <ActionPanel
        liked={false}
        numLikes={data?.struct?.upvotes_count?.toNumber?.() ?? 0}
        numComments={data?.struct?.replies_count?.toNumber?.() ?? 0}
        onPressLike={   () => alert('sorry, not yet implemented')}
        onPressComment={() => alert('sorry, not yet implemented')}
        onPressShare={  () => alert('sorry, not yet implemented')}
      />
    </View>
  )
}

type ContentData = {
  title: string
  content: string
  image: string // CID
  titleStyle: StyleProp<TextStyle> | undefined
  contentPreviewStyle: StyleProp<TextStyle> | undefined
}
function getContent(state: SubsocialInitializerState, data: PostData | undefined): ContentData {
  switch (state) {
    case 'PENDING':
    case 'LOADING': return {
      title: 'loading ...',
      content: '',
      image: '',
      titleStyle: styles.italic,
      contentPreviewStyle: styles.italic,
    }
    case 'READY': return {
      title: data?.content?.title ?? '',
      content: data?.content?.body ?? '',
      image: data?.content?.image ?? '',
      titleStyle: undefined,
      contentPreviewStyle: undefined,
    }
    case 'ERROR': return {
      title: 'Error',
      content: 'An error occurred while attempting to load post data.',
      image: '',
      contentPreviewStyle: styles.italic,
      titleStyle: styles.italic,
    }
  }
}

type TitleData = {
  avatar: string | undefined // CID
  ownerName: string | undefined
  spaceName: string | undefined
  age: Age
}
function getTitle(ownerid: AccountId | undefined, spaceid: SpaceId | undefined, data: PostData | undefined): TitleData {
  const [spaceState, spaceData] = useSpace(spaceid ?? 0);
  const [ownerState, ownerData] = useAccount(ownerid ?? '');
  
  return {
    avatar: ownerData?.content?.avatar,
    ownerName: ownerData?.content?.name,
    spaceName: spaceData?.content?.name,
    age: new Age(data?.struct?.created?.time ?? new BN(0)),
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
