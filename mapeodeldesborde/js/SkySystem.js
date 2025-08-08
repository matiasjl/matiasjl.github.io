import * as THREE from 'three';

export class SkySystem {
    constructor(scene) {
        this.scene = scene;
        this.skyDome = null;
        this.clouds = [];
        this.sunPosition = new THREE.Vector3();
        
        // Time of day (0 = midnight, 0.5 = noon, 1 = midnight)
        this.timeOfDay = 0.75; // Start at sunset (6 PM)
        this.dayDuration = 300; // 5 minutes for full day cycle
        
        // Sky colors for different times
        this.skyColors = {
            dawn: { horizon: '#ff6b35', zenith: '#4a90e2' },
            day: { horizon: '#87ceeb', zenith: '#191970' },
            sunset: { horizon: '#ff4500', zenith: '#2e1065' },
            night: { horizon: '#000428', zenith: '#004e92' }
        };
        
        this.createSkyDome();
        this.createClouds();
    }
    
    createSkyDome() {
        const skyGeometry = new THREE.SphereGeometry(400, 32, 16);
        
        // Create dynamic sky material with shader
        const skyMaterial = new THREE.ShaderMaterial({
            uniforms: {
                time: { value: 0 },
                sunPosition: { value: this.sunPosition },
                horizonColor: { value: new THREE.Color(0xff4500) },
                zenithColor: { value: new THREE.Color(0x2e1065) }
            },
            vertexShader: `
                varying vec3 vWorldPosition;
                varying vec2 vUv;
                
                void main() {
                    vec4 worldPosition = modelMatrix * vec4(position, 1.0);
                    vWorldPosition = worldPosition.xyz;
                    vUv = uv;
                    
                    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
                }
            `,
            fragmentShader: `
                uniform float time;
                uniform vec3 sunPosition;
                uniform vec3 horizonColor;
                uniform vec3 zenithColor;
                
                varying vec3 vWorldPosition;
                varying vec2 vUv;
                
                void main() {
                    vec3 direction = normalize(vWorldPosition);
                    
                    // Height factor (0 at horizon, 1 at zenith)
                    float heightFactor = max(0.0, direction.y);
                    
                    // Distance from sun
                    float sunDistance = distance(direction, normalize(sunPosition));
                    
                    // Sun glow effect
                    float sunGlow = 1.0 - smoothstep(0.0, 0.8, sunDistance);
                    sunGlow = pow(sunGlow, 3.0);
                    
                    // Base sky gradient
                    vec3 skyColor = mix(horizonColor, zenithColor, pow(heightFactor, 0.8));
                    
                    // Add sun glow
                    vec3 sunColor = vec3(1.0, 0.9, 0.7);
                    skyColor = mix(skyColor, sunColor, sunGlow * 0.6);
                    
                    // Add atmospheric scattering effect
                    float atmosphere = 1.0 - pow(heightFactor, 2.0);
                    skyColor = mix(skyColor, horizonColor, atmosphere * 0.3);
                    
                    gl_FragColor = vec4(skyColor, 1.0);
                }
            `,
            side: THREE.BackSide,
            fog: false
        });
        
        this.skyDome = new THREE.Mesh(skyGeometry, skyMaterial);
        this.scene.add(this.skyDome);
    }
    
    createClouds() {
        const cloudGeometry = new THREE.PlaneGeometry(40, 25);
        
        // Create multiple cloud layers at different heights
        const cloudLayers = [
            { height: 80, count: 15, speed: 0.3, opacity: 0.8 },
            { height: 120, count: 12, speed: 0.2, opacity: 0.6 },
            { height: 160, count: 8, speed: 0.1, opacity: 0.4 }
        ];
        
        cloudLayers.forEach((layer, layerIndex) => {
            for (let i = 0; i < layer.count; i++) {
                const cloud = this.createSingleCloud(cloudGeometry, layer, layerIndex);
                this.clouds.push(cloud);
                this.scene.add(cloud.mesh);
            }
        });
    }
    
