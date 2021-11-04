//////////////////////////////////////////////////////////////////////
// Generic tags component for use in spaces, posts, users
import React, { useMemo } from 'react'
import { StyleProp, StyleSheet, View, ViewStyle } from 'react-native'
import { Chip } from '~comps/Typography'

export type TagsProps = {
  tags: string[]
  accented?: boolean
  onPress?: (tag: string) => void
  style?: StyleProp<ViewStyle>
  tagStyle?: StyleProp<ViewStyle>
}
export function Tags({tags, accented, onPress, style, tagStyle}: TagsProps) {
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
    <View style={[styles.container, style]}>
      {children}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    display: 'flex',
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  tag: {
    marginRight: 10,
    marginBottom: 8,
  },
})
