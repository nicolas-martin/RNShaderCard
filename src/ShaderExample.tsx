import React from 'react';
import {StyleSheet, View} from 'react-native';
import ShaderContainer from './shader/ShaderContainer';
import {KaleidoscopeShader} from './shader/KaleidoscopeShader';

function ShaderExample({
  width,
  height,
}: {
  width: number;
  height: number;
}): React.JSX.Element {
  return (
    <View
      style={[
        styles.centeredView,
        {
          width,
          height,
        },
      ]}>
      <ShaderContainer
        width={width}
        height={width}
        SkSLCode={KaleidoscopeShader}
      />
    </View>
  );
}

export default ShaderExample;

const styles = StyleSheet.create({
  centeredView: {
    alignContent: 'center',
    justifyContent: 'center',
  },
});
