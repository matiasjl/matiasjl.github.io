import * as THREE from 'three';
import { PointerLockControls } from 'three/addons/controls/PointerLockControls.js';
import { AudioManager } from './AudioManager.js';
import { GeometryGenerator } from './GeometryGenerator.js';
import { AudioObject } from './AudioObject.js';
import { TextureManager } from './TextureManager.js';
import { TerrainGenerator } from './TerrainGenerator.js';
import { PlantGrowthSystem } from './PlantGrowthSystem.js';
import { SkySystem } from './SkySystem.js';

class ThreeJSEnvironment {
    constructor() {
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.controls = null;
        this.audioManager = null;
        this.geometryGenerator = null;
        this.textureManager = null;
        this.terrainGenerator = null;
        this.plantGrowthSystem = null;
        this.skySystem = null;
        this.audioObjects = [];
        
        this.clock = new THREE.Clock();
        this.raycaster = new THREE.Raycaster();
        this.mouse = new THREE.Vector2();
        
        this.moveForward = false;
        this.moveBackward = false;
        this.moveLeft = false;
        this.moveRight = false;
        this.canJump = false;
        this.isRunning = false;
        
        this.velocity = new THREE.Vector3();
        this.direction = new THREE.Vector3();
        this.lastDelta = 0;
        
        this.init();
    }
    
    async init() {
        await this.setupScene();
        await this.setupControls();
        await this.loadAudioFiles();
        await this.createAudioObjects();
        this.setupEventListeners();
        this.hideLoading();
        this.animate();
    }
    
    async setupScene() {
        // Scene
        this.scene = new THREE.Scene();
        this.scene.fog = new THREE.Fog(0x000011, 50, 200);
        
        // Camera
        this.camera = new THREE.PerspectiveCamera(
            75, 
            window.innerWidth / window.innerHeight, 
            0.1, 
            1000
        );
        this.camera.position.y = 10;
        
        // Renderer
        this.renderer = new THREE.WebGLRenderer({ antialias: true });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setClearColor(0x000011);
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        
        document.getElementById('container').appendChild(this.renderer.domElement);
        
        // Lighting - Increased ambient lighting
        const ambientLight = new THREE.AmbientLight(0x606060, 0.6);
        this.scene.add(ambientLight);
        
        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
        directionalLight.position.set(50, 50, 50);
        directionalLight.castShadow = true;
        directionalLight.shadow.mapSize.width = 2048;
        directionalLight.shadow.mapSize.height = 2048;
        this.scene.add(directionalLight);
        
        // Add hemisphere light for more natural lighting
        const hemisphereLight = new THREE.HemisphereLight(0x87CEEB, 0x444444, 0.4);
        this.scene.add(hemisphereLight);
        
        // Initialize managers first
        this.audioManager = new AudioManager();
        this.geometryGenerator = new GeometryGenerator();
        this.textureManager = new TextureManager();
        this.terrainGenerator = new TerrainGenerator();
        this.plantGrowthSystem = new PlantGrowthSystem(this.scene);
        this.skySystem = new SkySystem(this.scene);
        
        // Generate realistic terrain
        this.createTerrain();
    }
    
    async setupControls() {
        this.controls = new PointerLockControls(this.camera, document.body);
        
        document.addEventListener('click', () => {
            if (this.controls.isLocked === false) {
                this.controls.lock();
            }
        });
        
        this.controls.addEventListener('lock', () => {
            document.getElementById('instructions').classList.remove('hidden');
            document.getElementById('info').classList.remove('hidden');
            // Start all audio when navigation begins
            this.startAllAudio();
            
            // Add test audio button listener
            document.getElementById('testAudio').addEventListener('click', () => {
                this.testSingleAudio();
            });
        });
        
        this.controls.addEventListener('unlock', () => {
            document.getElementById('instructions').classList.add('hidden');
            document.getElementById('info').classList.add('hidden');
        });
        
        this.scene.add(this.controls.getObject());
    }
    
    async loadAudioFiles() {
        const audioFiles = [];
        for (let i = 52; i <= 77; i++) {
            audioFiles.push(`media/zoom/ZOOM00${i}.WAV`);
        }
        
        await this.audioManager.loadAudioFiles(audioFiles);
    }
    
