//////////////////////////////////////////////////////////////////////
// Post Preview - assembled from Post Base components
import React, { useMemo } from 'react'
import { Pressable, StyleProp, StyleSheet, TextStyle, View } from 'react-native'
import { Card } from 'react-native-paper'
import { Text, Title } from '~src/components/Typography'
import { Head, Body, usePost } from './Post'
import { IpfsAvatar } from '~src/components/IpfsImage'
import { ActionMenu } from '~stories/Actions'
import { SubsocialInitializerState } from '~src/components/SubsocialContext'
import { useAccount } from '~stories/Account'
import { IconDescriptor } from '~stories/Actions/Menu'
import { useSpace } from '~stories/Space'
import { AccountId } from '@polkadot/types/interfaces'
import { AnyPostId, PostData } from '@subsocial/types'
import { SpaceId } from '@subsocial/types/substrate/interfaces'
import BN from 'bn.js'
import { Age } from '~src/util'

const ICON_REACTIONS: IconDescriptor = {name: 'bulb-outline',      family: 'ionicon'}
const ICON_IPFS:      IconDescriptor = {name: 'analytics-outline', family: 'ionicon'}

export type PostPreviewProps = {
  id: AnyPostId | number
  onPressMore?: (id: AnyPostId) => void
  onPressOwner?: (postId: AnyPostId, ownerId: AccountId | undefined) => void
  onPressSpace?: (postId: AnyPostId, spaceId: SpaceId   | undefined) => void
}
export default function Preview({id, onPressMore, onPressOwner, onPressSpace}: PostPreviewProps) {
  const bnid = useMemo(() => new BN(id), [id]);
  const [state, data] = usePost(bnid);
  
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
      <Card.Title
        title={<Title onPress={() => onPressOwner?.(bnid, ownerid)}>{ownerName}</Title>}
        subtitle={<Text mode="secondary" onPress={() => onPressSpace?.(bnid, spaceid)}>{spaceName} · {age.toString()}</Text>}
        left={({size}) => <IpfsAvatar cid={avatar} size={size} />}
        right={({size}) => <ActionMenu secondary={renderActions} size={size} />}
        style={{paddingLeft: 0}}
      />
      <Pressable onPress={() => onPressMore?.(bnid)}>
        <Head {...{title, image, titleStyle}} preview />
        <Body content={content} previewStyle={contentPreviewStyle} preview />
      </Pressable>
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
  italic: {
    fontStyle: 'italic',
  },
});
