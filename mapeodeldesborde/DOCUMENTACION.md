# Mapeo del Desborde - Entorno 3D Interactivo

## 📋 Descripción del Proyecto

**Mapeo del Desborde** es un entorno 3D navegable en primera persona que combina arte sonoro, crecimiento vegetal procedural y visualizaciones espectrales en tiempo real. El proyecto genera objetos 3D reactivos basados en el análisis espectral de archivos de audio, creando una experiencia inmersiva donde el sonido, la forma y el color evolucionan dinámicamente.

---

## 🏗️ Estructura del Proyecto

```
mapeodeldesborde/
├── index.html                 # Página principal
├── DOCUMENTACION.md           # Este archivo
├── js/                        # Código JavaScript modular
│   ├── main.js               # Controlador principal y lógica de navegación
│   ├── AudioManager.js       # Gestión y análisis de archivos de audio
│   ├── GeometryGenerator.js  # Generación de geometría procedural
│   ├── AudioObject.js        # Objetos 3D reactivos al audio
│   ├── TextureManager.js     # Carga y aplicación de texturas fotográficas
│   ├── TerrainGenerator.js   # Generación de terreno procedural
│   ├── PlantGrowthSystem.js  # Sistema de crecimiento vegetal L-System
│   └── SkySystem.js          # Cielo dinámico con ciclo día/noche
└── media/                     # Recursos multimedia
    ├── zoom/                 # 26 archivos de audio WAV (ZOOM0052-ZOOM0077)
    ├── fotos/                # 35 fotografías JPEG para texturas
    ├── fotos_seleccion/      # Selección curada de fotografías
    ├── plantwave/            # Audio adicional MP4
    └── videos/               # Material audiovisual de referencia
```

---

## 🛠️ Tecnologías y Librerías

### **Librerías Principales**
- **Three.js v0.158.0** - Motor gráfico 3D WebGL
  - `PointerLockControls` - Controles de primera persona
  - Geometrías, materiales, luces y shaders personalizados

### **APIs Web Utilizadas**
- **Web Audio API** - Análisis espectral y audio 3D posicional
- **Canvas API** - Generación de texturas procedurales
- **RequestAnimationFrame** - Loop de renderizado optimizado

### **Técnicas Implementadas**
- **Análisis FFT** - Extracción de características espectrales
- **Perlin Noise** - Generación de terreno y deformación orgánica
- **L-Systems** - Algoritmos de crecimiento vegetal
- **Vertex Shaders** - Cielo atmosférico dinámico
- **Instanced Rendering** - Optimización de plantas múltiples

---

## 📁 Descripción de Archivos

### **Frontend (HTML)**
- **`index.html`** - Interfaz principal con controles de navegación, información de estado y importación de módulos ES6

### **Controlador Principal**
- **`main.js`** - Clase `ThreeJSEnvironment`
  - Inicialización de la escena 3D
  - Sistema de navegación en primera persona
  - Loop principal de actualización y renderizado
  - Coordinación entre todos los subsistemas

### **Sistemas de Audio**
- **`AudioManager.js`** - Clase `AudioManager`
  - Carga asíncrona de 26 archivos WAV
  - Análisis espectral con FFT (2048 puntos)
  - Extracción de características: centroide, rolloff, MFCC, energía
  - Audio 3D posicional con Web Audio API

- **`AudioObject.js`** - Clase `AudioObject`
  - Objetos 3D que representan cada archivo de audio
  - Deformación geométrica reactiva en tiempo real
  - Sistema de colores dinámico basado en bandas de frecuencia
  - Reproducción de audio en loop con análisis continuo

### **Generación Procedural**
- **`GeometryGenerator.js`** - Clase `GeometryGenerator`
  - Creación de geometrías amorfas basadas en análisis espectral
  - Deformación con múltiples octavas de Perlin noise
  - Escalado automático según energía y centroide espectral
  - Generación de morph targets para animación

- **`TerrainGenerator.js`** - Clase `TerrainGenerator`
  - Terreno procedural de 500x500 unidades
  - Heightmap basado en ruido multi-octava
  - Material con gradientes de color altura-dependientes
  - API para consulta de altura en coordenadas específicas

### **Sistemas Visuales**
- **`TextureManager.js`** - Clase `TextureManager`
  - Carga de 35 fotografías JPEG como texturas
  - Asignación de 2 texturas por objeto (difusa + normal)
  - Animación de UV mapping reactiva al audio
  - Tintado dinámico basado en espectro

