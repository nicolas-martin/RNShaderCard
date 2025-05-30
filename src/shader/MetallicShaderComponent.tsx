import React from 'react';
import { Group, Shader, Circle, RoundedRect } from '@shopify/react-native-skia';

interface MetallicShaderComponentProps {
	metallicShaderEffect: any;
	time: number;
	width: number;
	height: number;
	gradientCenter: { x: number; y: number };
	isCircular?: boolean;
	centerX?: number;
	centerY?: number;
	circleRadius?: number;
	metallic?: number;
	roughness?: number;
	baseColor?: [number, number, number];
	lightColor?: [number, number, number];
}

export function MetallicShaderComponent({
	metallicShaderEffect,
	time,
	width,
	height,
	gradientCenter,
	isCircular = true,
	centerX = width / 2,
	centerY = height / 2,
	circleRadius = Math.min(width, height) / 2,
	metallic = 0.9,
	roughness = 0.1,
	baseColor = [1.0, 0.8, 0.3],
	lightColor = [1.0, 0.95, 0.8],
}: MetallicShaderComponentProps) {
	if (!metallicShaderEffect) return null;

	return (
		<Group blendMode={'overlay'}>
			{isCircular ? (
				<Circle cx={centerX} cy={centerY} r={circleRadius}>
					<Shader
						source={metallicShaderEffect}
						uniforms={{
							iTime: time,
							iResolution: [width, height],
							gradientCenter: [gradientCenter.x, gradientCenter.y],
							metallic,
							roughness,
							baseColor,
							lightColor,
						}}
					/>
				</Circle>
			) : (
				<RoundedRect x={0} y={0} width={width} height={height} r={12}>
					<Shader
						source={metallicShaderEffect}
						uniforms={{
							iTime: time,
							iResolution: [width, height],
							gradientCenter: [gradientCenter.x, gradientCenter.y],
							metallic,
							roughness,
							baseColor,
							lightColor,
						}}
					/>
				</RoundedRect>
			)}
		</Group>
	);
} 