    async createAudioObjects() {
        const audioFiles = this.audioManager.getAudioFiles();
        const spawnRadius = 250; // Increased spawn radius
        const minDistance = 50; // Increased minimum distance between objects
        const positions = [];
        
        for (let i = 0; i < audioFiles.length; i++) {
            const audioData = audioFiles[i];
            
            let position;
            let attempts = 0;
            const maxAttempts = 50;
            
            // Find a valid position with minimum distance constraint
            do {
                const angle = Math.random() * Math.PI * 2;
                const distance = Math.random() * spawnRadius + 20;
                const x = Math.cos(angle) * distance;
                const z = Math.sin(angle) * distance;
                
                // Get terrain height at this position
                const terrainHeight = this.terrainGenerator.getHeightAt(x, z);
                const height = terrainHeight + Math.random() * 15 + 8; // Above terrain
                
                position = new THREE.Vector3(x, height, z);
                
                attempts++;
            } while (this.isTooClose(position, positions, minDistance) && attempts < maxAttempts);
            
            // If we couldn't find a good position after many attempts, use the last one anyway
            positions.push(position);
            
            // Create geometry based on audio analysis
            const geometry = await this.geometryGenerator.createFromAudio(audioData);
            
            // Create audio object
            const audioObject = new AudioObject(
                audioData,
                geometry,
                position,
                this.scene,
                this.audioManager,
                i, // object index for texture assignment
                this.textureManager
            );
            
            this.audioObjects.push(audioObject);
        }
        
        document.getElementById('objectCount').textContent = this.audioObjects.length;
    }
    
    isTooClose(newPosition, existingPositions, minDistance) {
        for (const existingPos of existingPositions) {
            const distance = newPosition.distanceTo(existingPos);
            if (distance < minDistance) {
                return true;
            }
        }
        return false;
    }
    
    setupEventListeners() {
        // Keyboard controls
        const onKeyDown = (event) => {
            switch (event.code) {
                case 'ArrowUp':
                case 'KeyW':
                    this.moveForward = true;
                    break;
                case 'ArrowLeft':
                case 'KeyA':
                    this.moveLeft = true;
                    break;
                case 'ArrowDown':
                case 'KeyS':
                    this.moveBackward = true;
                    break;
                case 'ArrowRight':
                case 'KeyD':
                    this.moveRight = true;
                    break;
                case 'Space':
                    if (this.canJump === true) this.velocity.y += 350;
                    this.canJump = false;
                    event.preventDefault();
                    break;
                case 'ShiftLeft':
                case 'ShiftRight':
                    this.isRunning = true;
                    break;
                case 'KeyQ':
                    this.toggleUI();
                    break;
            }
        };
        
        const onKeyUp = (event) => {
            switch (event.code) {
                case 'ArrowUp':
                case 'KeyW':
                    this.moveForward = false;
                    break;
                case 'ArrowLeft':
                case 'KeyA':
                    this.moveLeft = false;
                    break;
                case 'ArrowDown':
                case 'KeyS':
                    this.moveBackward = false;
                    break;
                case 'ArrowRight':
                case 'KeyD':
                    this.moveRight = false;
                    break;
                case 'ShiftLeft':
                case 'ShiftRight':
                    this.isRunning = false;
                    break;
            }
        };
        
        document.addEventListener('keydown', onKeyDown);
        document.addEventListener('keyup', onKeyUp);
        
        // Window resize
        window.addEventListener('resize', () => {
            this.camera.aspect = window.innerWidth / window.innerHeight;
            this.camera.updateProjectionMatrix();
            this.renderer.setSize(window.innerWidth, window.innerHeight);
        });
        
        // Mouse interaction
        window.addEventListener('click', (event) => {
            if (this.controls.isLocked) {
                this.handleMouseClick(event);
            }
        });
    }
    
    handleMouseClick(event) {
        this.mouse.x = 0; // Center screen for pointer lock
        this.mouse.y = 0;
        
        this.raycaster.setFromCamera(this.mouse, this.camera);
        
        const intersects = this.raycaster.intersectObjects(
            this.audioObjects.map(obj => obj.mesh)
        );
        
        if (intersects.length > 0) {
            const clickedMesh = intersects[0].object;
            const audioObject = this.audioObjects.find(obj => obj.mesh === clickedMesh);
            if (audioObject) {
                audioObject.playAudio();
            }
        }
    }
    