    createSingleCloud(geometry, layer, layerIndex) {
        // Create cloud texture
        const canvas = document.createElement('canvas');
        canvas.width = 256;
        canvas.height = 128;
        const ctx = canvas.getContext('2d');
        
        // Create fluffy cloud texture with noise
        this.drawCloudTexture(ctx, canvas.width, canvas.height);
        
        const texture = new THREE.CanvasTexture(canvas);
        texture.wrapS = THREE.RepeatWrapping;
        texture.wrapT = THREE.RepeatWrapping;
        
        const material = new THREE.MeshLambertMaterial({
            map: texture,
            transparent: true,
            opacity: layer.opacity,
            alphaTest: 0.1,
            side: THREE.DoubleSide
        });
        
        const mesh = new THREE.Mesh(geometry, material);
        
        // Random position around the sky
        const angle = Math.random() * Math.PI * 2;
        const distance = 200 + Math.random() * 100;
        
        mesh.position.set(
            Math.cos(angle) * distance,
            layer.height + (Math.random() - 0.5) * 20,
            Math.sin(angle) * distance
        );
        
        // Random rotation and scale
        mesh.rotation.y = Math.random() * Math.PI * 2;
        const scale = 0.8 + Math.random() * 0.8;
        mesh.scale.set(scale, scale, scale);
        
        // Look at camera (billboard effect)
        mesh.lookAt(0, layer.height, 0);
        
        return {
            mesh: mesh,
            layer: layer,
            layerIndex: layerIndex,
            initialPosition: mesh.position.clone(),
            driftSpeed: (Math.random() - 0.5) * layer.speed,
            bobSpeed: 0.1 + Math.random() * 0.05,
            bobAmplitude: 2 + Math.random() * 3
        };
    }
    
    drawCloudTexture(ctx, width, height) {
        // Create gradient background
        const gradient = ctx.createRadialGradient(
            width/2, height/2, 0,
            width/2, height/2, Math.max(width, height)/2
        );
        
        // Dynamic cloud color based on time of day
        const cloudColor = this.getCloudColor();
        gradient.addColorStop(0, `rgba(${cloudColor.r}, ${cloudColor.g}, ${cloudColor.b}, 0.9)`);
        gradient.addColorStop(0.6, `rgba(${cloudColor.r}, ${cloudColor.g}, ${cloudColor.b}, 0.5)`);
        gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
        
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, width, height);
        
        // Add noise for cloud texture
        const imageData = ctx.getImageData(0, 0, width, height);
        const data = imageData.data;
        
        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                const i = (y * width + x) * 4;
                
                // Generate Perlin-like noise
                const noise1 = this.noise(x * 0.02, y * 0.02) * 0.5;
                const noise2 = this.noise(x * 0.05, y * 0.05) * 0.3;
                const noise3 = this.noise(x * 0.1, y * 0.1) * 0.2;
                
                const totalNoise = (noise1 + noise2 + noise3 + 1) * 0.5; // Normalize to 0-1
                
