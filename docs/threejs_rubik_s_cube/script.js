// Variabili globali
let scene, camera, renderer, controls;
let cubeGroup, cubes = [];
let isAnimating = false;
let cubeState = initializeCubeState();

// Colori standard del Cubo di Rubik
const COLORS = {
    WHITE: 0xFFFFFF,    // Fronte
    RED: 0xFF0000,      // Destra
    BLUE: 0x0000FF,     // Alto
    ORANGE: 0xFFA500,   // Sinistra
    GREEN: 0x00FF00,    // Basso
    YELLOW: 0xFFFF00,   // Retro
    BLACK: 0x111111     // Facce interne
};

// Inizializzazione della scena
function init() {
    // Creazione della scena
    scene = new THREE.Scene();
    
    // Creazione della camera
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(5, 5, 7);
    
    // Creazione del renderer
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setClearColor(0xf0f0f0);
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    document.getElementById('container').appendChild(renderer.domElement);
    
    // Controlli orbit
    controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.25;
    
    // Illuminazione
    setupLighting();
    
    // Creazione del Cubo di Rubik
    createRubiksCube();
    
    // Event listeners
    window.addEventListener('resize', onWindowResize);
    
    // Avvio dell'animazione
    animate();
}

function setupLighting() {
    // Luce ambientale (ridotta intensità)
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
    scene.add(ambientLight);
    
    // Luce direzionale principale (intensità ridotta)
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(3, 8, 5);
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.width = 1024;
    directionalLight.shadow.mapSize.height = 1024;
    directionalLight.shadow.camera.near = 0.5;
    directionalLight.shadow.camera.far = 30;
    directionalLight.shadow.camera.left = -8;
    directionalLight.shadow.camera.right = 8;
    directionalLight.shadow.camera.top = 8;
    directionalLight.shadow.camera.bottom = -8;
    scene.add(directionalLight);
    
    // Luce di riempimento (intensità ridotta)
    const fillLight = new THREE.DirectionalLight(0x8888ff, 0.3);
    fillLight.position.set(-4, -2, -4);
    scene.add(fillLight);
    
    // Luce aggiuntiva (intensità ridotta)
    const additionalLight = new THREE.DirectionalLight(0xffffff, 0.3);
    additionalLight.position.set(-2, 4, 3);
    scene.add(additionalLight);
    
    // Luce puntuale (intensità ridotta)
    const pointLight = new THREE.PointLight(0xffffff, 0.2, 25);
    pointLight.position.set(2, 6, 3);
    scene.add(pointLight);
}

function createRubiksCube() {
    cubeGroup = new THREE.Group();
    scene.add(cubeGroup);
    
    const cubeSize = 1;
    const gap = 0.05;
    const totalSize = cubeSize * 3 + gap * 2;
    
    // Creazione di 27 cubetti (3x3x3)
    for (let x = 0; x < 3; x++) {
        for (let y = 0; y < 3; y++) {
            for (let z = 0; z < 3; z++) {
                createCubie(x, y, z, cubeSize, gap, totalSize);
            }
        }
    }
}

