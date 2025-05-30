import React from 'react';
import { Group, Shader, Circle, RoundedRect } from '@shopify/react-native-skia';
import { SparkleShader } from './SparkleShader';

interface SparkleShaderComponentProps {
	sparkleShaderEffect: any;
	time: number;
	width: number;
	height: number;
	gradientCenter: { x: number; y: number };
	isCircular?: boolean;
	centerX?: number;
	centerY?: number;
	circleRadius?: number;
}

export function SparkleShaderComponent({
	sparkleShaderEffect,
	time,
	width,
	height,
	gradientCenter,
	isCircular = true,
	centerX = width / 2,
	centerY = height / 2,
	circleRadius = Math.min(width, height) / 2,
}: SparkleShaderComponentProps) {
	if (!sparkleShaderEffect) return null;

	return (
		<Group blendMode={'overlay'}>
			{isCircular ? (
				<Circle cx={centerX} cy={centerY} r={circleRadius}>
					<Shader
						source={sparkleShaderEffect}
						uniforms={{
							iTime: time,
							iResolution: [width, height],
							gradientCenter: [gradientCenter.x, gradientCenter.y],
						}}
					/>
				</Circle>
			) : (
				<RoundedRect x={0} y={0} width={width} height={height} r={12}>
					<Shader
						source={sparkleShaderEffect}
						uniforms={{
							iTime: time,
							iResolution: [width, height],
							gradientCenter: [gradientCenter.x, gradientCenter.y],
						}}
					/>
				</RoundedRect>
			)}
		</Group>
	);
} 