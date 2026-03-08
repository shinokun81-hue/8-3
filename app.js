// ==========================================
// FPS 3D Classroom cho ngày 8/3 - ITA22
// ==========================================

let camera, scene, renderer, controls;
let objects = []; // Những vật thể có thể va chạm (tường, bàn...)
let interactables = []; // Những thứ có thể click: thiệp, bảng, bản đồ, bằng khen
let raycaster;

// Di chuyển
let moveForward = false;
let moveBackward = false;
let moveLeft = false;
let moveRight = false;
let canJump = false;

let prevTime = performance.now();
const velocity = new THREE.Vector3();
const direction = new THREE.Vector3();

// Animations
let ceilingFans = [];
let wallFans = [];

// Helper cho Mobile
function isMobileView() {
    return window.innerWidth <= 950 || ('ontouchstart' in window) || navigator.maxTouchPoints > 0;
}

function lockControls() {
    if (isMobileView()) {
        document.getElementById('blocker').style.display = 'none';
        document.getElementById('crosshair').style.display = 'block';
        controls.isLocked = true;

        // Cố gắng bật Fullscreen tự động
        if (document.documentElement.requestFullscreen) {
            document.documentElement.requestFullscreen().catch(() => { });
        }
    } else {
        controls.lock();
    }
}

function unlockControls() {
    if (isMobileView()) {
        controls.isLocked = false;
        document.getElementById('crosshair').style.display = 'none';
    } else {
        controls.unlock();
    }
}

init();
animate();

// --- Tạo Textures chi tiết bằng Canvas để tránh tải file ---
function getWoodTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 256; canvas.height = 256;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = "#a87442";
    ctx.fillRect(0, 0, 256, 256);
    for (let i = 0; i < 100; i++) {
        ctx.fillStyle = `rgba(100,50,20,${Math.random() * 0.1})`;
        ctx.fillRect(0, Math.random() * 256, 256, Math.random() * 10 + 5);
    }
    const tex = new THREE.CanvasTexture(canvas);
    tex.wrapS = THREE.RepeatWrapping; tex.wrapT = THREE.RepeatWrapping;
    return tex;
}

function getBoardTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 512; canvas.height = 256;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = "#2c4532";
    ctx.fillRect(0, 0, 512, 256);
    for (let i = 0; i < 200; i++) {
        // Vết phấn mờ
        ctx.fillStyle = `rgba(255,255,255,${Math.random() * 0.02})`;
        ctx.fillRect(Math.random() * 512, Math.random() * 256, Math.random() * 50, 2);
    }
    return new THREE.CanvasTexture(canvas);
}

function getFloorTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 128; canvas.height = 128;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = "#e0dab8"; // Gạch men cũ
    ctx.fillRect(0, 0, 128, 128);
    ctx.strokeStyle = "#ccc";
    ctx.lineWidth = 2;
    ctx.strokeRect(0, 0, 128, 128);
    const tex = new THREE.CanvasTexture(canvas);
    tex.wrapS = THREE.RepeatWrapping; tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(15, 15);
    return tex;
}

