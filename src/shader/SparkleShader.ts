const SparkleShader = `
uniform float2 iResolution;
uniform float iTime;
uniform float2 gradientCenter;

// Random function for sparkle generation
float random(vec2 st) {
    return fract(sin(dot(st.xy, vec2(12.9898, 78.233))) * 43758.5453123);
}

// Noise function for smooth sparkle movement
float noise(vec2 st) {
    vec2 i = floor(st);
    vec2 f = fract(st);
    
    float a = random(i);
    float b = random(i + vec2(1.0, 0.0));
    float c = random(i + vec2(0.0, 1.0));
    float d = random(i + vec2(1.0, 1.0));
    
    vec2 u = f * f * (3.0 - 2.0 * f);
    
    return mix(a, b, u.x) + (c - a) * u.y * (1.0 - u.x) + (d - b) * u.x * u.y;
}

// Generate sparkles at specific points
float sparkle(vec2 uv, vec2 sparklePos, float time, float intensity) {
    float dist = distance(uv, sparklePos);
    float sparkleSize = 0.02 + 0.01 * sin(time * 8.0);
    float sparkleIntensity = intensity * (0.5 + 0.5 * sin(time * 6.0));
    
    // Create cross-shaped sparkle
    float horizontal = exp(-abs(uv.y - sparklePos.y) * 100.0) * exp(-pow(abs(uv.x - sparklePos.x) * 20.0, 2.0));
    float vertical = exp(-abs(uv.x - sparklePos.x) * 100.0) * exp(-pow(abs(uv.y - sparklePos.y) * 20.0, 2.0));
    
    return (horizontal + vertical) * sparkleIntensity * smoothstep(sparkleSize * 2.0, 0.0, dist);
}

// Shimmer effect
float shimmer(vec2 uv, float time) {
    vec2 shimmering = uv + vec2(sin(time * 1.5) * 0.3, cos(time * 1.2) * 0.2);
    float shimmerNoise = noise(shimmering * 8.0 + time * 2.0);
    return shimmerNoise * 0.3;
}

half4 main(vec2 fragCoord) {
    vec2 uv = fragCoord / iResolution.xy;
    vec2 center = vec2(0.5, 0.5);
    
    // Normalize gradient center to UV coordinates
    vec2 normalizedGradientCenter = gradientCenter / iResolution.xy;
    
    // Distance from center for circular masking
    float distFromCenter = distance(uv, center);
    float circularMask = smoothstep(0.5, 0.45, distFromCenter);
    
    // Base shimmer effect
    float shimmerEffect = shimmer(uv, iTime);
    
    // Multiple sparkles at different positions and speeds
    float sparkles = 0.0;
    
    // Sparkle 1 - follows gradient center
    vec2 sparkle1Pos = normalizedGradientCenter + vec2(sin(iTime * 2.5) * 0.1, cos(iTime * 2.2) * 0.08);
    sparkles += sparkle(uv, sparkle1Pos, iTime, 0.8);
    
    // Sparkle 2 - independent movement
    vec2 sparkle2Pos = center + vec2(sin(iTime * 3.1 + 1.0) * 0.15, cos(iTime * 2.8 + 1.5) * 0.12);
    sparkles += sparkle(uv, sparkle2Pos, iTime + 1.0, 0.6);
    
    // Sparkle 3 - slower movement
    vec2 sparkle3Pos = center + vec2(sin(iTime * 1.8 + 2.0) * 0.2, cos(iTime * 1.5 + 2.5) * 0.15);
    sparkles += sparkle(uv, sparkle3Pos, iTime + 2.0, 0.4);
    
    // Random twinkling sparkles
    for (float i = 0.0; i < 5.0; i++) {
        vec2 randomPos = vec2(
            0.3 + 0.4 * sin(i * 2.4 + iTime * 0.8),
            0.3 + 0.4 * cos(i * 1.8 + iTime * 0.6)
        );
        float twinkle = sin(iTime * 4.0 + i * 2.0) * 0.5 + 0.5;
        sparkles += sparkle(uv, randomPos, iTime + i, 0.3 * twinkle);
    }
    
    // Radial gradient effect based on gradient center
    float radialEffect = 1.0 - smoothstep(0.0, 0.8, distance(uv, normalizedGradientCenter));
    radialEffect = pow(radialEffect, 2.0);
    
    // Combine effects
    float finalIntensity = (shimmerEffect + sparkles * 2.0 + radialEffect * 0.3) * circularMask;
    
    // Color with slight iridescence
    vec3 color = vec3(1.0, 0.95, 0.9) * finalIntensity;
    color += vec3(0.1, 0.2, 0.3) * sparkles * circularMask; // Add blue tint to sparkles
    
    // Pulsing overall intensity
    float pulse = 0.7 + 0.3 * sin(iTime * 2.0);
    color *= pulse;
    
    return vec4(color, finalIntensity * 0.8);
}`;

export { SparkleShader }; 