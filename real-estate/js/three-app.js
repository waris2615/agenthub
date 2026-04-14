// Three.js Integrations for LuxEstate

// Helper function to handle window resize
function handleResize(camera, renderer, container) {
    camera.aspect = container.clientWidth / container.clientHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(container.clientWidth, container.clientHeight);
}

// 1. Hero Section 3D Background (Abstract floating houses/geometry)
function initHero3D() {
    const container = document.getElementById('hero-3d-container');
    if (!container || typeof THREE === 'undefined') return;

    // Scene setup
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x0a2540, 0.002);

    const camera = new THREE.PerspectiveCamera(75, container.clientWidth / container.clientHeight, 0.1, 1000);
    camera.position.z = 30;
    camera.position.y = 10;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setClearColor(0x0a2540, 1); // Match primary color
    container.appendChild(renderer.domElement);

    // Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xC5A059, 0.8); // Gold tint
    dirLight.position.set(20, 40, 20);
    scene.add(dirLight);

    // Create abstract "houses" (cubes + pyramids)
    const buildings = new THREE.Group();

    const boxGeo = new THREE.BoxGeometry(1, 1, 1);
    const roofGeo = new THREE.ConeGeometry(0.75, 1, 4);
    roofGeo.rotateY(Math.PI / 4);

    const matBuilding = new THREE.MeshPhongMaterial({
        color: 0x153e6b,
        transparent: true,
        opacity: 0.8,
        wireframe: true
    });

    const matRoof = new THREE.MeshPhongMaterial({
        color: 0xC5A059, // Gold
        transparent: true,
        opacity: 0.9
    });

    for (let i = 0; i < 50; i++) {
        const house = new THREE.Group();

        // Random dimensions
        const w = 2 + Math.random() * 3;
        const h = 2 + Math.random() * 8;
        const d = 2 + Math.random() * 3;

        // Body
        const body = new THREE.Mesh(boxGeo, matBuilding);
        body.scale.set(w, h, d);
        body.position.y = h / 2;
        house.add(body);

        // Roof
        if (Math.random() > 0.3) {
            const roof = new THREE.Mesh(roofGeo, matRoof);
            roof.scale.set(w, h * 0.3, d);
            roof.position.y = h + (h * 0.3) / 2;
            house.add(roof);
        }

        // Position randomly in a circle
        const radius = 10 + Math.random() * 40;
        const theta = Math.random() * Math.PI * 2;
        house.position.x = Math.cos(theta) * radius;
        house.position.z = Math.sin(theta) * radius;

        // Random rotation
        house.rotation.y = Math.random() * Math.PI;

        buildings.add(house);
    }

    scene.add(buildings);

    // Animation Loop
    let time = 0;
    function animate() {
        requestAnimationFrame(animate);
        time += 0.001;

        buildings.rotation.y += 0.001;
        camera.position.y = 10 + Math.sin(time) * 2;
        camera.lookAt(0, 5, 0);

        renderer.render(scene, camera);
    }

    animate();

    // Resize handler
    window.addEventListener('resize', () => handleResize(camera, renderer, container));
}

