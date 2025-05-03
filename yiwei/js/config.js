// 游戏配置
const CONFIG = {
    // 场景配置
    scene: {
        background: './assets/images/background.png', // 背景图片路径
        width: 20,  // 场景宽度
        depth: 40,  // 场景深度
        floorY: -2  // 地板Y坐标
    },
    
    // 角色配置
    character: {
        modelPath: './assets/models/character.glb', // 角色模型路径（实际项目中需替换）
        placeholder: './assets/images/character.png', // 角色图片路径（用于开发阶段）
        speed: 0.1,  // 移动速度
        rotationSpeed: 0.1,  // 旋转速度
        scale: 1.0,  // 缩放比例
        startPosition: { x: 0, y: 0, z: 15 }  // 起始位置
    },
    
    // 相框配置
    frames: [
        // 左侧相框
        { id: 'frame1', position: { x: -7, y: 1, z: 10 }, rotation: { x: 0, y: Math.PI/2, z: 0 }, video: './assets/videos/video1.mp4' },
        { id: 'frame2', position: { x: -7, y: 1, z: 5 }, rotation: { x: 0, y: Math.PI/2, z: 0 }, video: './assets/videos/video2.mp4' },
        { id: 'frame3', position: { x: -7, y: 1, z: 0 }, rotation: { x: 0, y: Math.PI/2, z: 0 }, video: './assets/videos/video3.mp4' },
        { id: 'frame4', position: { x: -7, y: 1, z: -5 }, rotation: { x: 0, y: Math.PI/2, z: 0 }, video: './assets/videos/video4.mp4' },
        { id: 'frame5', position: { x: -7, y: 1, z: -10 }, rotation: { x: 0, y: Math.PI/2, z: 0 }, video: './assets/videos/video5.mp4' },
        
        // 右侧相框
        { id: 'frame6', position: { x: 7, y: 1, z: 10 }, rotation: { x: 0, y: -Math.PI/2, z: 0 }, video: './assets/videos/video6.mp4' },
        { id: 'frame7', position: { x: 7, y: 1, z: 5 }, rotation: { x: 0, y: -Math.PI/2, z: 0 }, video: './assets/videos/video7.mp4' },
        { id: 'frame8', position: { x: 7, y: 1, z: 0 }, rotation: { x: 0, y: -Math.PI/2, z: 0 }, video: './assets/videos/video8.mp4' },
        { id: 'frame9', position: { x: 7, y: 1, z: -5 }, rotation: { x: 0, y: -Math.PI/2, z: 0 }, video: './assets/videos/video9.mp4' },
        { id: 'frame10', position: { x: 7, y: 1, z: -10 }, rotation: { x: 0, y: -Math.PI/2, z: 0 }, video: './assets/videos/video10.mp4' }
    ],
    
    // 宝箱配置
    treasure: {
        position: { x: 0, y: 0, z: 0 },  // 宝箱位置
        scale: 1.0  // 缩放比例
    },
    
    // 钻戒配置
    ring: {
        scale: 0.5,  // 缩放比例
        rotationSpeed: 0.01  // 旋转速度
    },
    
    // 交互配置
    interaction: {
        distance: 3  // 交互距离
    }
};