function init() {
    // 1. Scene & Camera
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0xdcecf5);
    scene.fog = new THREE.Fog(0xdcecf5, 5, 40);

    camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.y = 1.6; // Mắt người

    // 2. Renderer
    renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: "high-performance" });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    document.getElementById('canvas-container').appendChild(renderer.domElement);

    // 3. PointerLockControls
    controls = new THREE.PointerLockControls(camera, document.body);

    const blocker = document.getElementById('blocker');
    const instructions = document.getElementById('instructions');

    instructions.addEventListener('click', function () {
        lockControls();
    });

    controls.addEventListener('lock', function () {
        blocker.style.display = 'none';
        document.getElementById('crosshair').style.display = 'block';
    });

    controls.addEventListener('unlock', function () {
        blocker.style.display = 'flex';
        document.getElementById('crosshair').style.display = 'none';
    });

    scene.add(controls.getObject());

    // Di chuyển = Keydown
    const onKeyDown = function (event) {
        switch (event.code) {
            case 'ArrowUp':
            case 'KeyW': moveForward = true; break;
            case 'ArrowLeft':
            case 'KeyA': moveLeft = true; break;
            case 'ArrowDown':
            case 'KeyS': moveBackward = true; break;
            case 'ArrowRight':
            case 'KeyD': moveRight = true; break;
            case 'Space': if (canJump === true) velocity.y += 30; canJump = false; break;
        }
    };
    const onKeyUp = function (event) {
        switch (event.code) {
            case 'ArrowUp':
            case 'KeyW': moveForward = false; break;
            case 'ArrowLeft':
            case 'KeyA': moveLeft = false; break;
            case 'ArrowDown':
            case 'KeyS': moveBackward = false; break;
            case 'ArrowRight':
            case 'KeyD': moveRight = false; break;
        }
    };
    document.addEventListener('keydown', onKeyDown);
    document.addEventListener('keyup', onKeyUp);
    // Click tương tác
    document.addEventListener('mousedown', onClick);

    // 4. Ánh sáng (Mô phỏng đèn neon trong lớp)
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xfff5e6, 0.6); // Ánh nắng từ cửa sổ
    dirLight.position.set(15, 10, -5);
    dirLight.castShadow = true;
    dirLight.shadow.mapSize.width = 2048;
    dirLight.shadow.mapSize.height = 2048;
    dirLight.shadow.camera.left = -20; dirLight.shadow.camera.right = 20;
    dirLight.shadow.camera.top = 20; dirLight.shadow.camera.bottom = -20;
    scene.add(dirLight);

    const neonLight1 = new THREE.PointLight(0xffffff, 0.5, 20);
    neonLight1.position.set(0, 3.8, -5);
    scene.add(neonLight1);
    const neonLight2 = new THREE.PointLight(0xffffff, 0.5, 20);
    neonLight2.position.set(0, 3.8, 5);
    scene.add(neonLight2);

    // ================= XÂY DỰNG PHÒNG HỌC =================
    // Kích thước phòng: Rộng 16m, Dài 22m, Cao 4m
    const wallMat = new THREE.MeshStandardMaterial({ color: 0xf4f4f4, roughness: 1 });
    const woodMat = new THREE.MeshStandardMaterial({ map: getWoodTexture(), roughness: 0.9 });
    const boardMat = new THREE.MeshStandardMaterial({ map: getBoardTexture(), roughness: 0.8 });

    // Sàn
    const floor = new THREE.Mesh(new THREE.PlaneGeometry(16, 22), new THREE.MeshStandardMaterial({ map: getFloorTexture(), roughness: 0.5 }));
    floor.rotation.x = -Math.PI / 2;
    floor.receiveShadow = true;
    scene.add(floor);
    objects.push(floor);

    // Tường
    const backWall = new THREE.Mesh(new THREE.BoxGeometry(16, 4, 1), wallMat); // Tường BẢN ĐỒ
    backWall.position.set(0, 2, 11.5);
    backWall.receiveShadow = true;
    scene.add(backWall); objects.push(backWall);

    const frontWall = new THREE.Mesh(new THREE.BoxGeometry(16, 4, 1), wallMat); // Tường BẢNG ĐEN
    frontWall.position.set(0, 2, -11.5);
    frontWall.receiveShadow = true;
    scene.add(frontWall); objects.push(frontWall);

    const leftWall = new THREE.Mesh(new THREE.BoxGeometry(1, 4, 22), wallMat);
    leftWall.position.set(-8.5, 2, 0);
    leftWall.receiveShadow = true;
    scene.add(leftWall); objects.push(leftWall);

    const rightWall = new THREE.Mesh(new THREE.BoxGeometry(1, 4, 22), wallMat); // Cửa sổ
    rightWall.position.set(8.5, 2, 0);
    rightWall.receiveShadow = true;
    scene.add(rightWall); objects.push(rightWall);

    // Cửa sổ & Rèm tường phải
    const curtainMat = new THREE.MeshStandardMaterial({ color: 0xc8b5a6, roughness: 1.0, side: THREE.DoubleSide });
    for (let i = -2; i <= 2; i++) {
        const windowPane = new THREE.Mesh(new THREE.PlaneGeometry(3, 1.8), new THREE.MeshStandardMaterial({ color: 0x87ceeb, transparent: true, opacity: 0.6 }));
        windowPane.rotation.y = -Math.PI / 2;
        windowPane.position.set(7.9, 1.8, i * 4);
        scene.add(windowPane);

        // Rèm vén 2 bên
        const curtainLeft = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.2, 2.5), curtainMat);
        curtainLeft.position.set(7.8, 1.8, i * 4 - 1.4);
        scene.add(curtainLeft);
        const curtainRight = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.2, 2.5), curtainMat);
        curtainRight.position.set(7.8, 1.8, i * 4 + 1.4);
        scene.add(curtainRight);
    }

    // Bảng đen (Phía trước: -z)
    const boardGroup = new THREE.Group();
    const boardPanel = new THREE.Mesh(new THREE.BoxGeometry(8, 2, 0.1), boardMat);
    boardPanel.position.set(0, 1.8, -10.9);
    boardPanel.castShadow = true;
    boardGroup.add(boardPanel);
    const boardFrame = new THREE.Mesh(new THREE.BoxGeometry(8.2, 2.2, 0.05), new THREE.MeshStandardMaterial({ color: 0xa0a0a0 }));
    boardFrame.position.set(0, 1.8, -10.95);
    boardGroup.add(boardFrame);

    boardPanel.userData = { type: 'special', title: 'Bảng Đen ITA22', desc: 'Nơi lưu giữ những bài giảng đau đầu và những hình vẽ bậy góc bảng của tụi mình.' };
    interactables.push(boardPanel);
    scene.add(boardGroup);

    // Cờ đỏ / Banner trên bảng
    const bannerCanvas = document.createElement('canvas'); bannerCanvas.width = 1024; bannerCanvas.height = 256;
    const bCtx = bannerCanvas.getContext('2d');
    bCtx.fillStyle = "#c9184a"; bCtx.fillRect(0, 0, 1024, 256);
    bCtx.fillStyle = "#ffd700"; bCtx.font = "bold 130px sans-serif"; bCtx.textAlign = "center";
    bCtx.fillText("CHÚC MỪNG 8/3 - ITA22", 512, 170);
    const bannerMat = new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(bannerCanvas) });
    const banner = new THREE.Mesh(new THREE.PlaneGeometry(6, 0.8), bannerMat);
    banner.position.set(0, 3.3, -10.9);
    scene.add(banner);

    // Bản đồ (Tường gạch cuối: +z)
    const mapCanvas = document.createElement('canvas'); mapCanvas.width = 512; mapCanvas.height = 300;
    const mCtx = mapCanvas.getContext('2d');
    mCtx.fillStyle = "#87ceeb"; mCtx.fillRect(0, 0, 512, 300);
    mCtx.fillStyle = "#228b22"; mCtx.beginPath(); mCtx.arc(200, 100, 60, 0, 2 * Math.PI); mCtx.arc(350, 150, 80, 0, 2 * Math.PI); mCtx.fill(); // Đảo fake
    const mapTexMat = new THREE.MeshStandardMaterial({ map: new THREE.CanvasTexture(mapCanvas) });

    const worldMap = new THREE.Mesh(new THREE.BoxGeometry(4, 2.5, 0.1), mapTexMat);
    worldMap.position.set(0, 2, 10.9);
    worldMap.userData = { type: 'special', title: 'Bản Đồ Thế Giới', desc: 'Bay thật cao, đi thật xa trên bản đồ thế giới này, các cô gái ITA22 nhé! 🌍' };
    scene.add(worldMap); interactables.push(worldMap);

    // Bằng khen (Tường trái: -x)
    for (let i = 0; i < 3; i++) {
        const cx = document.createElement('canvas'); cx.width = 200; cx.height = 250;
        const cCtx = cx.getContext('2d');
        cCtx.fillStyle = "#fff"; cCtx.fillRect(0, 0, 200, 250);
        cCtx.strokeStyle = "#d4af37"; cCtx.lineWidth = 10; cCtx.strokeRect(5, 5, 190, 240);
        cCtx.fillStyle = "#d4af37"; cCtx.font = "bold 20px serif"; cCtx.fillText("GIẤY KHEN", 45, 60);
        const ctMat = new THREE.MeshStandardMaterial({ map: new THREE.CanvasTexture(cx) });

        const cert = new THREE.Mesh(new THREE.PlaneGeometry(1, 1.2), ctMat);
        cert.position.set(-7.9, 2.2, -6 + i * 1.5);
        cert.rotation.y = Math.PI / 2;
        cert.userData = { type: 'special', title: `Bằng Khen số ${i + 1}`, desc: 'Chứng nhận các bạn nữ lớp mình luôn xinh đẹp và tài năng xuất chúng. 👏' };
        scene.add(cert); interactables.push(cert);
    }

    // Bàn giáo viên & Album Ảnh
    const tDesk = new THREE.Mesh(new THREE.BoxGeometry(2.5, 0.8, 1.2), woodMat);
    tDesk.position.set(-2.5, 0.4, -8);
    tDesk.castShadow = true; tDesk.receiveShadow = true;
    scene.add(tDesk); objects.push(tDesk);

    const album = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.05, 0.4), new THREE.MeshStandardMaterial({ color: 0xff0a54 }));
    album.position.set(-2, 0.8 + 0.025, -8);
    album.rotation.y = 0.3;
    album.userData = { type: 'special', title: 'Album Kỷ Niệm', desc: 'Cuốn album lưu giữ hàng tá bí mật và những nụ cười tỏa nắng của hội chị em. 📸' };
    scene.add(album); interactables.push(album);

    // ================= CHẾ TẠO QUẠT TRẦN & TREO TƯỜNG =================
    // 4 Quạt trần
    const gltfLoader = typeof THREE.GLTFLoader !== 'undefined' ? new THREE.GLTFLoader() : null;

    function buildFallbackFan(x, z) {
        const ceilingFanMat = new THREE.MeshStandardMaterial({ color: 0xffffff });
        const bladeMat = new THREE.MeshStandardMaterial({ color: 0x333333 });
        const fanGroup = new THREE.Group();
        const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 0.8), ceilingFanMat);
        pole.position.y = 3.6; fanGroup.add(pole);
        const center = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.3, 0.2), ceilingFanMat);
        center.position.y = 3.2; fanGroup.add(center);

        // Cánh quạt
        const rotObj = new THREE.Group(); rotObj.position.y = 3.2;
        for (let b = 0; b < 3; b++) {
            const blade = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.02, 0.2), bladeMat);
            blade.position.set(0.9, 0, 0);
            const bladePivot = new THREE.Group();
            bladePivot.rotation.y = (Math.PI * 2 / 3) * b;
            bladePivot.add(blade);
            rotObj.add(bladePivot);
        }
        fanGroup.add(rotObj);
        fanGroup.position.set(x, 0, z);
        scene.add(fanGroup);
        ceilingFans.push(rotObj);
    }

    for (let x of [-5.5, 5.5]) {
        for (let z of [-5, 4]) {
            if (gltfLoader) {
                gltfLoader.load(
                    'models/ceiling_fan.glb',
                    function (gltf) {
                        // 1. Phải Dùng .clone() để 4 Quạt không bị Three.js gộp chung thành một vật thẻ di chuyển qua lại
                        const fan = gltf.scene.clone();

                        // 2. Tính Tỷ lệ Zoom (Scale) tự động để Sải Cánh đúng 3.5 mét.
                        const box = new THREE.Box3().setFromObject(fan);
                        const size = box.getSize(new THREE.Vector3());
                        const maxDim = Math.max(size.x, size.z, 0.001);
                        const scaleFactor = 3.5 / maxDim;
                        fan.scale.set(scaleFactor, scaleFactor, scaleFactor);

                        // Lưu ý: KHÔNG chỉnh tâm fan.position qua centerBox nữa, bản thân Quạt đã ở origin
                        // Điều này ngăn chặn việc Quạt bị văng quỹ đạo quay ngáo.

                        // 3. Treo Quạt lên trần
                        const wrapper = new THREE.Group();
                        wrapper.position.set(x, 3.8, z);
                        wrapper.add(fan);
                        scene.add(wrapper);

                        // 4. Giải thuật Tìm Rô-tơ Cánh Quạt Thông Minh (Để giữ Chân Đế không quay)
                        let widestMesh = null;
                        let maxSpan = 0;
                        fan.traverse((child) => {
                            if (child.isMesh) {
                                // Đo độ sải cánh của từng mảnh vật thật (Mesh)
                                const childBox = new THREE.Box3().setFromObject(child);
                                const childSize = childBox.getSize(new THREE.Vector3());
                                const span = Math.max(childSize.x, childSize.z);
                                if (span > maxSpan) {
                                    maxSpan = span;
                                    widestMesh = child; // Ai sải tay rộng nhất -> Người đó là Cánh quạt
                                }
                            }
                        });

                        // 5. Xác định cụm Trục Xoay
                        let partToRotate = widestMesh;
                        if (partToRotate) {
                            // Lùi nhánh lên Group cao nhất nhưng cấm đụng tới vỏ ngoài (chứa chân đế)
                            // Tránh việc trục Y bị quay nhầm nếu model xuất Blender lộn.
                            while (partToRotate.parent &&
                                partToRotate.parent.type !== 'Scene' &&
                                partToRotate.parent.name !== 'GLTF_SceneRootNode' &&
                                partToRotate.parent !== fan) {
                                partToRotate = partToRotate.parent;
                            }
                            ceilingFans.push(partToRotate);
                        } else {
                            // Fallback
                            ceilingFans.push(fan);
                        }
                    },
                    undefined,
                    function (error) {
                        buildFallbackFan(x, z);
                    }
                );
            } else {
                buildFallbackFan(x, z);
            }
        }
    }

    // Quạt treo tường (Wall fans)
    const wallFanMat = new THREE.MeshStandardMaterial({ color: 0x444444 }); // Lồng sắt
    const wallBladeMat = new THREE.MeshStandardMaterial({ color: 0xff7f2a }); // Cánh cam đặc trưng
    for (let z of [-4, 2, 8]) {
        const wFanGroup = new THREE.Group();
        const base = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.4, 0.2), wallFanMat);
        wFanGroup.add(base);

        const head = new THREE.Group();
        head.position.set(0.15, 0, 0); head.rotation.z = -0.3; // Chúc xuống

        const rotBlade = new THREE.Group();
        for (let b = 0; b < 5; b++) { // 5 cánh
            const bl = new THREE.Mesh(new THREE.BoxGeometry(0.01, 0.8, 0.15), wallBladeMat);
            bl.position.set(0, 0.4, 0);
            const pv = new THREE.Group(); pv.rotation.x = (Math.PI * 2 / 5) * b;
            pv.add(bl); rotBlade.add(pv);
        }
        head.add(rotBlade);

        const grill = new THREE.Mesh(new THREE.SphereGeometry(0.5, 8, 8, 0, Math.PI), new THREE.MeshBasicMaterial({ color: 0x888888, wireframe: true }));
        grill.rotation.y = Math.PI / 2;
        head.add(grill);

        wFanGroup.add(head);
        wFanGroup.position.set(-7.8, 2.5, z);
        scene.add(wFanGroup);
        wallFans.push({ rotObj: rotBlade, group: head });
    }

    // ================= TẠO BÀN HỌC & THIỆP =================
    // Dãy: 4 dãy. Hàng: 5 hàng.
    const gapX = 3.5; const gapZ = 3.0;
    const startX = -5.25; const startZ = -4;

    let studentIdCounter = 1;

    // Card geometry & material
    const cardGeo = new THREE.PlaneGeometry(0.4, 0.6);
    const cardMat = new THREE.MeshBasicMaterial({ color: 0xffadc0, side: THREE.DoubleSide });

    for (let row = 0; row < 5; row++) {
        for (let col = 0; col < 4; col++) {
            const cx = startX + col * gapX;
            const cz = startZ + row * gapZ;

            // Mặt Bàn 
            const dTop = new THREE.Mesh(new THREE.BoxGeometry(2.2, 0.05, 0.8), woodMat);
            dTop.position.set(cx, 0.75, cz); dTop.castShadow = true; dTop.receiveShadow = true; scene.add(dTop); objects.push(dTop);

            // Ngăn bàn
            const dShelf = new THREE.Mesh(new THREE.BoxGeometry(2.1, 0.02, 0.7), woodMat);
            dShelf.position.set(cx, 0.6, cz); dShelf.castShadow = true; scene.add(dShelf);
            const legGeo = new THREE.BoxGeometry(0.05, 0.75, 0.05); const legMat = new THREE.MeshStandardMaterial({ color: 0x222222 });
            [[-1, -0.3], [1, -0.3], [-1, 0.3], [1, 0.3]].forEach(lp => {
                const leg = new THREE.Mesh(legGeo, legMat); leg.position.set(cx + lp[0], 0.375, cz + lp[1]); scene.add(leg);
            });

            // 2 Ghế
            [[-0.6, 0.7], [0.6, 0.7]].forEach(sp => {
                const sx = cx + sp[0]; const sz = cz + sp[1];
                const seat = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.05, 0.5), woodMat);
                seat.position.set(sx, 0.45, sz); seat.castShadow = true; seat.receiveShadow = true; scene.add(seat); objects.push(seat);

                const sback = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.3, 0.05), woodMat);
                sback.position.set(sx, 0.75, sz + 0.25); scene.add(sback);

                [[-0.2, -0.2], [0.2, -0.2], [-0.2, 0.2], [0.2, 0.2]].forEach(sl => {
                    const l = new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.45, 0.03), legMat); l.position.set(sx + sl[0], 0.225, sz + sl[1]); scene.add(l);
                });
            });

            // Thiệp đặt trên bàn (Tối đa 2 thiệp chia mỗi bàn)
            let cardsHere = 2;
            if (studentIdCounter > 34) cardsHere = 0;
            if (studentIdCounter === 34 && cardsHere === 2) cardsHere = 1;

            for (let c = 0; c < cardsHere; c++) {
                if (studentIdCounter > 34) break;
                const card = new THREE.Mesh(cardGeo, cardMat);
                card.rotation.x = -Math.PI / 2;

                const offset = cardsHere === 1 ? 0 : (c === 0 ? -0.5 : 0.5);
                card.position.set(cx + offset, 0.78, cz - 0.1);

                // Viền phát sáng nhẹ
                const glowEdge = new THREE.LineSegments(
                    new THREE.EdgesGeometry(cardGeo),
                    new THREE.LineBasicMaterial({ color: 0xff0a54, linewidth: 2 })
                );
                card.add(glowEdge);

                card.userData = { type: 'student', studentId: studentIdCounter };
                scene.add(card);
                interactables.push(card);
                studentIdCounter++;
            }
        }
    }

    // Raycaster Crosshair
    raycaster = new THREE.Raycaster();

    window.addEventListener('resize', onWindowResize);
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

