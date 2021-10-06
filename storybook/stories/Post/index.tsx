import React, { ReactNode, useCallback, useState } from 'react'
import { StyleSheet, View, Text } from 'react-native'
import { useSubsocial } from '../../../src/components/SubsocialContext'
import { PostData } from '@subsocial/types/dto'
import BN from 'bn.js'

export type PostProps = {
  id: number
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

export default function Post({id}: PostProps) {
  const {api} = useSubsocial() ?? {};
  const [state, setState] = useState<PostState>({job: 'PENDING'});
  const loadingStyle = (state.job === 'PENDING' || state.job === 'LOADING') && styles.loading;
  const errorStyle   =  state.job === 'ERROR' && styles.error;
  
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
      <Text style={[loadingStyle, styles.title]}>{state.data?.content?.title ?? 'loading ...'}</Text>
      <Text style={[loadingStyle, errorStyle, styles.content]}>
        {state.job === 'ERROR'
          ? 'An error occured while loading the post\'s contents.'
          : state.data?.content?.body || 'loading ...'
        }
      </Text>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    padding: 10,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  content: {
    
  },
  loading: {
    fontStyle: 'italic',
  },
  error: {
    fontStyle: 'italic',
  },
});
