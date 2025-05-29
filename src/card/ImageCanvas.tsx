import React from 'react';
import {
	Canvas,
	RadialGradient,
	vec,
	useImage,
	Image,
	LinearGradient,
	Group,
	RoundedRect,
	Circle,
	Mask,
} from '@shopify/react-native-skia';

interface ImageCanvasProps {
	width: number;
	height: number;
	gradientCenter: { x: number; y: number };
	imageUrl?: string;
}

export function ImageCanvas({ width, height, gradientCenter, imageUrl }: ImageCanvasProps) {
	const wildCharge = useImage(require('../../assets/wild_charge.png'));
	const maskedWildCharge = useImage(
		require('../../assets/masked_wild_charge.webp'),
	);

	// Use custom image if provided, otherwise fall back to default Pokemon images
	const customImage = useImage(imageUrl || null);

	// Determine which image to use
	const primaryImage = customImage || wildCharge;
	const overlayImage = customImage ? null : maskedWildCharge;

	if (!primaryImage) {
		return null;
	}

	// Calculate circle dimensions - use the smaller dimension to ensure it fits
	const circleRadius = Math.min(width, height) / 2;
	const centerX = width / 2;
	const centerY = height / 2;

	function glareShinyLayer() {
		return (
			<Group blendMode={'overlay'}>
				{/* Combined effect using a gradient */}
				<Circle cx={centerX} cy={centerY} r={circleRadius}>
					<LinearGradient
						start={{ x: 0, y: 0 }}
						end={{ x: width, y: height }}
						colors={[
							'rgba(255, 255, 255, 0.15)', // Simulates brightness
							'rgba(0, 0, 0, 0.25)', // Simulates contrast
							'rgba(128, 128, 128, 0.2)', // Simulates saturation
						]}
					/>
				</Circle>
				<Circle
					cx={centerX}
					cy={centerY}
					r={circleRadius}
					color="white">
					<RadialGradient
						c={vec(gradientCenter.x, gradientCenter.y)}
						r={Math.max(width, height)}
						colors={[
							'hsla(0, 0%, 100%, 0.8)',
							'hsla(0, 0%, 100%, 0.65)',
							'hsla(0, 0%, 0%, 0.5)',
						]}
						positions={[0.1, 0.2, 0.9]}
					/>
				</Circle>
			</Group>
		);
	}

	return (
		<Canvas style={{ width, height }}>
			<Mask
				mask={
					<Group>
						<Circle cx={centerX} cy={centerY} r={circleRadius} color="white" />
					</Group>
				}>
				<Image image={primaryImage} height={height} width={width} fit="cover" />
				{overlayImage && (
					<Image
						image={overlayImage}
						height={height}
						width={width}
						fit="cover"
						opacity={0.8}
						blendMode="overlay"
					/>
				)}
			</Mask>
			{glareShinyLayer()}
		</Canvas>
	);
}
