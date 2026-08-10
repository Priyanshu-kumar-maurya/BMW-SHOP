/**
 * BMW SHOP - Real 3D Automotive Studio & Interactive Systems
 * Powered by Google Model-Viewer (GLTF/GLB Engine) & Modern Web APIs
 */

document.addEventListener('DOMContentLoaded', () => {
    // =========================================================================
    // 1. REAL 3D AUTOMOTIVE STUDIO ENGINE (Google Model-Viewer)
    // =========================================================================
    const modelViewer = document.getElementById('realBmwModelViewer');
    const heroTitle = document.getElementById('heroActiveModelTitle');
    const heroTag = document.getElementById('heroActiveModelTag');
    const activePaintLabel = document.getElementById('activePaintName');
    const toggleOrbitBtn = document.getElementById('toggleReal3DOrbitBtn');

    if (modelViewer) {
        // 1. Real 3D Model Switcher
        document.querySelectorAll('.real-3d-model-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('.real-3d-model-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');

                const modelSrc = btn.getAttribute('data-src');
                const modelName = btn.getAttribute('data-name');
                const modelTag = btn.getAttribute('data-tag');

                if (modelSrc) {
                    modelViewer.src = modelSrc;
                }
                if (heroTitle && modelName) {
                    heroTitle.textContent = modelName;
                }
                if (heroTag && modelTag) {
                    heroTag.textContent = modelTag;
                }
            });
        });

        // 2. Real 3D Material Metallic Paint Color Customizer
        document.querySelectorAll('.real-paint-swatch').forEach(swatch => {
            swatch.addEventListener('click', () => {
                document.querySelectorAll('.real-paint-swatch').forEach(s => s.classList.remove('active'));
                swatch.classList.add('active');

                const hexColor = swatch.getAttribute('data-color');
                const colorName = swatch.getAttribute('data-name');

                if (activePaintLabel && colorName) {
                    activePaintLabel.textContent = colorName;
                    activePaintLabel.style.color = hexColor;
                }

                // Apply color to 3D model materials
                if (modelViewer.model && modelViewer.model.materials) {
                    const materials = modelViewer.model.materials;
                    materials.forEach(material => {
                        const matName = material.name ? material.name.toLowerCase() : '';
                        // Target car body paint or main metallic surfaces
                        if (matName.includes('body') || matName.includes('car_body') || matName.includes('paint') || matName.includes('exterior') || matName.includes('red') || matName.includes('color')) {
                            material.pbrMetallicRoughness.setBaseColorFactor(hexToRgba(hexColor));
                        }
                    });
                }
            });
        });

        // Helper to convert hex to RGBA for Model-Viewer PBR
        function hexToRgba(hex) {
            let c = hex.replace('#', '');
            if (c.length === 3) c = c.split('').map(x => x + x).join('');
            const num = parseInt(c, 16);
            return [
                ((num >> 16) & 255) / 255,
                ((num >> 8) & 255) / 255,
                (num & 255) / 255,
                1.0
            ];
        }

        // When 3D model loads, apply initial metallic clearcoat
        modelViewer.addEventListener('load', () => {
            const activeSwatch = document.querySelector('.real-paint-swatch.active');
            if (activeSwatch) {
                const hexColor = activeSwatch.getAttribute('data-color');
                if (modelViewer.model && modelViewer.model.materials) {
                    modelViewer.model.materials.forEach(material => {
                        const matName = material.name ? material.name.toLowerCase() : '';
                        if (matName.includes('body') || matName.includes('car_body') || matName.includes('paint') || matName.includes('red') || matName.includes('exterior')) {
                            material.pbrMetallicRoughness.setBaseColorFactor(hexToRgba(hexColor));
                        }
                    });
                }
            }
        });

        // 3. Camera Angle Presets
        document.querySelectorAll('.camera-angle-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('.camera-angle-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');

                const orbit = btn.getAttribute('data-orbit');
                if (orbit && modelViewer) {
                    modelViewer.cameraOrbit = orbit;
                }
            });
        });

        // 4. Auto-Rotate Toggle Button
        if (toggleOrbitBtn) {
            toggleOrbitBtn.addEventListener('click', () => {
                const isRotating = modelViewer.hasAttribute('auto-rotate');
                if (isRotating) {
                    modelViewer.removeAttribute('auto-rotate');
                    toggleOrbitBtn.classList.remove('active');
                    toggleOrbitBtn.innerHTML = '⏸️ Auto-Rotate [PAUSED]';
                } else {
                    modelViewer.setAttribute('auto-rotate', '');
                    toggleOrbitBtn.classList.add('active');
                    toggleOrbitBtn.innerHTML = '🔄 Auto-Rotate [ON]';
                }
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
