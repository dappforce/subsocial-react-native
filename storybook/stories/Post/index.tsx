import React from 'react'
import { StyleSheet, View } from 'react-native'
import { Text, Title, useTheme } from 'react-native-paper'
import { useSubsocialInitializer, SubsocialInitializerState } from '~comps/SubsocialContext'
import { PostData } from '@subsocial/types/dto'
import { LinearGradient } from 'expo-linear-gradient'
import { BN } from '@polkadot/util'
import { Markdown } from '~comps/Typography'
import { IpfsBanner } from '~comps/IpfsImage'
import Preview from '~src/components/Preview'

export type PostProps = {
  id: number
  preview?: boolean
}

export class PostNotFoundError extends Error {
  constructor(postId: number) {
    super(`Subsocial Post ${postId} not found`);
  }
}

export default function Post({id, preview}: PostProps) {
  const [state, data] = useSubsocialInitializer<PostData>(async api => {
    const data = await api.findPost({id: new BN(id)});
    if (!data) throw new PostNotFoundError(id);
    return data;
  }, [id]);
  
  return (
    <View style={styles.container}>
      <PostHead state={state} data={data} preview={!!preview} />
      <PostBody preview={!!preview} state={state} data={data} />
    </View>
  )
}


type PostHeadProps = {
  state: SubsocialInitializerState
  data?: PostData
  preview: boolean
}
type PostBodyProps = {
  state: SubsocialInitializerState
  preview: boolean
  data?: PostData
}

function PostHead({state, data, preview}: PostHeadProps) {
  const isLoading = state === 'PENDING' || state === 'LOADING';
  
  return (
    <>
      <Title style={[isLoading && styles.loading]}>{data?.content?.title ?? 'loading ...'}</Title>
      <IpfsBanner cid={data?.content?.image} style={[styles.banner, preview && {height: 200}]} />
    </>
  )
}

function PostBody({state, preview, data}: PostBodyProps) {
  // State
  const isLoading = state === 'PENDING' || state === 'LOADING'
  const isError   = state === 'ERROR';
  
  // Styling + Schemes
  const theme = useTheme();
  
  // DOM
  if (isError) {
    return <Text style={[styles.error]}>An error occurred while loading the post's contents.</Text>
  }
  if (isLoading) {
    return <Text style={[styles.loading]}>loading ...</Text>
  }
  else {
    let copy = data?.content?.body || '';
    if (preview) {
      return (
        <Preview height={220}>
          <Markdown>{copy}</Markdown>
        </Preview>
      )
    }
    else {
      return <Markdown>{copy}</Markdown>
    }
  }
}


const styles = StyleSheet.create({
  container: {
    width: '100%',
    padding: 10,
  },
  loading: {
    fontStyle: 'italic',
  },
  error: {
    fontStyle: 'italic',
  },
  banner: {
    borderRadius: 10,
  },
});
