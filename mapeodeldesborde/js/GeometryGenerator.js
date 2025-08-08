import * as THREE from 'three';

export class GeometryGenerator {
    constructor() {
        this.noiseScale = 0.1;
        this.baseComplexity = 32;
    }
    
    async createFromAudio(audioData) {
        const spectralData = audioData.spectralData;
        const overallFeatures = spectralData.overall;
        
        // Use spectral features to determine geometry characteristics
        const complexity = this.calculateComplexity(overallFeatures);
        const deformationIntensity = this.calculateDeformationIntensity(overallFeatures);
        const scale = this.calculateScale(overallFeatures);
        
        // Create base geometry
        const baseGeometry = this.createBaseGeometry(complexity);
        
        // Apply audio-driven deformations
        const deformedGeometry = this.applySpectralDeformation(
            baseGeometry, 
            spectralData, 
            deformationIntensity,
            scale
        );
        
        return deformedGeometry;
    }
    
    calculateComplexity(features) {
        // Higher spectral centroid and energy = more complex geometry
        const centroidFactor = Math.min(features.spectralCentroid / 200, 1.0);
        const energyFactor = Math.min(features.energy / 1000, 1.0);
        
        const complexityMultiplier = 1 + (centroidFactor + energyFactor);
        return Math.floor(this.baseComplexity * complexityMultiplier);
    }
    
    calculateDeformationIntensity(features) {
        // Use spectral variance and energy for deformation intensity
        const varianceIntensity = Math.sqrt(features.variance.spectralCentroid) / 50;
        const energyIntensity = Math.min(features.energy / 500, 2.0);
        
        return Math.min(varianceIntensity + energyIntensity, 3.0);
    }
    
    calculateScale(features) {
        // Scale based on overall energy and spectral rolloff
        const energyScale = Math.max(0.5, Math.min(features.energy / 300, 3.0));
        const rolloffScale = 0.5 + features.spectralRolloff * 1.5;
        
        return energyScale * rolloffScale * 25; // Increased scale much more
    }
    
    createBaseGeometry(complexity) {
        // Create an icosphere as base geometry
        const geometry = new THREE.IcosahedronGeometry(1, Math.floor(complexity / 16));
        return geometry;
    }
    
    applySpectralDeformation(geometry, spectralData, intensity, scale) {
        const vertices = geometry.attributes.position.array;
        const originalVertices = vertices.slice(); // Keep original for reference
        
        const overallFeatures = spectralData.overall;
        const mfccWeights = overallFeatures.mfcc || new Array(13).fill(0);
        
        // Apply deformations based on spectral features
        for (let i = 0; i < vertices.length; i += 3) {
            const x = originalVertices[i];
            const y = originalVertices[i + 1];
            const z = originalVertices[i + 2];
            
            // Create vertex position vector for noise calculation
            const vertex = new THREE.Vector3(x, y, z);
            const normalizedVertex = vertex.clone().normalize();
            
            // Generate Perlin-like noise using spectral data
            const noiseValue = this.generateSpectralNoise(
                normalizedVertex, 
                mfccWeights, 
                overallFeatures,
                intensity
            );
            
            // Apply deformation along vertex normal
            const deformationAmount = 1.0 + (noiseValue * intensity * 0.5);
            
            vertices[i] = x * deformationAmount * scale;
            vertices[i + 1] = y * deformationAmount * scale;
            vertices[i + 2] = z * deformationAmount * scale;
        }
        
        // Update geometry
        geometry.attributes.position.needsUpdate = true;
        geometry.computeVertexNormals();
        
        return geometry;
    }
    
    generateSpectralNoise(vertex, mfccWeights, features, intensity) {
        // Multi-octave noise based on spectral features
        let noise = 0;
        let amplitude = 1.0;
        let frequency = 1.0;
        
        const octaves = 4;
        
        for (let i = 0; i < octaves; i++) {
            // Use different MFCC coefficients for different octaves
            const mfccIndex = Math.min(i * 3, mfccWeights.length - 1);
            const mfccWeight = mfccWeights[mfccIndex] || 0;
            
            // Generate noise for this octave
            const octaveNoise = this.perlinNoise3D(
                vertex.x * frequency + mfccWeight,
                vertex.y * frequency + features.spectralCentroid * 0.01,
                vertex.z * frequency + features.energy * 0.001
            );
            
            noise += octaveNoise * amplitude;
            
            amplitude *= 0.5;
            frequency *= 2.0;
        }
        
        // Add spectral-specific modulations
        const spectralModulation = Math.sin(features.spectralCentroid * 0.1) * 
                                  Math.cos(features.spectralRolloff * Math.PI * 2);
        
        noise += spectralModulation * 0.3;
        
        // Apply energy-based scaling
        const energyScaling = Math.min(features.energy / 200, 2.0);
        noise *= energyScaling;
        
        return Math.max(-1, Math.min(1, noise));
    }
    
