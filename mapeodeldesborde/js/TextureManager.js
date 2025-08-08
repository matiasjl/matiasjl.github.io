import * as THREE from 'three';

export class TextureManager {
    constructor() {
        this.textureLoader = new THREE.TextureLoader();
        this.loadedTextures = new Map();
        this.photoList = [];
        this.initPhotoList();
    }
    
    initPhotoList() {
        // List of all available photos
        this.photoList = [
            'media/fotos/WhatsApp Image 2025-08-07 at 1.16.45 PM.jpeg',
            'media/fotos/WhatsApp Image 2025-08-07 at 1.16.48 PM-2.jpeg',
            'media/fotos/WhatsApp Image 2025-08-07 at 1.16.48 PM.jpeg',
            'media/fotos/WhatsApp Image 2025-08-07 at 1.16.49 PM-2.jpeg',
            'media/fotos/WhatsApp Image 2025-08-07 at 1.16.49 PM-3.jpeg',
            'media/fotos/WhatsApp Image 2025-08-07 at 1.16.49 PM.jpeg',
            'media/fotos/WhatsApp Image 2025-08-07 at 1.16.50 PM-2.jpeg',
            'media/fotos/WhatsApp Image 2025-08-07 at 1.16.50 PM.jpeg',
            'media/fotos/WhatsApp Image 2025-08-07 at 1.16.51 PM-2.jpeg',
            'media/fotos/WhatsApp Image 2025-08-07 at 1.16.51 PM-3.jpeg',
            'media/fotos/WhatsApp Image 2025-08-07 at 1.16.51 PM.jpeg',
            'media/fotos/WhatsApp Image 2025-08-07 at 1.17.07 PM.jpeg',
            'media/fotos/WhatsApp Image 2025-08-07 at 1.17.37 PM.jpeg',
            'media/fotos/WhatsApp Image 2025-08-07 at 1.17.38 PM.jpeg',
            'media/fotos/WhatsApp Image 2025-08-07 at 1.17.39 PM.jpeg',
            'media/fotos/WhatsApp Image 2025-08-07 at 1.18.21 PM-2.jpeg',
            'media/fotos/WhatsApp Image 2025-08-07 at 1.18.21 PM.jpeg',
            'media/fotos/WhatsApp Image 2025-08-07 at 1.18.27 PM.jpeg',
            'media/fotos/WhatsApp Image 2025-08-07 at 1.18.31 PM.jpeg',
            'media/fotos/WhatsApp Image 2025-08-07 at 1.18.36 PM-2.jpeg',
            'media/fotos/WhatsApp Image 2025-08-07 at 1.18.36 PM-3.jpeg',
            'media/fotos/WhatsApp Image 2025-08-07 at 1.18.36 PM-4.jpeg',
            'media/fotos/WhatsApp Image 2025-08-07 at 1.18.36 PM.jpeg',
            'media/fotos/WhatsApp Image 2025-08-07 at 1.18.37 PM-2.jpeg',
            'media/fotos/WhatsApp Image 2025-08-07 at 1.18.37 PM.jpeg',
            'media/fotos/WhatsApp Image 2025-08-07 at 1.18.38 PM-2.jpeg',
            'media/fotos/WhatsApp Image 2025-08-07 at 1.18.38 PM-3.jpeg',
            'media/fotos/WhatsApp Image 2025-08-07 at 1.18.38 PM-4.jpeg',
            'media/fotos/WhatsApp Image 2025-08-07 at 1.18.38 PM.jpeg',
            'media/fotos/WhatsApp Image 2025-08-07 at 1.18.39 PM-2.jpeg',
            'media/fotos/WhatsApp Image 2025-08-07 at 1.18.39 PM-3.jpeg',
            'media/fotos/WhatsApp Image 2025-08-07 at 1.18.39 PM-4.jpeg',
            'media/fotos/WhatsApp Image 2025-08-07 at 1.18.39 PM-5.jpeg',
            'media/fotos/WhatsApp Image 2025-08-07 at 1.18.39 PM.jpeg',
            'media/fotos/WhatsApp Image 2025-08-07 at 1.18.40 PM-2.jpeg',
            'media/fotos/WhatsApp Image 2025-08-07 at 1.18.40 PM.jpeg'
        ];
    }
    
