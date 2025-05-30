const GlowShader = `
uniform float2 iResolution;
uniform float iTime;
uniform float2 gradientCenter;

// Glow parameters
uniform float glowIntensity; // Default: 1.0
uniform float glowRadius;    // Default: 0.3
uniform float3 glowColor;    // Default: vec3(1.0, 0.8, 0.2)

// Distance function for smooth circles
float sdCircle(vec2 p, float r) {
    return length(p) - r;
}

// Smooth minimum function for blending
float smin(float a, float b, float k) {
    float h = clamp(0.5 + 0.5 * (b - a) / k, 0.0, 1.0);
    return mix(b, a, h) - k * h * (1.0 - h);
}

// Generate smooth noise
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

// Fractal noise for more complex patterns
float fbm(vec2 st) {
    float value = 0.0;
    float amplitude = 0.3; // Reduced from 0.5
    float frequency = 0.0;
    
    for (int i = 0; i < 3; i++) { // Reduced iterations from 4 to 3
        value += amplitude * noise(st);
        st *= 2.0;
        amplitude *= 0.5;
    }
    return value;
}

half4 main(vec2 fragCoord) {
    vec2 uv = fragCoord / iResolution.xy;
    vec2 center = vec2(0.5, 0.5);
    
    // Normalize gradient center to UV coordinates
    vec2 normalizedGradientCenter = gradientCenter / iResolution.xy;
    
    // Distance from center for circular masking
    float distFromCenter = distance(uv, center);
    float circularMask = smoothstep(0.5, 0.45, distFromCenter);
    
    // Create subtle glow sources
    vec3 finalGlow = vec3(0.0);
    
    // Main gentle glow following gradient center
    vec2 glowCenter1 = normalizedGradientCenter;
    float dist1 = distance(uv, glowCenter1);
    float glow1 = 1.0 - smoothstep(0.0, glowRadius * 1.2, dist1); // Larger, softer radius
    glow1 = pow(glow1, 3.0); // Increased power for softer falloff
    
    // Very subtle secondary glow
    vec2 glowCenter2 = center + vec2(sin(iTime * 0.8) * 0.1, cos(iTime * 0.6) * 0.08); // Slower, smaller movement
    float dist2 = distance(uv, glowCenter2);
    float glow2 = 1.0 - smoothstep(0.0, glowRadius * 0.8, dist2);
    glow2 = pow(glow2, 4.0); // Even softer
    
    // Minimal third glow for subtle variation
    vec2 glowCenter3 = center + vec2(cos(iTime * 1.2 + 3.14) * 0.06, sin(iTime * 0.9 + 1.57) * 0.05);
    float dist3 = distance(uv, glowCenter3);
    float glow3 = 1.0 - smoothstep(0.0, glowRadius * 0.4, dist3);
    glow3 = pow(glow3, 5.0); // Very soft
    
    // Combine glows with gold coin colors - much more subtle
    finalGlow += glow1 * glowColor * glowIntensity * 0.6; // Reduced intensity
    finalGlow += glow2 * vec3(1.0, 0.9, 0.7) * glowIntensity * 0.2; // Warm gold tint, very subtle
    finalGlow += glow3 * vec3(1.0, 0.85, 0.6) * glowIntensity * 0.15; // Even more subtle warm tint
    
    // Very subtle noise-based shimmer
    vec2 noiseUV = uv * 4.0 + iTime * 0.3; // Slower movement
    float noiseGlow = fbm(noiseUV) * 0.1; // Much reduced intensity
    
    // Gentle edge highlight like a coin rim
    float edgeGlow = 1.0 - smoothstep(0.42, 0.48, distFromCenter); // Narrower edge
    edgeGlow = pow(edgeGlow, 4.0); // Softer edge
    finalGlow += edgeGlow * glowColor * 0.2; // Much more subtle
    
    // Very gentle pulsing like subtle light reflection
    float pulse = 0.9 + 0.1 * sin(iTime * 2.0); // Much smaller pulse range
    finalGlow *= pulse;
    
    // Add minimal noise variation
    finalGlow += noiseGlow * glowColor * 0.08; // Very subtle
    
    // Apply circular mask
    finalGlow *= circularMask;
    
    // Gentle breathing intensity like natural light variation
    float breathe = 0.85 + 0.15 * sin(iTime * 1.0); // Smaller range, slower
    finalGlow *= breathe;
    
    // Create very soft falloff
    float alpha = length(finalGlow) * 0.5; // Reduced alpha intensity
    alpha = clamp(alpha, 0.0, 0.6); // Cap maximum alpha for subtlety
    
    return vec4(finalGlow, alpha);
}`;

export { GlowShader }; 