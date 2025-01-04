import React from 'react';
import {
  SafeAreaView,
  ScrollView,
  StatusBar,
  useColorScheme,
  // useWindowDimensions,
} from 'react-native';

import {Colors} from 'react-native/Libraries/NewAppScreen';
// import ShaderExample from './ShaderExample';
import {LuffyExample} from './LuffyExample';

function Playground(): React.JSX.Element {
  const isDarkMode = useColorScheme() === 'dark';
  // const {width, height} = useWindowDimensions();

  const backgroundStyle = {
    backgroundColor: isDarkMode ? Colors.darker : Colors.lighter,
  };

  return (
    <SafeAreaView style={backgroundStyle}>
      <StatusBar
        barStyle={isDarkMode ? 'light-content' : 'dark-content'}
        backgroundColor={backgroundStyle.backgroundColor}
      />
      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        style={backgroundStyle}>
        {/* <ShaderExample width={width} height={height} /> */}
        <LuffyExample />
      </ScrollView>
    </SafeAreaView>
  );
}

export default Playground;
