import * as THREE from 'three';

export class AudioObject {
    constructor(audioData, geometry, position, scene, audioManager, objectIndex, textureManager) {
        this.audioData = audioData;
        this.position = position.clone();
        this.scene = scene;
        this.audioManager = audioManager;
        this.objectIndex = objectIndex;
        this.textureManager = textureManager;
        
        this.mesh = null;
        this.audioSource = null;
        this.panner = null;
        this.isPlaying = false;
        this.playbackStartTime = 0;
        
        // Visual properties
        this.originalGeometry = geometry.clone();
        this.currentGeometry = geometry;
        this.morphTargets = [];
        
        // Animation properties
        this.rotationSpeed = new THREE.Vector3(
            (Math.random() - 0.5) * 0.02,
            (Math.random() - 0.5) * 0.02,
            (Math.random() - 0.5) * 0.02
        );
        
        this.floatAmplitude = Math.random() * 2 + 1;
        this.floatSpeed = Math.random() * 0.05 + 0.02;
        this.baseY = position.y;
        
        // Audio visualization properties
        this.spectralInfluence = 0;
        this.targetSpectralInfluence = 0;
        this.energyInfluence = 0;
        
        this.textures = null;
        this.initMesh();
        this.loadTextures();
        this.createMorphTargets().catch(console.error);
    }
    
    async loadTextures() {
        if (this.textureManager) {
            try {
                this.textures = await this.textureManager.loadTexturesForObject(this.objectIndex);
                if (this.textures && this.mesh) {
                    // Update material with textures
                    this.updateMaterialWithTextures();
                }
            } catch (error) {
                console.error('Failed to load textures for object', this.objectIndex, error);
            }
        }
    }
    
    initMesh() {
        // Create material based on spectral features
        const features = this.audioData.spectralData.overall;
        const material = this.createSpectralMaterial(features);
        
        // Create mesh
        this.mesh = new THREE.Mesh(this.currentGeometry, material);
        this.mesh.position.copy(this.position);
        this.mesh.castShadow = true;
        this.mesh.receiveShadow = true;
        
        // Add glow effect
        this.addGlowEffect();
        
        this.scene.add(this.mesh);
    }
    
    createSpectralMaterial(features) {
        // Map spectral features to colors and material properties
        const centroidNorm = Math.min(features.spectralCentroid / 300, 1);
        const energyNorm = Math.min(features.energy / 1000, 1);
        const rolloffNorm = features.spectralRolloff;
        
        // Create color based on spectral features
        const hue = centroidNorm * 0.8; // Higher frequencies -> blue/violet
        const saturation = 0.7 + energyNorm * 0.3;
        const lightness = 0.3 + rolloffNorm * 0.4;
        
        const color = new THREE.Color().setHSL(hue, saturation, lightness);
        
        // Create material with audio-driven properties
        const material = new THREE.MeshPhongMaterial({
            color: color,
            transparent: true,
            opacity: 0.8,
            shininess: 30 + energyNorm * 70,
            specular: new THREE.Color().setHSL(hue, saturation * 0.5, 0.8),
            wireframe: false
        });
        
        return material;
    }
    
    addGlowEffect() {
        // Add subtle glow using a larger, transparent mesh
        const glowGeometry = this.currentGeometry.clone();
        const glowMaterial = new THREE.MeshBasicMaterial({
            color: this.mesh.material.color,
            transparent: true,
            opacity: 0.1,
            side: THREE.BackSide
        });
        
        const glowMesh = new THREE.Mesh(glowGeometry, glowMaterial);
        glowMesh.scale.setScalar(1.2);
        
        this.mesh.add(glowMesh);
        this.glowMesh = glowMesh;
    }
    
    updateMaterialWithTextures() {
        if (!this.textures || !this.mesh) return;
        
        const features = this.audioData.spectralData.overall;
        
        // Create new material with textures
        const material = this.textureManager.createDynamicMaterial(this.textures, features);
        
        // Apply spectral color tinting to the textured material
        const centroidNorm = Math.min(features.spectralCentroid / 300, 1);
        const energyNorm = Math.min(features.energy / 1000, 1);
        const rolloffNorm = features.spectralRolloff;
        
        const hue = centroidNorm * 0.8;
        const saturation = 0.4 + energyNorm * 0.3; // Less saturation to show texture
        const lightness = 0.6 + rolloffNorm * 0.3;
        
        const tintColor = new THREE.Color().setHSL(hue, saturation, lightness);
        material.color.copy(tintColor);
        
        // Replace the mesh material
        if (this.mesh.material) {
            this.mesh.material.dispose();
        }
        this.mesh.material = material;
        
        console.log('Applied textures to object', this.objectIndex, this.textures.texture1Path, this.textures.texture2Path);
    }
    
