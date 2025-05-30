import React from 'react';
import { Group, Shader, Circle, RoundedRect } from '@shopify/react-native-skia';

interface BloomShaderComponentProps {
	bloomGlowShaderEffect: any;
	time: number;
	width: number;
	height: number;
	gradientCenter: { x: number; y: number };
	isCircular?: boolean;
	centerX?: number;
	centerY?: number;
	circleRadius?: number;
	samples?: number;
	quality?: number;
	intensity?: number;
}

export function BloomShaderComponent({
	bloomGlowShaderEffect,
	time,
	width,
	height,
	gradientCenter,
	isCircular = true,
	centerX = width / 2,
	centerY = height / 2,
	circleRadius = Math.min(width, height) / 2,
	samples = 5.0,
	quality = 2.0,
	intensity = 0.7,
}: BloomShaderComponentProps) {
	if (!bloomGlowShaderEffect) return null;

	return (
		<Group blendMode={'screen'}>
			{isCircular ? (
				<Circle cx={centerX} cy={centerY} r={circleRadius}>
					<Shader
						source={bloomGlowShaderEffect}
						uniforms={{
							iTime: time,
							iResolution: [width, height],
							gradientCenter: [gradientCenter.x, gradientCenter.y],
							samples,
							quality,
							intensity,
						}}
					/>
				</Circle>
			) : (
				<RoundedRect x={0} y={0} width={width} height={height} r={12}>
					<Shader
						source={bloomGlowShaderEffect}
						uniforms={{
							iTime: time,
							iResolution: [width, height],
							gradientCenter: [gradientCenter.x, gradientCenter.y],
							samples,
							quality,
							intensity,
						}}
					/>
				</RoundedRect>
			)}
		</Group>
	);
} 