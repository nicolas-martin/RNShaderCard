import React, { useCallback } from 'react';
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
	Shader,
	Skia,
	Fill,
} from '@shopify/react-native-skia';
import { SparkleShader } from '../shader/SparkleShader';
import { GlowShader } from '../shader/GlowShader';
import { BloomGlowShader } from '../shader/BloomGlowShader';
import { MetallicShader } from '../shader/MetallicShader';

interface ImageCanvasProps {
	width: number;
	height: number;
	gradientCenter: { x: number; y: number };
	imageUrl?: string;
	shaderType?: 'sparkle' | 'glow' | 'bloom' | 'metallic' | 'both' | 'all' | 'shiny'; // Updated shader type options
}

export function ImageCanvas({ width, height, gradientCenter, imageUrl, shaderType }: ImageCanvasProps) {
	const [time, setTime] = React.useState(0);
	const requestRef = React.useRef<number>();

	// Animation frame callback for shining effect
	const animate = useCallback(() => {
		setTime(t => t + 0.016); // ~60fps
		requestRef.current = requestAnimationFrame(animate);
	}, []);

	// Setup and cleanup animation frame
	React.useEffect(() => {
		requestRef.current = requestAnimationFrame(animate);
		return () => {
			if (requestRef.current) {
				cancelAnimationFrame(requestRef.current);
			}
		};
	}, [animate]);

	const wildCharge = useImage(require('../../assets/wild_charge.png'));
	const maskedWildCharge = useImage(
		require('../../assets/masked_wild_charge.webp'),
	);

	// Use custom image if provided, otherwise fall back to default Pokemon images
	const customImage = useImage(imageUrl || null);

	// Determine which image to use
	const primaryImage = customImage || wildCharge;
	const overlayImage = customImage ? null : maskedWildCharge;

	// Create shader effects
	const sparkleShaderEffect = React.useMemo(() => {
		return Skia.RuntimeEffect.Make(SparkleShader);
	}, []);

	const glowShaderEffect = React.useMemo(() => {
		return Skia.RuntimeEffect.Make(GlowShader);
	}, []);

	const bloomGlowShaderEffect = React.useMemo(() => {
		return Skia.RuntimeEffect.Make(BloomGlowShader);
	}, []);

	const metallicShaderEffect = React.useMemo(() => {
		return Skia.RuntimeEffect.Make(MetallicShader);
	}, []);

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

	function shaderSparkleLayer() {
		if (!sparkleShaderEffect) return null;

		return (
			<Group blendMode={'overlay'}>
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
			</Group>
		);
	}

	function shaderGlowLayer() {
		if (!glowShaderEffect) return null;

		return (
			<Group blendMode={'screen'}>
				<Circle cx={centerX} cy={centerY} r={circleRadius}>
					<Shader
						source={glowShaderEffect}
						uniforms={{
							iTime: time,
							iResolution: [width, height],
							gradientCenter: [gradientCenter.x, gradientCenter.y],
							glowIntensity: 0.8,
							glowRadius: 0.3,
							glowColor: [1.0, 0.9, 0.65],
						}}
					/>
				</Circle>
			</Group>
		);
	}

	function shaderBloomGlowLayer() {
		if (!bloomGlowShaderEffect) return null;

		return (
			<Group blendMode={'screen'}>
				<Circle cx={centerX} cy={centerY} r={circleRadius}>
					<Shader
						source={bloomGlowShaderEffect}
						uniforms={{
							iTime: time,
							iResolution: [width, height],
							gradientCenter: [gradientCenter.x, gradientCenter.y],
							samples: 5.0,
							quality: 2.0,
							intensity: 0.7,
						}}
					/>
				</Circle>
			</Group>
		);
	}

	function shaderMetallicLayer() {
		if (!metallicShaderEffect) return null;

		return (
			<Group blendMode={'overlay'}>
				<Circle cx={centerX} cy={centerY} r={circleRadius}>
					<Shader
						source={metallicShaderEffect}
						uniforms={{
							iTime: time,
							iResolution: [width, height],
							gradientCenter: [gradientCenter.x, gradientCenter.y],
							metallic: 0.9,
							roughness: 0.1,
							baseColor: [1.0, 0.8, 0.3], // Gold color
							lightColor: [1.0, 0.95, 0.8], // Warm light
						}}
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
			{(shaderType === "shiny") && glareShinyLayer()}
			{(shaderType === 'sparkle' || shaderType === 'both' || shaderType === 'all') && shaderSparkleLayer()}
			{(shaderType === 'glow' || shaderType === 'both' || shaderType === 'all') && shaderGlowLayer()}
			{(shaderType === 'bloom' || shaderType === 'all') && shaderBloomGlowLayer()}
			{(shaderType === 'metallic' || shaderType === 'all') && shaderMetallicLayer()}
		</Canvas>
	);
}