    async createMorphTargets() {
        // Create different deformation states for animation
        const { GeometryGenerator } = await import('./GeometryGenerator.js');
        const geometryGen = new GeometryGenerator();
        this.morphTargets = geometryGen.createReactiveGeometry(this.audioData, this.originalGeometry);
    }
    
    playAudio() {
        if (this.isPlaying) {
            this.stopAudio();
            return;
        }
        
        console.log('Attempting to play audio:', this.audioData.path);
        
        // Resume context first
        this.audioManager.resumeContext();
        
        if (!this.audioManager.audioContext) {
            console.error('No audio context available');
            return;
        }
        
        if (this.audioManager.audioContext.state !== 'running') {
            console.error('Audio context not running, state:', this.audioManager.audioContext.state);
            return;
        }
        
        // Create simple audio source first (without 3D positioning for testing)
        const source = this.audioManager.createAudioSource(this.audioData);
        if (!source) {
            console.error('Failed to create audio source for:', this.audioData.path);
            return;
        }
        
        // Enable looping
        source.loop = true;
        
        // Create analyser for real-time frequency analysis
        this.analyser = this.audioManager.audioContext.createAnalyser();
        this.analyser.fftSize = 256;
        this.analyser.smoothingTimeConstant = 0.8;
        this.frequencyData = new Uint8Array(this.analyser.frequencyBinCount);
        
        // Connect: source -> analyser -> destination
        source.connect(this.analyser);
        this.analyser.connect(this.audioManager.audioContext.destination);
        
        this.audioSource = source;
        
        // Start playback
        this.audioSource.onended = () => {
            console.log('Audio ended (should not happen with loop):', this.audioData.path);
            this.isPlaying = false;
            this.targetSpectralInfluence = 0;
        };
        
        try {
            this.audioSource.start(0);
            this.isPlaying = true;
            this.playbackStartTime = this.audioManager.audioContext.currentTime;
            this.targetSpectralInfluence = 1.0;
            console.log('Audio started successfully with loop:', this.audioData.path);
        } catch (error) {
            console.error('Error starting audio:', error);
        }
    }
    
    stopAudio() {
        if (this.audioSource) {
            this.audioSource.stop();
            this.audioSource = null;
            this.panner = null;
        }
        if (this.analyser) {
            this.analyser = null;
            this.frequencyData = null;
        }
        this.isPlaying = false;
        this.targetSpectralInfluence = 0;
    }
    
    update(deltaTime, cameraPosition) {
        // Update floating animation
        const time = Date.now() * 0.001;
        this.mesh.position.y = this.baseY + Math.sin(time * this.floatSpeed) * this.floatAmplitude;
        
        // Update rotation
        this.mesh.rotation.x += this.rotationSpeed.x * deltaTime;
        this.mesh.rotation.y += this.rotationSpeed.y * deltaTime;
        this.mesh.rotation.z += this.rotationSpeed.z * deltaTime;
        
        // Update distance-based effects
        const distance = cameraPosition.distanceTo(this.mesh.position);
        this.updateDistanceEffects(distance);
        
        // Update audio-reactive effects
        if (this.isPlaying) {
            this.updateRealTimeVisualization(deltaTime);
        }
        
        // Smoothly interpolate spectral influence
        this.spectralInfluence += (this.targetSpectralInfluence - this.spectralInfluence) * deltaTime * 5;
        
        // Update material based on current state
        this.updateMaterialProperties();
    }
    
    updateDistanceEffects(distance) {
        // Fade opacity and glow based on distance
        const maxDistance = 100;
        const normalizedDistance = Math.min(distance / maxDistance, 1);
        
        // Base opacity decreases with distance
        const baseOpacity = Math.max(0.3, 1 - normalizedDistance * 0.5);
        this.mesh.material.opacity = baseOpacity + this.spectralInfluence * 0.3;
        
        // Scale based on distance and audio activity
        const baseScale = Math.max(0.5, 1 - normalizedDistance * 0.3);
        const audioScale = 1 + this.spectralInfluence * 0.5;
        this.mesh.scale.setScalar(baseScale * audioScale);
        
        // Update glow
        if (this.glowMesh) {
            this.glowMesh.material.opacity = 0.1 * (1 - normalizedDistance) + this.spectralInfluence * 0.2;
        }
    }
    
