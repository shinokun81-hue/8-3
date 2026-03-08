// Logic cho Không gian phòng học 3D - Three.js

let scene, camera, renderer, controls;
let raycaster, mouse;
let interactableObjects = []; // Mảng chứa các vật có thể click
let currentHovered = null;

// Khởi tạo
init3D();

function init3D() {
    const container = document.getElementById('canvas-container');

    // 1. Scene & Camera
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0xdcecf5); // Màu tường phòng sáng nhẹ
    scene.fog = new THREE.Fog(0xdcecf5, 10, 50);

    camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(0, 5, 12); // Nhìn từ trên cao chéo xuống

    // 2. Renderer
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    container.appendChild(renderer.domElement);

    // 3. Controls (OrbitControls cho phép xoay, kéo, zoom)
    controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.maxPolarAngle = Math.PI / 2 - 0.05; // Ko cho cuộn úp mặt xuống đất
    controls.minDistance = 2;
    controls.maxDistance = 20;

    // 4. Ánh sáng
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xffeedd, 0.8);
    dirLight.position.set(10, 20, 10);
    dirLight.castShadow = true;
    dirLight.shadow.camera.top = 20;
    dirLight.shadow.camera.bottom = - 20;
    dirLight.shadow.camera.left = - 20;
    dirLight.shadow.camera.right = 20;
    scene.add(dirLight);

    // Ánh sáng phụ cho căn phòng trông sinh động hơn
    const pointLight = new THREE.PointLight(0xffddaa, 0.5, 30);
    pointLight.position.set(0, 8, 0);
    scene.add(pointLight);

    // ============================================
    // XÂY DỰNG MÔ HÌNH PHÒNG HỌC
    // ============================================

    // Nền nhà
    const floorGeo = new THREE.PlaneGeometry(30, 30);
    const floorMat = new THREE.MeshStandardMaterial({ color: 0xcab599, roughness: 0.8 }); // Màu gỗ/gạch
    const floor = new THREE.Mesh(floorGeo, floorMat);
    floor.rotation.x = -Math.PI / 2;
    floor.receiveShadow = true;
    scene.add(floor);

    // Các bức tường
    const wallMat = new THREE.MeshStandardMaterial({ color: 0xefefef, roughness: 1 });
    const backWall = new THREE.Mesh(new THREE.BoxGeometry(30, 10, 1), wallMat);
    backWall.position.set(0, 5, -15.5);
    backWall.receiveShadow = true;
    scene.add(backWall);

    const leftWall = new THREE.Mesh(new THREE.BoxGeometry(1, 10, 30), wallMat);
    leftWall.position.set(-15.5, 5, 0);
    leftWall.receiveShadow = true;
    scene.add(leftWall);

    const rightWall = new THREE.Mesh(new THREE.BoxGeometry(1, 10, 30), wallMat);
    rightWall.position.set(15.5, 5, 0);
    rightWall.receiveShadow = true;
    scene.add(rightWall);

    // Bảng đen ở back wall
    const boardMat = new THREE.MeshStandardMaterial({ color: 0x24422e }); // Xanh rêu
    const board = new THREE.Mesh(new THREE.BoxGeometry(12, 4, 0.2), boardMat);
    board.position.set(0, 4, -14.9);
    scene.add(board);

    // Bản đồ thế giới (Tường bên trái)
    const mapMat = new THREE.MeshStandardMaterial({ color: 0x5dade2 }); // Đại diện bản đồ
    const mapMesh = new THREE.Mesh(new THREE.BoxGeometry(0.2, 3, 5), mapMat);
    mapMesh.position.set(-14.9, 5, -2);
    mapMesh.userData = {
        type: 'special',
        title: 'Bản Đồ Thế Giới',
        desc: 'Bản đồ đánh dấu những vùng đất chúng ta đã cùng nhau khám phá. Chúc cậu ngày 8/3 luôn đi đến vinh quang!'
    };
    scene.add(mapMesh);
    interactableObjects.push(mapMesh);

    // Bằng khen (Tường bên phải)
    const certGroup = new THREE.Group();
    for (let i = 0; i < 3; i++) {
        const certMat = new THREE.MeshStandardMaterial({ color: 0xfad7a1 }); // Viền vàng/gỗ
        const cert = new THREE.Mesh(new THREE.BoxGeometry(0.2, 1.2, 0.8), certMat);
        cert.position.set(14.9, 5, -4 + i * 1.5);
        cert.userData = {
            type: 'special',
            title: 'Các Bằng Khen của Lớp',
            desc: 'Giấy khen minh chứng cho những nỗ lực và sự xinh đẹp, tài năng của toàn thể chị em ITA22! 🥇🌺'
        };
        certGroup.add(cert);
        interactableObjects.push(cert);
    }
    scene.add(certGroup);

    // Bàn giáo viên + Album
    const deskGVMat = new THREE.MeshStandardMaterial({ color: 0x8b5a2b }); // Gỗ đậm
    const deskGV = new THREE.Mesh(new THREE.BoxGeometry(4, 1.6, 2), deskGVMat);
    deskGV.position.set(-6, 0.8, -10);
    deskGV.castShadow = true; deskGV.receiveShadow = true;
    scene.add(deskGV);

    // Album ảnh trên bàn giáo viên
    const albumMat = new THREE.MeshStandardMaterial({ color: 0xc9184a }); // Sách màu hồng đỏ
    const album = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.15, 0.6), albumMat);
    album.position.set(-5.5, 1.6 + 0.075, -10);
    album.rotation.y = 0.2;
    album.castShadow = true;
    album.userData = {
        type: 'special',
        title: 'Album Ảnh Kỷ Niệm 📸',
        desc: 'Lưu giữ những khoảnh khắc thanh xuân rực rỡ nhất của 34 bông hoa ITA22. Nhìn lại thấy mình dễ thương chưa kìa!'
    };
    scene.add(album);
    interactableObjects.push(album);

    // ============================================
    // TẠO BÀN HỌC (4 DÃY x 5 BÀN) VÀ CÁC THIỆP
    // ============================================
    // Chúng ta có 20 bàn. Để đủ 34 thiệp, một số bàn sẽ có 2 thiệp, một số bàn 1 thiệp.

    const deskGeo = new THREE.BoxGeometry(2.5, 1.3, 1.5);
    const deskMat = new THREE.MeshStandardMaterial({ color: 0xe5c29f, roughness: 0.9 });

    const cardGeo = new THREE.PlaneGeometry(0.5, 0.7);
    const cardMat = new THREE.MeshStandardMaterial({ color: 0xffb3c6, side: THREE.DoubleSide });

    let studentIdCounter = 1;

    for (let row = 0; row < 5; row++) {
        for (let col = 0; col < 4; col++) {
            // Tính toạ độ
            // Dãy (col): 4 dãy, từ -9 đến +9
            // Hàng (row): 5 hàng, từ -4 đến +8
            const x = -8 + col * 5.3;
            const z = -4 + row * 3.5;

            // Tạo bàn
            const desk = new THREE.Mesh(deskGeo, deskMat);
            desk.position.set(x, 1.3 / 2, z);
            desk.castShadow = true;
            desk.receiveShadow = true;
            scene.add(desk);

            // Thêm Ghế (Cho đẹp)
            const chairMat = new THREE.MeshStandardMaterial({ color: 0x444444 });
            const chair = new THREE.Mesh(new THREE.BoxGeometry(1, 0.8, 1), chairMat);
            chair.position.set(x, 0.4, z + 1.2);
            chair.castShadow = true;
            scene.add(chair);

            // Đặt thẻ lên bàn (Tối đa 2 thẻ mỗi bàn để đủ 34, 1 bàn 2 chỗ)
            let cardsOnThisDesk = 2;
            // Dừng lại nếu đã đủ 34 người
            if (studentIdCounter > 34) cardsOnThisDesk = 0;
            // Một vài bàn cuối dãy chỉ có 1 thẻ để tròn 34 
            if (studentIdCounter === 34 && cardsOnThisDesk === 2) cardsOnThisDesk = 1;

            for (let seat = 0; seat < cardsOnThisDesk; seat++) {
                if (studentIdCounter > 34) break;

                const card = new THREE.Mesh(cardGeo, cardMat);
                // Đặt thẻ nghiêng nằm trên mặt bàn
                card.rotation.x = -Math.PI / 2;
                // Chia khoảng cách nếu bàn có 2 người
                let xOffset = cardsOnThisDesk === 1 ? 0 : (seat === 0 ? -0.6 : 0.6);
                card.position.set(x + xOffset, 1.3 + 0.01, z);
                card.receiveShadow = true;

                // Thêm Outline xíu cho card dễ nhìn
                const edge = new THREE.LineSegments(
                    new THREE.EdgesGeometry(cardGeo),
                    new THREE.LineBasicMaterial({ color: 0xc9184a })
                );
                card.add(edge);

                // Lưu thông tin học sinh vào mesh
                card.userData = {
                    type: 'student',
                    studentId: studentIdCounter
                };
                scene.add(card);
                interactableObjects.push(card);

                studentIdCounter++;
            }
        }
    }

    // Ẩn màn hình loading
    document.getElementById('loading-3d').style.display = 'none';

    // Raycaster for Interaction
    raycaster = new THREE.Raycaster();
    mouse = new THREE.Vector2();

    // Events
    window.addEventListener('resize', onWindowResize, false);
    window.addEventListener('mousemove', onMouseMove, false);
    window.addEventListener('click', onClick, false);

    // Bắt đầu render loop
    animate();
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

