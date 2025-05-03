// 安全地获取DOM元素
function safeGetElement(id) {
    const element = document.getElementById(id);
    if (!element) {
        console.warn(`找不到ID为${id}的元素`);
        return null;
    }
    return element;
}

// 安全地设置元素文本
function safeSetElementText(id, text) {
    const element = safeGetElement(id);
    if (element) {
        element.textContent = text;
        return true;
    }
    return false;
}

// 安全地设置元素样式
function safeSetElementStyle(id, property, value) {
    const element = safeGetElement(id);
    if (element) {
        element.style[property] = value;
        return true;
    }
    return false;
}

// 检查THREE.js是否正确加载
function checkThreeJsLoaded() {
    if (typeof THREE === 'undefined') {
        const errorMsg = 'THREE.js库未正确加载，请检查网络连接并刷新页面';
        console.error(errorMsg);
        safeSetElementText('loading-progress', errorMsg);
        safeSetElementStyle('loading-progress', 'color', 'red');
        showDebugInfo(errorMsg);
        return false;
    }
    return true;
}

// 安全地显示调试信息
function safeShowDebugInfo(message) {
    try {
        if (typeof showDebugInfo === 'function') {
            showDebugInfo(message);
        } else {
            console.log('[调试]', message);
        }
    } catch (error) {
        console.log('[调试]', message);
        console.error('显示调试信息出错:', error);
    }
}

// 显示错误信息
function displayErrorMessage(message) {
    console.error(message);
    safeSetElementText('loading-progress', message);
    safeSetElementStyle('loading-progress', 'color', 'red');
    safeShowDebugInfo(message);
}

// 检查WebGL支持
function checkWebGLSupport() {
    try {
        const canvas = document.createElement('canvas');
        const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
        if (!gl) {
            const errorMsg = '您的浏览器不支持WebGL，请使用现代浏览器如Chrome、Firefox或Edge';
            displayErrorMessage(errorMsg);
            return false;
        }
        return true;
    } catch (e) {
        const errorMsg = '检测WebGL支持时出错: ' + e.message;
        displayErrorMessage(errorMsg);
        return false;
    }
}

// 初始化游戏的包装函数，包含错误处理
function initGameWithErrorHandling() {
    try {
        // 检查THREE.js和WebGL支持
        if (!checkThreeJsLoaded() || !checkWebGLSupport()) {
            return;
        }
        
        safeShowDebugInfo('开始初始化游戏...');
        
        try {
            // 创建游戏实例
            window.gameInstance = new Game();
            safeShowDebugInfo('游戏实例创建成功');
        } catch (error) {
            const errorMsg = '游戏实例创建失败: ' + (error.message || '未知错误');
            displayErrorMessage(errorMsg);
            console.error('详细错误信息:', error);
        }
    } catch (error) {
        const errorMsg = '游戏初始化失败: ' + (error.message || '未知错误');
        displayErrorMessage(errorMsg);
        console.error('详细错误信息:', error);
    }
}

// 主游戏逻辑
class Game {
    constructor() {
        // 初始化属性
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.character = null;
        this.interactables = null;
        this.clock = new THREE.Clock();
        this.isPlaying = false;
        this.loadingManager = new THREE.LoadingManager();
        this.stats = null; // 性能监控
        this.frustum = new THREE.Frustum(); // 用于视锥体剔除
        
        // 设置加载管理器
        this.setupLoadingManager();
        
        // 初始化游戏
        this.init();
    }
    