function createCubie(x, y, z, cubeSize, gap, totalSize) {
    const group = new THREE.Group();
    
    // Cubo base nero
    const baseGeometry = new THREE.BoxGeometry(cubeSize, cubeSize, cubeSize);
    const baseMaterial = new THREE.MeshStandardMaterial({
        color: 0x111111,
        metalness: 0.5,
        roughness: 0.2
    });
    const baseCube = new THREE.Mesh(baseGeometry, baseMaterial);
    baseCube.castShadow = true;
    baseCube.receiveShadow = true;
    group.add(baseCube);
    
    // Dimensioni degli sticker (90% della faccia)
    const stickerSize = cubeSize * 0.9;
    const stickerThickness = 0.02;
    const stickerOffset = cubeSize / 2 + stickerThickness / 2;
    
    // Funzione per creare uno sticker
    function createSticker(color, position, rotation) {
        const stickerGeometry = new THREE.BoxGeometry(stickerSize, stickerSize, stickerThickness);
        const stickerMaterial = new THREE.MeshStandardMaterial({
            color: color,
            metalness: 0.1,
            roughness: 0.1,
            emissive: new THREE.Color(color).multiplyScalar(0.05)
        });
        
        const sticker = new THREE.Mesh(stickerGeometry, stickerMaterial);
        sticker.position.copy(position);
        if (rotation) sticker.rotation.copy(rotation);
        sticker.castShadow = true;
        sticker.receiveShadow = true;
        
        return sticker;
    }
    
    // Creazione sticker per ogni faccia colorata con rotazioni corrette
    if (z === 2) { // Fronte
        group.add(createSticker(COLORS.WHITE, new THREE.Vector3(0, 0, stickerOffset)));
    }
    if (z === 0) { // Retro
        group.add(createSticker(COLORS.YELLOW, new THREE.Vector3(0, 0, -stickerOffset)));
    }
    if (y === 2) { // Alto
        group.add(createSticker(COLORS.BLUE, new THREE.Vector3(0, stickerOffset, 0), new THREE.Euler(Math.PI / 2, 0, 0)));
    }
    if (y === 0) { // Basso
        group.add(createSticker(COLORS.GREEN, new THREE.Vector3(0, -stickerOffset, 0), new THREE.Euler(-Math.PI / 2, 0, 0)));
    }
    if (x === 0) { // Sinistra
        group.add(createSticker(COLORS.ORANGE, new THREE.Vector3(-stickerOffset, 0, 0), new THREE.Euler(0, Math.PI / 2, 0)));
    }
    if (x === 2) { // Destra
        group.add(createSticker(COLORS.RED, new THREE.Vector3(stickerOffset, 0, 0), new THREE.Euler(0, -Math.PI / 2, 0)));
    }
    
    // Posizionamento del cubetto
    const offset = (totalSize - cubeSize) / 2;
    group.position.set(
        x * (cubeSize + gap) - offset,
        y * (cubeSize + gap) - offset,
        z * (cubeSize + gap) - offset
    );
    
    group.userData = {
        originalPosition: { x, y, z },
        currentPosition: { x, y, z }
    };
    
    cubes.push(group);
    cubeGroup.add(group);
}

function getFaceMaterial(color) {
    const isColored = color !== COLORS.BLACK;
    
    return new THREE.MeshStandardMaterial({
        color: color,
        metalness: isColored ? 0.3 : 0.5,  // Ridotto metalness per colori più vividi
        roughness: isColored ? 0.1 : 0.2,  // Maggiore lucentezza
        emissive: isColored ? new THREE.Color(color).multiplyScalar(0.05) : new THREE.Color(0x000000),
        envMapIntensity: isColored ? 0.8 : 0.4,  // Maggiore intensità riflessi
        transparent: false,
        opacity: 1.0
    });
}

