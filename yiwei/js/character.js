// 角色控制系统
class Character {
    constructor(scene, camera) {
        this.scene = scene;
        this.camera = camera;
        this.model = null;
        this.mixer = null; // 动画混合器
        this.animations = {};
        this.moveSpeed = CONFIG.character.speed;
        this.rotationSpeed = CONFIG.character.rotationSpeed;
        
        // 移动状态
        this.moveState = {
            forward: false,
            backward: false,
            left: false,
            right: false
        };
        
        // 位置和旋转
        this.position = new THREE.Vector3(
            CONFIG.character.startPosition.x,
            CONFIG.character.startPosition.y,
            CONFIG.character.startPosition.z
        );
        this.rotation = new THREE.Euler(0, 0, 0);
        
        // 初始化角色
        this.init();
        
        // 设置键盘控制
        this.setupKeyboardControls();
    }
    
    // 初始化角色
    async init() {
        // 在模型加载前，创建一个简单的占位符
        const geometry = new THREE.BoxGeometry(0.5, 1, 0.5);
        const material = new THREE.MeshBasicMaterial({ color: 0x00ff00, transparent: true, opacity: 0 });
        this.model = new THREE.Mesh(geometry, material);
        this.model.position.copy(this.position);
        this.scene.add(this.model);
        
        // 加载角色模型
        try {
            // 尝试加载3D模型
            await this.loadModel();
        } catch (error) {
            console.error('加载角色模型失败:', error);
            // 如果3D模型加载失败，使用2D精灵作为替代
            await this.createSpriteCharacter();
        }
    }
    
    // 加载3D模型
    loadModel() {
        return new Promise((resolve, reject) => {
            const loader = new THREE.GLTFLoader();
            loader.load(
                CONFIG.character.modelPath,
                (gltf) => {
                    // 移除占位符
                    this.scene.remove(this.model);
                    
                    // 设置模型
                    this.model = gltf.scene;
                    this.model.scale.set(
                        CONFIG.character.scale,
                        CONFIG.character.scale,
                        CONFIG.character.scale
                    );
                    this.model.position.copy(this.position);
                    this.scene.add(this.model);
                    
                    // 设置动画
                    if (gltf.animations && gltf.animations.length > 0) {
                        this.mixer = new THREE.AnimationMixer(this.model);
                        gltf.animations.forEach(clip => {
                            const name = clip.name.toLowerCase();
                            this.animations[name] = this.mixer.clipAction(clip);
                            
                            // 如果有idle动画，默认播放
                            if (name === 'idle') {
                                this.animations[name].play();
                            }
                        });
                    }
                    
                    resolve();
                },
                undefined,
                (error) => {
                    console.error('加载角色模型出错:', error);
                    reject(error);
                }
            );
        });
    }
    
    // 创建2D精灵角色（作为3D模型的替代）
    createSpriteCharacter() {
        return new Promise((resolve, reject) => {
            // 加载角色图片
            const textureLoader = new THREE.TextureLoader();
            textureLoader.load(
                CONFIG.character.placeholder,
                (texture) => {
                    // 移除占位符
                    this.scene.remove(this.model);
                    
                    // 创建精灵
                    const material = new THREE.SpriteMaterial({ map: texture });
                    this.model = new THREE.Sprite(material);
                    this.model.scale.set(2, 2, 1);
                    this.model.position.copy(this.position);
                    this.scene.add(this.model);
                    
                    resolve();
                },
                undefined,
                (error) => {
                    console.error('加载角色图片出错:', error);
                    reject(error);
                }
            );
        });
    }
    
    // 设置键盘控制
    setupKeyboardControls() {
        document.addEventListener('keydown', (event) => {
            switch (event.key.toLowerCase()) {
                case 'w':
                    this.moveState.forward = true;
                    break;
                case 's':
                    this.moveState.backward = true;
                    break;
                case 'a':
                    this.moveState.left = true;
                    break;
                case 'd':
                    this.moveState.right = true;
                    break;
            }
            
            // 如果有行走动画，播放它
            if (this.animations['walk'] && 
                (this.moveState.forward || this.moveState.backward || 
                 this.moveState.left || this.moveState.right)) {
                // 停止其他动画
                if (this.animations['idle']) {
                    this.animations['idle'].stop();
                }
                this.animations['walk'].play();
            }
        });
        
        document.addEventListener('keyup', (event) => {
            switch (event.key.toLowerCase()) {
                case 'w':
                    this.moveState.forward = false;
                    break;
                case 's':
                    this.moveState.backward = false;
                    break;
                case 'a':
                    this.moveState.left = false;
                    break;
                case 'd':
                    this.moveState.right = false;
                    break;
            }
            
            // 如果没有移动，播放idle动画
            if (this.animations['idle'] && 
                !this.moveState.forward && !this.moveState.backward && 
                !this.moveState.left && !this.moveState.right) {
                if (this.animations['walk']) {
                    this.animations['walk'].stop();
                }
                this.animations['idle'].play();
            }
        });
    }
    
    // 更新角色位置
    update(deltaTime) {
        // 更新动画混合器
        if (this.mixer) {
            this.mixer.update(deltaTime);
        }
        
        // 计算移动方向和距离
        let moveX = 0;
        let moveZ = 0;
        
        if (this.moveState.forward) moveZ -= this.moveSpeed;
        if (this.moveState.backward) moveZ += this.moveSpeed;
        if (this.moveState.left) moveX -= this.moveSpeed;
        if (this.moveState.right) moveX += this.moveSpeed;
        
        // 如果有移动，更新角色旋转
        if (moveX !== 0 || moveZ !== 0) {
            // 计算移动角度
            const angle = Math.atan2(moveX, moveZ);
            this.rotation.y = angle;
            
            // 播放行走动画
            this.playAnimation('walk');
        } else {
            // 播放待机动画
            this.playAnimation('idle');
        }
        
        // 计算新位置
        const newX = this.position.x + moveX;
        const newZ = this.position.z + moveZ;
        
        // 检查墙壁碰撞
        const game = window.gameInstance;
        const boundaries = game.wallBoundaries;
        
        // 只有在不碰撞的情况下才更新位置
        if (newX >= boundaries.left && newX <= boundaries.right) {
            this.position.x = newX;
        }
        
        if (newZ >= boundaries.back && newZ <= boundaries.front) {
            this.position.z = newZ;
        }
        
        // 更新模型位置和旋转
        this.model.position.copy(this.position);
        this.model.rotation.y = this.rotation.y;
        
        // 更新相机位置（跟随角色）
        this.updateCamera();
    }
    
    // 更新相机位置
    updateCamera() {
        // 设置相机位置，跟随角色
        const cameraOffset = new THREE.Vector3(0, 5, 10); // 相机偏移量
        const cameraPosition = this.position.clone().add(cameraOffset);
        this.camera.position.copy(cameraPosition);
        
        // 相机始终看向角色
        this.camera.lookAt(this.position);
    }
    
    // 获取角色位置
    getPosition() {
        return this.position.clone();
    }
}