// Xử lý di chuyển
function animate() {
    requestAnimationFrame(animate);

    const time = performance.now();

    if (controls.isLocked === true) {
        // ----- Di chuyển Vật lý -----
        let delta = (time - prevTime) / 1000;
        if (delta > 0.1) delta = 0.1; // Chống drop frame gây lỗi physic xuyên tường

        velocity.x -= velocity.x * 10.0 * delta;
        velocity.z -= velocity.z * 10.0 * delta;
        velocity.y -= 9.8 * 8.0 * delta; // Trọng lực

        direction.z = Number(moveForward) - Number(moveBackward);
        direction.x = Number(moveRight) - Number(moveLeft);
        direction.normalize(); // Ensure consistent movement in all directions

        if (moveForward || moveBackward) velocity.z -= direction.z * 50.0 * delta;
        if (moveLeft || moveRight) velocity.x -= direction.x * 50.0 * delta;

        const oldPos = controls.getObject().position.clone();

        // TÍNH TOÁN VECTOR DI CHUYỂN TOÀN CỤC SAO CHO KHÔNG BỊ TRƯỢT XUYÊN GÓC TƯỜNG
        const lateralVec = new THREE.Vector3();
        lateralVec.setFromMatrixColumn(camera.matrix, 0); // Vector hướng phải
        lateralVec.y = 0; lateralVec.normalize();

        const forwardVec = new THREE.Vector3();
        forwardVec.setFromMatrixColumn(camera.matrix, 0);
        forwardVec.crossVectors(camera.up, forwardVec); // Vector hướng tới
        forwardVec.y = 0; forwardVec.normalize();

        const displacement = new THREE.Vector3();
        displacement.addScaledVector(lateralVec, -velocity.x * delta);
        displacement.addScaledVector(forwardVec, -velocity.z * delta);

        const pos = controls.getObject().position;
        const oldX = pos.x;
        const oldZ = pos.z;

        // Di chuyển trục X và kiểm tra va chạm ĐỘC LẬP
        pos.x += displacement.x;
        if (checkCollision(pos)) {
            pos.x = oldX; // Phục hồi X nếu đâm tường X
        }

        // Di chuyển trục Z và kiểm tra va chạm ĐỘC LẬP
        pos.z += displacement.z;
        if (checkCollision(pos)) {
            pos.z = oldZ; // Phục hồi Z nếu đâm tường Z
        }

        controls.getObject().position.y += (velocity.y * delta); // Jump

        if (controls.getObject().position.y < 1.6) {
            velocity.y = 0;
            controls.getObject().position.y = 1.6;
            canJump = true;
        }

        // Chặn tường cơ bản (Dài 22m, Rộng 16m -> Tọa độ ranh giới: z: -11 đến +11, x: -8 đến +8)
        if (pos.x < -7.5) pos.x = -7.5;
        if (pos.x > 7.5) pos.x = 7.5;
        if (pos.z < -10.5) pos.z = -10.5;
        if (pos.z > 10.5) pos.z = 10.5;

        // ----- Raycaster Crosshair / Hover ngắm bắn (CHỈ DÀNH CHO MÁY TÍNH) -----
        if (!isMobileView()) {
            raycaster.setFromCamera(new THREE.Vector2(0, 0), camera);
            const intersects = raycaster.intersectObjects(interactables);
            const tooltip = document.getElementById('tooltip');
            const crosshair = document.getElementById('crosshair');

            if (intersects.length > 0 && intersects[0].distance < 4) { // Chỉ tương tác nếu đứng đủ gần (< 4m)
                const obj = intersects[0].object;
                crosshair.classList.add('active');
                tooltip.style.opacity = 1;
                if (obj.userData.type === 'student') {
                    tooltip.innerHTML = `[Click] Thư giãn 8/3<br>Học sinh ${obj.userData.studentId}`;
                    // Animation nhảy nhẹ
                    obj.position.y = 0.78 + 0.03 + Math.sin(time / 200) * 0.03;
                } else {
                    tooltip.innerHTML = `[Click] Xem: ${obj.userData.title}`;
                }
            } else {
                crosshair.classList.remove('active');
                tooltip.style.opacity = 0;
                // Trả thiệp về vị trí cũ (Hơi nặng chút nhưng an toàn)
                interactables.forEach(obj => {
                    if (obj.userData.type === 'student') obj.position.y = 0.78;
                });
            }
        }
    }

    // Hoạt cảnh quạt trần 
    ceilingFans.forEach(fan => fan.rotation.y -= 0.1);

    // Hoạt cảnh quạt treo tường (xoay cánh và xoay cổ gật gù)
    wallFans.forEach((f, idx) => {
        f.rotObj.rotation.x -= 0.3; // Cánh tua pin
        f.group.rotation.y = Math.sin(time / 1000 + idx) * 0.4; // Đảo cổ quạt trái phải
    });

    prevTime = time;
    renderer.render(scene, camera);
}