    // 设置加载管理器
    setupLoadingManager() {
        // 加载进度更新
        this.loadingManager.onProgress = (url, loaded, total) => {
            try {
                const progress = Math.floor((loaded / total) * 100);
                safeSetElementText('loading-progress', `${progress}%`);
                
                const progressFill = document.querySelector('.progress-fill');
                if (progressFill) {
                    progressFill.style.width = `${progress}%`;
                }
                
                console.log(`加载进度: ${progress}%, 当前加载: ${url}`);
                safeShowDebugInfo(`加载资源: ${url}`);
            } catch (error) {
                console.error('更新加载进度出错:', error);
            }
        };
        
        // 加载错误处理
        this.loadingManager.onError = (url) => {
            const errorMsg = `资源加载失败: ${url}`;
            console.error(errorMsg);
            safeShowDebugInfo(errorMsg);
            
            // 显示错误信息但继续加载其他资源
            safeSetElementText('loading-progress', '部分资源加载失败，游戏可能无法正常显示');
            safeSetElementStyle('loading-progress', 'color', 'orange');
        };
        
        // 加载完成
        this.loadingManager.onLoad = () => {
            console.log('所有资源加载完成');
            safeShowDebugInfo('所有资源加载完成');
            
            // 隐藏加载屏幕
            setTimeout(() => {
                const loadingScreen = safeGetElement('loading-screen');
                if (loadingScreen) {
                    loadingScreen.classList.add('hidden');
                }
                
                // 开始游戏
                try {
                    this.start();
                    safeShowDebugInfo('游戏启动成功');
                } catch (error) {
                    console.error('游戏启动失败:', error);
                    safeShowDebugInfo('游戏启动失败: ' + error.message);
                }
            }, 1000);
        };
    }
    
    // 初始化游戏
    init() {
        try {
            safeShowDebugInfo('开始初始化游戏...');
            
            // 创建场景
            this.scene = new THREE.Scene();
            safeShowDebugInfo('场景创建成功');
            
            // 创建相机
            try {
                this.camera = new THREE.PerspectiveCamera(
                    75,
                    window.innerWidth / window.innerHeight,
                    0.1,
                    1000
                );
                this.camera.position.set(0, 5, 20);
                safeShowDebugInfo('相机创建成功');
            } catch (error) {
                console.error('相机创建失败:', error);
                throw new Error('相机初始化失败: ' + (error.message || '未知错误'));
            }
            
            // 创建渲染器
            try {
                const canvas = safeGetElement('game-canvas');
                if (!canvas) {
                    throw new Error('找不到canvas元素');
                }
                
                this.renderer = new THREE.WebGLRenderer({
                    canvas: canvas,
                    antialias: true,
                    powerPreference: 'high-performance',
                    alpha: true
                });
                
                if (!this.renderer) {
                    throw new Error('渲染器创建失败');
                }
                
                this.renderer.setSize(window.innerWidth, window.innerHeight);
                this.setupPerformanceMode(); // 根据设备性能调整渲染设置
                this.renderer.setClearColor(0x000000);
                safeShowDebugInfo('渲染器创建成功');
            } catch (error) {
                console.error('渲染器创建失败:', error);
                displayErrorMessage('渲染器创建失败，请刷新页面重试');
                throw new Error('渲染器初始化失败: ' + (error.message || '未知错误'));
            }
            
            // 初始化性能监控
            try {
                this.initStats();
                safeShowDebugInfo('性能监控初始化成功');
            } catch (error) {
                console.warn('性能监控初始化失败:', error);
                // 继续执行，性能监控不是关键组件
            }
            
            // 添加环境光
            try {
                const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
                this.scene.add(ambientLight);
                safeShowDebugInfo('环境光添加成功');
                
                // 添加定向光
                const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
                directionalLight.position.set(0, 10, 5);
                this.scene.add(directionalLight);
                safeShowDebugInfo('定向光添加成功');
            } catch (error) {
                console.warn('光源创建失败:', error);
                safeShowDebugInfo('光源创建失败，但游戏将继续');
                // 继续执行，光源不是关键组件
            }
            
            // 创建地板
            try {
                this.createFloor();
                safeShowDebugInfo('地板创建成功');
            } catch (error) {
                console.warn('地板创建失败:', error);
                safeShowDebugInfo('使用备用地板');
                // 继续执行，使用备用地板
                try {
                    this.createFloorWithColor();
                } catch (backupError) {
                    console.error('备用地板创建失败:', backupError);
                    // 继续执行，地板不是绝对必要的
                }
            }
            
            // 创建墙壁
            try {
                this.createWalls();
                safeShowDebugInfo('墙壁创建成功');
            } catch (error) {
                console.warn('墙壁创建失败:', error);
                safeShowDebugInfo('墙壁创建失败，但游戏将继续');
                // 继续执行，墙壁不是关键组件
            }
            
            // 创建交互对象
            try {
                this.interactables = new Interactables(this.scene);
                safeShowDebugInfo('交互对象创建成功');
            } catch (error) {
                console.error('交互对象创建失败:', error);
                throw new Error('交互对象初始化失败: ' + (error.message || '未知错误'));
            }
            
            // 创建角色
            try {
                this.character = new Character(this.scene, this.camera);
                safeShowDebugInfo('角色创建成功');
            } catch (error) {
                console.error('角色创建失败:', error);
                throw new Error('角色初始化失败: ' + (error.message || '未知错误'));
            }
            
            // 设置事件监听
            try {
                this.setupEventListeners();
                safeShowDebugInfo('事件监听设置成功');
            } catch (error) {
                console.warn('事件监听设置失败:', error);
                safeShowDebugInfo('事件监听设置失败，部分功能可能不可用');
                // 继续执行，事件监听不是关键组件
            }
            
            // 添加进度指示器
            try {
                this.createProgressIndicator();
                safeShowDebugInfo('进度指示器创建成功');
            } catch (error) {
                console.warn('进度指示器创建失败:', error);
                safeShowDebugInfo('进度指示器创建失败，但游戏将继续');
                // 继续执行，进度指示器不是关键组件
            }
            
            safeShowDebugInfo('游戏初始化完成');
        } catch (error) {
            console.error('游戏初始化过程中出错:', error);
            displayErrorMessage('游戏初始化失败: ' + (error.message || '未知错误'));
            // 不再抛出错误，让游戏尝试继续运行
        }
    }
    
