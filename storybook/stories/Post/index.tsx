import React, { useCallback, useState } from 'react'
import { StyleSheet, View, Text, useColorScheme } from 'react-native'
import { useSubsocial } from '../../../src/components/SubsocialContext'
import { PostData } from '@subsocial/types/dto'
import { LinearGradient } from 'expo-linear-gradient'
import Markdown from 'react-native-markdown-display'
import BN from 'bn.js'

export type PostProps = {
  id: number
  summary?: boolean
}

type PostStateJob = 'PENDING' | 'LOADING' | 'READY' | 'ERROR'
export type PostState = {
  job: PostStateJob
  data?: PostData
  error?: any
}

export class PostNotFoundError extends Error {
  constructor(postId: number) {
    super(`Post ${postId} not found`);
  }
}

export default function Post({id, summary}: PostProps) {
  const {api} = useSubsocial() ?? {};
  const [state, setState] = useState<PostState>({job: 'PENDING'});
  const isLoading = state.job === 'PENDING' || state.job === 'LOADING';
  
  useCallback(async () => {
    if (!api) return;
    
    if (state.job === 'PENDING') {
      setState({...state, job: 'LOADING'});
      try {
        const data = await api.findPost({id: new BN(id)});
        if (data)
          setState({...state, job: 'READY', data});
        else
          setState({...state, job: 'ERROR', error: new PostNotFoundError(id)});
      }
      catch (err: any) {
        setState({...state, job: 'ERROR', error: err});
      }
    }
  }, [api, id, state, setState])();
  
  return (
    <View style={styles.container}>
      <Text style={[isLoading && styles.loading, styles.title]}>{state.data?.content?.title ?? 'loading ...'}</Text>
      <PostBody summary={summary??false} job={state.job} data={state.data} />
    </View>
  )
}


type PostBodyProps = {
  job: PostStateJob
  summary: boolean
  fadeColor?: string
  data?: PostData
}

function PostBody({job, summary, fadeColor, data}: PostBodyProps) {
  const isLoading = job === 'PENDING' || job === 'LOADING'
  const isError   = job === 'ERROR';
  const scheme = useColorScheme();
  
  if (isError) {
    return <Text style={[styles.content, styles.error]}>An error occurred while loading the post's contents.</Text>
  }
  if (isLoading) {
    return <Text style={[styles.content, styles.loading]}>loading ...</Text>
  }
  else {
    let copy = data?.content?.body || '';
    if (summary) {
      return (
        <View style={styles.summary}>
          <Markdown style={styles.content}>{copy}</Markdown>
          <LinearGradient
            colors={['transparent', fadeColor ?? (scheme === 'light' ? '#fff' : '#000')]}
            style={styles.fader}
          />
        </View>
      )
    }
    else {
      return <Markdown style={styles.content}>{copy}</Markdown>
    }
  }
}


const styles = StyleSheet.create({
  container: {
    width: '100%',
    padding: 10,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  content: {
    
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
