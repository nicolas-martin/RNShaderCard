import React from 'react';
import { Group, Shader, Circle, RoundedRect } from '@shopify/react-native-skia';

interface GlowShaderComponentProps {
	glowShaderEffect: any;
	time: number;
	width: number;
	height: number;
	gradientCenter: { x: number; y: number };
	isCircular?: boolean;
	centerX?: number;
	centerY?: number;
	circleRadius?: number;
	glowIntensity?: number;
	glowRadius?: number;
	glowColor?: [number, number, number];
}

export function GlowShaderComponent({
	glowShaderEffect,
	time,
	width,
	height,
	gradientCenter,
	isCircular = true,
	centerX = width / 2,
	centerY = height / 2,
	circleRadius = Math.min(width, height) / 2,
	glowIntensity = 0.8,
	glowRadius = 0.3,
	glowColor = [1.0, 0.9, 0.65],
}: GlowShaderComponentProps) {
	if (!glowShaderEffect) return null;

	return (
		<Group blendMode={'screen'}>
			{isCircular ? (
				<Circle cx={centerX} cy={centerY} r={circleRadius}>
					<Shader
						source={glowShaderEffect}
						uniforms={{
							iTime: time,
							iResolution: [width, height],
							gradientCenter: [gradientCenter.x, gradientCenter.y],
							glowIntensity,
							glowRadius,
							glowColor,
						}}
					/>
				</Circle>
			) : (
				<RoundedRect x={0} y={0} width={width} height={height} r={12}>
					<Shader
						source={glowShaderEffect}
						uniforms={{
							iTime: time,
							iResolution: [width, height],
							gradientCenter: [gradientCenter.x, gradientCenter.y],
							glowIntensity,
							glowRadius,
							glowColor,
						}}
					/>
				</RoundedRect>
			)}
		</Group>
	);
} 