function onMouseMove(event) {
    // Chuẩn hoá toạ độ chuột (-1 đến +1)
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
}

function onClick(event) {
    if (currentHovered) {
        handleInteraction(currentHovered);
    }
}

// Hàm render liên tục
function animate() {
    requestAnimationFrame(animate);
    controls.update(); // Yêu cầu cho OrbitControls damping

    // Kiểm tra con trỏ trỏ vào đối tượng nào
    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects(interactableObjects);

    const tooltip = document.getElementById('tooltip');

    if (intersects.length > 0) {
        const object = intersects[0].object;
        currentHovered = object;

        // Đổi con trỏ chuột
        document.body.style.cursor = 'pointer';

        // Hover effect trên mesh (Nâng lên 1 tí)
        if (object.userData.type === 'student' && !object.userData.hovered) {
            object.position.y += 0.1;
            object.userData.hovered = true;
        }

        // Cập nhật tooltip
        tooltip.style.opacity = 1;
        if (object.userData.type === 'student') {
            tooltip.innerText = `[Click] Xem thiệp học sinh (${object.userData.studentId})`;
        } else {
            tooltip.innerText = `[Click] Xem ${object.userData.title}`;
        }
        tooltip.style.left = (mouse.x * 0.5 + 0.5) * window.innerWidth + 'px';
        tooltip.style.top = (-(mouse.y * 0.5 - 0.5)) * window.innerHeight + 'px';

    } else {
        // Reset hover
        if (currentHovered && currentHovered.userData.type === 'student') {
            currentHovered.position.y -= 0.1;
            currentHovered.userData.hovered = false;
        }

        currentHovered = null;
        document.body.style.cursor = 'default';
        tooltip.style.opacity = 0;
    }

    renderer.render(scene, camera);
}

