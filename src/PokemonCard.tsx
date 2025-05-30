import React from 'react';
import { useWindowDimensions, View, StyleSheet, Image } from 'react-native';
import { runOnJS } from 'react-native-reanimated';

import { GestureContainer } from './card/GestureContainer';
import { ImageCanvas } from './card/ImageCanvas';

interface PokemonCardProps {
	imageUrl?: string;
	maxWidth?: number;
}

export function PokemonCard({
	imageUrl,
	maxWidth
}: PokemonCardProps) {
	const { width: SCREEN_WIDTH, height } = useWindowDimensions();
	const [imageDimensions, setImageDimensions] = React.useState<{
		width: number;
		height: number;
	} | null>(null);

	// Get image dimensions
	React.useEffect(() => {
		if (imageUrl) {
			Image.getSize(
				imageUrl,
				(width, height) => {
					setImageDimensions({ width, height });
				},
				(error) => {
					console.warn('Failed to get image size:', error);
					// Fallback to default Pokemon card dimensions
					setImageDimensions({ width: 1, height: 1.4 });
				}
			);
		} else {
			// Default Pokemon card aspect ratio
			setImageDimensions({ width: 1, height: 1.4 });
		}
	}, [imageUrl]);

	// Calculate card dimensions based on image aspect ratio
	const getCardDimensions = () => {
		if (!imageDimensions) {
			// Default while loading
			const WIDTH = SCREEN_WIDTH * 0.9;
			return { WIDTH, HEIGHT: WIDTH * 1.4 };
		}

		const aspectRatio = imageDimensions.width / imageDimensions.height;
		const maxCardWidth = maxWidth || SCREEN_WIDTH * 0.9;

		let WIDTH = maxCardWidth;
		let HEIGHT = WIDTH / aspectRatio;

		// Ensure the card doesn't exceed screen height
		const maxHeight = height * 0.8;
		if (HEIGHT > maxHeight) {
			HEIGHT = maxHeight;
			WIDTH = HEIGHT * aspectRatio;
		}

		return { WIDTH, HEIGHT };
	};

	const { WIDTH, HEIGHT } = getCardDimensions();
	const MAX_ANGLE = 10;

	const [gradientCenter, setGradientCenter] = React.useState({
		x: WIDTH / 2,
		y: HEIGHT / 2,
	});

	const handleRotationChange = React.useCallback(
		(rx: number, ry: number) => {
			'worklet';
			runOnJS(setGradientCenter)({
				x: WIDTH / 2 + (WIDTH / 2) * (ry / MAX_ANGLE),
				y: HEIGHT / 2 + (HEIGHT / 2) * (rx / MAX_ANGLE),
			});
		},
		[HEIGHT, WIDTH, MAX_ANGLE],
	);

	// Update gradient center when dimensions change
	React.useEffect(() => {
		setGradientCenter({
			x: WIDTH / 2,
			y: HEIGHT / 2,
		});
	}, [WIDTH, HEIGHT]);

	return (
		<View
			style={[
				styles.centeredView,
				{
					width: SCREEN_WIDTH,
					height,
				},
			]}>
			{/* <GestureContainer
				width={WIDTH}
				height={HEIGHT}
				maxAngle={MAX_ANGLE}
				onRotationChange={handleRotationChange}> */}
				<ImageCanvas
					width={WIDTH}
					height={HEIGHT}
					gradientCenter={gradientCenter}
					imageUrl={imageUrl}
					shaderType='metallic'
				/>
			{/* </GestureContainer> */}
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