function animate() {
    requestAnimationFrame(animate);
    
    controls.update();
    renderer.render(scene, camera);
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

// Funzioni per ruotare le facce (completamente implementate)
function rotateFront() {
    if (!isAnimating) animateFaceRotation('z', 2, Math.PI / 2);
}

function rotateFrontCounter() {
    if (!isAnimating) animateFaceRotation('z', 2, -Math.PI / 2);
}

function rotateBack() {
    if (!isAnimating) animateFaceRotation('z', 0, Math.PI / 2);
}

function rotateBackCounter() {
    if (!isAnimating) animateFaceRotation('z', 0, -Math.PI / 2);
}

function rotateLeft() {
    if (!isAnimating) animateFaceRotation('x', 0, Math.PI / 2);
}

function rotateLeftCounter() {
    if (!isAnimating) animateFaceRotation('x', 0, -Math.PI / 2);
}

function rotateRight() {
    if (!isAnimating) animateFaceRotation('x', 2, Math.PI / 2);
}

function rotateRightCounter() {
    if (!isAnimating) animateFaceRotation('x', 2, -Math.PI / 2);
}

function rotateTop() {
    if (!isAnimating) animateFaceRotation('y', 2, Math.PI / 2);
}

function rotateTopCounter() {
    if (!isAnimating) animateFaceRotation('y', 2, -Math.PI / 2);
}

function rotateBottom() {
    if (!isAnimating) animateFaceRotation('y', 0, Math.PI / 2);
}
function rotateBottomCounter() {
    if (!isAnimating) animateFaceRotation('y', 0, -Math.PI / 2);
}

function rotateMiddleVertical() {
    if (!isAnimating) animateFaceRotation('x', 1, Math.PI / 2);
}

function rotateMiddleVerticalCounter() {
    if (!isAnimating) animateFaceRotation('x', 1, -Math.PI / 2);
}

function rotateMiddleHorizontal() {
    if (!isAnimating) animateFaceRotation('y', 1, Math.PI / 2);
}

function rotateMiddleHorizontalCounter() {
    if (!isAnimating) animateFaceRotation('y', 1, -Math.PI / 2);
}

function scrambleCube() {
    if (isAnimating) return;
    
    const moves = [
        () => animateFaceRotation('x', 0, Math.PI / 2),
        () => animateFaceRotation('x', 2, -Math.PI / 2),
        () => animateFaceRotation('y', 0, Math.PI / 2),
        () => animateFaceRotation('y', 2, -Math.PI / 2),
        () => animateFaceRotation('z', 0, Math.PI / 2),
        () => animateFaceRotation('z', 2, -Math.PI / 2)
    ];
    
    let count = 0;
    const maxMoves = 20;
    
    function performNextMove() {
        if (count < maxMoves && !isAnimating) {
            const randomMove = moves[Math.floor(Math.random() * moves.length)];
            randomMove();
            count++;
            setTimeout(performNextMove, 700);
        }
    }
    
    performNextMove();
}

function resetCube() {
    if (isAnimating) return;
    
    // Re-inizializza il cubo
    cubeGroup.remove(...cubes);
    cubes = [];
    createRubiksCube();
    
    console.log("Cubo resettato alla configurazione iniziale");
}

function initializeCubeState() {
    // Inizializza lo stato del cubo 3x3x3
    const state = [];
    for (let x = 0; x < 3; x++) {
        state[x] = [];
        for (let y = 0; y < 3; y++) {
            state[x][y] = [];
            for (let z = 0; z < 3; z++) {
                state[x][y][z] = { x, y, z };
            }
        }
    }
    return state;
}

function animateFaceRotation(axis, layer, angle) {
    if (isAnimating) return;
    isAnimating = true;

    const pivot = new THREE.Group();
    cubeGroup.add(pivot);

    const cubesToRotate = cubes.filter(cube => {
        const pos = cube.userData.currentPosition;
        // Use Math.round to be safe with potential floating point inaccuracies
        return Math.round(pos[axis]) === layer;
    });

    cubesToRotate.forEach(cube => {
        pivot.attach(cube); // Use attach to preserve world transforms
    });

    const duration = 500; // ms
    const easing = t => 1 - Math.pow(1 - t, 4); // easeOutQuart for a smoother end
    const startTime = Date.now();

    function update() {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const easedProgress = easing(progress);
        const currentAngle = angle * easedProgress;

        if (axis === 'x') {
            pivot.rotation.x = currentAngle;
        } else if (axis === 'y') {
            pivot.rotation.y = currentAngle;
        } else if (axis === 'z') {
            pivot.rotation.z = currentAngle;
        }

        if (progress < 1) {
            requestAnimationFrame(update);
        } else {
            // Finalize rotation to avoid precision errors
            if (axis === 'x') pivot.rotation.x = angle;
            if (axis === 'y') pivot.rotation.y = angle;
            if (axis === 'z') pivot.rotation.z = angle;
            
            // Update world matrix before detaching
            pivot.updateMatrixWorld(true);

            cubesToRotate.forEach(cube => {
                cubeGroup.attach(cube); // Re-attach to the main group
            });
            cubeGroup.remove(pivot);

            updateLogicalPositions(axis, layer, angle);
            
            isAnimating = false;
        }
    }

    update();
}

function updateLogicalPositions(axis, layer, angle) {
    const direction = angle > 0 ? 1 : -1;

    for (let i = 0; i < cubes.length; i++) {
        const cube = cubes[i];
        const pos = cube.userData.currentPosition;

        if (Math.round(pos[axis]) === layer) {
            const x = pos.x - 1;
            const y = pos.y - 1;
            const z = pos.z - 1;

            let newX, newY, newZ;

            if (axis === 'y') { // U, D, E
                newX = (direction === 1) ? z : -z;
                newZ = (direction === 1) ? -x : x;
                newY = y;
            } else if (axis === 'x') { // R, L, M
                newY = (direction === 1) ? -z : z;
                newZ = (direction === 1) ? y : -y;
                newX = x;
            } else { // F, B, S
                newX = (direction === 1) ? -y : y;
                newY = (direction === 1) ? x : -x;
                newZ = z;
            }

            cube.userData.currentPosition = {
                x: newX + 1,
                y: newY + 1,
                z: newZ + 1
            };
        }
    }
}


// Avvio dell'applicazione
window.onload = init;