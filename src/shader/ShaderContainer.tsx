import React, { useCallback } from 'react';
import { Canvas, Shader, Skia, Fill } from '@shopify/react-native-skia';

const ShaderContainer: React.FC<{
	width: number;
	height: number;
	SkSLCode: string;
}> = ({ width, height, SkSLCode }) => {
	const [time, setTime] = React.useState(0);
	const [shaderEffect, setShaderEffect] = React.useState<any>(null);
	const requestRef = React.useRef<number>();

	// Create shader effect once
	React.useEffect(() => {
		try {
			const effect = Skia.RuntimeEffect.Make(SkSLCode);
			if (effect) {
				setShaderEffect(effect);
			} else {
				console.error('Failed to create runtime effect');
			}
		} catch (err) {
			console.error('Shader compilation error:', err);
		}
	}, [SkSLCode]);

	// Animation frame callback
	const animate = useCallback(() => {
		setTime(t => t + 0.016);
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

	if (!shaderEffect) {
		return null;
	}

	return (
		<Canvas style={{ width, height }}>
			<Fill>
				<Shader
					source={shaderEffect}
					uniforms={{
						iTime: time,
						iResolution: [width, height],
					}}
				/>
			</Fill>
		</Canvas>
	);
};

export default ShaderContainer;