// Hàm chung xử lý mở Đồ vật
async function handleInteract(obj) {
    const data = obj.userData;
    if (data.type === 'special') {
        document.getElementById('item-title').innerText = data.title;
        document.getElementById('item-desc').innerText = data.desc;
        document.getElementById('item-overlay').style.display = 'flex';
        unlockControls();
    }
    else if (data.type === 'student') {
        const num = data.studentId;
        // Báo hiệu đang tải nếu click trên PC
        if (!isMobileView()) document.getElementById('tooltip').innerText = '⏳ Đang tải...';

        try {
            const student = await loadStudentById(num);
            const photoEl = document.getElementById('card-photo');
            photoEl.src = student.photoURL || 'photos/default.jpg';
            photoEl.onerror = function () { this.src = 'photos/default.jpg'; };

            document.getElementById('card-name').textContent = student.name;
            document.getElementById('card-id').textContent = `(${String(num).padStart(2, '0')})`;
            const DEFAULT_MSG = `Mời bạn đến với buổi vui chơi chào nhân dịp Ngày Quốc tế phụ nữ của ITA22 nhé! 🌸\n\nChúc bạn luôn xinh đẹp, hạnh phúc và rạng rỡ! 💐`;
            document.getElementById('card-msg').innerHTML = (student.message || DEFAULT_MSG).replace(/\n/g, '<br/>');

            document.getElementById('screen-card').style.display = 'flex';
            unlockControls();
        } catch (e) {
            alert("Lỗi tải thiệp. Thử lại sau!");
        }
    }
}

