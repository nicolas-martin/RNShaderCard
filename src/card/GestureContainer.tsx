import React from 'react';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
	Extrapolation,
	interpolate,
	useAnimatedStyle,
	useSharedValue,
	withTiming,
	useAnimatedReaction,
	withSpring,
} from 'react-native-reanimated';

interface GestureContainerProps {
	children: React.ReactNode;
	width: number;
	height: number;
	maxAngle?: number; // Made optional with default value
	onRotationChange?: (rx: number, ry: number) => void;
}

export function GestureContainer({
	children,
	width,
	height,
	maxAngle = 6, // Reduced default for more subtle, realistic rotation
	onRotationChange,
}: GestureContainerProps) {
	const rotateX = useSharedValue(0);
	const rotateY = useSharedValue(0);

	// Improved interpolation for more realistic rotation based on distance from center
	const interpolateRotation = React.useCallback(
		(value: number, size: number, isReverse = false) => {
			'worklet';
			const center = size / 2;
			const relativeValue = value - center;
			const normalizedValue = relativeValue / center;
			
			return interpolate(
				normalizedValue,
				[-1, 1],
				isReverse ? [maxAngle, -maxAngle] : [-maxAngle, maxAngle],
				Extrapolation.CLAMP,
			);
		},
		[maxAngle],
	);

	useAnimatedReaction(
		() => ({ x: rotateX.value, y: rotateY.value }),
		(current, previous) => {
			if (current !== previous && onRotationChange) {
				onRotationChange(current.x, current.y);
			}
		},
	);

	const gesture = Gesture.Pan()
		.onBegin(event => {
			// Use spring animation for more natural feel
			rotateX.value = withSpring(interpolateRotation(event.y, height, true), {
				damping: 15,
				stiffness: 150,
			});
			rotateY.value = withSpring(interpolateRotation(event.x, width), {
				damping: 15,
				stiffness: 150,
			});
		})
		.onUpdate(event => {
			rotateX.value = interpolateRotation(event.y, height, true);
			rotateY.value = interpolateRotation(event.x, width);
		})
		.onFinalize(() => {
			// Smooth return to center with spring animation
			rotateX.value = withSpring(0, {
				damping: 20,
				stiffness: 100,
			});
			rotateY.value = withSpring(0, {
				damping: 20,
				stiffness: 100,
			});
		});

	const rStyle = useAnimatedStyle(
		() => ({
			transform: [
				{ perspective: 1000 }, // Increased perspective for more realistic 3D effect
				{ rotateX: `${rotateX.value}deg` },
				{ rotateY: `${rotateY.value}deg` },
			],
		}),
		[],
	);

	return (
		<GestureDetector gesture={gesture}>
			<Animated.View
				style={[
					{
						height,
						width,
					},
					rStyle,
				]}>
				{children}
			</Animated.View>
		</GestureDetector>
	);
}