    // 设置事件监听器
    setupEventListeners() {
        // 设置窗口大小调整事件
        window.addEventListener('resize', this.onWindowResize.bind(this));
        
        // 设置点击事件
        const canvas = safeGetElement('game-canvas');
        if (canvas) {
            canvas.addEventListener('click', this.onCanvasClick.bind(this));
        }
        
        const closeVideoBtn = safeGetElement('close-video');
        if (closeVideoBtn) {
            closeVideoBtn.addEventListener('click', this.closeVideo.bind(this));
        }
        
        const hideControlsBtn = safeGetElement('hide-controls');
        if (hideControlsBtn) {
            hideControlsBtn.addEventListener('click', this.hideControls.bind(this));
        }
        
        // 添加ESC键关闭视频功能
        document.addEventListener('keydown', (event) => {
            if (event.key === 'Escape') {
                const videoPlayer = safeGetElement('video-player');
                if (videoPlayer && !videoPlayer.classList.contains('hidden')) {
                    this.closeVideo();
                }
            }
        });
    }
    
    // 创建地板
    createFloor() {
        try {
            // 加载地板纹理
            const textureLoader = new THREE.TextureLoader(this.loadingManager);
            const floorTexture = textureLoader.load(
                './assets/images/floor.jpg', 
                (texture) => {
                    // 设置纹理重复
                    texture.wrapS = THREE.RepeatWrapping;
                    texture.wrapT = THREE.RepeatWrapping;
                    texture.repeat.set(10, 20);
                    console.log('地板纹理加载成功');
                },
                undefined,
                (error) => {
                    console.error('地板纹理加载失败:', error);
                    // 使用默认颜色作为备用
                    this.createFloorWithColor();
                }
            );
            
            // 创建地板几何体和材质
            const floorGeometry = new THREE.PlaneGeometry(CONFIG.scene.width, CONFIG.scene.depth);
            const floorMaterial = new THREE.MeshStandardMaterial({
                map: floorTexture,
                side: THREE.DoubleSide
            });
            
            // 创建地板网格
            const floor = new THREE.Mesh(floorGeometry, floorMaterial);
            floor.rotation.x = Math.PI / 2; // 旋转为水平
            floor.position.y = CONFIG.scene.floorY;
            
            // 添加到场景
            this.scene.add(floor);
        } catch (error) {
            console.error('创建地板出错:', error);
            // 使用备用方法创建地板
            this.createFloorWithColor();
        }
    }
    
    // 使用纯色创建地板（作为纹理加载失败的备用方案）
    createFloorWithColor() {
        try {
            console.log('使用纯色创建地板');
            const floorGeometry = new THREE.PlaneGeometry(CONFIG.scene.width, CONFIG.scene.depth);
            const floorMaterial = new THREE.MeshStandardMaterial({
                color: 0x808080, // 灰色
                side: THREE.DoubleSide
            });
            
            const floor = new THREE.Mesh(floorGeometry, floorMaterial);
            floor.rotation.x = Math.PI / 2;
            floor.position.y = CONFIG.scene.floorY;
            
            this.scene.add(floor);
        } catch (error) {
            console.error('创建备用地板出错:', error);
        }
    }
    
