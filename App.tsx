import {GestureHandlerRootView} from 'react-native-gesture-handler';
import React from 'react';
import Playground from './src/Playground';

export default function App() {
  return (
    <GestureHandlerRootView>
      <Playground />
    </GestureHandlerRootView>
  );
}
