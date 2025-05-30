import React from 'react';
import { Group, Circle, RoundedRect, LinearGradient, RadialGradient, vec } from '@shopify/react-native-skia';

interface ShinyShaderComponentProps {
	width: number;
	height: number;
	gradientCenter: { x: number; y: number };
	isCircular?: boolean;
	centerX?: number;
	centerY?: number;
	circleRadius?: number;
}

export function ShinyShaderComponent({
	width,
	height,
	gradientCenter,
	isCircular = true,
	centerX = width / 2,
	centerY = height / 2,
	circleRadius = Math.min(width, height) / 2,
}: ShinyShaderComponentProps) {
	// Calculate appropriate gradient radius based on dimensions and mode
	const calculateGradientRadius = () => {
		if (isCircular) {
			// For circular mode, use a radius that's slightly larger than the circle
			// to ensure the gradient covers the entire circle area
			return circleRadius * 1.5;
		} else {
			// For rectangular mode, calculate the diagonal distance from the gradient center
			// to the farthest corner to ensure the gradient covers the entire rectangle
			const corners = [
				{ x: 0, y: 0 },
				{ x: width, y: 0 },
				{ x: 0, y: height },
				{ x: width, y: height }
			];
			
			const maxDistance = Math.max(
				...corners.map(corner => 
					Math.sqrt(
						Math.pow(corner.x - gradientCenter.x, 2) + 
						Math.pow(corner.y - gradientCenter.y, 2)
					)
				)
			);
			
			// Add a small buffer to ensure complete coverage
			return maxDistance * 1.1;
		}
	};

	const gradientRadius = calculateGradientRadius();

	return (
		<Group blendMode={'overlay'}>
			{isCircular ? (
				<>
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
							r={gradientRadius}
							colors={[
								'hsla(0, 0%, 100%, 0.8)',
								'hsla(0, 0%, 100%, 0.65)',
								'hsla(0, 0%, 0%, 0.5)',
							]}
							positions={[0.1, 0.2, 0.9]}
						/>
					</Circle>
				</>
			) : (
				<>
					<RoundedRect x={0} y={0} width={width} height={height} r={12}>
						<LinearGradient
							start={{ x: 0, y: 0 }}
							end={{ x: width, y: height }}
							colors={[
								'rgba(255, 255, 255, 0.15)',
								'rgba(0, 0, 0, 0.25)',
								'rgba(128, 128, 128, 0.2)',
							]}
						/>
					</RoundedRect>
					<RoundedRect x={0} y={0} width={width} height={height} r={12} color="white">
						<RadialGradient
							c={vec(gradientCenter.x, gradientCenter.y)}
							r={gradientRadius}
							colors={[
								'hsla(0, 0%, 100%, 0.8)',
								'hsla(0, 0%, 100%, 0.65)',
								'hsla(0, 0%, 0%, 0.5)',
							]}
							positions={[0.1, 0.2, 0.9]}
						/>
					</RoundedRect>
				</>
			)}
		</Group>
	);
} 