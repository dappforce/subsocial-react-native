//////////////////////////////////////////////////////////////////////
// Post Preview - assembled from Post Base components
import React, { useMemo } from 'react'
import { Pressable, StyleSheet, View } from 'react-native'
import { Head, Body, usePost } from './Post'
import { AnyPostId, AnySpaceId } from '@subsocial/types'
import { SpaceId } from '@subsocial/types/substrate/interfaces'
import BN from 'bn.js'

export type PostPreviewProps = {
  id: AnyPostId | number
  onPressMore?: (id: AnyPostId) => void
  onPressSpace?: (postId: AnyPostId, spaceId: AnySpaceId | undefined) => void
}
export default function Preview({id, onPressMore, onPressSpace}: PostPreviewProps) {
  const bnid = useMemo(() => new BN(id), [id]);
  const [state, data] = usePost(bnid);
  const spaceid = useMemo(() => {
    const _spaceid = data?.struct?.space_id;
    if (!_spaceid?.isSome) return undefined;
    return _spaceid!.value as SpaceId;
  }, [data]);
  
  let title: string,
    content = '',
    image = '',
    titleStyle,
    contentPreviewStyle;
  switch (state) {
    case 'PENDING':
    case 'LOADING':
      title = 'loading ...'
      titleStyle = styles.italic
      break;
    case 'READY':
      ({title, body: content, image} = data?.content ?? {title: '', body: '', image: ''})
      break;
    case 'ERROR':
      title = 'Error'
      titleStyle = styles.italic
      content = 'An error occurred while attempting to load post data.'
      break;
  }
  
  return (
    <View style={styles.container}>
      <Pressable onPress={() => onPressSpace?.(bnid, spaceid)}>
        
      </Pressable>
      <Pressable onPress={() => onPressMore?.(bnid)}>
        <Head {...{title, image, titleStyle}} preview />
        <Body content={content} previewStyle={contentPreviewStyle} preview />
      </Pressable>
    </View>
  )
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