    updateRealTimeVisualization(deltaTime) {
        if (!this.analyser || !this.frequencyData) return;
        
        // Get real-time frequency data
        this.analyser.getByteFrequencyData(this.frequencyData);
        
        // Calculate energy and spectral features from live audio
        const features = this.calculateRealTimeFeatures(this.frequencyData);
        
        // Update energy influence
        this.energyInfluence = features.energy;
        
        // Apply real-time deformation
        this.applyRealtimeDeformation(features, deltaTime);
        
        // Update colors and textures based on real-time spectrum
        this.updateSpectralColors(features);
        this.updateTextureProperties(features);
    }
    
    calculateRealTimeFeatures(frequencyData) {
        const features = {
            energy: 0,
            spectralCentroid: 0,
            spectralRolloff: 0,
            bassEnergy: 0,
            midEnergy: 0,
            trebleEnergy: 0
        };
        
        // Calculate total energy
        let totalEnergy = 0;
        let weightedSum = 0;
        
        for (let i = 0; i < frequencyData.length; i++) {
            const magnitude = frequencyData[i] / 255.0; // Normalize to 0-1
            totalEnergy += magnitude;
            weightedSum += i * magnitude;
        }
        
        features.energy = Math.min(totalEnergy / frequencyData.length, 1.0);
        features.spectralCentroid = totalEnergy > 0 ? weightedSum / totalEnergy / frequencyData.length : 0;
        
        // Calculate spectral rolloff (90% of energy)
        const targetEnergy = totalEnergy * 0.9;
        let currentEnergy = 0;
        for (let i = 0; i < frequencyData.length; i++) {
            currentEnergy += frequencyData[i] / 255.0;
            if (currentEnergy >= targetEnergy) {
                features.spectralRolloff = i / frequencyData.length;
                break;
            }
        }
        
        // Calculate energy in different frequency bands
        const lowBand = Math.floor(frequencyData.length * 0.1);  // 0-10% (bass)
        const midBand = Math.floor(frequencyData.length * 0.5);  // 10-50% (mids)
        const highBand = frequencyData.length;                   // 50-100% (treble)
        
        for (let i = 0; i < lowBand; i++) {
            features.bassEnergy += frequencyData[i] / 255.0;
        }
        for (let i = lowBand; i < midBand; i++) {
            features.midEnergy += frequencyData[i] / 255.0;
        }
        for (let i = midBand; i < highBand; i++) {
            features.trebleEnergy += frequencyData[i] / 255.0;
        }
        
        // Normalize band energies
        features.bassEnergy /= lowBand;
        features.midEnergy /= (midBand - lowBand);
        features.trebleEnergy /= (highBand - midBand);
        
        return features;
    }
    
    applyRealtimeDeformation(features, deltaTime) {
        // Apply dynamic vertex displacement based on real-time spectral features
        const vertices = this.mesh.geometry.attributes.position.array;
        const originalVertices = this.originalGeometry.attributes.position.array;
        
        const time = Date.now() * 0.001;
        
        // Multiple deformation layers based on frequency bands
        const bassDeformation = features.bassEnergy * 0.8;    // Strong low-frequency expansion
        const midDeformation = features.midEnergy * 0.4;      // Medium mid-frequency waves
        const trebleDeformation = features.trebleEnergy * 0.6; // High-frequency detail
        
        for (let i = 0; i < vertices.length; i += 3) {
            const x = originalVertices[i];
            const y = originalVertices[i + 1];
            const z = originalVertices[i + 2];
            
            // Create vertex position vector
            const vertex = new THREE.Vector3(x, y, z);
            const normalizedVertex = vertex.clone().normalize();
            
            // Bass deformation - slow, large movements
            const bassWave = Math.sin(time * 1.5 + normalizedVertex.x * 2) * bassDeformation;
            
            // Mid deformation - medium frequency waves
            const midWaveX = Math.sin(time * 3 + normalizedVertex.y * 4) * midDeformation;
            const midWaveY = Math.cos(time * 2.5 + normalizedVertex.z * 3) * midDeformation;
            
            // Treble deformation - fast, small details
            const trebleDetail = Math.sin(time * 8 + normalizedVertex.x * 10 + normalizedVertex.y * 8) * trebleDeformation * 0.3;
            
            // Combine all deformations
            const totalDeformation = 1.0 + bassWave + (midWaveX + midWaveY) * 0.5 + trebleDetail;
            
            // Apply energy-based pulsing
            const energyPulse = 1.0 + Math.sin(time * 4) * features.energy * 0.2;
            
            vertices[i] = x * totalDeformation * energyPulse;
            vertices[i + 1] = y * totalDeformation * energyPulse;
            vertices[i + 2] = z * totalDeformation * energyPulse;
        }
        
        this.mesh.geometry.attributes.position.needsUpdate = true;
        this.mesh.geometry.computeVertexNormals();
    }
    
