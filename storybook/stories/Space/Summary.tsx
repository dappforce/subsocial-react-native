//////////////////////////////////////////////////////////////////////
// Space "Summary" - shortened version of the space with less details
// for display in other locations, such as post details or space
// explorer.
import React, { useCallback } from 'react'
import { StyleSheet, View } from 'react-native'
import { Card } from 'react-native-paper'
import { SpaceData } from '@subsocial/types'
import { SubsocialInitializerState } from '~comps/SubsocialContext'
import { Button, Markdown, Text } from '~comps/Typography'
import { IpfsAvatar } from '~comps/IpfsImage'
import { useSpace } from './util'
import { Socials, Tags } from '~stories/Misc'
import { SpaceId } from './util'
import { Actions, PrimaryAction, SecondaryAction } from '~comps/Actions'
import { summarizeMd } from '@subsocial/utils'

export type SummaryProps = Omit<DataProps, 'data' | 'state'> & {
  id: SpaceId
}
export default function Summary({id, preview, ...props}: SummaryProps) {
  const [state, data] = useSpace(id);
  return <Summary.Data {...props} titlePlaceholder={id.toString()} {...{data, state, preview}} />
}

type DataProps = {
  data?: SpaceData
  state?: SubsocialInitializerState
  titlePlaceholder?: string
  showFollowButton?: boolean
  showAbout?: boolean
  showSocials?: boolean
  showTags?: boolean
  preview?: boolean
};
Summary.Data = function({data, state = 'READY', titlePlaceholder, showFollowButton, showAbout, showSocials, showTags, preview = false}: DataProps) {
  return (
    <View style={{width: '100%'}}>
      <Head {...{titlePlaceholder, data, showFollowButton}} />
      {showAbout   && <About {...{state, data, preview}} />}
      {showSocials && <Socials links={data?.content?.links??[]} />}
      {showTags    && <Tags tags={data?.content?.tags??[]} accented />}
    </View>
  )
}

export type HeadProps = {
  titlePlaceholder?: string
  data?: SpaceData
  showFollowButton?: boolean
}
export function Head({titlePlaceholder = '', data, showFollowButton}: HeadProps) {
  const loading = !data;
  
  const renderPrimaryActions = useCallback(() => {
    return <>
      {showFollowButton && (
        <PrimaryAction>
          <Button mode="contained" onPress={() => alert('not yet implemented, sorry')}>
            Follow
          </Button>
        </PrimaryAction>
      )}
    </>
  }, []);
  
  const renderSecondaryActions = useCallback(() => {
    return <>
      <SecondaryAction>
        Test
      </SecondaryAction>
    </>
  }, []);
  
  return (
    <Card.Title
      title={data?.content?.name ?? titlePlaceholder}
      subtitle={loading ? 'loading...' : `${data?.struct?.posts_count || 0} Posts · ${data?.struct?.followers_count || 0} Followers`}
      left={props => <IpfsAvatar {...props} cid={data?.content?.image} />}
      right={props => <Actions {...props} primary={renderPrimaryActions} secondary={renderSecondaryActions} />}
      style={{paddingLeft: 0, paddingRight: 0}}
    />
  )
}

export type AboutProps = {
  state: SubsocialInitializerState
  data?: SpaceData
  preview: boolean
}
export function About({state, data, preview}: AboutProps) {
  const isLoading = state === 'PENDING' || state === 'LOADING'
  const isError   = state === 'ERROR'
  
  if (isLoading) {
    return <Text style={styles.italic}>loading ...</Text>
  }
  if (isError) {
    return <Text style={styles.italic}>An error occurred while loading Space's About.</Text>
  }
  if (!data?.content?.about) {
    return <Text style={styles.italic}>no about info specified</Text>
  }
  if (preview) {
    const {summary, isShowMore} = summarizeMd(data!.content!.about!);
    return (
      <Text>
        {summary}
        {isShowMore && <Text style={{fontWeight: 'bold'}}>{' '}Read more</Text>}
      </Text>
    )
  }
  else {
    return <Markdown>{data!.content!.about!}</Markdown>
  }
}

const styles = StyleSheet.create({
  italic: {
    fontStyle: 'italic',
  },
});