                // Apply noise to alpha channel for fluffy edges
                data[i + 3] *= totalNoise;
            }
        }
        
        ctx.putImageData(imageData, 0, 0);
    }
    
    getCloudColor() {
        const colors = this.getCurrentSkyColors();
        
        // Mix horizon and zenith colors for cloud tinting
        const cloudBase = {
            r: Math.floor((colors.horizon.r + colors.zenith.r) / 2 + 50),
            g: Math.floor((colors.horizon.g + colors.zenith.g) / 2 + 50),
            b: Math.floor((colors.horizon.b + colors.zenith.b) / 2 + 50)
        };
        
        return {
            r: Math.min(255, cloudBase.r),
            g: Math.min(255, cloudBase.g),
            b: Math.min(255, cloudBase.b)
        };
    }
    
    noise(x, y) {
        // Simple noise function for cloud texture
        const n = Math.sin(x * 12.9898 + y * 78.233) * 43758.5453;
        return (n - Math.floor(n)) * 2 - 1;
    }
    
    getCurrentSkyColors() {
        // Interpolate between sky colors based on time of day
        let period, t;
        
        if (this.timeOfDay < 0.25) {
            // Night to Dawn
            period = 'dawn';
            t = this.timeOfDay * 4;
        } else if (this.timeOfDay < 0.5) {
            // Dawn to Day
            period = 'day';
            t = (this.timeOfDay - 0.25) * 4;
        } else if (this.timeOfDay < 0.75) {
            // Day to Sunset
            period = 'sunset';
            t = (this.timeOfDay - 0.5) * 4;
        } else {
            // Sunset to Night
            period = 'night';
            t = (this.timeOfDay - 0.75) * 4;
        }
        
        const colors = this.skyColors[period];
        
        return {
            horizon: this.hexToRgb(colors.horizon),
            zenith: this.hexToRgb(colors.zenith)
        };
    }
    
    hexToRgb(hex) {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16)
        } : null;
    }
    
    update(deltaTime) {
        // Update time of day
        this.timeOfDay += deltaTime / this.dayDuration;
        if (this.timeOfDay >= 1) this.timeOfDay -= 1;
        
        // Update sun position
        const sunAngle = this.timeOfDay * Math.PI * 2;
        this.sunPosition.set(
            Math.cos(sunAngle) * 300,
            Math.sin(sunAngle) * 200,
            0
        );
        
        // Update sky colors
        const colors = this.getCurrentSkyColors();
        if (this.skyDome && this.skyDome.material.uniforms) {
            this.skyDome.material.uniforms.time.value += deltaTime;
            this.skyDome.material.uniforms.sunPosition.value.copy(this.sunPosition);
            this.skyDome.material.uniforms.horizonColor.value.setRGB(
                colors.horizon.r / 255,
                colors.horizon.g / 255,
                colors.horizon.b / 255
            );
            this.skyDome.material.uniforms.zenithColor.value.setRGB(
                colors.zenith.r / 255,
                colors.zenith.g / 255,
                colors.zenith.b / 255
            );
        }
        
        // Update clouds
        this.updateClouds(deltaTime);
    }
    
    updateClouds(deltaTime) {
        const time = Date.now() * 0.001;
        
        this.clouds.forEach((cloud, index) => {
            // Horizontal drift
            const driftX = Math.cos(time * cloud.driftSpeed + index) * cloud.layer.speed;
            const driftZ = Math.sin(time * cloud.driftSpeed + index) * cloud.layer.speed;
            
            // Vertical bobbing
            const bobY = Math.sin(time * cloud.bobSpeed + index * 2) * cloud.bobAmplitude;
            
            cloud.mesh.position.x = cloud.initialPosition.x + driftX * 50;
            cloud.mesh.position.y = cloud.initialPosition.y + bobY;
            cloud.mesh.position.z = cloud.initialPosition.z + driftZ * 50;
            
            // Wrap around if clouds drift too far
            if (Math.abs(cloud.mesh.position.x) > 400 || Math.abs(cloud.mesh.position.z) > 400) {
                const angle = Math.random() * Math.PI * 2;
                const distance = 200 + Math.random() * 100;
                cloud.mesh.position.x = Math.cos(angle) * distance;
                cloud.mesh.position.z = Math.sin(angle) * distance;
                cloud.initialPosition.copy(cloud.mesh.position);
            }
            
            // Update cloud color based on time of day
            if (index % 10 === Math.floor(time) % 10) { // Update subset each frame
                this.updateCloudColor(cloud);
            }
        });
    }
    
    updateCloudColor(cloud) {
        // Recreate cloud texture with updated colors
        const canvas = document.createElement('canvas');
        canvas.width = 256;
        canvas.height = 128;
        const ctx = canvas.getContext('2d');
        
        this.drawCloudTexture(ctx, canvas.width, canvas.height);
        
        const texture = new THREE.CanvasTexture(canvas);
        texture.wrapS = THREE.RepeatWrapping;
        texture.wrapT = THREE.RepeatWrapping;
        
        // Update material
        if (cloud.mesh.material.map) {
            cloud.mesh.material.map.dispose();
        }
        cloud.mesh.material.map = texture;
        cloud.mesh.material.needsUpdate = true;
    }
    
    setTimeOfDay(time) {
        this.timeOfDay = Math.max(0, Math.min(1, time));
    }
    
    getDayDuration() {
        return this.dayDuration;
    }
    
    setDayDuration(duration) {
        this.dayDuration = Math.max(60, duration); // Minimum 1 minute
    }
    
    dispose() {
        if (this.skyDome) {
            this.scene.remove(this.skyDome);
            this.skyDome.geometry.dispose();
            this.skyDome.material.dispose();
        }
        
        this.clouds.forEach(cloud => {
            this.scene.remove(cloud.mesh);
            cloud.mesh.geometry.dispose();
            cloud.mesh.material.dispose();
            if (cloud.mesh.material.map) {
                cloud.mesh.material.map.dispose();
            }
        });
        
        this.clouds = [];
    }
}