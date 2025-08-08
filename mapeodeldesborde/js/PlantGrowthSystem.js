import * as THREE from 'three';

export class PlantGrowthSystem {
    constructor(scene) {
        this.scene = scene;
        this.plants = [];
        this.baseGrowthSpeed = 3.0; // Increased base speed
        this.playerPosition = new THREE.Vector3();
    }
    
    createPlant(position, plantType = 'tree') {
        // Some plants start pre-grown
        const isPreGrown = Math.random() < 0.3; // 30% chance of pre-grown
        const initialAge = isPreGrown ? Math.random() * 80 + 60 : 0; // 60-140% of max age
        
        const plant = {
            position: new THREE.Vector3(position.x, position.y, position.z),
            type: plantType,
            age: initialAge,
            maxAge: 50 + Math.random() * 30, // Reduced for faster growth
            branches: [],
            leaves: [],
            mesh: new THREE.Group(),
            growthData: this.generateGrowthData(plantType),
            isPreGrown: isPreGrown
        };
        
        this.scene.add(plant.mesh);
        plant.mesh.position.copy(plant.position);
        
        this.plants.push(plant);
        
        // If pre-grown, immediately set to mature state
        if (isPreGrown) {
            this.updatePlantGeometry(plant, 1.0);
        }
        
        return plant;
    }
    
    generateGrowthData(plantType) {
        const data = {
            trunkSegments: [],
            branchPoints: [],
            leafClusters: []
        };
        
        switch (plantType) {
            case 'tree':
                data.maxHeight = (8 + Math.random() * 6) * 10; // 10x larger trees
                data.trunkRadius = (0.1 + Math.random() * 0.05) * 10;
                data.branchingFactor = 3 + Math.floor(Math.random() * 3);
                data.leafDensity = 0.7 + Math.random() * 0.3;
                break;
                
            case 'bush':
                data.maxHeight = 2 + Math.random() * 2;
                data.trunkRadius = 0.05 + Math.random() * 0.03;
                data.branchingFactor = 5 + Math.floor(Math.random() * 4);
                data.leafDensity = 0.8 + Math.random() * 0.2;
                break;
                
            case 'grass':
                data.maxHeight = 0.5 + Math.random() * 0.3;
                data.trunkRadius = 0.01;
                data.branchingFactor = 1;
                data.leafDensity = 1.0;
                break;
        }
        
        // Generate branching pattern using L-system-like rules
        this.generateBranchingPattern(data, plantType);
        
        return data;
    }
    
    generateBranchingPattern(data, plantType) {
        // Simple L-system for plant structure
        const segmentInterval = plantType === 'tree' ? 5.0 : 0.5; // Larger segments for trees
        const segments = Math.floor(data.maxHeight / segmentInterval);
        
        for (let i = 0; i < segments; i++) {
            const height = (i / segments) * data.maxHeight;
            const segmentData = {
                height: height,
                radius: data.trunkRadius * (1 - i / segments * 0.7), // Taper
                branches: []
            };
            
            // Add branches based on height and branching factor
            if (i > segments * 0.3) { // Start branching after 30% of height
                const numBranches = Math.floor(Math.random() * data.branchingFactor);
                
                for (let b = 0; b < numBranches; b++) {
                    const angle = (b / numBranches) * Math.PI * 2 + Math.random() * 0.5;
                    const length = (Math.random() * 0.5 + 0.3) * (data.maxHeight / 4);
                    const upwardAngle = Math.random() * Math.PI / 3 - Math.PI / 6; // -30 to +30 degrees
                    
                    segmentData.branches.push({
                        angle: angle,
                        length: length,
                        upwardAngle: upwardAngle,
                        leaves: Math.floor(length * data.leafDensity * 5)
                    });
                }
            }
            
            data.trunkSegments.push(segmentData);
        }
    }
    
