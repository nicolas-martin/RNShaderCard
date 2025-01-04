import React, {useCallback} from 'react';
import {
  Canvas,
  useImage,
  Fill,
  Shader,
  Skia,
  Image,
} from '@shopify/react-native-skia';
import {KaleidoscopeShader} from '../shader/KaleidoscopeShader';

interface LuffyCanvasProps {
  width: number;
  height: number;
}

export function LuffyCanvas({width, height}: LuffyCanvasProps) {
  const [time, setTime] = React.useState(0);
  const requestRef = React.useRef<number>();

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

  const luffy = useImage(require('../../assets/luffy.png'));

  if (!luffy) {
    return null;
  }

  const shaderEffect = Skia.RuntimeEffect.Make(KaleidoscopeShader);
  if (!shaderEffect) {
    return null;
  }

  return (
    <Canvas style={{width, height}}>
      <Fill>
        <Shader
          source={shaderEffect}
          uniforms={{
            iTime: time,
            iResolution: [width, height],
          }}
        />
      </Fill>
      <Image image={luffy} height={height} width={width} fit="contain" />
    </Canvas>
  );
}
