// 交互对象系统
class Interactables {
    constructor(scene) {
        this.scene = scene;
        this.frames = []; // 相框数组
        this.frameStates = {}; // 相框状态（是否已点击）
        this.treasureChest = null; // 宝箱
        this.ring = null; // 钻戒
        this.treasureOpened = false; // 宝箱是否已打开
        this.ringRevealed = false; // 钻戒是否已显示
        
        // 加载相框
        this.loadFrames();
        
        // 加载宝箱
        this.loadTreasureChest();
        
        // 创建钻戒（初始隐藏）
        this.createRing();
    }
    
    // 加载相框
    loadFrames() {
        // 创建基本相框几何体和材质
        const frameGeometry = new THREE.BoxGeometry(0.1, 1.5, 2);
        const frameMaterial = new THREE.MeshStandardMaterial({ color: 0x8B4513 });
        
        // 创建画布几何体
        const canvasGeometry = new THREE.PlaneGeometry(1.8, 1.3);
        
        // 为每个相框创建3D对象
        CONFIG.frames.forEach((frameConfig, index) => {
            // 创建相框组
            const frameGroup = new THREE.Group();
            frameGroup.position.set(
                frameConfig.position.x,
                frameConfig.position.y,
                frameConfig.position.z
            );
            frameGroup.rotation.set(
                frameConfig.rotation.x,
                frameConfig.rotation.y,
                frameConfig.rotation.z
            );
            
            // 创建相框
            const frame = new THREE.Mesh(frameGeometry, frameMaterial);
            frameGroup.add(frame);
            
            // 加载画框图片
            const textureLoader = new THREE.TextureLoader();
            const imageUrl = `./assets/images/image${index+1}.jpg`; // 图片命名规则：image1.jpg, image2.jpg等
            
            // 创建带图片的画布
            const canvasMaterial = new THREE.MeshBasicMaterial({ 
                map: textureLoader.load(imageUrl),
                side: THREE.DoubleSide
            });
            
            const canvas = new THREE.Mesh(canvasGeometry, canvasMaterial);
            canvas.position.z = 0.06;
            frameGroup.add(canvas);
            
            // 添加到场景
            this.scene.add(frameGroup);
            
            // 存储相框信息
            this.frames.push({
                id: frameConfig.id,
                object: frameGroup,
                canvas: canvas, // 存储画布引用
                videoPath: frameConfig.video,
                position: new THREE.Vector3(
                    frameConfig.position.x,
                    frameConfig.position.y,
                    frameConfig.position.z
                )
            });
            
            // 初始化相框状态为未点击
            this.frameStates[frameConfig.id] = false;
        });
    }
    
    // 加载宝箱
    loadTreasureChest() {
        // 创建简单的宝箱几何体
        const chestGeometry = new THREE.BoxGeometry(2, 1.5, 1.5);
        const chestMaterial = new THREE.MeshBasicMaterial({ color: 0x8B4513 });
        this.treasureChest = new THREE.Mesh(chestGeometry, chestMaterial);
        
        // 设置宝箱位置
        this.treasureChest.position.set(
            CONFIG.treasure.position.x,
            CONFIG.treasure.position.y,
            CONFIG.treasure.position.z
        );
        
        // 添加到场景
        this.scene.add(this.treasureChest);
        
        // 创建宝箱盖（初始关闭状态）
        const lidGeometry = new THREE.BoxGeometry(2, 0.3, 1.5);
        const lidMaterial = new THREE.MeshBasicMaterial({ color: 0x8B4513 });
        this.treasureLid = new THREE.Mesh(lidGeometry, lidMaterial);
        
        // 设置宝箱盖位置
        this.treasureLid.position.set(
            CONFIG.treasure.position.x,
            CONFIG.treasure.position.y + 0.9,
            CONFIG.treasure.position.z
        );
        
        // 设置旋转点
        this.treasureLid.geometry.translate(0, -0.15, 0.75);
        
        // 添加到场景
        this.scene.add(this.treasureLid);
    }
    
    // 创建钻戒
    createRing() {
        // 创建简单的钻戒几何体
        const ringGeometry = new THREE.TorusGeometry(0.5, 0.1, 16, 32);
        const ringMaterial = new THREE.MeshBasicMaterial({ color: 0xFFD700 });
        this.ring = new THREE.Mesh(ringGeometry, ringMaterial);
        
        // 创建钻石几何体
        const diamondGeometry = new THREE.ConeGeometry(0.3, 0.6, 6);
        const diamondMaterial = new THREE.MeshBasicMaterial({ color: 0x00FFFF });
        this.diamond = new THREE.Mesh(diamondGeometry, diamondMaterial);
        this.diamond.position.y = 0.3;
        this.diamond.rotation.x = Math.PI;
        
        // 创建钻戒组
        this.ringGroup = new THREE.Group();
        this.ringGroup.add(this.ring);
        this.ringGroup.add(this.diamond);
        
        // 设置钻戒位置（初始在宝箱上方，但隐藏）
        this.ringGroup.position.set(
            CONFIG.treasure.position.x,
            CONFIG.treasure.position.y + 2,
            CONFIG.treasure.position.z
        );
        
        // 缩放钻戒
        this.ringGroup.scale.set(
            CONFIG.ring.scale,
            CONFIG.ring.scale,
            CONFIG.ring.scale
        );
        
        // 初始隐藏钻戒
        this.ringGroup.visible = false;
        
        // 添加到场景
        this.scene.add(this.ringGroup);
    }
    
