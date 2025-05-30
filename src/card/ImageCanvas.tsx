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
import {
	SparkleShader,
	GlowShader,
	BloomGlowShader,
	MetallicShader,
	SparkleShaderComponent,
	GlowShaderComponent,
	BloomShaderComponent,
	MetallicShaderComponent,
	ShinyShaderComponent,
} from '../shader';

interface ImageCanvasProps {
	width: number;
	height: number;
	gradientCenter: { x: number; y: number };
	imageUrl?: string;
	shaderType?: 'sparkle' | 'glow' | 'bloom' | 'metallic' | 'both' | 'all' | 'shiny' | 'original' | 'none';
	useCircularMask?: boolean;
}

export function ImageCanvas({ width, height, gradientCenter, imageUrl, shaderType, useCircularMask }: ImageCanvasProps) {
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

	const shaderProps = {
		time,
		width,
		height,
		gradientCenter,
		centerX,
		centerY,
		circleRadius,
	};

	return (
		<Canvas style={{ width, height }}>
			{useCircularMask === false ? (
				// Rectangular version - shows full rectangular image with optional shader effects
				<>
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
					{/* Apply shader effects to rectangular image */}
					{(shaderType === "shiny") && (
						<ShinyShaderComponent {...shaderProps} isCircular={false} />
					)}
					{(shaderType === 'sparkle' || shaderType === 'both' || shaderType === 'all') && sparkleShaderEffect && (
						<SparkleShaderComponent 
							{...shaderProps} 
							sparkleShaderEffect={sparkleShaderEffect} 
							isCircular={false} 
						/>
					)}
					{(shaderType === 'glow' || shaderType === 'both' || shaderType === 'all') && glowShaderEffect && (
						<GlowShaderComponent 
							{...shaderProps} 
							glowShaderEffect={glowShaderEffect} 
							isCircular={false} 
						/>
					)}
					{(shaderType === 'bloom' || shaderType === 'all') && bloomGlowShaderEffect && (
						<BloomShaderComponent 
							{...shaderProps} 
							bloomGlowShaderEffect={bloomGlowShaderEffect} 
							isCircular={false} 
						/>
					)}
					{(shaderType === 'metallic' || shaderType === 'all') && metallicShaderEffect && (
						<MetallicShaderComponent 
							{...shaderProps} 
							metallicShaderEffect={metallicShaderEffect} 
							isCircular={false} 
						/>
					)}
				</>
			) : (
				// Circular version with mask
				<>
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
					{(shaderType === "shiny") && (
						<ShinyShaderComponent {...shaderProps} isCircular={true} />
					)}
					{(shaderType === 'sparkle' || shaderType === 'both' || shaderType === 'all') && sparkleShaderEffect && (
						<SparkleShaderComponent 
							{...shaderProps} 
							sparkleShaderEffect={sparkleShaderEffect} 
							isCircular={true} 
						/>
					)}
					{(shaderType === 'glow' || shaderType === 'both' || shaderType === 'all') && glowShaderEffect && (
						<GlowShaderComponent 
							{...shaderProps} 
							glowShaderEffect={glowShaderEffect} 
							isCircular={true} 
						/>
					)}
					{(shaderType === 'bloom' || shaderType === 'all') && bloomGlowShaderEffect && (
						<BloomShaderComponent 
							{...shaderProps} 
							bloomGlowShaderEffect={bloomGlowShaderEffect} 
							isCircular={true} 
						/>
					)}
					{(shaderType === 'metallic' || shaderType === 'all') && metallicShaderEffect && (
						<MetallicShaderComponent 
							{...shaderProps} 
							metallicShaderEffect={metallicShaderEffect} 
							isCircular={true} 
						/>
					)}
					{/* 'none' shader type shows circular mask but no effects */}
				</>
			)}
		</Canvas>
	);
}
