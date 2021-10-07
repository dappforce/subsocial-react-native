import React, { useCallback, useMemo, useState } from 'react'
import { StyleSheet, View, useColorScheme, ColorSchemeName } from 'react-native'
import { useSubsocial } from '~comps/SubsocialContext'
import { useBackgroundColor } from '~comps/BackgroundColorContext'
import { PostData } from '@subsocial/types/dto'
import { LinearGradient } from 'expo-linear-gradient'
import SubsocialText from '../SubsocialText'
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
      <PostHead job={state.job} data={state.data} />
      <PostBody summary={summary??false} job={state.job} data={state.data} />
    </View>
  )
}


type PostHeadProps = {
  job: PostStateJob
  data?: PostData
}
type PostBodyProps = {
  job: PostStateJob
  summary: boolean
  data?: PostData
}

function PostHead({job, data}: PostHeadProps) {
  const isLoading = job === 'PENDING' || job === 'LOADING';
  const scheme = useColorScheme();
  const schemeStyle = useMemo(() => ({color: scheme === 'light' ? 'black' : 'white'}), [scheme]);
  
  return <SubsocialText style={[styles.title, schemeStyle, isLoading && styles.loading]}>{data?.content?.title ?? 'loading ...'}</SubsocialText>
}

function PostBody({job, summary, data}: PostBodyProps) {
  // State
  const isLoading = job === 'PENDING' || job === 'LOADING'
  const isError   = job === 'ERROR';
  
  // Styling + Schemes
  const scheme = useColorScheme();
  const bgc    = useBackgroundColor();
  const mdStyles = useMemo(() => createMDStyles(scheme), [scheme]);
  
  // DOM
  if (isError) {
    return <SubsocialText style={[styles.content, styles.error]}>An error occurred while loading the post's contents.</SubsocialText>
  }
  if (isLoading) {
    return <SubsocialText style={[styles.content, styles.loading]}>loading ...</SubsocialText>
  }
  else {
    let copy = data?.content?.body || '';
    if (summary) {
      return (
        <View style={styles.summary}>
          <Markdown style={mdStyles}>{copy}</Markdown>
          <LinearGradient
            colors={['transparent', bgc]}
            style={styles.fader}
          />
        </View>
      )
    }
    else {
      return <Markdown style={mdStyles}>{copy}</Markdown>
    }
  }
}


const styles = StyleSheet.create({
  container: {
    width: '100%',
    padding: 10,
  },
  title: {
    fontSize: 22,
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

export const createMDStyles = (scheme: ColorSchemeName) => {
  return StyleSheet.create({
    body: {
      color: scheme === 'light' ? 'black' : 'white',
    },
    heading1: {
      fontSize: 18,
      fontWeight: 'bold',
      marginTop: 6,
      marginBottom: 4,
    },
    heading2: {
      fontSize: 16,
      fontWeight: 'bold',
      marginTop: 6,
      marginBottom: 4,
    },
    heading3: {
      fontSize: 14,
      fontWeight: 'bold',
      marginTop: 6,
      marginBottom: 4,
    },
    heading4: {
      fontSize: 12,
      fontWeight: 'bold',
      marginTop: 6,
      marginBottom: 4,
    },
    heading5: {
      fontSize: 10,
      fontWeight: 'bold',
      marginTop: 6,
      marginBottom: 4,
    },
    heading6: {
      fontSize: 10,
      fontStyle: 'italic',
      marginTop: 6,
      marginBottom: 4,
    },
    hr: {
      marginTop: 6,
      marginBottom: 6,
    },
    list_item: {
      marginTop: 2,
      marginBottom: 2,
    },
    link: {
      color: '#c9046a',
      textDecorationLine: 'none',
    },
    code_block: {
      backgroundColor: scheme === 'light' ? 'hsl(0, 0%, 80%)' : 'hsl(0, 0%, 20%)',
      borderLeftColor: scheme === 'light' ? 'hsl(0, 0%, 60%)' : 'hsl(0, 0%, 40%)',
      borderLeftWidth: 3,
    },
    code_inline: {
      backgroundColor: scheme === 'light' ? 'hsl(0, 0%, 80%)' : 'hsl(0, 0%, 20%)',
    },
    blockquote: {
      backgroundColor: scheme === 'light' ? 'hsl(0, 0%, 95%)' : 'hsl(0, 0%, 10%)',
      borderLeftColor: scheme === 'light' ? 'hsl(0, 0%, 70%)' : 'hsl(0, 0%, 30%)',
      borderLeftWidth: 3,
    },
  });
};