    async loadTexture(imagePath) {
        return new Promise((resolve, reject) => {
            if (this.loadedTextures.has(imagePath)) {
                resolve(this.loadedTextures.get(imagePath));
                return;
            }
            
            this.textureLoader.load(
                imagePath,
                (texture) => {
                    // Configure texture properties
                    texture.wrapS = THREE.RepeatWrapping;
                    texture.wrapT = THREE.RepeatWrapping;
                    texture.magFilter = THREE.LinearFilter;
                    texture.minFilter = THREE.LinearMipmapLinearFilter;
                    texture.generateMipmaps = true;
                    
                    this.loadedTextures.set(imagePath, texture);
                    console.log('Loaded texture:', imagePath);
                    resolve(texture);
                },
                (progress) => {
                    // Loading progress
                },
                (error) => {
                    console.error('Error loading texture:', imagePath, error);
                    reject(error);
                }
            );
        });
    }
    
    getTexturesForObject(objectIndex) {
        // Assign 2 textures per object, cycling through available photos
        const totalPhotos = this.photoList.length;
        const texturesPerObject = 2;
        
        const startIndex = (objectIndex * texturesPerObject) % totalPhotos;
        const texture1Path = this.photoList[startIndex];
        const texture2Path = this.photoList[(startIndex + 1) % totalPhotos];
        
        return {
            texture1Path,
            texture2Path
        };
    }
    
    async loadTexturesForObject(objectIndex) {
        const { texture1Path, texture2Path } = this.getTexturesForObject(objectIndex);
        
        try {
            const [texture1, texture2] = await Promise.all([
                this.loadTexture(texture1Path),
                this.loadTexture(texture2Path)
            ]);
            
            return {
                texture1,
                texture2,
                texture1Path,
                texture2Path
            };
        } catch (error) {
            console.error('Failed to load textures for object', objectIndex, error);
            return null;
        }
    }
    
    createMixedMaterial(texture1, texture2, spectralFeatures) {
        // Create a material that mixes two textures based on spectral data
        const material = new THREE.MeshPhongMaterial({
            transparent: true,
            opacity: 0.9
        });
        
        // For now, we'll use texture1 as the primary texture
        // In a more advanced setup, we could use custom shaders to mix both textures
        material.map = texture1;
        
        // Adjust UV scaling based on spectral features
        const uvScale = 1 + spectralFeatures.energy * 0.5;
        texture1.repeat.set(uvScale, uvScale);
        
        if (texture2) {
            // Could be used for bump mapping or as an overlay
            material.bumpMap = texture2;
            material.bumpScale = spectralFeatures.spectralCentroid * 0.1;
        }
        
        return material;
    }
    
    createDynamicMaterial(textures, spectralFeatures) {
        // Create material with dynamic texture mixing capabilities
        const material = new THREE.MeshPhongMaterial({
            transparent: true,
            opacity: 0.8,
            shininess: 30 + spectralFeatures.energy * 50,
            specular: new THREE.Color(0.3, 0.3, 0.3)
        });
        
        // Use first texture as diffuse map
        if (textures.texture1) {
            material.map = textures.texture1;
            
            // Adjust texture properties based on spectral features
            const repeatScale = 0.5 + spectralFeatures.spectralRolloff * 1.5;
            textures.texture1.repeat.set(repeatScale, repeatScale);
        }
        
        // Use second texture for additional effects
        if (textures.texture2) {
            // Use as normal map or bump map for surface detail
            material.normalMap = textures.texture2;
            material.normalScale = new THREE.Vector2(
                spectralFeatures.spectralCentroid * 0.5,
                spectralFeatures.spectralCentroid * 0.5
            );
        }
        
        return material;
    }
    
    updateMaterialProperties(material, realtimeFeatures) {
        // Update material properties based on real-time audio features
        if (!material.map) return;
        
        // Animate texture offset based on audio
        const time = Date.now() * 0.001;
        const offsetX = Math.sin(time + realtimeFeatures.bassEnergy * 5) * 0.1;
        const offsetY = Math.cos(time + realtimeFeatures.trebleEnergy * 8) * 0.1;
        
        material.map.offset.set(offsetX, offsetY);
        
        // Update texture scale based on energy
        const scale = 1 + realtimeFeatures.energy * 0.3;
        material.map.repeat.set(scale, scale);
        
        // Update material opacity based on energy
        material.opacity = 0.7 + realtimeFeatures.energy * 0.2;
        
        // Update normal map intensity if available
        if (material.normalScale) {
            const normalIntensity = realtimeFeatures.midEnergy * 0.8;
            material.normalScale.set(normalIntensity, normalIntensity);
        }
    }
    
    dispose() {
        // Clean up loaded textures
        this.loadedTextures.forEach((texture) => {
            texture.dispose();
        });
        this.loadedTextures.clear();
    }
}