// Xử lý khi click vào vật thể
async function handleInteraction(object) {
    const data = object.userData;

    if (data.type === 'special') {
        // Hiển thị Overlay vật phẩm
        document.getElementById('item-title').innerText = data.title;
        document.getElementById('item-desc').innerText = data.desc;
        document.getElementById('item-overlay').style.display = 'flex';
    }
    else if (data.type === 'student') {
        // Hiển thị Card Học sinh (giống app.js)
        const num = data.studentId;
        try {
            // Đổi chữ tooltip thành đang tải cho ngầu
            document.getElementById('tooltip').innerText = '⏳ Đang tải thư...';

            const student = await loadStudentById(num);

            const photoEl = document.getElementById('card-photo');
            photoEl.src = student.photoURL || 'photos/default.jpg';
            photoEl.onerror = function () { this.src = 'photos/default.jpg'; };

            document.getElementById('card-name').textContent = student.name;
            document.getElementById('card-id').textContent = `(${String(num).padStart(2, '0')})`;

            const DEFAULT_MSG = `Mời bạn đến với buổi vui chơi chào nhân dịp Ngày Quốc tế phụ nữ của ITA22 nhé! 🌸\n\nChúc bạn luôn xinh đẹp, hạnh phúc và rạng rỡ! 💐`;
            document.getElementById('card-msg').innerHTML = (student.message || DEFAULT_MSG).replace(/\n/g, '<br/>');

            // Hiện màn hình thẻ
            document.getElementById('screen-card').style.display = 'flex';

        } catch (e) {
            alert("Lỗi tải thiệp: " + e.message);
        }
    }
}

// Hàm đóng overlay thủ công
function closeItemOverlay() {
    document.getElementById('item-overlay').style.display = 'none';
}

function closeStudentCard() {
    document.getElementById('screen-card').style.display = 'none';
}