    growPlant(plant, deltaTime) {
        if (plant.age >= plant.maxAge) return; // Fully grown
        
        // Calculate distance-based growth speed
        const distance = plant.position.distanceTo(this.playerPosition);
        const maxDistance = 100; // Maximum effective distance
        const proximityFactor = Math.max(0.1, Math.min(1, (maxDistance - distance) / maxDistance));
        const distanceMultiplier = 0.5 + (proximityFactor * 2.5); // 0.5x to 3x speed
        
        const oldAge = plant.age;
        plant.age += deltaTime * this.baseGrowthSpeed * distanceMultiplier;
        
        const growthProgress = Math.min(plant.age / plant.maxAge, 1.0);
        const oldProgress = Math.min(oldAge / plant.maxAge, 1.0);
        
        // Smooth growth curve (S-curve)
        const smoothProgress = this.smoothStep(0, 1, growthProgress);
        const oldSmoothProgress = this.smoothStep(0, 1, oldProgress);
        
        // Only update if there's significant growth
        if (smoothProgress - oldSmoothProgress > 0.005) { // More frequent updates
            this.updatePlantGeometry(plant, smoothProgress);
        }
    }
    
    smoothStep(min, max, value) {
        const t = Math.max(0, Math.min(1, (value - min) / (max - min)));
        return t * t * (3 - 2 * t);
    }
    
    updatePlantGeometry(plant, progress) {
        // Clear existing geometry
        while (plant.mesh.children.length > 0) {
            const child = plant.mesh.children[0];
            plant.mesh.remove(child);
            if (child.geometry) child.geometry.dispose();
            if (child.material) child.material.dispose();
        }
        
        const data = plant.growthData;
        const currentHeight = data.maxHeight * progress;
        
        // Create trunk segments up to current height
        for (let i = 0; i < data.trunkSegments.length; i++) {
            const segment = data.trunkSegments[i];
            
            if (segment.height > currentHeight) break;
            
            // Create trunk segment
            this.createTrunkSegment(plant, segment, progress);
            
            // Create branches for this segment
            for (const branchData of segment.branches) {
                const branchProgress = Math.max(0, (progress - 0.5) * 2); // Branches grow in second half
                if (branchProgress > 0) {
                    this.createBranch(plant, segment, branchData, branchProgress);
                }
            }
        }
        
        // Add leaves in final growth phase
        const leafProgress = Math.max(0, (progress - 0.7) / 0.3); // Leaves in final 30%
        if (leafProgress > 0) {
            this.addLeaves(plant, leafProgress);
        }
    }
    
    createTrunkSegment(plant, segment, progress) {
        const height = plant.type === 'tree' ? 5.0 : 0.5; // Larger segments for trees
        const radiusTop = segment.radius;
        const radiusBottom = segment.radius * 1.2;
        
        const geometry = new THREE.CylinderGeometry(radiusTop, radiusBottom, height, 8);
        const material = new THREE.MeshLambertMaterial({
            color: new THREE.Color().setHSL(0.08, 0.6, 0.2 + Math.random() * 0.1) // Brown variations
        });
        
        const mesh = new THREE.Mesh(geometry, material);
        mesh.position.y = segment.height;
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        
        plant.mesh.add(mesh);
    }
    
    createBranch(plant, segment, branchData, progress) {
        const length = branchData.length * progress;
        if (length < 0.1) return;
        
        const geometry = new THREE.CylinderGeometry(
            segment.radius * 0.3, 
            segment.radius * 0.5, 
            length, 
            6
        );
        
        const material = new THREE.MeshLambertMaterial({
            color: new THREE.Color().setHSL(0.08, 0.5, 0.25)
        });
        
        const mesh = new THREE.Mesh(geometry, material);
        
        // Position and rotate branch
        const branchX = Math.cos(branchData.angle) * (segment.radius + length / 2);
        const branchZ = Math.sin(branchData.angle) * (segment.radius + length / 2);
        const branchY = segment.height + Math.sin(branchData.upwardAngle) * length / 2;
        
        mesh.position.set(branchX, branchY, branchZ);
        mesh.rotation.z = branchData.upwardAngle;
        mesh.rotation.y = branchData.angle;
        
        mesh.castShadow = true;
        plant.mesh.add(mesh);
    }
    