    // 创建墙壁
    createWalls() {
        // 创建房间几何体
        const roomWidth = CONFIG.scene.width;
        const roomHeight = 10;
        const roomDepth = CONFIG.scene.depth;
        const wallThickness = 0.5;
        
        // 材质
        const wallMaterial = new THREE.MeshStandardMaterial({ 
            color: 0xf5f5f5,
            roughness: 0.7, 
            metalness: 0.1 
        });
        
        // 创建左墙
        const leftWall = new THREE.Mesh(
            new THREE.BoxGeometry(wallThickness, roomHeight, roomDepth),
            wallMaterial
        );
        leftWall.position.set(-roomWidth/2 - wallThickness/2, roomHeight/2 + CONFIG.scene.floorY, 0);
        this.scene.add(leftWall);
        
        // 创建右墙
        const rightWall = new THREE.Mesh(
            new THREE.BoxGeometry(wallThickness, roomHeight, roomDepth),
            wallMaterial
        );
        rightWall.position.set(roomWidth/2 + wallThickness/2, roomHeight/2 + CONFIG.scene.floorY, 0);
        this.scene.add(rightWall);
        
        // 创建后墙
        const backWall = new THREE.Mesh(
            new THREE.BoxGeometry(roomWidth + wallThickness*2, roomHeight, wallThickness),
            wallMaterial
        );
        backWall.position.set(0, roomHeight/2 + CONFIG.scene.floorY, -roomDepth/2 - wallThickness/2);
        this.scene.add(backWall);
        
        // 创建前墙
        const frontWall = new THREE.Mesh(
            new THREE.BoxGeometry(roomWidth + wallThickness*2, roomHeight, wallThickness),
            wallMaterial
        );
        frontWall.position.set(0, roomHeight/2 + CONFIG.scene.floorY, roomDepth/2 + wallThickness/2);
        this.scene.add(frontWall);
        
        // 创建天花板
        const ceiling = new THREE.Mesh(
            new THREE.BoxGeometry(roomWidth + wallThickness*2, wallThickness, roomDepth + wallThickness*2),
            wallMaterial
        );
        ceiling.position.set(0, roomHeight + CONFIG.scene.floorY, 0);
        this.scene.add(ceiling);
        
        // 添加墙壁碰撞检测边界
        this.wallBoundaries = {
            left: -roomWidth/2 + 0.5,
            right: roomWidth/2 - 0.5,
            front: roomDepth/2 - 0.5,
            back: -roomDepth/2 + 0.5
        };
    }
    
    // 开始游戏
    start() {
        this.isPlaying = true;
        this.animate();
    }
    
    // 动画循环
    animate() {
        if (!this.isPlaying) return;
        
        // 请求下一帧
        requestAnimationFrame(this.animate.bind(this));
        
        // 开始性能监控
        if (this.stats) this.stats.begin();
        
        // 获取时间增量
        const delta = this.clock.getDelta();
        
        // 更新角色
        if (this.character) {
            this.character.update(delta);
        }
        
        // 更新交互对象
        if (this.interactables) {
            this.interactables.update();
        }
        
        // 执行视锥体剔除
        this.performFrustumCulling();
        
        // 渲染场景
        this.renderer.render(this.scene, this.camera);
        
        // 结束性能监控
        if (this.stats) this.stats.end();
    }
    
    // 处理窗口大小调整
    onWindowResize() {
        // 更新相机宽高比
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        
        // 更新渲染器大小
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }
    