    update() {
        const delta = this.clock.getDelta();
        this.lastDelta = delta; // Store for FPS calculation
        
        if (this.controls.isLocked === true) {
            // Movement
            this.velocity.x -= this.velocity.x * 10.0 * delta;
            this.velocity.z -= this.velocity.z * 10.0 * delta;
            this.velocity.y -= 9.8 * 100.0 * delta; // gravity
            
            this.direction.z = Number(this.moveForward) - Number(this.moveBackward);
            this.direction.x = Number(this.moveRight) - Number(this.moveLeft);
            this.direction.normalize();
            
            const speed = this.isRunning ? 800.0 : 400.0;
            
            if (this.moveForward || this.moveBackward) {
                this.velocity.z -= this.direction.z * speed * delta;
            }
            if (this.moveLeft || this.moveRight) {
                this.velocity.x -= this.direction.x * speed * delta;
            }
            
            this.controls.moveRight(-this.velocity.x * delta);
            this.controls.moveForward(-this.velocity.z * delta);
            
            this.controls.getObject().position.y += (this.velocity.y * delta);
            
            if (this.controls.getObject().position.y < 2) {
                this.velocity.y = 0;
                this.controls.getObject().position.y = 2; // Just above flat ground
                this.canJump = true;
            }
        }
        
        // Update audio objects
        this.audioObjects.forEach(audioObject => {
            audioObject.update(delta, this.camera.position);
        });
        
        // Update plant growth
        if (this.plantGrowthSystem) {
            this.plantGrowthSystem.update(delta, this.camera.position);
        }
        
        // Update sky system
        if (this.skySystem) {
            this.skySystem.update(delta);
        }
        
        // Update UI
        const pos = this.camera.position;
        document.getElementById('position').textContent = 
            `${pos.x.toFixed(1)}, ${pos.y.toFixed(1)}, ${pos.z.toFixed(1)}`;
    }
    
    animate() {
        requestAnimationFrame(() => this.animate());
        
        this.update();
        this.renderer.render(this.scene, this.camera);
        
        // Update FPS counter using stored delta
        const fps = this.lastDelta > 0 ? Math.round(1 / this.lastDelta) : 0;
        document.getElementById('fps').textContent = fps;
    }
    
    createTerrain() {
        // Generate terrain with heightmap
        const terrain = this.terrainGenerator.generateTerrain(this.scene);
        
        // Distribute plants across the terrain
        setTimeout(() => {
            this.plantGrowthSystem.distributePlantsOnTerrain(this.terrainGenerator, 60);
        }, 100); // Small delay to ensure terrain is ready
    }
    
    
    simpleNoise(x, y) {
        // Simple 2D noise function
        const n = Math.sin(x * 12.9898 + y * 78.233) * 43758.5453;
        return (n - Math.floor(n)) * 2 - 1; // Return value between -1 and 1
    }
    
    testSingleAudio() {
        console.log('Testing single audio...');
        if (this.audioObjects.length > 0) {
            const firstAudio = this.audioObjects[0];
            firstAudio.playAudio();
        }
    }
    
    startAllAudio() {
        // Resume audio context first (required for autoplay policies)
        this.audioManager.resumeContext();
        
        // Start all audio objects with a small delay between each
        this.audioObjects.forEach((audioObject, index) => {
            setTimeout(() => {
                audioObject.playAudio();
            }, index * 100); // Stagger start times by 100ms
        });
        
        console.log(`Started ${this.audioObjects.length} audio sources`);
    }
    
    toggleUI() {
        const info = document.getElementById('info');
        const instructions = document.getElementById('instructions');
        
        if (info.classList.contains('hidden')) {
            // Show UI
            info.classList.remove('hidden');
            instructions.classList.remove('hidden');
        } else {
            // Hide UI
            info.classList.add('hidden');
            instructions.classList.add('hidden');
        }
    }
    
    hideLoading() {
        document.getElementById('loading').classList.add('hidden');
    }
}

// Initialize the environment
new ThreeJSEnvironment();