/**
 * BMW SHOP - Interactive JavaScript & True WebGL 3D Automotive Studio
 * Powered by Three.js & Modern Web Technologies
 */

document.addEventListener('DOMContentLoaded', () => {
    // =========================================================================
    // 1. TRUE 3D WEBGL AUTOMOTIVE STUDIO (Three.js)
    // =========================================================================
    const webglContainer = document.getElementById('webglCarStudio');

    if (webglContainer && typeof THREE !== 'undefined') {
        let scene, camera, renderer, controls;
        let carGroup, bodyMaterial, glassMaterial, wheelMeshes = [];
        let headlightSpotlights = [], ambientLight, dirLight1, dirLight2;
        let isAutoRotating = true;
        let lightsOn = true;

        // Color Presets (Hex values for metallic paint)
        const paintColors = {
            'blue': 0x0066b1,    // Marina Bay Blue Metallic
            'red': 0xd91424,     // Toronto M Red Metallic
            'green': 0x00593b,   // Isle of Man Green Metallic
            'grey': 0x22262c,    // Frozen Deep Grey Matte
            'white': 0xededed,   // Alpine Metallic White
            'yellow': 0xd9b300,  // Sao Paulo M Gold
            'cyan': 0x00a3e0     // Electric Cyan Metallic
        };

        // Initialize 3D Scene
        function init3DStudio() {
            const width = webglContainer.offsetWidth;
            const height = webglContainer.offsetHeight || 420;

            // 1. Scene & Background
            scene = new THREE.Scene();
            scene.fog = new THREE.FogExp2(0x070a10, 0.035);

            // 2. Camera
            camera = new THREE.PerspectiveCamera(42, width / height, 0.1, 100);
            camera.position.set(4.8, 1.9, 5.2);

            // 3. WebGL Renderer with Anti-Aliasing & Shadows
            renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
            renderer.setSize(width, height);
            renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
            renderer.shadowMap.enabled = true;
            renderer.shadowMap.type = THREE.PCFSoftShadowMap;
            renderer.toneMapping = THREE.ACESFilmicToneMapping;
            renderer.toneMappingExposure = 1.15;
            webglContainer.appendChild(renderer.domElement);

            // 4. Orbit Controls for full 360 rotation & zoom
            if (typeof THREE.OrbitControls !== 'undefined') {
                controls = new THREE.OrbitControls(camera, renderer.domElement);
                controls.enableDamping = true;
                controls.dampingFactor = 0.05;
                controls.maxPolarAngle = Math.PI / 2 - 0.04; // Don't go under ground
                controls.minDistance = 3.5;
                controls.maxDistance = 11;
                controls.enablePan = false;
                controls.autoRotate = true;
                controls.autoRotateSpeed = 1.6;
            }

            // 5. Studio Lighting Setup
            setupLighting();

            // 6. Ground Studio Floor with Grid & Radial Reflection
            setupStudioFloor();

            // 7. Build High-Detail 3D BMW Concept Sports Car
            build3DCar();

            // Window Resize Handler
            window.addEventListener('resize', onWindowResize);

            // Start Animation Loop
            animate();
        }

        function setupLighting() {
            ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
            scene.add(ambientLight);

            // Key Light
            dirLight1 = new THREE.DirectionalLight(0xffffff, 2.2);
            dirLight1.position.set(6, 10, 6);
            dirLight1.castShadow = true;
            dirLight1.shadow.mapSize.width = 1024;
            dirLight1.shadow.mapSize.height = 1024;
            dirLight1.shadow.bias = -0.001;
            scene.add(dirLight1);

            // Fill Light with BMW Cyan Glow
            dirLight2 = new THREE.DirectionalLight(0x00a3e0, 1.4);
            dirLight2.position.set(-6, 6, -6);
            scene.add(dirLight2);

            // Underglow Cyan Light
            const underglow = new THREE.PointLight(0x00a3e0, 2.0, 5);
            underglow.position.set(0, 0.1, 0);
            scene.add(underglow);

            // Headlight beams
            const headlightL = new THREE.SpotLight(0xaad5ff, 4.0, 14, Math.PI / 6, 0.4, 1.5);
            headlightL.position.set(1.65, 0.65, 0.62);
            headlightL.target.position.set(8, 0, 0.62);
            scene.add(headlightL);
            scene.add(headlightL.target);
            headlightSpotlights.push(headlightL);

            const headlightR = new THREE.SpotLight(0xaad5ff, 4.0, 14, Math.PI / 6, 0.4, 1.5);
            headlightR.position.set(1.65, 0.65, -0.62);
            headlightR.target.position.set(8, 0, -0.62);
            scene.add(headlightR);
            scene.add(headlightR.target);
            headlightSpotlights.push(headlightR);
        }

        function setupStudioFloor() {
            // Shadow Receiver Plane
            const planeGeo = new THREE.PlaneGeometry(35, 35);
            const planeMat = new THREE.MeshStandardMaterial({
                color: 0x05080e,
                roughness: 0.4,
                metalness: 0.8
            });
            const floor = new THREE.Mesh(planeGeo, planeMat);
            floor.rotation.x = -Math.PI / 2;
            floor.position.y = 0;
            floor.receiveShadow = true;
            scene.add(floor);

            // Studio Circular Grid Ring
            const ringGeo = new THREE.RingGeometry(2.4, 2.5, 64);
            const ringMat = new THREE.MeshBasicMaterial({ color: 0x00a3e0, side: THREE.DoubleSide, transparent: true, opacity: 0.6 });
            const ring = new THREE.Mesh(ringGeo, ringMat);
            ring.rotation.x = -Math.PI / 2;
            ring.position.y = 0.01;
            scene.add(ring);

            const outerRingGeo = new THREE.RingGeometry(3.6, 3.65, 64);
            const outerRingMat = new THREE.MeshBasicMaterial({ color: 0x0066b1, side: THREE.DoubleSide, transparent: true, opacity: 0.3 });
            const outerRing = new THREE.Mesh(outerRingGeo, outerRingMat);
            outerRing.rotation.x = -Math.PI / 2;
            outerRing.position.y = 0.01;
            scene.add(outerRing);
        }

        function build3DCar() {
            carGroup = new THREE.Group();
            scene.add(carGroup);

            // 1. Materials
            bodyMaterial = new THREE.MeshStandardMaterial({
                color: paintColors['blue'],
                metalness: 0.9,
                roughness: 0.18,
                clearcoat: 1.0,
                clearcoatRoughness: 0.1
            });

            const carbonMaterial = new THREE.MeshStandardMaterial({
                color: 0x111113,
                metalness: 0.6,
                roughness: 0.4
            });

            glassMaterial = new THREE.MeshPhysicalMaterial({
                color: 0x111827,
                metalness: 0.1,
                roughness: 0.05,
                transmission: 0.85,
                thickness: 0.5,
                transparent: true,
                opacity: 0.9
            });

            const chromeMaterial = new THREE.MeshStandardMaterial({
                color: 0xffffff,
                metalness: 0.95,
                roughness: 0.05
            });

            const tireMaterial = new THREE.MeshStandardMaterial({
                color: 0x18181b,
                roughness: 0.85,
                metalness: 0.1
            });

            const lightMaterial = new THREE.MeshBasicMaterial({
                color: 0x60a5fa
            });

            const taillightMaterial = new THREE.MeshBasicMaterial({
                color: 0xef4444
            });

            // 2. Main Lower Chassis (Streamlined aerodynamic shape)
            const mainBodyGeo = new THREE.BoxGeometry(3.6, 0.55, 1.75);
            const mainBody = new THREE.Mesh(mainBodyGeo, bodyMaterial);
            mainBody.position.y = 0.45;
            mainBody.castShadow = true;
            mainBody.receiveShadow = true;
            carGroup.add(mainBody);

            // 3. Cabin & Curved Roof
            const cabinGeo = new THREE.BoxGeometry(2.0, 0.58, 1.45);
            const cabin = new THREE.Mesh(cabinGeo, bodyMaterial);
            cabin.position.set(-0.2, 0.92, 0);
            cabin.castShadow = true;
            carGroup.add(cabin);

            // Windshield (Front Slanted Glass)
            const windshieldGeo = new THREE.BoxGeometry(0.9, 0.52, 1.42);
            const windshield = new THREE.Mesh(windshieldGeo, glassMaterial);
            windshield.position.set(0.65, 0.82, 0);
            windshield.rotation.z = -0.55;
            carGroup.add(windshield);

            // Rear Slanted Glass
            const rearGlassGeo = new THREE.BoxGeometry(0.85, 0.48, 1.42);
            const rearGlass = new THREE.Mesh(rearGlassGeo, glassMaterial);
            rearGlass.position.set(-1.05, 0.82, 0);
            rearGlass.rotation.z = 0.55;
            carGroup.add(rearGlass);

            // Side Windows (Left & Right)
            const sideWindowGeo = new THREE.BoxGeometry(1.4, 0.42, 1.48);
            const sideWindows = new THREE.Mesh(sideWindowGeo, glassMaterial);
            sideWindows.position.set(-0.2, 0.88, 0);
            carGroup.add(sideWindows);

            // 4. Hood & Front Nose (Slanted Aerodynamic Front)
            const hoodGeo = new THREE.BoxGeometry(1.2, 0.28, 1.7);
            const hood = new THREE.Mesh(hoodGeo, bodyMaterial);
            hood.position.set(1.4, 0.55, 0);
            hood.rotation.z = -0.12;
            hood.castShadow = true;
            carGroup.add(hood);

            // 5. Signature BMW Kidney Grille (Left & Right)
            const grilleFrameGeo = new THREE.TorusGeometry(0.18, 0.035, 16, 32);
            
            const grilleL = new THREE.Mesh(grilleFrameGeo, chromeMaterial);
            grilleL.position.set(1.82, 0.45, 0.22);
            grilleL.rotation.y = Math.PI / 2;
            carGroup.add(grilleL);

            const grilleR = new THREE.Mesh(grilleFrameGeo, chromeMaterial);
            grilleR.position.set(1.82, 0.45, -0.22);
            grilleR.rotation.y = Math.PI / 2;
            carGroup.add(grilleR);

            // Inner Black Grille Slats
            const innerGrilleGeo = new THREE.BoxGeometry(0.04, 0.28, 0.28);
            const innerGrilleL = new THREE.Mesh(innerGrilleGeo, carbonMaterial);
            innerGrilleL.position.set(1.81, 0.45, 0.22);
            carGroup.add(innerGrilleL);

            const innerGrilleR = new THREE.Mesh(innerGrilleGeo, carbonMaterial);
            innerGrilleR.position.set(1.81, 0.45, -0.22);
            carGroup.add(innerGrilleR);

            // 6. Iconic BMW Twin Laser Headlights
            const headlightGeo = new THREE.BoxGeometry(0.12, 0.08, 0.4);
            
            const hlMeshL = new THREE.Mesh(headlightGeo, lightMaterial);
            hlMeshL.position.set(1.78, 0.58, 0.62);
            hlMeshL.rotation.y = 0.2;
            carGroup.add(hlMeshL);

            const hlMeshR = new THREE.Mesh(headlightGeo, lightMaterial);
            hlMeshR.position.set(1.78, 0.58, -0.62);
            hlMeshR.rotation.y = -0.2;
            carGroup.add(hlMeshR);

            // 7. L-Shaped Sleek BMW OLED Taillights
            const taillightGeo = new THREE.BoxGeometry(0.08, 0.08, 0.55);
            
            const tlMeshL = new THREE.Mesh(taillightGeo, taillightMaterial);
            tlMeshL.position.set(-1.81, 0.6, 0.55);
            carGroup.add(tlMeshL);

            const tlMeshR = new THREE.Mesh(taillightGeo, taillightMaterial);
            tlMeshR.position.set(-1.81, 0.6, -0.55);
            carGroup.add(tlMeshR);

            // 8. Front & Rear Carbon Diffusers & Side Skirts
            const frontLipGeo = new THREE.BoxGeometry(0.4, 0.08, 1.8);
            const frontLip = new THREE.Mesh(frontLipGeo, carbonMaterial);
            frontLip.position.set(1.75, 0.18, 0);
            carGroup.add(frontLip);

            const rearDiffuserGeo = new THREE.BoxGeometry(0.4, 0.14, 1.75);
            const rearDiffuser = new THREE.Mesh(rearDiffuserGeo, carbonMaterial);
            rearDiffuser.position.set(-1.75, 0.22, 0);
            carGroup.add(rearDiffuser);

            // Quad M-Performance Exhaust Tips
            const exhaustGeo = new THREE.CylinderGeometry(0.05, 0.05, 0.15, 16);
            for (let i of [-0.45, -0.32, 0.32, 0.45]) {
                const exhaust = new THREE.Mesh(exhaustGeo, chromeMaterial);
                exhaust.rotation.z = Math.PI / 2;
                exhaust.position.set(-1.86, 0.22, i);
                carGroup.add(exhaust);
            }

            // 9. 4 Alloy Wheels with 3D Rims & Disc Brakes
            const wheelPositions = [
                { x: 1.15, y: 0.35, z: 0.88 },   // Front Left
                { x: 1.15, y: 0.35, z: -0.88 },  // Front Right
                { x: -1.15, y: 0.35, z: 0.88 },  // Rear Left
                { x: -1.15, y: 0.35, z: -0.88 }  // Rear Right
            ];

            const tireGeo = new THREE.CylinderGeometry(0.35, 0.35, 0.28, 32);
            const rimGeo = new THREE.CylinderGeometry(0.24, 0.24, 0.29, 16);
            const brakeDiscGeo = new THREE.CylinderGeometry(0.2, 0.2, 0.05, 16);
            const brakeCaliperGeo = new THREE.BoxGeometry(0.08, 0.14, 0.08);
            const caliperMat = new THREE.MeshStandardMaterial({ color: 0x0066b1, roughness: 0.3 });

            wheelPositions.forEach((pos) => {
                const wheelAssembly = new THREE.Group();
                wheelAssembly.position.set(pos.x, pos.y, pos.z);

                // Tire
                const tire = new THREE.Mesh(tireGeo, tireMaterial);
                tire.rotation.x = Math.PI / 2;
                tire.castShadow = true;
                wheelAssembly.add(tire);

                // Alloy Rim
                const rim = new THREE.Mesh(rimGeo, chromeMaterial);
                rim.rotation.x = Math.PI / 2;
                wheelAssembly.add(rim);

                // Brake Disc
                const brakeDisc = new THREE.Mesh(brakeDiscGeo, chromeMaterial);
                brakeDisc.rotation.x = Math.PI / 2;
                wheelAssembly.add(brakeDisc);

                // M Brake Caliper
                const caliper = new THREE.Mesh(brakeCaliperGeo, caliperMat);
                caliper.position.set(0, 0.12, 0);
                wheelAssembly.add(caliper);

                carGroup.add(wheelAssembly);
                wheelMeshes.push(wheelAssembly);
            });

            // 10. Subtle Floating Animation Anchor
            carGroup.position.y = 0.05;
        }

        function onWindowResize() {
            const width = webglContainer.offsetWidth;
            const height = webglContainer.offsetHeight || 420;
            camera.aspect = width / height;
            camera.updateProjectionMatrix();
            renderer.setSize(width, height);
        }

        // Animation Loop
        let clock = new THREE.Clock();
        function animate() {
            requestAnimationFrame(animate);

            const elapsedTime = clock.getElapsedTime();

            // Subtle suspension hover breath
            if (carGroup) {
                carGroup.position.y = 0.05 + Math.sin(elapsedTime * 2.5) * 0.025;
            }

            // Update Controls
            if (controls) {
                controls.update();
            }

            renderer.render(scene, camera);
        }

        // Initialize Now
        init3DStudio();

        // =====================================================================
        // 3D STUDIO UI CONTROLS (Colors, Angles, Lights, Orbit)
        // =====================================================================

        // 1. Paint Color Customizer Swatches
        document.querySelectorAll('.color-swatch-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('.color-swatch-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');

                const colorKey = btn.getAttribute('data-color');
                const selectedHex = paintColors[colorKey] || paintColors['blue'];

                if (bodyMaterial) {
                    bodyMaterial.color.setHex(selectedHex);
                }

                // Update UI text badge
                const colorLabel = document.getElementById('activeColorName');
                if (colorLabel) {
                    colorLabel.textContent = btn.getAttribute('data-name') || colorKey.toUpperCase();
                }
            });
        });

        // 2. Camera Preset Angle Buttons
        document.querySelectorAll('.camera-angle-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('.camera-angle-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');

                const angle = btn.getAttribute('data-angle');
                if (!controls) return;

                if (angle === 'front') {
                    gsapAnimateCamera(4.8, 1.2, 2.5);
                } else if (angle === 'side') {
                    gsapAnimateCamera(0.2, 1.1, 6.2);
                } else if (angle === 'rear') {
                    gsapAnimateCamera(-4.8, 1.4, 2.8);
                } else if (angle === 'top') {
                    gsapAnimateCamera(0.5, 6.5, 1.0);
                } else {
                    // Default 3/4 Orbit
                    gsapAnimateCamera(4.8, 1.9, 5.2);
                }
            });
        });

        function gsapAnimateCamera(targetX, targetY, targetZ) {
            if (!camera) return;
            const startX = camera.position.x;
            const startY = camera.position.y;
            const startZ = camera.position.z;
            let progress = 0;

            function step() {
                progress += 0.06;
                camera.position.x = startX + (targetX - startX) * progress;
                camera.position.y = startY + (targetY - startY) * progress;
                camera.position.z = startZ + (targetZ - startZ) * progress;
                camera.lookAt(0, 0.4, 0);

                if (progress < 1) {
                    requestAnimationFrame(step);
                }
            }
            requestAnimationFrame(step);
        }

        // 3. Auto-Orbit Toggle Button
        const orbitBtn = document.getElementById('toggle3DOrbitBtn');
        if (orbitBtn) {
            orbitBtn.addEventListener('click', () => {
                isAutoRotating = !isAutoRotating;
                if (controls) {
                    controls.autoRotate = isAutoRotating;
                }
                orbitBtn.classList.toggle('active', isAutoRotating);
                orbitBtn.innerHTML = isAutoRotating ? '🔄 360° Auto-Orbit [ON]' : '⏸️ 360° Orbit [PAUSED]';
            });
        }

        // 4. Laser Headlights Toggle Button
        const lightsBtn = document.getElementById('toggle3DLightsBtn');
        if (lightsBtn) {
            lightsBtn.addEventListener('click', () => {
                lightsOn = !lightsOn;
                headlightSpotlights.forEach(spot => {
                    spot.intensity = lightsOn ? 4.0 : 0;
                });
                lightsBtn.classList.toggle('active', lightsOn);
                lightsBtn.innerHTML = lightsOn ? '💡 Laser Lights [ON]' : '🌑 Laser Lights [OFF]';
            });
        }
    }

    // =========================================================================
    // 2. MOBILE MENU & NAVBAR SCROLL
    // =========================================================================
    const hamburgerBtn = document.getElementById('hamburgerBtn');
    const navMenu = document.getElementById('navMenu');

    if (hamburgerBtn && navMenu) {
        hamburgerBtn.addEventListener('click', () => {
            hamburgerBtn.classList.toggle('active');
            navMenu.classList.toggle('active');
            document.body.classList.toggle('menu-open');
        });

        document.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', () => {
                hamburgerBtn.classList.remove('active');
                navMenu.classList.remove('active');
                document.body.classList.remove('menu-open');
            });
        });
    }

    const header = document.querySelector('.main-header');
    const backToTopBtn = document.getElementById('backToTop');

    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            header?.classList.add('scrolled');
        } else {
            header?.classList.remove('scrolled');
        }

        if (backToTopBtn) {
            if (window.scrollY > 400) {
                backToTopBtn.classList.add('visible');
            } else {
                backToTopBtn.classList.remove('visible');
            }
        }
    });

    if (backToTopBtn) {
        backToTopBtn.addEventListener('click', () => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }

    // =========================================================================
    // 3. CAR MODELS CATEGORY FILTER
    // =========================================================================
    const filterBtns = document.querySelectorAll('.filter-btn');
    const carCards = document.querySelectorAll('.car-card');

    if (filterBtns.length > 0 && carCards.length > 0) {
        filterBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                filterBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');

                const filterValue = btn.getAttribute('data-filter');

                carCards.forEach(card => {
                    const category = card.getAttribute('data-category');
                    if (filterValue === 'all' || category.includes(filterValue)) {
                        card.style.display = 'flex';
                        setTimeout(() => {
                            card.style.opacity = '1';
                            card.style.transform = 'translateY(0) scale(1)';
                        }, 50);
                    } else {
                        card.style.opacity = '0';
                        card.style.transform = 'translateY(20px) scale(0.95)';
                        setTimeout(() => {
                            card.style.display = 'none';
                        }, 300);
                    }
                });
            });
        });
    }

    // =========================================================================
    // 4. VEHICLE SPECIFICATIONS DATA & MODAL HANDLER
    // =========================================================================
    const vehicleSpecsData = {
        'bmw-i7': {
            name: 'BMW i7 xDrive60',
            series: 'THE BMW i-SERIES (Fully Electric)',
            image: 'img/BMWi7.png',
            tag: '100% Electric Luxury',
            hp: '536 HP',
            acc: '4.5 sec (0-100 km/h)',
            topSpeed: '240 km/h',
            range: 'Up to 625 km (WLTP)',
            battery: '101.7 kWh Lithium-Ion',
            drivetrain: 'All-Wheel Drive (Dual Motor)',
            price: 'From $105,700 / ₹2.03 Cr',
            description: 'The BMW i7 combines pure electric performance and ground-breaking multisensory entertainment to produce an unforgettable motoring experience with the BMW Theatre Screen.'
        },
        'bmw-ix': {
            name: 'BMW iX xDrive50',
            series: 'THE BMW i-SERIES (Electric SAV)',
            image: 'img/BMWiX.png',
            tag: 'Pioneering Electric SUV',
            hp: '516 HP',
            acc: '4.4 sec (0-100 km/h)',
            topSpeed: '200 km/h',
            range: 'Up to 630 km (WLTP)',
            battery: '111.5 kWh Lithium-Ion',
            drivetrain: 'Electric All-Wheel Drive',
            price: 'From $87,100 / ₹1.21 Cr',
            description: 'Born from a vision. Created for electric mobility. Thanks to efficient BMW eDrive technology and fully electric all-wheel drive, the BMW iX achieves an exceptional range.'
        },
        'bmw-x5': {
            name: 'BMW X5 xDrive40i',
            series: 'THE BMW X-SERIES (Sports Activity Vehicle)',
            image: 'img/BMWX5.png',
            tag: 'The Boss of Versatility',
            hp: '375 HP',
            acc: '5.2 sec (0-100 km/h)',
            topSpeed: '250 km/h',
            range: 'TwinPower Turbo Inline 6',
            battery: '48V Mild Hybrid System',
            drivetrain: 'Intelligent xDrive AWD',
            price: 'From $65,200 / ₹96.0 Lakh',
            description: 'Powerful, elegant and commanding. The BMW X5 impresses with a refined exterior, premium interior with BMW Curved Display, and dynamic performance across all terrains.'
        },
        'bmw-x7': {
            name: 'BMW X7 M60i',
            series: 'THE BMW X-SERIES (Luxury Full-Size SUV)',
            image: 'img/BMWX7.png',
            tag: 'Supreme Presence',
            hp: '523 HP',
            acc: '4.5 sec (0-100 km/h)',
            topSpeed: '250 km/h',
            range: '4.4L BMW M TwinPower Turbo V8',
            battery: '48V Mild Hybrid Assist',
            drivetrain: 'xDrive All-Wheel Drive',
            price: 'From $108,700 / ₹1.30 Cr',
            description: 'The BMW X7 represents the pinnacle of luxury SUVs, offering three rows of lavish seating, executive split headlights, and effortless twin-turbo V8 dominance.'
        },
        'bmw-m4': {
            name: 'BMW M4 Competition Coupé',
            series: 'THE BMW M-SERIES (Pure High-Performance)',
            image: 'img/BMWM4.png',
            tag: 'Motorsport DNA',
            hp: '503 HP / 650 Nm',
            acc: '3.4 sec (0-100 km/h)',
            topSpeed: '290 km/h (M Driver’s Pkg)',
            range: '3.0L M TwinPower Turbo S58',
            battery: 'High-Revving Petrol Engine',
            drivetrain: 'M xDrive / RWD selectable',
            price: 'From $82,200 / ₹1.53 Cr',
            description: 'A masterpiece of precision engineering and track capability. The M4 Competition offers adrenaline-pumping agility with carbon-fiber bucket seats and active M differential.'
        },
        'bmw-x6m': {
            name: 'BMW X6 M Competition',
            series: 'THE BMW M-SERIES (Sports Activity Coupé)',
            image: 'img/BMWX6M.png',
            tag: 'Unstoppable Authority',
            hp: '617 HP / 750 Nm',
            acc: '3.7 sec (0-100 km/h)',
            topSpeed: '290 km/h',
            range: '4.4L V8 M TwinPower Turbo',
            battery: '48V e-Motor boost',
            drivetrain: 'M xDrive with Active M Diff',
            price: 'From $127,200 / ₹2.15 Cr',
            description: 'Dominance in every curve. The BMW X6 M Competition pairs dramatic coupe styling with thunderous V8 performance and track-tuned adaptive M suspension.'
        },
        'bmw-7': {
            name: 'BMW 750e xDrive',
            series: 'THE BMW 7-SERIES (Flagship Luxury Sedan)',
            image: 'img/BMW7.png',
            tag: 'Forwardism & Opulence',
            hp: '483 HP (PHEV Combined)',
            acc: '4.6 sec (0-100 km/h)',
            topSpeed: '250 km/h',
            range: 'Up to 80 km Electric Only',
            battery: '18.7 kWh High-Voltage Battery',
            drivetrain: 'Intelligent xDrive AWD',
            price: 'From $107,000 / ₹1.82 Cr',
            description: 'The archetype of automotive luxury. Features the BMW Interaction Bar, automatic opening doors, executive lounge seating, and whisper-quiet hybrid glide.'
        },
        'bmw-5': {
            name: 'BMW 530i Sedan (G68)',
            series: 'THE BMW 5-SERIES (Executive Business Sedan)',
            image: 'img/BMW530.png',
            tag: 'Dynamic Executive',
            hp: '255 HP / 400 Nm',
            acc: '5.9 sec (0-100 km/h)',
            topSpeed: '250 km/h',
            range: '2.0L TwinPower Turbo 4-Cylinder',
            battery: '48V Mild Hybrid Technology',
            drivetrain: 'Rear-Wheel Drive / xDrive',
            price: 'From $57,900 / ₹72.9 Lakh',
            description: 'The world’s most successful business sedan. Redesigned with sharp proportions, Highway Assistant hands-free driving, and BMW Curved Display with QuickSelect.'
        },
        'bmw-3': {
            name: 'BMW 330i Gran Turismo / M Sport',
            series: 'THE BMW 3-SERIES (Sports Sedan Benchmark)',
            image: 'img/BMW3.png',
            tag: 'The Ultimate Driving Legend',
            hp: '255 HP / 400 Nm',
            acc: '5.4 sec (0-100 km/h)',
            topSpeed: '250 km/h',
            range: '2.0L BMW TwinPower Turbo',
            battery: 'Optimized Energy Recuperation',
            drivetrain: 'M Sport RWD / xDrive',
            price: 'From $44,500 / ₹60.6 Lakh',
            description: 'The benchmark of driving dynamics for over 45 years. Perfect 50:50 weight distribution, razor-sharp handling, and iconic kidney grille styling.'
        },
        'bmw-2': {
            name: 'BMW 2 Series Gran Coupé (F74)',
            series: 'THE BMW 2-SERIES (Compact Luxury Coupé)',
            image: 'img/BMW2.png',
            tag: 'Bold & Unconventional',
            hp: '241 HP / 300 Nm',
            acc: '6.0 sec (0-100 km/h)',
            topSpeed: '240 km/h',
            range: '2.0L TwinPower Turbo',
            battery: 'Twin-Scroll Turbo Petrol',
            drivetrain: 'Front-Wheel Drive / xDrive',
            price: 'From $38,400 / ₹43.9 Lakh',
            description: 'A compact four-door coupe with unmistakable presence, frameless doors, athletic shoulder lines, and BMW Operating System 9 with gaming & streaming.'
        },
        'bmw-z4': {
            name: 'BMW Z4 M40i Roadster',
            series: 'THE BMW Z4-SERIES (Open-Top Performance)',
            image: 'img/BMWZ4.png',
            tag: 'Pure Open-Air Thrill',
            hp: '382 HP / 500 Nm',
            acc: '3.9 sec (0-100 km/h)',
            topSpeed: '250 km/h',
            range: '3.0L BMW M TwinPower Turbo Inline 6',
            battery: 'Sport Exhaust Valve Control',
            drivetrain: 'Rear-Wheel Drive (6-Speed Manual / 8-Speed Sport Auto)',
            price: 'From $66,300 / ₹90.9 Lakh',
            description: 'Drop the soft-top roof in 10 seconds and hear the roar of the iconic inline-6 engine. Agile, lightweight, and tailored for pure driver connection.'
        },
        'bmw-i5': {
            name: 'BMW i5 eDrive40',
            series: 'THE BMW i-SERIES (Electric Business Sedan)',
            image: 'img/BMWi5.png',
            tag: 'Modern Business Electric',
            hp: '335 HP',
            acc: '5.7 sec (0-100 km/h)',
            topSpeed: '193 km/h',
            range: 'Up to 582 km (WLTP)',
            battery: '81.2 kWh Usable Capacity',
            drivetrain: 'Rear-Wheel Drive eDrive',
            price: 'From $66,800 / ₹1.19 Cr',
            description: 'Electrifying business class. Combines the elegance of the 5 Series with zero-emission electric prowess and cutting-edge digital infotainment.'
        },
        'bmw-i4': {
            name: 'BMW i4 M50 Gran Coupé',
            series: 'THE BMW i-SERIES (Electric Gran Coupé)',
            image: 'img/BMWi4.png',
            tag: 'First Electric M Model',
            hp: '536 HP / 795 Nm',
            acc: '3.7 sec (0-100 km/h)',
            topSpeed: '225 km/h',
            range: 'Up to 520 km (WLTP)',
            battery: '83.9 kWh Battery Pack',
            drivetrain: 'Dual Motor All-Wheel Drive',
            price: 'From $69,700 / ₹77.5 Lakh',
            description: 'The agility of a BMW 4 Series Coupé matched with dual electric motors delivering instant torque and M-tuned chassis dynamics.'
        },
        'bmw-xm': {
            name: 'BMW XM Label Red',
            series: 'THE BMW M-SERIES (High-Performance Hybrid)',
            image: 'img/BMWXM.png',
            tag: 'Most Powerful M Car Ever',
            hp: '738 HP / 1,000 Nm',
            acc: '3.7 sec (0-100 km/h)',
            topSpeed: '290 km/h',
            range: 'M HYBRID V8 Turbocharged',
            battery: '25.7 kWh Lithium Battery',
            drivetrain: 'M xDrive Intelligent AWD',
            price: 'From $185,000 / ₹2.60 Cr',
            description: 'The pinnacle of M performance. An extravagant hybrid SUV combining a thunderous twin-turbo V8 with an electric motor for unmatched sheer power.'
        },
        'bmw-8': {
            name: 'BMW M850i xDrive Coupé',
            series: 'THE BMW 8-SERIES (Luxury Grand Tourer)',
            image: 'img/BMW8.png',
            tag: 'The Gentleman’s Racer',
            hp: '523 HP / 750 Nm',
            acc: '3.7 sec (0-100 km/h)',
            topSpeed: '250 km/h',
            range: '4.4L BMW TwinPower Turbo V8',
            battery: 'High-Efficiency Direct Injection',
            drivetrain: 'xDrive AWD with Adaptive M Chassis',
            price: 'From $106,300 / ₹1.78 Cr',
            description: 'Unmatched grand touring refinement with handcrafted Merino leather, CraftedClarity glass gear shifter, and roaring twin-turbo V8 performance.'
        }
    };

    const specsModal = document.getElementById('specsModal');
    const specsModalContent = document.getElementById('specsModalContent');
    const closeSpecsModalBtn = document.getElementById('closeSpecsModal');

    document.querySelectorAll('.open-specs-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            const carKey = btn.getAttribute('data-car');
            const data = vehicleSpecsData[carKey];

            if (data && specsModal && specsModalContent) {
                specsModalContent.innerHTML = `
                    <div class="modal-car-header">
                        <span class="modal-car-series">${data.series}</span>
                        <h2 class="modal-car-title">${data.name}</h2>
                        <span class="badge badge-accent">${data.tag}</span>
                    </div>
                    <div class="modal-car-body">
                        <div class="modal-car-img-box">
                            <img src="${data.image}" alt="${data.name}" class="modal-car-img">
                            <div class="modal-price-tag">
                                <span>Estimated Starting Price:</span>
                                <strong>${data.price}</strong>
                            </div>
                        </div>
                        <div class="modal-car-specs-grid">
                            <div class="spec-tile">
                                <span class="spec-label">⚡ Max Power</span>
                                <span class="spec-val">${data.hp}</span>
                            </div>
                            <div class="spec-tile">
                                <span class="spec-label">⏱️ Acceleration</span>
                                <span class="spec-val">${data.acc}</span>
                            </div>
                            <div class="spec-tile">
                                <span class="spec-label">🚀 Top Speed</span>
                                <span class="spec-val">${data.topSpeed}</span>
                            </div>
                            <div class="spec-tile">
                                <span class="spec-label">🔋 Engine / Range</span>
                                <span class="spec-val">${data.range}</span>
                            </div>
                            <div class="spec-tile">
                                <span class="spec-label">⚙️ Drivetrain</span>
                                <span class="spec-val">${data.drivetrain}</span>
                            </div>
                            <div class="spec-tile">
                                <span class="spec-label">🔋 Battery / Tech</span>
                                <span class="spec-val">${data.battery}</span>
                            </div>
                        </div>
                    </div>
                    <div class="modal-car-desc">
                        <p>${data.description}</p>
                    </div>
                    <div class="modal-actions">
                        <button class="btn btn-primary" onclick="openBookingModalForCar('${data.name}')">Book Exclusive Test Drive</button>
                        <button class="btn btn-secondary" onclick="closeSpecsModalFunc()">Close</button>
                    </div>
                `;
                specsModal.classList.add('active');
                document.body.style.overflow = 'hidden';
            }
        });
    });

    window.closeSpecsModalFunc = function () {
        if (specsModal) {
            specsModal.classList.remove('active');
            document.body.style.overflow = '';
        }
    };

    if (closeSpecsModalBtn) {
        closeSpecsModalBtn.addEventListener('click', closeSpecsModalFunc);
    }

    if (specsModal) {
        specsModal.addEventListener('click', (e) => {
            if (e.target === specsModal) {
                closeSpecsModalFunc();
            }
        });
    }

    // =========================================================================
    // 5. TEST DRIVE & SERVICE BOOKING MODAL
    // =========================================================================
    const bookingModal = document.getElementById('bookingModal');
    const closeBookingModalBtn = document.getElementById('closeBookingModal');
    const bookingForm = document.getElementById('bookingForm');
    const bookingCarSelect = document.getElementById('bookingCarModel');

    window.openBookingModalForCar = function (carName = '') {
        closeSpecsModalFunc();
        if (bookingModal) {
            if (bookingCarSelect && carName) {
                let found = false;
                for (let i = 0; i < bookingCarSelect.options.length; i++) {
                    if (bookingCarSelect.options[i].text.includes(carName) || bookingCarSelect.options[i].value === carName) {
                        bookingCarSelect.selectedIndex = i;
                        found = true;
                        break;
                    }
                }
                if (!found && carName) {
                    const opt = new Option(carName, carName, true, true);
                    bookingCarSelect.add(opt);
                }
            }
            bookingModal.classList.add('active');
            document.body.style.overflow = 'hidden';
        }
    };

    document.querySelectorAll('.open-booking-modal').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            const preferredCar = btn.getAttribute('data-car') || '';
            window.openBookingModalForCar(preferredCar);
        });
    });

    window.closeBookingModalFunc = function () {
        if (bookingModal) {
            bookingModal.classList.remove('active');
            document.body.style.overflow = '';
        }
    };

    if (closeBookingModalBtn) {
        closeBookingModalBtn.addEventListener('click', closeBookingModalFunc);
    }

    if (bookingModal) {
        bookingModal.addEventListener('click', (e) => {
            if (e.target === bookingModal) {
                closeBookingModalFunc();
            }
        });
    }

    if (bookingForm) {
        bookingForm.addEventListener('submit', (e) => {
            e.preventDefault();

            const name = document.getElementById('bookingName')?.value.trim();
            const email = document.getElementById('bookingEmail')?.value.trim();
            const phone = document.getElementById('bookingPhone')?.value.trim();
            const model = document.getElementById('bookingCarModel')?.value;
            const date = document.getElementById('bookingDate')?.value;

            if (!name || !email || !phone || !date) {
                showToast('Please fill all required fields.', 'error');
                return;
            }

            const submitBtn = bookingForm.querySelector('button[type="submit"]');
            if (submitBtn) {
                submitBtn.innerHTML = 'Securing Booking...';
                submitBtn.disabled = true;
            }

            setTimeout(() => {
                if (submitBtn) {
                    submitBtn.innerHTML = 'Appointment Confirmed ✓';
                }
                showToast(`Congratulations ${name}! Your VIP appointment for ${model || 'BMW Experience'} on ${date} is confirmed. Our advisor will contact you at ${phone}.`, 'success', 6000);

                setTimeout(() => {
                    bookingForm.reset();
                    if (submitBtn) {
                        submitBtn.innerHTML = 'Confirm Appointment';
                        submitBtn.disabled = false;
                    }
                    closeBookingModalFunc();
                }, 1500);
            }, 1000);
        });
    }

    // =========================================================================
    // 6. CONTACT FORM HANDLER
    // =========================================================================
    const contactForm = document.getElementById('contactForm');
    if (contactForm) {
        contactForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const name = document.getElementById('contactName')?.value.trim();
            const email = document.getElementById('contactEmail')?.value.trim();
            const message = document.getElementById('contactMessage')?.value.trim();

            if (!name || !email || !message) {
                showToast('Please complete all required fields.', 'error');
                return;
            }

            const sendBtn = contactForm.querySelector('button[type="submit"]');
            if (sendBtn) {
                sendBtn.innerHTML = 'Sending Message...';
                sendBtn.disabled = true;
            }

            setTimeout(() => {
                showToast(`Thank you ${name}! Your inquiry has been sent to BMW Support. We will get back to you at ${email} shortly.`, 'success', 5000);
                contactForm.reset();
                if (sendBtn) {
                    sendBtn.innerHTML = 'Message Dispatched ✓';
                    setTimeout(() => {
                        sendBtn.innerHTML = 'Send Inquiry';
                        sendBtn.disabled = false;
                    }, 2000);
                }
            }, 800);
        });
    }

    // =========================================================================
    // 7. INTERACTIVE ACCORDION
    // =========================================================================
    document.querySelectorAll('.accordion-header').forEach(header => {
        header.addEventListener('click', () => {
            const item = header.parentElement;
            const isOpen = item.classList.contains('active');

            document.querySelectorAll('.accordion-item').forEach(i => i.classList.remove('active'));

            if (!isOpen) {
                item.classList.add('active');
            }
        });
    });

    // =========================================================================
    // 8. CUSTOM TOAST NOTIFICATIONS
    // =========================================================================
    function showToast(message, type = 'info', duration = 4000) {
        let toastContainer = document.getElementById('toastContainer');
        if (!toastContainer) {
            toastContainer = document.createElement('div');
            toastContainer.id = 'toastContainer';
            toastContainer.className = 'toast-container';
            document.body.appendChild(toastContainer);
        }

        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        
        const icon = type === 'success' ? '✓' : type === 'error' ? '⚠️' : 'ℹ️';
        toast.innerHTML = `
            <div class="toast-icon">${icon}</div>
            <div class="toast-message">${message}</div>
            <button class="toast-close" onclick="this.parentElement.remove()">&times;</button>
        `;

        toastContainer.appendChild(toast);

        setTimeout(() => toast.classList.add('show'), 10);

        setTimeout(() => {
            if (toast.parentElement) {
                toast.classList.remove('show');
                toast.classList.add('fade-out');
                setTimeout(() => toast.remove(), 300);
            }
        }, duration);
    }

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            closeSpecsModalFunc();
            closeBookingModalFunc();
        }
    });
});
