const BloomGlowShader = `
uniform float2 iResolution;
uniform float iTime;
uniform float2 gradientCenter;

// Glow parameters adapted from Love2D shader concept
uniform float samples;     // pixels per axis; higher = bigger glow, worse performance (default: 5.0)
uniform float quality;     // lower = smaller glow, better quality (default: 2.5)
uniform float intensity;   // glow intensity multiplier (default: 1.0)

// Generate smooth noise for bloom base
float noise(vec2 st) {
    vec2 i = floor(st);
    vec2 f = fract(st);
    
    float a = fract(sin(dot(i, vec2(12.9898, 78.233))) * 43758.5453);
    float b = fract(sin(dot(i + vec2(1.0, 0.0), vec2(12.9898, 78.233))) * 43758.5453);
    float c = fract(sin(dot(i + vec2(0.0, 1.0), vec2(12.9898, 78.233))) * 43758.5453);
    float d = fract(sin(dot(i + vec2(1.0, 1.0), vec2(12.9898, 78.233))) * 43758.5453);
    
    vec2 u = f * f * (3.0 - 2.0 * f);
    
    return mix(a, b, u.x) + (c - a) * u.y * (1.0 - u.x) + (d - b) * u.x * u.y;
}

// Create bloom effect by sampling surrounding areas
float createBloom(vec2 uv, vec2 center, float radius) {
    float bloom = 0.0;
    float sampleCount = 0.0;
    
    // Sample in a grid pattern around the center
    for (float x = -2.0; x <= 2.0; x += 1.0) {
        for (float y = -2.0; y <= 2.0; y += 1.0) {
            vec2 offset = vec2(x, y) * quality / iResolution.xy;
            vec2 samplePos = uv + offset;
            
            // Calculate distance from the bloom center
            float dist = distance(samplePos, center);
            float contribution = 1.0 - smoothstep(0.0, radius, dist);
            contribution = pow(contribution, 2.0);
            
            bloom += contribution;
            sampleCount += 1.0;
        }
    }
    
    return bloom / sampleCount;
}

half4 main(vec2 fragCoord) {
    vec2 uv = fragCoord / iResolution.xy;
    vec2 center = vec2(0.5, 0.5);
    
    // Normalize gradient center to UV coordinates
    vec2 normalizedGradientCenter = gradientCenter / iResolution.xy;
    
    // Distance from center for circular masking
    float distFromCenter = distance(uv, center);
    float circularMask = smoothstep(0.5, 0.45, distFromCenter);
    
    // Create base bright spots
    vec3 baseGlow = vec3(0.0);
    
    // Main bright spot at gradient center
    float dist1 = distance(uv, normalizedGradientCenter);
    float spot1 = 1.0 - smoothstep(0.0, 0.15, dist1);
    spot1 = pow(spot1, 2.0);
    
    // Animated secondary spots
    vec2 spot2Pos = center + vec2(sin(iTime * 1.2) * 0.1, cos(iTime * 0.8) * 0.08);
    float dist2 = distance(uv, spot2Pos);
    float spot2 = 1.0 - smoothstep(0.0, 0.1, dist2);
    spot2 = pow(spot2, 3.0);
    
    vec2 spot3Pos = center + vec2(cos(iTime * 1.5 + 3.14) * 0.08, sin(iTime * 1.1 + 1.57) * 0.06);
    float dist3 = distance(uv, spot3Pos);
    float spot3 = 1.0 - smoothstep(0.0, 0.08, dist3);
    spot3 = pow(spot3, 4.0);
    
    // Create bloom effects for each spot
    float bloom1 = createBloom(uv, normalizedGradientCenter, 0.2);
    float bloom2 = createBloom(uv, spot2Pos, 0.15);
    float bloom3 = createBloom(uv, spot3Pos, 0.1);
    
    // Combine base spots with their bloom
    baseGlow += (spot1 + bloom1 * 0.5) * vec3(1.0, 0.9, 0.65) * 0.8;
    baseGlow += (spot2 + bloom2 * 0.3) * vec3(1.0, 0.85, 0.6) * 0.6;
    baseGlow += (spot3 + bloom3 * 0.2) * vec3(1.0, 0.95, 0.7) * 0.4;
    
    // Add noise variation for organic feel
    vec2 noiseUV = uv * 4.0 + iTime * 0.3;
    float noiseVariation = noise(noiseUV) * 0.1;
    baseGlow += noiseVariation * vec3(1.0, 0.9, 0.65);
    
    // Apply intensity
    vec3 finalGlow = baseGlow * intensity;
    
    // Add subtle pulsing
    float pulse = 0.9 + 0.1 * sin(iTime * 2.0);
    finalGlow *= pulse;
    
    // Apply circular mask
    finalGlow *= circularMask;
    
    // Create alpha based on glow intensity
    float alpha = length(finalGlow) * 0.6;
    alpha = clamp(alpha, 0.0, 0.8);
    
    return vec4(finalGlow, alpha);
}`;

export { BloomGlowShader }; 