- **`SkySystem.js`** - Clase `SkySystem`
  - Ciclo día/noche de 5 minutos de duración
  - 35 nubes procedurales en 3 capas atmosféricas
  - Shader personalizado con degradados atmosféricos
  - Posicionamiento solar dinámico con efectos de resplandor

### **Crecimiento Vegetal**
- **`PlantGrowthSystem.js`** - Clase `PlantGrowthSystem`
  - Sistema L-System para 3 tipos de plantas (árboles, arbustos, hierba)
  - Crecimiento temporal con curvas de suavizado
  - Velocidad basada en proximidad del jugador
  - 30% de plantas pre-crecidas al inicio

---

## ⚙️ Funciones Principales

### **Inicialización del Sistema**
```javascript
// main.js - ThreeJSEnvironment.init()
- setupScene() → Luces, cámara, renderer WebGL
- setupControls() → Controles de primera persona
- loadAudioFiles() → Carga asíncrona de 26 archivos WAV
- createAudioObjects() → Generación de 26 objetos reactivos
- setupEventListeners() → Controles WASD, mouse, tecla Q
```

### **Análisis Espectral**
```javascript
// AudioManager.js - analyzeAudioBuffer()
- performFFT() → Transformada rápida de Fourier
- extractSpectralFeatures() → Centroide, rolloff, MFCC, energía
- calculateRealTimeFeatures() → Análisis en vivo durante reproducción
```

### **Generación de Geometría**
```javascript
// GeometryGenerator.js - createFromAudio()
- calculateComplexity() → Basado en centroide y energía
- applySpectralDeformation() → Deformación con Perlin noise
- generateSpectralNoise() → Ruido multi-octava ponderado por MFCC
```

### **Crecimiento Vegetal**
```javascript
// PlantGrowthSystem.js - growPlant()
- generateBranchingPattern() → Patrones L-System
- updatePlantGeometry() → Construcción incremental de mesh
- createTrunkSegment() → Segmentos cilíndricos con tapering
- addLeaves() → Clusters de hojas con distribución procedural
```

---

## 🎮 Controles de Usuario

| Tecla/Acción | Función |
|--------------|---------|
| **WASD** | Movimiento en primera persona |
| **Mouse** | Control de cámara (look around) |
| **Click** | Activar controles + reproducir/pausar objeto |
| **Espacio** | Saltar |
| **Shift** | Correr (2x velocidad) |
| **Q** | Mostrar/Ocultar interfaz de usuario |

---

## 🔧 Configuración Técnica

### **Parámetros de Renderizado**
- **Resolución de terreno:** 128x128 puntos
- **Área de juego:** 500x500 unidades
- **Altura de cámara:** 2 unidades sobre suelo
- **Velocidad normal:** 400 unidades/segundo
- **Velocidad corriendo:** 800 unidades/segundo

### **Configuración de Audio**
- **FFT Size:** 2048 puntos
- **Smoothing:** 0.8 (temporal)
- **Frecuencia de análisis:** 60 FPS
- **Formato soportado:** WAV, MP4
- **Audio 3D:** Modelo HRTF con rolloff exponencial

### **Parámetros de Plantas**
- **Cantidad total:** 60 plantas distribuidas
- **Tipos:** Árboles (80-140u), Arbustos (2-4u), Hierba (0.5-0.8u)
- **Velocidad de crecimiento:** 3x base, hasta 9x cerca del jugador
- **Distancia de influencia:** 100 unidades

---

## 🚀 Cómo Ejecutar

1. **Servidor local requerido** (CORS policy):
   ```bash
   cd mapeodeldesborde
   python3 -m http.server 8000
   ```

2. **Abrir navegador:** `http://localhost:8000`

3. **Activar controles:** Click en la página

4. **Explorar:** Navegar y interactuar con objetos de audio

---

## 📊 Métricas del Proyecto

- **Líneas de código:** ~2,500 líneas JavaScript
- **Archivos de audio:** 26 archivos WAV
- **Texturas fotográficas:** 35 imágenes JPEG
- **Objetos 3D:** 26 reactivos + 60 plantas + 35 nubes
- **Sistemas integrados:** 7 módulos especializados
- **Performance objetivo:** 60 FPS en hardware moderno

---

## 🎯 Características Únicas

- **Sinergia audio-visual:** Formas que emergen directamente del análisis espectral
- **Ecosistema viviente:** Plantas que crecen en tiempo real
- **Texturas reactivas:** Fotografías que se animan con el sonido
- **Ambiente dinámico:** Cielo que evoluciona continuamente
- **Navegación libre:** Exploración sin restricciones en primera persona

---

*Generado para el proyecto Mapeo del Desborde - Entorno 3D Interactivo*