// 2. Interactive Property 3D Viewer (Procedural house model)
function initProperty3D(propertyData) {
    const container = document.getElementById('property-3d-container');
    if (!container || typeof THREE === 'undefined') return;

    // Remove overlay text on interaction
    container.addEventListener('mousedown', () => {
        const overlay = container.querySelector('.viewer-overlay-text');
        if (overlay) overlay.style.opacity = '0';
    }, { once: true });

    // Scene setup
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xe9ecef);

    const camera = new THREE.PerspectiveCamera(45, container.clientWidth / container.clientHeight, 0.1, 1000);
    camera.position.set(15, 10, 20);

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    container.appendChild(renderer.domElement);

    // Orbit Controls
    const controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.maxPolarAngle = Math.PI / 2 - 0.05; // Don't go below ground
    controls.minDistance = 10;
    controls.maxDistance = 50;

    // Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xffffff, 0.8);
    dirLight.position.set(10, 20, 10);
    dirLight.castShadow = true;
    dirLight.shadow.mapSize.width = 1024;
    dirLight.shadow.mapSize.height = 1024;
    scene.add(dirLight);

    const fillLight = new THREE.DirectionalLight(0xffeeba, 0.3);
    fillLight.position.set(-10, 10, -10);
    scene.add(fillLight);

    // Ground Plane
    const groundGeo = new THREE.PlaneGeometry(100, 100);
    const groundMat = new THREE.MeshPhongMaterial({ color: 0x8fc985 }); // Grass green
    const ground = new THREE.Mesh(groundGeo, groundMat);
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    scene.add(ground);

    // Build Procedural House based on property type
    const houseGroup = new THREE.Group();

    // Materials
    const wallMat = new THREE.MeshPhongMaterial({ color: 0xffffff });
    const roofMat = new THREE.MeshPhongMaterial({ color: 0x333333 });
    const glassMat = new THREE.MeshPhongMaterial({
        color: 0x88ccff,
        transparent: true,
        opacity: 0.6,
        shininess: 100
    });
    const woodMat = new THREE.MeshPhongMaterial({ color: 0x8b5a2b });

    if (propertyData.type === 'apartment') {
        // Build a tall building
        const width = 6, height = 12, depth = 6;

        // Main block
        const buildingGeo = new THREE.BoxGeometry(width, height, depth);
        const building = new THREE.Mesh(buildingGeo, wallMat);
        building.position.y = height / 2;
        building.castShadow = true;
        building.receiveShadow = true;
        houseGroup.add(building);

        // Windows (grid)
        for (let y = 1; y < height; y += 2) {
            for (let x = -2; x <= 2; x += 2) {
                // Front
                const winGeo = new THREE.PlaneGeometry(1.2, 1.2);
                const win1 = new THREE.Mesh(winGeo, glassMat);
                win1.position.set(x, y + 0.5, depth/2 + 0.01);
                houseGroup.add(win1);

                // Back
                const win2 = new THREE.Mesh(winGeo, glassMat);
                win2.position.set(x, y + 0.5, -depth/2 - 0.01);
                win2.rotation.y = Math.PI;
                houseGroup.add(win2);
            }
        }
    } else {
        // Build a house (Villa/Suburban)
        const isVilla = propertyData.price > 2000000;
        const width = isVilla ? 10 : 7;
        const height = isVilla ? 6 : 4;
        const depth = isVilla ? 8 : 6;

        // First Floor
        const floor1Geo = new THREE.BoxGeometry(width, height/2, depth);
        const floor1 = new THREE.Mesh(floor1Geo, wallMat);
        floor1.position.y = height/4;
        floor1.castShadow = true;
        floor1.receiveShadow = true;
        houseGroup.add(floor1);

        // Second Floor
        const floor2Geo = new THREE.BoxGeometry(width * 0.9, height/2, depth * 0.9);
        const floor2 = new THREE.Mesh(floor2Geo, wallMat);
        floor2.position.y = height * 0.75;
        floor2.castShadow = true;
        floor2.receiveShadow = true;
        houseGroup.add(floor2);

        // Modern flat roof for villa, pitched for suburban
        if (isVilla) {
            const roofGeo = new THREE.BoxGeometry(width * 1.1, 0.4, depth * 1.1);
            const roof = new THREE.Mesh(roofGeo, roofMat);
            roof.position.y = height + 0.2;
            roof.castShadow = true;
            houseGroup.add(roof);

            // Pool
            const poolGeo = new THREE.BoxGeometry(6, 0.1, 4);
            const poolMat = new THREE.MeshPhongMaterial({ color: 0x00aaff, transparent: true, opacity: 0.8 });
            const pool = new THREE.Mesh(poolGeo, poolMat);
            pool.position.set(0, 0.05, depth/2 + 3);
            houseGroup.add(pool);
        } else {
            const roofGeo = new THREE.ConeGeometry(Math.max(width, depth) * 0.7, 3, 4);
            roofGeo.rotateY(Math.PI / 4);
            const roof = new THREE.Mesh(roofGeo, roofMat);
            roof.position.y = height + 1.5;
            roof.castShadow = true;
            houseGroup.add(roof);
        }

        // Door
        const doorGeo = new THREE.PlaneGeometry(1.2, 2);
        const door = new THREE.Mesh(doorGeo, woodMat);
        door.position.set(0, 1, depth/2 + 0.01);
        houseGroup.add(door);

        // Big windows
        const winGeo = new THREE.PlaneGeometry(2, 2);
        const win1 = new THREE.Mesh(winGeo, glassMat);
        win1.position.set(-2.5, 1.2, depth/2 + 0.01);
        houseGroup.add(win1);

        const win2 = new THREE.Mesh(winGeo, glassMat);
        win2.position.set(2.5, 1.2, depth/2 + 0.01);
        houseGroup.add(win2);
    }

    scene.add(houseGroup);

    // Animation Loop
    function animate() {
        requestAnimationFrame(animate);
        controls.update();
        renderer.render(scene, camera);
    }

    animate();

    // Initial rotation to show off the 3D aspect
    let autoRotateAngle = 0;
    const initialRotation = setInterval(() => {
        if (controls.state !== -1) { // User started interacting
            clearInterval(initialRotation);
            return;
        }
        autoRotateAngle += 0.005;
        camera.position.x = Math.sin(autoRotateAngle) * 20;
        camera.position.z = Math.cos(autoRotateAngle) * 20;
        camera.lookAt(0, 5, 0);
    }, 16);

    // Stop auto rotation after 3 seconds
    setTimeout(() => clearInterval(initialRotation), 3000);

    // Resize handler
    window.addEventListener('resize', () => handleResize(camera, renderer, container));
}