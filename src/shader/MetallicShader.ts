const MetallicShader = `
uniform float2 iResolution;
uniform float iTime;
uniform float2 gradientCenter;

// Metallic parameters
uniform float metallic;      // Default: 0.9
uniform float roughness;     // Default: 0.1
uniform float3 baseColor;    // Default: vec3(1.0, 0.8, 0.3) - gold color
uniform float3 lightColor;  // Default: vec3(1.0, 0.95, 0.8) - warm light

// Noise function for surface detail
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

// Fractal noise for surface texture
float fbm(vec2 st) {
    float value = 0.0;
    float amplitude = 0.5;
    
    for (int i = 0; i < 4; i++) {
        value += amplitude * noise(st);
        st *= 2.0;
        amplitude *= 0.5;
    }
    return value;
}

// Fresnel reflection calculation
float fresnel(float cosTheta, float F0) {
    return F0 + (1.0 - F0) * pow(1.0 - cosTheta, 5.0);
}

// Schlick's approximation for Fresnel
vec3 fresnelSchlick(float cosTheta, vec3 F0) {
    return F0 + (1.0 - F0) * pow(clamp(1.0 - cosTheta, 0.0, 1.0), 5.0);
}

// Distribution function (GGX/Trowbridge-Reitz)
float distributionGGX(vec3 N, vec3 H, float roughness) {
    float a = roughness * roughness;
    float a2 = a * a;
    float NdotH = max(dot(N, H), 0.0);
    float NdotH2 = NdotH * NdotH;
    
    float num = a2;
    float denom = (NdotH2 * (a2 - 1.0) + 1.0);
    denom = 3.14159265 * denom * denom;
    
    return num / denom;
}

// Geometry function
float geometrySchlickGGX(float NdotV, float roughness) {
    float r = (roughness + 1.0);
    float k = (r * r) / 8.0;
    
    float num = NdotV;
    float denom = NdotV * (1.0 - k) + k;
    
    return num / denom;
}

float geometrySmith(vec3 N, vec3 V, vec3 L, float roughness) {
    float NdotV = max(dot(N, V), 0.0);
    float NdotL = max(dot(N, L), 0.0);
    float ggx2 = geometrySchlickGGX(NdotV, roughness);
    float ggx1 = geometrySchlickGGX(NdotL, roughness);
    
    return ggx1 * ggx2;
}

// Calculate surface normal with micro-details
vec3 calculateNormal(vec2 uv, vec2 center) {
    // Base normal pointing up
    vec3 normal = vec3(0.0, 0.0, 1.0);
    
    // Add subtle surface variations
    float surfaceNoise = fbm(uv * 20.0 + iTime * 0.1) * 0.1;
    
    // Create slight curvature based on distance from center
    float distFromCenter = distance(uv, center);
    float curvature = smoothstep(0.0, 0.5, distFromCenter) * 0.3;
    
    // Modify normal based on position relative to center
    vec2 dirFromCenter = normalize(uv - center);
    normal.xy += dirFromCenter * curvature + vec2(surfaceNoise);
    normal = normalize(normal);
    
    return normal;
}

// Multiple light sources for realistic coin lighting
vec3 calculateLighting(vec3 normal, vec3 viewDir, vec2 uv, vec2 center) {
    vec3 finalColor = vec3(0.0);
    
    // Normalize gradient center to UV coordinates
    vec2 normalizedGradientCenter = gradientCenter / iResolution.xy;
    
    // Primary light source (follows gradient center)
    vec3 lightPos1 = vec3(normalizedGradientCenter.x - 0.5, normalizedGradientCenter.y - 0.5, 0.8);
    lightPos1 = normalize(lightPos1);
    
    // Secondary light source (opposite side for rim lighting)
    vec3 lightPos2 = vec3(-lightPos1.x * 0.5, -lightPos1.y * 0.5, 0.6);
    lightPos2 = normalize(lightPos2);
    
    // Ambient light source (top-down)
    vec3 lightPos3 = vec3(0.0, 0.0, 1.0);
    
    // Light colors and intensities
    vec3 lightColor1 = lightColor * 1.2;
    vec3 lightColor2 = lightColor * 0.6;
    vec3 lightColor3 = lightColor * 0.4;
    
    // Calculate lighting for each light source
    vec3 lights[3];
    lights[0] = lightPos1;
    lights[1] = lightPos2;
    lights[2] = lightPos3;
    
    vec3 lightColors[3];
    lightColors[0] = lightColor1;
    lightColors[1] = lightColor2;
    lightColors[2] = lightColor3;
    
    for (int i = 0; i < 3; i++) {
        vec3 lightDir = lights[i];
        vec3 halfwayDir = normalize(lightDir + viewDir);
        
        // Calculate PBR components
        float NdotV = max(dot(normal, viewDir), 0.0);
        float NdotL = max(dot(normal, lightDir), 0.0);
        float HdotV = max(dot(halfwayDir, viewDir), 0.0);
        
        // Fresnel reflectance at normal incidence for gold
        vec3 F0 = mix(vec3(0.04), baseColor, metallic);
        
        // Calculate Fresnel
        vec3 F = fresnelSchlick(HdotV, F0);
        
        // Calculate distribution and geometry
        float NDF = distributionGGX(normal, halfwayDir, roughness);
        float G = geometrySmith(normal, viewDir, lightDir, roughness);
        
        // Calculate specular reflection
        vec3 numerator = NDF * G * F;
        float denominator = 4.0 * NdotV * NdotL + 0.0001;
        vec3 specular = numerator / denominator;
        
        // Calculate diffuse (for non-metallic parts)
        vec3 kS = F;
        vec3 kD = vec3(1.0) - kS;
        kD *= 1.0 - metallic;
        
        vec3 diffuse = kD * baseColor / 3.14159265;
        
        // Combine diffuse and specular
        finalColor += (diffuse + specular) * lightColors[i] * NdotL;
    }
    
    return finalColor;
}

half4 main(vec2 fragCoord) {
    vec2 uv = fragCoord / iResolution.xy;
    vec2 center = vec2(0.5, 0.5);
    
    // Distance from center for circular masking
    float distFromCenter = distance(uv, center);
    float circularMask = smoothstep(0.5, 0.48, distFromCenter);
    
    if (circularMask < 0.01) {
        return vec4(0.0, 0.0, 0.0, 0.0);
    }
    
    // Calculate surface normal
    vec3 normal = calculateNormal(uv, center);
    
    // View direction (camera looking down at coin)
    vec3 viewDir = vec3(0.0, 0.0, 1.0);
    
    // Calculate realistic metallic lighting
    vec3 color = calculateLighting(normal, viewDir, uv, center);
    
    // Add subtle animated reflections
    float animatedReflection = sin(iTime * 2.0 + distFromCenter * 10.0) * 0.1 + 0.9;
    color *= animatedReflection;
    
    // Add edge enhancement for coin rim
    float edgeGlow = 1.0 - smoothstep(0.45, 0.48, distFromCenter);
    edgeGlow = pow(edgeGlow, 3.0);
    color += edgeGlow * baseColor * 0.5;
    
    // Add subtle surface scratches and imperfections
    float scratches = fbm(uv * 50.0) * 0.05;
    color += scratches * baseColor;
    
    // Enhance metallic appearance with environment reflection simulation
    vec2 reflectionUV = uv + normal.xy * 0.1;
    float envReflection = fbm(reflectionUV * 3.0 + iTime * 0.2) * 0.3;
    color += envReflection * lightColor * metallic;
    
    // Apply circular mask
    color *= circularMask;
    
    // Calculate alpha based on the circular mask and intensity
    float alpha = circularMask * (0.8 + length(color) * 0.2);
    alpha = clamp(alpha, 0.0, 1.0);
    
    return vec4(color, alpha);
}
`;

export { MetallicShader }; 