    perlinNoise3D(x, y, z) {
        // Simplified 3D Perlin noise implementation
        const xi = Math.floor(x) & 255;
        const yi = Math.floor(y) & 255;
        const zi = Math.floor(z) & 255;
        
        const xf = x - Math.floor(x);
        const yf = y - Math.floor(y);
        const zf = z - Math.floor(z);
        
        const u = this.fade(xf);
        const v = this.fade(yf);
        const w = this.fade(zf);
        
        // Simplified gradient calculation
        const aaa = this.grad3D(this.hash(xi, yi, zi), xf, yf, zf);
        const aba = this.grad3D(this.hash(xi, yi + 1, zi), xf, yf - 1, zf);
        const aab = this.grad3D(this.hash(xi, yi, zi + 1), xf, yf, zf - 1);
        const abb = this.grad3D(this.hash(xi, yi + 1, zi + 1), xf, yf - 1, zf - 1);
        const baa = this.grad3D(this.hash(xi + 1, yi, zi), xf - 1, yf, zf);
        const bba = this.grad3D(this.hash(xi + 1, yi + 1, zi), xf - 1, yf - 1, zf);
        const bab = this.grad3D(this.hash(xi + 1, yi, zi + 1), xf - 1, yf, zf - 1);
        const bbb = this.grad3D(this.hash(xi + 1, yi + 1, zi + 1), xf - 1, yf - 1, zf - 1);
        
        // Trilinear interpolation
        const x1 = this.lerp(aaa, baa, u);
        const x2 = this.lerp(aba, bba, u);
        const x3 = this.lerp(aab, bab, u);
        const x4 = this.lerp(abb, bbb, u);
        
        const y1 = this.lerp(x1, x2, v);
        const y2 = this.lerp(x3, x4, v);
        
        return this.lerp(y1, y2, w);
    }
    
    hash(x, y, z) {
        // Simple hash function for noise
        let hash = x * 374761393 + y * 668265263 + z * 1013904242;
        hash = (hash ^ (hash >> 13)) * 1274126177;
        return Math.abs(hash) % 256;
    }
    
    grad3D(hash, x, y, z) {
        // 3D gradient vectors
        const h = hash & 15;
        const u = h < 8 ? x : y;
        const v = h < 4 ? y : h === 12 || h === 14 ? x : z;
        return ((h & 1) === 0 ? u : -u) + ((h & 2) === 0 ? v : -v);
    }
    
    fade(t) {
        // Smooth interpolation curve
        return t * t * t * (t * (t * 6 - 15) + 10);
    }
    
    lerp(a, b, t) {
        return a + t * (b - a);
    }
    
    // Create animated geometry that can respond to real-time audio
    createReactiveGeometry(audioData, baseGeometry) {
        const spectralChunks = audioData.spectralData.chunks;
        
        // Create morph targets based on different time slices
        const morphTargets = [];
        const numTargets = Math.min(8, spectralChunks.length);
        
        for (let i = 0; i < numTargets; i++) {
            const chunkIndex = Math.floor((i / numTargets) * spectralChunks.length);
            const chunk = spectralChunks[chunkIndex];
            
            const morphGeometry = this.createMorphTarget(baseGeometry, chunk.features);
            morphTargets.push({
                name: `morph${i}`,
                geometry: morphGeometry,
                time: chunk.time
            });
        }
        
        return morphTargets;
    }
    
    createMorphTarget(baseGeometry, features) {
        const geometry = baseGeometry.clone();
        const vertices = geometry.attributes.position.array;
        
        // Apply different deformation based on features
        for (let i = 0; i < vertices.length; i += 3) {
            const vertex = new THREE.Vector3(vertices[i], vertices[i + 1], vertices[i + 2]);
            const normalizedVertex = vertex.clone().normalize();
            
            const deformation = this.calculateFeatureDeformation(normalizedVertex, features);
            
            vertices[i] *= (1.0 + deformation * 0.3);
            vertices[i + 1] *= (1.0 + deformation * 0.3);
            vertices[i + 2] *= (1.0 + deformation * 0.3);
        }
        
        geometry.attributes.position.needsUpdate = true;
        geometry.computeVertexNormals();
        
        return geometry;
    }
    
    calculateFeatureDeformation(vertex, features) {
        // Use multiple features to create complex deformation
        const centroidInfluence = Math.sin(vertex.x * features.spectralCentroid * 0.1);
        const energyInfluence = Math.cos(vertex.y * features.energy * 0.01);
        const rolloffInfluence = Math.sin(vertex.z * features.spectralRolloff * Math.PI);
        
        return (centroidInfluence + energyInfluence + rolloffInfluence) / 3.0;
    }
}