    // 画布点击事件
    onCanvasClick(event) {
        try {
            // 如果正在播放视频，忽略点击
            const videoPlayer = safeGetElement('video-player');
            if (videoPlayer && videoPlayer.classList.contains('hidden') === false) {
                return;
            }
            
            // 获取鼠标位置
            const mouse = new THREE.Vector2();
            mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
            mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
            
            // 创建射线
            const raycaster = new THREE.Raycaster();
            raycaster.setFromCamera(mouse, this.camera);
            
            // 获取玩家位置
            if (!this.character) {
                safeShowDebugInfo('角色未初始化，无法处理点击');
                return;
            }
            
            const playerPosition = this.character.getPosition();
            if (!playerPosition) {
                safeShowDebugInfo('无法获取角色位置');
                return;
            }
            
            // 检查交互对象是否初始化
            if (!this.interactables || !this.interactables.frames) {
                safeShowDebugInfo('交互对象未初始化，无法处理点击');
                return;
            }
            
            // 获取所有画框的画布对象
            const canvases = [];
            this.interactables.frames.forEach(frame => {
                if (frame && frame.canvas) {
                    canvases.push(frame.canvas);
                }
            });
            
            // 检测射线与画布的交叉
            const intersects = raycaster.intersectObjects(canvases);
            
            if (intersects.length > 0) {
                // 找到被点击的画框
                const clickedCanvas = intersects[0].object;
                const clickedFrame = this.interactables.frames.find(frame => frame && frame.canvas === clickedCanvas);
                
                if (clickedFrame) {
                    // 检查是否在交互距离内
                    const distance = playerPosition.distanceTo(clickedFrame.position);
                    if (distance <= CONFIG.interaction.distance) {
                        // 如果相框已经被点击过，不再触发视频
                        if (this.interactables.frameStates && this.interactables.frameStates[clickedFrame.id]) {
                            safeShowDebugInfo('这个相框已经被查看过了');
                            return;
                        }
                        
                        // 播放相框视频
                        try {
                            const videoPath = this.interactables.playFrameVideo(clickedFrame.id);
                            if (videoPath) {
                                this.playVideo(videoPath);
                            }
                            
                            // 检查是否所有相框都已点击
                            if (this.interactables.checkAllFramesClicked()) {
                                // 打开宝箱
                                this.interactables.openTreasureChest();
                            }
                        } catch (error) {
                            console.error('播放视频出错:', error);
                            safeShowDebugInfo('播放视频出错: ' + error.message);
                        }
                    } else {
                        safeShowDebugInfo('请靠近画框以查看视频');
                    }
                    return;
                }
            }
            
            // 检查与相框的交互（备用方法，确保兼容性）
            try {
                const interactedFrame = this.interactables.checkFrameInteraction(playerPosition);
                if (interactedFrame) {
                    // 如果相框已经被点击过，不再触发视频
                    if (this.interactables.frameStates && this.interactables.frameStates[interactedFrame.id]) {
                        safeShowDebugInfo('这个相框已经被查看过了');
                        return;
                    }
                    
                    // 播放相框视频
                    const videoPath = this.interactables.playFrameVideo(interactedFrame.id);
                    if (videoPath) {
                        this.playVideo(videoPath);
                    }
                    
                    // 检查是否所有相框都已点击
                    if (this.interactables.checkAllFramesClicked()) {
                        // 打开宝箱
                        this.interactables.openTreasureChest();
                    }
                    
                    return;
                }
            } catch (error) {
                console.error('相框交互检查出错:', error);
                safeShowDebugInfo('相框交互检查出错');
            }
            
            // 检查与宝箱的交互
            try {
                const canInteractWithTreasure = this.interactables.checkTreasureInteraction(playerPosition);
                if (canInteractWithTreasure && this.interactables.treasureOpened && !this.interactables.ringRevealed) {
                    // 显示钻戒
                    this.interactables.revealRing();
                    return;
                }
            } catch (error) {
                console.error('宝箱交互检查出错:', error);
                safeShowDebugInfo('宝箱交互检查出错');
            }
        } catch (error) {
            console.error('点击处理出错:', error);
            safeShowDebugInfo('点击处理出错: ' + error.message);
        }
    }
    
    // 播放视频
    playVideo(videoPath) {
        try {
            // 暂停游戏
            this.isPlaying = false;
            
            // 设置视频源
            const videoElement = safeGetElement('frame-video');
            if (!videoElement) {
                throw new Error('找不到视频元素');
            }
            
            videoElement.src = videoPath;
            
            // 显示视频播放器
            const videoPlayer = safeGetElement('video-player');
            if (videoPlayer) {
                videoPlayer.classList.remove('hidden');
            }
            
            // 播放视频
            videoElement.play().catch(error => {
                console.error('视频播放失败:', error);
                safeShowDebugInfo('视频播放失败: ' + error.message);
                // 恢复游戏
                this.isPlaying = true;
                this.animate();
            });
        } catch (error) {
            console.error('视频播放设置出错:', error);
            safeShowDebugInfo('视频播放设置出错: ' + error.message);
            // 恢复游戏
            this.isPlaying = true;
            this.animate();
        }
    }
    