    // 检查与相框的交互
    checkFrameInteraction(playerPosition) {
        let interactedFrame = null;
        
        // 遍历所有相框
        for (const frame of this.frames) {
            // 计算玩家与相框的距离
            const distance = playerPosition.distanceTo(frame.position);
            
            // 如果距离小于交互距离，可以交互
            if (distance < CONFIG.interaction.distance) {
                interactedFrame = frame;
                break;
            }
        }
        
        return interactedFrame;
    }
    
    // 检查与宝箱的交互
    checkTreasureInteraction(playerPosition) {
        // 如果宝箱未打开，不能交互
        if (!this.treasureOpened) {
            return false;
        }
        
        // 计算玩家与宝箱的距离
        const treasurePosition = new THREE.Vector3(
            CONFIG.treasure.position.x,
            CONFIG.treasure.position.y,
            CONFIG.treasure.position.z
        );
        const distance = playerPosition.distanceTo(treasurePosition);
        
        // 如果距离小于交互距离，可以交互
        return distance < CONFIG.interaction.distance;
    }
    
    // 播放相框视频
    playFrameVideo(frameId) {
        try {
            // 标记相框为已点击
            this.frameStates[frameId] = true;
            
            // 获取相框视频路径
            const frame = this.frames.find(f => f.id === frameId);
            if (!frame) {
                console.error('找不到相框:', frameId);
                return null;
            }
            
            // 更新进度指示器
            this.updateProgressIndicator();
            
            // 高亮显示当前点击的画框
            this.highlightFrame(frame);
            
            return frame.videoPath;
        } catch (error) {
            console.error('播放视频出错:', error);
            return null;
        }
    }
    
    // 更新进度指示器
    updateProgressIndicator() {
        try {
            // 安全地计算已观看视频数量
            const videosWatched = this.frameStates ? 
                Object.values(this.frameStates).filter(clicked => clicked).length : 0;
            
            // 安全地更新进度指示器
            const videosWatchedElement = document.getElementById('videos-watched');
            if (videosWatchedElement) {
                videosWatchedElement.textContent = videosWatched;
                console.log(`进度更新: ${videosWatched}/10 视频已观看`);
            } else {
                console.warn('找不到进度指示器元素');
            }
        } catch (error) {
            console.error('更新进度指示器出错:', error);
        }
    }
    
    // 检查是否所有相框都已点击
    checkAllFramesClicked() {
        try {
            return Object.values(this.frameStates).every(clicked => clicked === true);
        } catch (error) {
            console.error('检查相框状态出错:', error);
            return false;
        }
    }
    
    // 高亮显示当前点击的画框
    highlightFrame(frame) {
        try {
            // 重置所有画框的材质
            this.frames.forEach(f => {
                if (f.canvas && f.canvas.material) {
                    f.canvas.material.emissive = new THREE.Color(0x000000);
                    f.canvas.material.emissiveIntensity = 0;
                }
            });
            
            // 高亮当前画框
            if (frame.canvas && frame.canvas.material) {
                // 如果材质不是MeshStandardMaterial，转换它
                if (!frame.canvas.material.isMeshStandardMaterial) {
                    const oldMaterial = frame.canvas.material;
                    const newMaterial = new THREE.MeshStandardMaterial({
                        map: oldMaterial.map,
                        side: THREE.DoubleSide
                    });
                    frame.canvas.material = newMaterial;
                }
                
                // 设置发光效果
                frame.canvas.material.emissive = new THREE.Color(0xffff00);
                frame.canvas.material.emissiveIntensity = 0.5;
            }
        } catch (error) {
            console.error('高亮画框出错:', error);
        }
    }
    
    // 打开宝箱
    openTreasureChest() {
        if (this.treasureOpened) return;
        
        // 标记宝箱为已打开
        this.treasureOpened = true;
        
        // 动画打开宝箱盖
        const openAnimation = { rotation: 0 };
        const targetRotation = -Math.PI / 2; // 打开90度
        
        // 使用GSAP或自定义动画系统
        // 这里使用简单的动画逻辑
        const animate = () => {
            if (openAnimation.rotation > targetRotation) {
                openAnimation.rotation -= 0.05;
                this.treasureLid.rotation.x = openAnimation.rotation;
                requestAnimationFrame(animate);
            }
        };
        
        animate();
    }
    
    // 显示钻戒
    revealRing() {
        if (this.ringRevealed) return;
        
        // 标记钻戒为已显示
        this.ringRevealed = true;
        
        // 显示钻戒
        this.ringGroup.visible = true;
        
        // 添加上升动画
        const startY = this.ringGroup.position.y;
        const targetY = startY + 1;
        const riseAnimation = { y: startY };
        
        // 使用简单的动画逻辑
        const animate = () => {
            if (riseAnimation.y < targetY) {
                riseAnimation.y += 0.02;
                this.ringGroup.position.y = riseAnimation.y;
                requestAnimationFrame(animate);
            }
        };
        
        animate();
    }
    
    // 更新交互对象
    update() {
        // 如果钻戒已显示，旋转它
        if (this.ringRevealed && this.ringGroup.visible) {
            this.ringGroup.rotation.y += CONFIG.ring.rotationSpeed;
        }
    }
}