import React from 'react';
import { useWindowDimensions, View, StyleSheet } from 'react-native';

import { GestureContainer } from './card/GestureContainer';
import { LuffyCanvas } from './card/LuffyCanvas';

export function LuffyExample() {
	const { width: SCREEN_WIDTH, height } = useWindowDimensions();
	const WIDTH = SCREEN_WIDTH * 0.9;
	const HEIGHT = WIDTH * 1.4;
	const MAX_ANGLE = 10;

	return (
		<View
			style={[
				styles.centeredView,
				{
					width: SCREEN_WIDTH,
					height,
				},
			]}>
			<GestureContainer width={WIDTH} height={HEIGHT} maxAngle={MAX_ANGLE}>
				<LuffyCanvas width={WIDTH} height={HEIGHT} />
			</GestureContainer>
		</View>
	);
}

const styles = StyleSheet.create({
	centeredView: {
		flex: 1,
		justifyContent: 'center',
		alignItems: 'center',
	},
});
