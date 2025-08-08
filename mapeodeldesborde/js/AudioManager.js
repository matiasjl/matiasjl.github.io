export class AudioManager {
    constructor() {
        this.audioContext = null;
        this.audioFiles = [];
        this.audioBuffers = new Map();
        this.analyser = null;
        this.initAudioContext();
    }
    
    initAudioContext() {
        try {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            this.analyser = this.audioContext.createAnalyser();
            this.analyser.fftSize = 2048;
            this.analyser.smoothingTimeConstant = 0.8;
        } catch (e) {
            console.error('Web Audio API not supported:', e);
        }
    }
    
    async loadAudioFiles(filePaths) {
        console.log('Loading audio files:', filePaths.length, 'files');
        const loadPromises = filePaths.map(async (path) => {
            try {
                console.log('Loading:', path);
                const response = await fetch(path);
                if (!response.ok) {
                    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
                }
                const arrayBuffer = await response.arrayBuffer();
                console.log('Loaded buffer for', path, 'size:', arrayBuffer.byteLength);
                const audioBuffer = await this.audioContext.decodeAudioData(arrayBuffer);
                console.log('Decoded audio for', path, 'duration:', audioBuffer.duration);
                
                // Analyze the audio buffer for spectral data
                const spectralData = await this.analyzeAudioBuffer(audioBuffer);
                
                const audioData = {
                    path: path,
                    buffer: audioBuffer,
                    spectralData: spectralData,
                    duration: audioBuffer.duration,
                    sampleRate: audioBuffer.sampleRate
                };
                
                this.audioFiles.push(audioData);
                this.audioBuffers.set(path, audioData);
                
                return audioData;
            } catch (error) {
                console.error(`Error loading audio file ${path}:`, error);
                return null;
            }
        });
        
        await Promise.all(loadPromises);
        return this.audioFiles.filter(file => file !== null);
    }
    
    async analyzeAudioBuffer(audioBuffer) {
        const channelData = audioBuffer.getChannelData(0);
        const sampleRate = audioBuffer.sampleRate;
        const duration = audioBuffer.duration;
        
        // Analyze in chunks for more detailed spectral data
        const chunkSize = 4096;
        const chunks = Math.floor(channelData.length / chunkSize);
        const spectralChunks = [];
        
        for (let i = 0; i < chunks; i++) {
            const start = i * chunkSize;
            const end = Math.min(start + chunkSize, channelData.length);
            const chunk = channelData.slice(start, end);
            
            const fftData = this.performFFT(chunk);
            const spectralFeatures = this.extractSpectralFeatures(fftData);
            
            spectralChunks.push({
                time: (start / sampleRate),
                frequencies: fftData,
                features: spectralFeatures
            });
        }
        
        // Calculate overall audio characteristics
        const overallFeatures = this.calculateOverallFeatures(spectralChunks);
        
        return {
            chunks: spectralChunks,
            overall: overallFeatures,
            duration: duration,
            sampleRate: sampleRate
        };
    }
    
    performFFT(audioData) {
        // Simple FFT implementation for spectral analysis
        const fftSize = Math.min(audioData.length, 1024);
        const fft = new Array(fftSize).fill(0);
        
        // Apply window function (Hamming window)
        for (let i = 0; i < fftSize; i++) {
            const windowValue = 0.54 - 0.46 * Math.cos(2 * Math.PI * i / (fftSize - 1));
            fft[i] = audioData[i] * windowValue;
        }
        
        // Compute magnitude spectrum (simplified)
        const spectrum = [];
        for (let k = 0; k < fftSize / 2; k++) {
            let real = 0;
            let imag = 0;
            
            for (let n = 0; n < fftSize; n++) {
                const angle = -2 * Math.PI * k * n / fftSize;
                real += fft[n] * Math.cos(angle);
                imag += fft[n] * Math.sin(angle);
            }
            
            const magnitude = Math.sqrt(real * real + imag * imag);
            spectrum.push(magnitude);
        }
        
        return spectrum;
    }
    
    extractSpectralFeatures(spectrum) {
        const features = {
            spectralCentroid: 0,
            spectralRolloff: 0,
            spectralFlux: 0,
            mfcc: [],
            energy: 0,
            zeroCrossings: 0
        };
        
        // Spectral Centroid (brightness)
        let weightedSum = 0;
        let magnitudeSum = 0;
        
        for (let i = 0; i < spectrum.length; i++) {
            weightedSum += i * spectrum[i];
            magnitudeSum += spectrum[i];
        }
        
        features.spectralCentroid = magnitudeSum > 0 ? weightedSum / magnitudeSum : 0;
        
        // Spectral Rolloff (85% of energy)
        const targetEnergy = magnitudeSum * 0.85;
        let currentEnergy = 0;
        
        for (let i = 0; i < spectrum.length; i++) {
            currentEnergy += spectrum[i];
            if (currentEnergy >= targetEnergy) {
                features.spectralRolloff = i / spectrum.length;
                break;
            }
        }
        
        // Total energy
        features.energy = magnitudeSum;
        
        // Simplified MFCC-like features (frequency bands)
        const numBands = 13;
        const bandSize = Math.floor(spectrum.length / numBands);
        
        for (let band = 0; band < numBands; band++) {
            let bandEnergy = 0;
            const start = band * bandSize;
            const end = Math.min(start + bandSize, spectrum.length);
            
            for (let i = start; i < end; i++) {
                bandEnergy += spectrum[i];
            }
            
            features.mfcc.push(bandEnergy / bandSize);
        }
        
        return features;
    }
    
    calculateOverallFeatures(spectralChunks) {
        if (spectralChunks.length === 0) return {};
        
        const avgFeatures = {
            spectralCentroid: 0,
            spectralRolloff: 0,
            energy: 0,
            mfcc: new Array(13).fill(0),
            variance: {
                spectralCentroid: 0,
                energy: 0
            }
        };
        
        // Calculate averages
        spectralChunks.forEach(chunk => {
            avgFeatures.spectralCentroid += chunk.features.spectralCentroid;
            avgFeatures.spectralRolloff += chunk.features.spectralRolloff;
            avgFeatures.energy += chunk.features.energy;
            
            chunk.features.mfcc.forEach((mfcc, i) => {
                avgFeatures.mfcc[i] += mfcc;
            });
        });
        
        const numChunks = spectralChunks.length;
        avgFeatures.spectralCentroid /= numChunks;
        avgFeatures.spectralRolloff /= numChunks;
        avgFeatures.energy /= numChunks;
        avgFeatures.mfcc = avgFeatures.mfcc.map(mfcc => mfcc / numChunks);
        
        // Calculate variance for dynamic features
        spectralChunks.forEach(chunk => {
            const centroidDiff = chunk.features.spectralCentroid - avgFeatures.spectralCentroid;
            const energyDiff = chunk.features.energy - avgFeatures.energy;
            
            avgFeatures.variance.spectralCentroid += centroidDiff * centroidDiff;
            avgFeatures.variance.energy += energyDiff * energyDiff;
        });
        
        avgFeatures.variance.spectralCentroid /= numChunks;
        avgFeatures.variance.energy /= numChunks;
        
        return avgFeatures;
    }
    
    createAudioSource(audioData) {
        if (!this.audioContext || !audioData.buffer) {
            console.error('Audio context or buffer not available');
            return null;
        }
        
        const source = this.audioContext.createBufferSource();
        source.buffer = audioData.buffer;
        
        return source;
    }
    
    create3DAudioSource(audioData, position) {
        const source = this.createAudioSource(audioData);
        if (!source) return null;
        
        const panner = this.audioContext.createPanner();
        panner.panningModel = 'HRTF';
        panner.distanceModel = 'exponential';
        panner.refDistance = 1;
        panner.maxDistance = 100;
        panner.rolloffFactor = 2;
        panner.coneInnerAngle = 360;
        panner.coneOuterAngle = 0;
        panner.coneOuterGain = 0;
        
        // Set 3D position
        panner.positionX.setValueAtTime(position.x, this.audioContext.currentTime);
        panner.positionY.setValueAtTime(position.y, this.audioContext.currentTime);
        panner.positionZ.setValueAtTime(position.z, this.audioContext.currentTime);
        
        // Connect: source -> panner -> destination
        source.connect(panner);
        panner.connect(this.audioContext.destination);
        
        return { source, panner };
    }
    
    updateListenerPosition(position, forward, up) {
        if (!this.audioContext.listener) return;
        
        this.audioContext.listener.positionX.setValueAtTime(position.x, this.audioContext.currentTime);
        this.audioContext.listener.positionY.setValueAtTime(position.y, this.audioContext.currentTime);
        this.audioContext.listener.positionZ.setValueAtTime(position.z, this.audioContext.currentTime);
        
        this.audioContext.listener.forwardX.setValueAtTime(forward.x, this.audioContext.currentTime);
        this.audioContext.listener.forwardY.setValueAtTime(forward.y, this.audioContext.currentTime);
        this.audioContext.listener.forwardZ.setValueAtTime(forward.z, this.audioContext.currentTime);
        
        this.audioContext.listener.upX.setValueAtTime(up.x, this.audioContext.currentTime);
        this.audioContext.listener.upY.setValueAtTime(up.y, this.audioContext.currentTime);
        this.audioContext.listener.upZ.setValueAtTime(up.z, this.audioContext.currentTime);
    }
    
    getAudioFiles() {
        return this.audioFiles;
    }
    
    resumeContext() {
        if (this.audioContext && this.audioContext.state === 'suspended') {
            console.log('Resuming audio context...');
            this.audioContext.resume().then(() => {
                console.log('Audio context resumed, state:', this.audioContext.state);
            }).catch(error => {
                console.error('Failed to resume audio context:', error);
            });
        } else if (this.audioContext) {
            console.log('Audio context state:', this.audioContext.state);
        }
    }
}