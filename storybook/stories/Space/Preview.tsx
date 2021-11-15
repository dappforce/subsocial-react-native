//////////////////////////////////////////////////////////////////////
// Space "Summary" - shortened version of the space with less details
// for display in other locations, such as post details or space
// explorer.
import React from 'react'
import { useCreateReloadSpace, useResolvedSpaceHandle, useSelectSpace } from 'src/rtk/app/hooks'
import { useInit } from '~comps/hooks'
import { SpaceId } from 'src/types/subsocial'
import { DataRaw, DataRawProps } from './Data'

export type PreviewProps = Omit<DataRawProps, 'data' | 'preview' | 'state'> & {
  id: SpaceId
}
export const Preview = React.memo(({ id, ...props }: PreviewProps) => {
  const resolvedId = useResolvedSpaceHandle(id)
  const reloadSpace = useCreateReloadSpace()
  const data = useSelectSpace(resolvedId)
  
  useInit(() => {
    if (data) return true
    
    if (!reloadSpace) return false
    
    reloadSpace({ id: resolvedId })
    return true
  }, [resolvedId], [reloadSpace])
  
  return <DataRaw {...props} titlePlaceholder={id.toString()} preview {...{ data }} />
})
