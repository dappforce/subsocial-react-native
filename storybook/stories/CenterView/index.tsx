import React, { ReactNode } from 'react';
import { StyleSheet } from 'react-native';
import { View } from 'react-native';

export interface CenterViewProps {
  children: ReactNode | ReactNode[];
}

export default function CenterView({children}: CenterViewProps) {
  return <View style={styles.container}>{children}</View>;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5FCFF',
  },
});