    updateSpectralColors(features) {
        const material = this.mesh.material;
        
        // Create dynamic color based on frequency bands
        const bassHue = 0.0;        // Red/Orange for bass
        const midHue = 0.33;        // Green for mids  
        const trebleHue = 0.66;     // Blue/Purple for treble
        
        // Weighted color mixing based on energy in each band
        const totalBandEnergy = features.bassEnergy + features.midEnergy + features.trebleEnergy;
        
        if (totalBandEnergy > 0) {
            const bassWeight = features.bassEnergy / totalBandEnergy;
            const midWeight = features.midEnergy / totalBandEnergy;
            const trebleWeight = features.trebleEnergy / totalBandEnergy;
            
            // Calculate weighted hue
            const hue = (bassHue * bassWeight + midHue * midWeight + trebleHue * trebleWeight) % 1.0;
            
            // Saturation based on spectral centroid
            const saturation = 0.6 + features.spectralCentroid * 0.4;
            
            // Lightness based on overall energy
            const lightness = 0.3 + features.energy * 0.5;
            
            // Apply color
            const dynamicColor = new THREE.Color().setHSL(hue, saturation, lightness);
            material.color.copy(dynamicColor);
            
            // Update emissive for glow effect
            const emissiveIntensity = features.energy * 0.4;
            material.emissive.copy(dynamicColor).multiplyScalar(emissiveIntensity);
            
            // Update glow mesh color
            if (this.glowMesh) {
                this.glowMesh.material.color.copy(dynamicColor);
            }
        }
    }
    
    updateTextureProperties(features) {
        if (this.textureManager && this.mesh && this.mesh.material) {
            this.textureManager.updateMaterialProperties(this.mesh.material, features);
        }
    }
    
    updateMaterialProperties() {
        const material = this.mesh.material;
        
        // Update color intensity based on audio activity
        const baseColor = material.color.clone();
        const intensity = 1 + this.spectralInfluence * 0.5;
        
        material.color.copy(baseColor).multiplyScalar(intensity);
        
        // Update emissive property for glow effect when playing
        if (this.isPlaying) {
            const emissiveIntensity = this.spectralInfluence * this.energyInfluence * 0.3;
            material.emissive.copy(baseColor).multiplyScalar(emissiveIntensity);
        } else {
            material.emissive.setScalar(0);
        }
        
        // Update glow mesh if it exists
        if (this.glowMesh) {
            this.glowMesh.material.color.copy(material.color);
        }
    }
    
    // Method to get the current audio features for external use
    getCurrentSpectralFeatures() {
        if (!this.isPlaying || !this.audioManager.audioContext) {
            return this.audioData.spectralData.overall;
        }
        
        const currentTime = this.audioManager.audioContext.currentTime - this.playbackStartTime;
        const progress = currentTime / this.audioData.duration;
        const spectralChunks = this.audioData.spectralData.chunks;
        const chunkIndex = Math.floor(progress * (spectralChunks.length - 1));
        
        return spectralChunks[chunkIndex]?.features || this.audioData.spectralData.overall;
    }
    
    // Cleanup method
    dispose() {
        this.stopAudio();
        
        if (this.mesh) {
            this.scene.remove(this.mesh);
            this.mesh.geometry.dispose();
            this.mesh.material.dispose();
        }
        
        if (this.glowMesh) {
            this.glowMesh.geometry.dispose();
            this.glowMesh.material.dispose();
        }
        
        this.morphTargets.forEach(target => {
            target.geometry.dispose();
        });
    }
}