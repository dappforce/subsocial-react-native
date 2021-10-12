import React from 'react'
import { StyleSheet, View } from 'react-native'
import { Text, Title, useTheme } from 'react-native-paper'
import { useSubsocialInitializer, SubsocialInitializerState } from '~comps/SubsocialContext'
import { PostData } from '@subsocial/types/dto'
import { LinearGradient } from 'expo-linear-gradient'
import { BN } from '@polkadot/util'
import { Markdown } from '~comps/Typography'
import { IpfsBanner } from '~comps/IpfsImage'

export type PostProps = {
  id: number
  summary?: boolean
}

export class PostNotFoundError extends Error {
  constructor(postId: number) {
    super(`Subsocial Post ${postId} not found`);
  }
}

export default function Post({id, summary}: PostProps) {
  const [state, data] = useSubsocialInitializer<PostData>(async api => {
    const data = await api.findPost({id: new BN(id)});
    if (!data) throw new PostNotFoundError(id);
    return data;
  }, [id]);
  
  return (
    <View style={styles.container}>
      <PostHead state={state} data={data} />
      <PostBody summary={summary??false} state={state} data={data} />
    </View>
  )
}


type PostHeadProps = {
  state: SubsocialInitializerState
  data?: PostData
}
type PostBodyProps = {
  state: SubsocialInitializerState
  summary: boolean
  data?: PostData
}

function PostHead({state, data}: PostHeadProps) {
  const isLoading = state === 'PENDING' || state === 'LOADING';
  
  return (
    <>
      <Title style={[isLoading && styles.loading]}>{data?.content?.title ?? 'loading ...'}</Title>
      <IpfsBanner cid={data?.content?.image} />
    </>
  )
}

function PostBody({state, summary, data}: PostBodyProps) {
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
    if (summary) {
      return (
        <View style={styles.summary}>
          <Markdown>{copy}</Markdown>
          <LinearGradient
            colors={['transparent', theme.colors.background]}
            style={styles.fader}
          />
        </View>
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
  summary: {
    maxHeight: 240,
    overflow: 'hidden',
  },
  fader: {
    position: 'absolute',
    height: 50,
    bottom: 0,
    left: 0,
    right: 0,
  },
  loading: {
    fontStyle: 'italic',
  },
  error: {
    fontStyle: 'italic',
  },
});