    // 关闭视频
    closeVideo() {
        try {
            // 暂停视频
            const videoElement = safeGetElement('frame-video');
            if (videoElement) {
                videoElement.pause();
                // 释放视频资源
                this.disposeVideo(videoElement);
            }
            
            // 隐藏视频播放器
            const videoPlayer = safeGetElement('video-player');
            if (videoPlayer) {
                videoPlayer.classList.add('hidden');
            }
            
            // 恢复游戏
            this.isPlaying = true;
            this.animate();
        } catch (error) {
            console.error('关闭视频出错:', error);
            safeShowDebugInfo('关闭视频出错: ' + error.message);
            // 强制恢复游戏
            this.isPlaying = true;
            this.animate();
        }
    }
    
    // 释放视频资源
    disposeVideo(videoElement) {
        try {
            if (videoElement && videoElement.src) {
                const oldSrc = videoElement.src;
                videoElement.src = '';
                videoElement.load();
                try {
                    URL.revokeObjectURL(oldSrc); // 释放视频资源
                } catch (error) {
                    console.warn('释放视频资源URL出错:', error);
                }
            }
        } catch (error) {
            console.error('释放视频资源出错:', error);
            safeShowDebugInfo('释放视频资源出错: ' + error.message);
        }
    }
    
    // 初始化性能监控
    initStats() {
        // 检查是否为开发环境
        if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
            // 动态加载stats.js
            const script = document.createElement('script');
            script.onload = () => {
                this.stats = new Stats();
                this.stats.showPanel(0); // 0: fps, 1: ms, 2: mb
                this.stats.dom.style.position = 'absolute';
                this.stats.dom.style.top = '0px';
                this.stats.dom.style.left = '0px';
                document.body.appendChild(this.stats.dom);
            };
            script.src = 'https://cdn.jsdelivr.net/npm/stats.js@0.17.0/build/stats.min.js';
            document.head.appendChild(script);
        }
    }
    
    // 根据设备性能调整渲染设置
    setupPerformanceMode() {
        // 检测设备性能
        const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
        const isLowEnd = window.navigator.hardwareConcurrency < 4;
        
        if (isMobile || isLowEnd) {
            // 低性能设备设置
            this.renderer.setPixelRatio(1);
            this.renderer.shadowMap.enabled = false;
        } else {
            // 高性能设备设置
            this.renderer.setPixelRatio(window.devicePixelRatio);
            this.renderer.shadowMap.enabled = true;
        }
    }
    
    // 执行视锥体剔除
    performFrustumCulling() {
        // 更新视锥体
        const matrix = new THREE.Matrix4().multiplyMatrices(
            this.camera.projectionMatrix,
            this.camera.matrixWorldInverse
        );
        this.frustum.setFromProjectionMatrix(matrix);
        
        // 遍历场景中的对象
        this.scene.traverse(object => {
            if (object.isMesh && object !== this.character.model) {
                // 计算对象是否在视锥体内
                const distance = this.camera.position.distanceTo(object.position);
                
                // 如果距离太远或不在视锥体内，暂时隐藏
                if (distance > 50 || !this.frustum.intersectsObject(object)) {
                    object.visible = false;
                } else {
                    object.visible = true;
                }
            }
        });
    }
    
    // 创建进度指示器
    createProgressIndicator() {
        try {
            // 检查是否已存在进度指示器
            if (safeGetElement('progress-indicator')) {
                return; // 已存在，不重复创建
            }
            
            const progressIndicator = document.createElement('div');
            progressIndicator.id = 'progress-indicator';
            progressIndicator.className = 'progress-indicator';
            progressIndicator.innerHTML = '<span id="videos-watched">0</span>/10 视频已观看';
            
            const gameContainer = safeGetElement('game-container');
            if (gameContainer) {
                gameContainer.appendChild(progressIndicator);
                safeShowDebugInfo('进度指示器创建成功');
            } else {
                // 如果找不到游戏容器，尝试添加到body
                document.body.appendChild(progressIndicator);
                safeShowDebugInfo('进度指示器添加到body');
            }
        } catch (error) {
            console.error('创建进度指示器出错:', error);
            safeShowDebugInfo('创建进度指示器出错: ' + error.message);
        }
    }
    
    // 隐藏控制提示
    hideControls() {
        document.getElementById('controls-help').classList.add('hidden');
    }
}

