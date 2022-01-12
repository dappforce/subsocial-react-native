//////////////////////////////////////////////////////////////////////
// Bottom Sheet Modal based on @gorhom/bottom-sheet
import React, { ComponentType, RefObject, useRef } from 'react'
import {
  BottomSheetBackdrop,
  BottomSheetFlatList,
  BottomSheetModal,
  BottomSheetScrollView,
  BottomSheetSectionList,
  BottomSheetView,
  BottomSheetVirtualizedList
} from '@gorhom/bottom-sheet'
import { AnyIcon, Icon } from '~comps/Icon'
import { useTheme } from '~comps/Theming'

export type BottomSheetTriggerProps = {
  bottomSheetModal: RefObject<BottomSheetModal>
  iconSize: number
}

export type BottomSheetProps = {
  TriggerComponent: ComponentType<BottomSheetTriggerProps>
  children: React.ReactNode
  height?: number | string
  iconSize?: number
}

export const BottomSheet = ({ children, TriggerComponent, height = 200, iconSize = 24 }: BottomSheetProps) => {
  const ref = useRef<BottomSheetModal>(null)
  
  return (
    <>
      <TriggerComponent bottomSheetModal={ref} iconSize={iconSize} />
      <BottomSheetModal
        ref={ref}
        index={0}
        snapPoints={[height, '90%']}
        backdropComponent={(props) => <BottomSheetBackdrop {...props} disappearsOnIndex={-1} />}
        enablePanDownToClose
        enableDismissOnClose
      >
        {children}
      </BottomSheetModal>
    </>
  )
};

export type BottomSheetIconTriggerProps = BottomSheetTriggerProps & {
  icon: AnyIcon
}

BottomSheet.trigger = {
  Icon: ({ icon, bottomSheetModal, iconSize }: BottomSheetIconTriggerProps) => {
    const theme = useTheme()
    return (
      <Icon
        icon={icon}
        color={theme.colors.textSecondary}
        size={iconSize}
        onPress={() => bottomSheetModal.current?.present()}
        rippleBorderless
      />
    )
  },
  MoreVertical: (props: BottomSheetTriggerProps) => (
    <BottomSheet.trigger.Icon
      icon={{
        family: 'ionicon',
        name: 'ellipsis-vertical',
      }}
      {...props}
    />
  )
};

BottomSheet.View = BottomSheetView;
BottomSheet.ScrollView = BottomSheetScrollView;
BottomSheet.FlatList = BottomSheetFlatList;
BottomSheet.SectionList = BottomSheetSectionList;
BottomSheet.VirtualizedList = BottomSheetVirtualizedList;
