//////////////////////////////////////////////////////////////////////
// Generic tags component for use in spaces, posts, users
import React, { useMemo } from 'react'
import { ScrollView, StyleProp, StyleSheet, ViewStyle } from 'react-native'
import { Chip } from '~comps/Typography'

export type TagsProps = {
  tags: string[]
  accented?: boolean
  onPress?: (tag: string) => void
  style?: StyleProp<ViewStyle>
  tagStyle?: StyleProp<ViewStyle>
}
export default function Tags({tags, accented, onPress, style, tagStyle}: TagsProps) {
  if (!tags.length) return null;
  
  const _tagStyle = useMemo(() => StyleSheet.compose<ViewStyle>(styles.tag, tagStyle), [tagStyle]);
  const children = tags.map(tag => (
    <Chip
      mode={accented ? 'accent' : 'flat'}
      onPress={()=>onPress?.(tag)}
      key={tag}
      style={_tagStyle}
    >
      {tag}
    </Chip>
  ));

  return (
    <ScrollView
      horizontal
      style={[styles.container, style]}
      contentContainerStyle={styles.contentContainer}
      showsHorizontalScrollIndicator={false}
    >
      {children}
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  contentContainer: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
  },
  tag: {
    marginHorizontal: 2,
    marginVertical: 4,
  },
})