// 创建资源文件夹结构
function createAssetFolders() {
    console.log('游戏需要以下资源文件夹结构:');
    console.log('- assets/images/: 存放背景图片、角色图片和纹理');
    console.log('- assets/models/: 存放3D模型');
    console.log('- assets/videos/: 存放10个相框视频');
    console.log('请确保这些文件夹存在并包含相应资源。');
}

// 检查THREE.js是否正确加载
function checkThreeJsLoaded() {
    if (typeof THREE === 'undefined') {
        console.error('THREE.js 未加载！请检查网络连接或脚本引用。');
        document.getElementById('loading-progress').textContent = 'THREE.js 加载失败，请刷新页面重试';
        document.getElementById('loading-progress').style.color = 'red';
        return false;
    }
    return true;
}

// 初始化游戏并处理错误
function initGameWithErrorHandling() {
    try {
        // 检查THREE.js是否加载
        if (!checkThreeJsLoaded()) return;
        
        // 检查WebGL支持
        if (!checkWebGLSupport()) return;
        
        // 创建资源文件夹结构提示
        createAssetFolders();
        
        // 初始化游戏
        window.gameInstance = new Game();
        console.log('游戏初始化成功');
    } catch (error) {
        console.error('游戏初始化失败:', error);
        document.getElementById('loading-progress').textContent = '游戏初始化失败，请刷新页面重试';
        document.getElementById('loading-progress').style.color = 'red';
    }
}

// 检查WebGL支持
function checkWebGLSupport() {
    try {
        const canvas = document.createElement('canvas');
        const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
        
        if (!gl) {
            const errorMessage = '您的浏览器不支持WebGL，无法运行游戏';
            console.error(errorMessage);
            document.getElementById('loading-progress').textContent = errorMessage;
            document.getElementById('loading-progress').style.color = 'red';
            return false;
        }
        return true;
    } catch (e) {
        console.error('WebGL检查失败:', e);
        document.getElementById('loading-progress').textContent = 'WebGL检查失败，请使用现代浏览器';
        document.getElementById('loading-progress').style.color = 'red';
        return false;
    }
}

// 当页面加载完成时初始化游戏
window.addEventListener('DOMContentLoaded', () => {
    // 设置全局错误处理
    window.addEventListener('error', (event) => {
        console.error('全局错误:', event.error);
        document.getElementById('loading-progress').textContent = '游戏运行出错，请刷新页面重试';
        document.getElementById('loading-progress').style.color = 'red';
    });
    
    // 延迟初始化，确保DOM完全加载
    setTimeout(function() {
        showDebugInfo('DOM加载完成，开始初始化游戏...');
        initGameWithErrorHandling();
    }, 100);
});

// 添加调试信息显示
function showDebugInfo(message) {
    console.log(message);
    const debugElement = document.getElementById('debug-info');
    if (!debugElement) {
        const debugDiv = document.createElement('div');
        debugDiv.id = 'debug-info';
        debugDiv.style.position = 'fixed';
        debugDiv.style.bottom = '10px';
        debugDiv.style.left = '10px';
        debugDiv.style.backgroundColor = 'rgba(0,0,0,0.7)';
        debugDiv.style.color = 'white';
        debugDiv.style.padding = '10px';
        debugDiv.style.borderRadius = '5px';
        debugDiv.style.fontFamily = 'monospace';
        debugDiv.style.fontSize = '12px';
        debugDiv.style.maxWidth = '80%';
        debugDiv.style.maxHeight = '200px';
        debugDiv.style.overflow = 'auto';
        debugDiv.style.zIndex = '1000';
        document.body.appendChild(debugDiv);
    }
    
    const debugElement2 = document.getElementById('debug-info');
    if (debugElement2) {
        const msgElement = document.createElement('div');
        msgElement.textContent = `[${new Date().toLocaleTimeString()}] ${message}`;
        debugElement2.appendChild(msgElement);
        
        // 保持最新消息可见
        debugElement2.scrollTop = debugElement2.scrollHeight;
        
        // 限制消息数量
        while (debugElement2.childNodes.length > 50) {
            debugElement2.removeChild(debugElement2.firstChild);
        }
    }
}