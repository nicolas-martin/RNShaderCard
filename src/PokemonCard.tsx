import React from 'react';
import { useWindowDimensions, View, StyleSheet, Image } from 'react-native';
import { runOnJS } from 'react-native-reanimated';

import { GestureContainer } from './card/GestureContainer';
import { ImageCanvas } from './card/ImageCanvas';

interface PokemonCardProps {
	imageUrl?: string;
	maxWidth?: number;
	shaderType?: 'sparkle' | 'glow' | 'bloom' | 'metallic' | 'both' | 'all' | 'shiny' | 'original' | 'none';
	useCircularMask?: boolean;
}

export function PokemonCard({
	imageUrl,
	maxWidth,
	shaderType = 'shiny',
	useCircularMask = true
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
			
			// Calculate movement constraints based on image dimensions and display mode
			const calculateGradientCenter = () => {
				const centerX = WIDTH / 2;
				const centerY = HEIGHT / 2;
				
				// Normalize rotation values (-1 to 1)
				const normalizedRx = rx / MAX_ANGLE;
				const normalizedRy = ry / MAX_ANGLE;
				
				if (useCircularMask) {
					// For circular mode, constrain movement to stay within the circle
					const circleRadius = Math.min(WIDTH, HEIGHT) / 2;
					
					// Calculate movement range as a percentage of the circle radius
					const movementRange = circleRadius * 0.6; // 60% of radius for smooth movement
					
					// Apply aspect ratio correction for non-square images
					const aspectRatio = WIDTH / HEIGHT;
					const xMovement = movementRange * normalizedRy * (aspectRatio > 1 ? 1 : aspectRatio);
					const yMovement = movementRange * normalizedRx * (aspectRatio < 1 ? 1 : 1/aspectRatio);
					
					return {
						x: centerX + xMovement,
						y: centerY + yMovement,
					};
				} else {
					// For rectangular mode, use proportional movement based on dimensions
					const aspectRatio = WIDTH / HEIGHT;
					
					// Calculate movement range as a percentage of each dimension
					const xMovementRange = WIDTH * 0.35; // 35% of width
					const yMovementRange = HEIGHT * 0.35; // 35% of height
					
					// Apply aspect ratio weighting to make movement feel natural
					const aspectWeight = Math.min(aspectRatio, 1/aspectRatio);
					const xMovement = xMovementRange * normalizedRy * (1 + aspectWeight * 0.3);
					const yMovement = yMovementRange * normalizedRx * (1 + aspectWeight * 0.3);
					
					// Ensure gradient center stays within image bounds with padding
					const padding = Math.min(WIDTH, HEIGHT) * 0.1;
					const clampedX = Math.max(padding, Math.min(WIDTH - padding, centerX + xMovement));
					const clampedY = Math.max(padding, Math.min(HEIGHT - padding, centerY + yMovement));
					
					return {
						x: clampedX,
						y: clampedY,
					};
				}
			};
			
			runOnJS(setGradientCenter)(calculateGradientCenter());
		},
		[HEIGHT, WIDTH, MAX_ANGLE, useCircularMask],
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
			<GestureContainer
				width={WIDTH}
				height={HEIGHT}
				maxAngle={MAX_ANGLE}
				onRotationChange={handleRotationChange}>
				<ImageCanvas
					width={WIDTH}
					height={HEIGHT}
					gradientCenter={gradientCenter}
					imageUrl={imageUrl}
					shaderType={shaderType}
					useCircularMask={useCircularMask}
				/>
			</GestureContainer>
		</View>
	);
}

const styles = StyleSheet.create({
	centeredView: {
		justifyContent: 'flex-start',
		alignItems: 'center',
		paddingTop: 10,
	},
});
