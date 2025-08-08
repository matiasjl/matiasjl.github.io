import * as THREE from 'three';

export class TerrainGenerator {
    constructor() {
        this.terrainSize = 500;
        this.terrainResolution = 128; // Higher resolution for smoother terrain
        this.maxHeight = 15; // Back to original height
        this.heightMap = [];
        this.terrainMesh = null;
    }
    
    generateHeightMap() {
        const size = this.terrainResolution;
        this.heightMap = new Array(size * size);
        
        // Generate multi-octave noise
        for (let y = 0; y < size; y++) {
            for (let x = 0; x < size; x++) {
                const index = y * size + x;
                
                // Normalize coordinates to 0-1 range
                const nx = x / (size - 1);
                const ny = y / (size - 1);
                
                // Flat terrain - no height variation
                let height = 0; // Always flat
                
                // Store flat height for all positions
                this.heightMap[index] = 0; // Completely flat
            }
        }
    }
    
    perlinNoise(x, y) {
        // Improved Perlin noise implementation
        const xi = Math.floor(x) & 255;
        const yi = Math.floor(y) & 255;
        
        const xf = x - Math.floor(x);
        const yf = y - Math.floor(y);
        
        const u = this.fade(xf);
        const v = this.fade(yf);
        
        // Hash function for gradients
        const aa = this.hash(xi, yi);
        const ab = this.hash(xi, yi + 1);
        const ba = this.hash(xi + 1, yi);
        const bb = this.hash(xi + 1, yi + 1);
        
        // Calculate dot products with gradients
        const gradAA = this.gradient(aa, xf, yf);
        const gradAB = this.gradient(ab, xf, yf - 1);
        const gradBA = this.gradient(ba, xf - 1, yf);
        const gradBB = this.gradient(bb, xf - 1, yf - 1);
        
        // Bilinear interpolation
        const x1 = this.lerp(gradAA, gradBA, u);
        const x2 = this.lerp(gradAB, gradBB, u);
        
        return this.lerp(x1, x2, v);
    }
    
    hash(x, y) {
        let hash = x * 374761393 + y * 668265263;
        hash = (hash ^ (hash >> 13)) * 1274126177;
        return Math.abs(hash) % 8; // Return 0-7 for gradient selection
    }
    
    gradient(hash, x, y) {
        // 8 gradient directions
        switch (hash & 7) {
            case 0: return x + y;
            case 1: return -x + y;
            case 2: return x - y;
            case 3: return -x - y;
            case 4: return x;
            case 5: return -x;
            case 6: return y;
            case 7: return -y;
            default: return 0;
        }
    }
    
    fade(t) {
        return t * t * t * (t * (t * 6 - 15) + 10);
    }
    
    lerp(a, b, t) {
        return a + t * (b - a);
    }
    
    createTerrainGeometry() {
        const geometry = new THREE.PlaneGeometry(
            this.terrainSize, 
            this.terrainSize, 
            this.terrainResolution - 1, 
            this.terrainResolution - 1
        );
        
        // Apply height data to vertices
        const vertices = geometry.attributes.position.array;
        
        for (let i = 0; i < vertices.length; i += 3) {
            const x = i / 3;
            const height = this.heightMap[x] || 0;
            vertices[i + 2] = height; // Z coordinate for height
        }
        
        geometry.attributes.position.needsUpdate = true;
        geometry.computeVertexNormals();
        
        return geometry;
    }
    
    createTerrainMaterial() {
        // Create a material that varies with height and slope
        const canvas = document.createElement('canvas');
        canvas.width = 512;
        canvas.height = 512;
        const ctx = canvas.getContext('2d');
        
        // Create gradient from dark brown (low) to lighter brown/green (high)
        const gradient = ctx.createLinearGradient(0, 0, 0, 512);
        gradient.addColorStop(0, '#2d1810');    // Dark brown (valleys)
        gradient.addColorStop(0.3, '#4a2c17');  // Medium brown
        gradient.addColorStop(0.6, '#6b4423');  // Lighter brown
        gradient.addColorStop(0.8, '#8b6914');  // Yellowish brown
        gradient.addColorStop(1, '#4a5d23');    // Dark green (peaks)
        
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, 512, 512);
        
        // Add some texture noise
        const imageData = ctx.getImageData(0, 0, 512, 512);
        const data = imageData.data;
        
        for (let i = 0; i < data.length; i += 4) {
            const noise = (Math.random() - 0.5) * 20;
            data[i] = Math.max(0, Math.min(255, data[i] + noise));     // R
            data[i + 1] = Math.max(0, Math.min(255, data[i + 1] + noise)); // G
            data[i + 2] = Math.max(0, Math.min(255, data[i + 2] + noise)); // B
        }
        
        ctx.putImageData(imageData, 0, 0);
        
        const texture = new THREE.CanvasTexture(canvas);
        texture.wrapS = THREE.RepeatWrapping;
        texture.wrapT = THREE.RepeatWrapping;
        texture.repeat.set(8, 8);
        
        const material = new THREE.MeshLambertMaterial({
            map: texture,
            transparent: false
        });
        
        return material;
    }
    
    generateTerrain(scene) {
        // Generate height map
        this.generateHeightMap();
        
        // Create geometry and material
        const geometry = this.createTerrainGeometry();
        const material = this.createTerrainMaterial();
        
        // Create mesh
        this.terrainMesh = new THREE.Mesh(geometry, material);
        this.terrainMesh.rotation.x = -Math.PI / 2; // Rotate to be horizontal
        this.terrainMesh.receiveShadow = true;
        
        scene.add(this.terrainMesh);
        
        return this.terrainMesh;
    }
    
    getHeightAt(x, z) {
        // Convert world coordinates to heightmap coordinates
        const hx = Math.floor(((x + this.terrainSize / 2) / this.terrainSize) * (this.terrainResolution - 1));
        const hz = Math.floor(((z + this.terrainSize / 2) / this.terrainSize) * (this.terrainResolution - 1));
        
        // Clamp to bounds
        const clampedX = Math.max(0, Math.min(this.terrainResolution - 1, hx));
        const clampedZ = Math.max(0, Math.min(this.terrainResolution - 1, hz));
        
        const index = clampedZ * this.terrainResolution + clampedX;
        return this.heightMap[index] || 0;
    }
    
    getSlopeAt(x, z) {
        // Calculate slope by sampling nearby heights
        const h1 = this.getHeightAt(x - 1, z);
        const h2 = this.getHeightAt(x + 1, z);
        const h3 = this.getHeightAt(x, z - 1);
        const h4 = this.getHeightAt(x, z + 1);
        
        const dx = (h2 - h1) / 2;
        const dz = (h4 - h3) / 2;
        
        return Math.sqrt(dx * dx + dz * dz);
    }
    
    findValidPlantPositions(numPositions = 50) {
        const positions = [];
        const maxAttempts = 200;
        
        for (let i = 0; i < numPositions; i++) {
            let attempts = 0;
            let position;
            
            do {
                // Random position within terrain bounds
                const x = (Math.random() - 0.5) * this.terrainSize * 0.8;
                const z = (Math.random() - 0.5) * this.terrainSize * 0.8;
                const y = this.getHeightAt(x, z);
                const slope = this.getSlopeAt(x, z);
                
                position = { x, y, z, slope };
                attempts++;
                
                // Plants prefer moderate slopes and not too high elevations
            } while (
                (position.slope > 0.5 || position.y > this.maxHeight * 0.8) &&
                attempts < maxAttempts
            );
            
            if (attempts < maxAttempts) {
                positions.push(position);
            }
        }
        
        return positions;
    }
}