// Xử lý Click (Trên PC) -> Lấy vật đang bị ngắm giữa màn hình
async function onClick() {
    if (!controls.isLocked || isMobileView()) return; // Mobile dùng Tap riêng
    raycaster.setFromCamera(new THREE.Vector2(0, 0), camera);
    const intersects = raycaster.intersectObjects(interactables);
    if (intersects.length > 0 && intersects[0].distance < 4) {
        handleInteract(intersects[0].object);
    }
}

// GUI Đóng
function closeItemOverlay() {
    document.getElementById('item-overlay').style.display = 'none';
    lockControls(); // Khoá lại để chơi tiếp
}
function closeStudentCard() {
    document.getElementById('screen-card').style.display = 'none';
    lockControls();
}

// MOBILE CONTROLS (4 Nút bấm & Touch Look/Tap)
let touchX = 0, touchY = 0;

function setupMobileControls() {
    const isMobile = window.innerWidth <= 950 || ('ontouchstart' in window) || navigator.maxTouchPoints > 0;
    if (!isMobile) return;

    // 1. 4 nút WASD
    ['w', 'a', 's', 'd'].forEach(k => {
        const btn = document.getElementById('btn-' + k);
        if (btn) {
            btn.addEventListener('touchstart', (e) => { e.preventDefault(); triggerKey(k, true); });
            btn.addEventListener('touchend', (e) => { e.preventDefault(); triggerKey(k, false); });
        }
    });

    // 2. Vùng Lookzone
    const lookZone = document.getElementById('mobile-look');
    let lookTouchId = null;
    let tapStartX = 0, tapStartY = 0; // Để phân biệt Vuốt và Chạm (Tap)

    lookZone.addEventListener('touchstart', e => {
        for (let i = 0; i < e.changedTouches.length; i++) {
            if (lookTouchId === null) {
                lookTouchId = e.changedTouches[i].identifier;
                touchX = tapStartX = e.changedTouches[i].pageX;
                touchY = tapStartY = e.changedTouches[i].pageY;
                if (!controls.isLocked) document.getElementById('instructions').click(); // Ép kích hoạt Lock trên Mobile
                break;
            }
        }
    }, { passive: false });

    lookZone.addEventListener('touchmove', e => {
        e.preventDefault();
        for (let i = 0; i < e.changedTouches.length; i++) {
            if (e.changedTouches[i].identifier === lookTouchId) {
                const deltaX = e.changedTouches[i].pageX - touchX;
                const deltaY = e.changedTouches[i].pageY - touchY;
                touchX = e.changedTouches[i].pageX;
                touchY = e.changedTouches[i].pageY;

                const euler = new THREE.Euler(0, 0, 0, 'YXZ');
                euler.setFromQuaternion(camera.quaternion);

                euler.y -= deltaX * 0.005;
                euler.x -= deltaY * 0.005;

                const PI_2 = Math.PI / 2;
                euler.x = Math.max(-PI_2, Math.min(PI_2, euler.x));

                camera.quaternion.setFromEuler(euler);
                break;
            }
        }
    }, { passive: false });

    const endLook = e => {
        for (let i = 0; i < e.changedTouches.length; i++) {
            if (e.changedTouches[i].identifier === lookTouchId) {
                const tapEndX = e.changedTouches[i].pageX;
                const tapEndY = e.changedTouches[i].pageY;
                lookTouchId = null;

                // Nếu ngón tay dời đi rất ít (< 20px) -> Được coi là 1 CÚ TAP ĐỂ MỞ VẬT PHẨM
                if (Math.abs(tapEndX - tapStartX) < 20 && Math.abs(tapEndY - tapStartY) < 20 && controls.isLocked) {
                    const pointer = new THREE.Vector2();
                    pointer.x = (tapEndX / window.innerWidth) * 2 - 1;
                    pointer.y = -(tapEndY / window.innerHeight) * 2 + 1;
                    raycaster.setFromCamera(pointer, camera);
                    const intersects = raycaster.intersectObjects(interactables);

                    // Điện thoại cho phép chạm xa hơn một chút (khoảng 6m)
                    if (intersects.length > 0 && intersects[0].distance < 6) {
                        handleInteract(intersects[0].object);
                    }
                }
                break;
            }
        }
    };
    lookZone.addEventListener('touchend', endLook);
    lookZone.addEventListener('touchcancel', endLook);
}

function triggerKey(key, isDown) {
    if (key === 'w') moveForward = isDown;
    if (key === 's') moveBackward = isDown;
    if (key === 'a') moveLeft = isDown;
    if (key === 'd') moveRight = isDown;
}

window.addEventListener('load', setupMobileControls);

// Check va chạm Box3 cho nhân vật
function checkCollision(pos) {
    const playerRadius = 0.3;
    const playerBox = new THREE.Box3(
        new THREE.Vector3(pos.x - playerRadius, pos.y - 1.5, pos.z - playerRadius),
        new THREE.Vector3(pos.x + playerRadius, pos.y + 0.1, pos.z + playerRadius)
    );
    for (let obj of objects) {
        if (!obj.geometry) continue;
        if (!obj.userData.boundingBox) {
            obj.geometry.computeBoundingBox();
            obj.userData.boundingBox = new THREE.Box3();
        }
        obj.userData.boundingBox.copy(obj.geometry.boundingBox).applyMatrix4(obj.matrixWorld);

        // Bỏ qua sàn nhà
        if (obj.userData.boundingBox.max.y <= 0.1) continue;

        if (playerBox.intersectsBox(obj.userData.boundingBox)) {
            return true;
        }
    }
    return false;
}
