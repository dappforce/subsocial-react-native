//////////////////////////////////////////////////////////////////////
// Generic helper to render markdown text with preview option.
import React from 'react'
import { StyleProp, StyleSheet, TextStyle, View, ViewStyle } from 'react-native'
import Md, { MarkdownProps as MdProps } from 'react-native-markdown-display'
import { Link, Text } from '~comps/Typography'
import { createThemedStylesHook, reduceMarkdownTheme, Theme, useTheme } from '~comps/Theming'
import { summarizeMd } from '@subsocial/utils'

const SUMMARY_LIMIT = 200

export type MarkdownProps = MdProps & {
  children: string
  summary?: boolean
  summaryStyle?: StyleProp<TextStyle>
  containerStyle?: StyleProp<ViewStyle>
  onPressMore?: () => void
}
export const Markdown = React.memo(({
  children: content,
  summary,
  mergeStyle = false,
  style,
  summaryStyle,
  containerStyle,
  onPressMore,
  ...props
}: MarkdownProps) =>
{
  const rootstyles = useMarkdownTheme(style)
  const styles = useThemedStyles()
  
  if (summary) {
    const { summary, isShowMore } = summarizeAndStrip(content, { limit: SUMMARY_LIMIT })
    
    return (
      <View style={containerStyle}>
        <Text style={summaryStyle} onPress={onPressMore}>
          {summary}{' '}
          {isShowMore && 
          <Link
            mode="primary"
            style={styles.readMore}
            onPress={onPressMore}
          >
            Read more
          </Link>}
        </Text>
      </View>
    )
  }
  
  else {
    return (
      <View style={containerStyle}>
        <Md
          {...props}
          style={rootstyles}
          mergeStyle={mergeStyle}
        >
          {content}
        </Md>
      </View>
    )
  }
})

export type StrippedSummary = {
  summary: string
  isShowMore: boolean 
}
export function summarizeAndStrip(content: string, opts?: { limit?: number }): StrippedSummary {
  let { summary, isShowMore } = summarizeMd(content, opts)
  
  if (summary)
    summary = summary.replace(/(\n\r|\r\n|\n|\r)+/g, '  ')
  
  return {
    summary,
    isShowMore,
  }
}

const useMarkdownTheme = (style?: MdProps['style']) => {
  const theme = useTheme()
  
  if (cache.lastTheme !== theme || cache.lastStyle !== style) {
    cache.lastTheme = theme
    cache.reduced = reduceMarkdownTheme(style ?? {}, theme)
  }
  
  return cache.reduced
}

const useThemedStyles = createThemedStylesHook(({ fonts }) => StyleSheet.create({
  readMore: {
    fontFamily: 'RobotoMedium',
  },
}))

const cache = {
  lastTheme: undefined as Theme | undefined,
  lastStyle: undefined as MdProps['style'] | undefined,
  reduced: undefined as MdProps['style'] | undefined,
}