    addLeaves(plant, progress) {
        const data = plant.growthData;
        const numLeafClusters = Math.floor(data.trunkSegments.length * data.leafDensity * progress);
        
        for (let i = 0; i < numLeafClusters; i++) {
            const cluster = this.createLeafCluster(plant.type);
            
            // Random position on the plant
            const angle = Math.random() * Math.PI * 2;
            const height = Math.random() * data.maxHeight * progress;
            const distance = Math.random() * 2;
            
            cluster.position.set(
                Math.cos(angle) * distance,
                height,
                Math.sin(angle) * distance
            );
            
            plant.mesh.add(cluster);
        }
    }
    
    createLeafCluster(plantType) {
        const group = new THREE.Group();
        const numLeaves = plantType === 'tree' ? 8 : plantType === 'bush' ? 12 : 3;
        
        for (let i = 0; i < numLeaves; i++) {
            const leaf = this.createSingleLeaf(plantType);
            
            // Random position within cluster
            const angle = (i / numLeaves) * Math.PI * 2 + Math.random() * 0.5;
            const distance = Math.random() * 0.3;
            
            leaf.position.set(
                Math.cos(angle) * distance,
                Math.random() * 0.2,
                Math.sin(angle) * distance
            );
            
            leaf.rotation.set(
                Math.random() * 0.5,
                Math.random() * Math.PI * 2,
                Math.random() * 0.5
            );
            
            group.add(leaf);
        }
        
        return group;
    }
    
    createSingleLeaf(plantType) {
        let geometry, color;
        
        switch (plantType) {
            case 'tree':
                geometry = new THREE.PlaneGeometry(3.0, 2.0); // 10x larger leaves for trees
                color = new THREE.Color().setHSL(0.25 + Math.random() * 0.1, 0.7, 0.4);
                break;
                
            case 'bush':
                geometry = new THREE.PlaneGeometry(0.2, 0.15);
                color = new THREE.Color().setHSL(0.25 + Math.random() * 0.05, 0.8, 0.35);
                break;
                
            case 'grass':
                geometry = new THREE.PlaneGeometry(0.05, 0.3);
                color = new THREE.Color().setHSL(0.25, 0.9, 0.3);
                break;
                
            default:
                geometry = new THREE.PlaneGeometry(0.2, 0.15);
                color = new THREE.Color(0x4a7c59);
        }
        
        const material = new THREE.MeshLambertMaterial({
            color: color,
            transparent: true,
            opacity: 0.8,
            side: THREE.DoubleSide
        });
        
        return new THREE.Mesh(geometry, material);
    }
    
    distributePlantsOnTerrain(terrainGenerator, numPlants = 80) {
        const positions = terrainGenerator.findValidPlantPositions(numPlants);
        
        positions.forEach((pos, index) => {
            // Vary plant types based on terrain features
            let plantType;
            if (pos.y > terrainGenerator.maxHeight * 0.6) {
                plantType = 'grass'; // High areas
            } else if (pos.slope < 0.2) {
                plantType = Math.random() < 0.6 ? 'tree' : 'bush'; // Flat areas
            } else {
                plantType = 'bush'; // Sloped areas
            }
            
            // Add some randomness
            if (Math.random() < 0.1) {
                const types = ['tree', 'bush', 'grass'];
                plantType = types[Math.floor(Math.random() * types.length)];
            }
            
            this.createPlant(pos, plantType);
        });
        
        console.log(`Created ${this.plants.length} plants on terrain`);
    }
    
    update(deltaTime, playerPosition) {
        if (playerPosition) {
            this.playerPosition.copy(playerPosition);
        }
        
        this.plants.forEach(plant => {
            this.growPlant(plant, deltaTime);
        });
    }
    
    setGrowthSpeed(speed) {
        this.growthSpeed = speed;
    }
    
    dispose() {
        this.plants.forEach(plant => {
            this.scene.remove(plant.mesh);
            // Dispose of geometries and materials
            plant.mesh.traverse((child) => {
                if (child.geometry) child.geometry.dispose();
                if (child.material) child.material.dispose();
            });
        });
        this.plants = [];
    }
}