// 徽章数据
const BADGES = [
    { id: 1, name: '天尊悟空', innerImage: 'images/badge1.png' },
    { id: 2, name: '天尊哪吒', innerImage: 'images/badge2.png' },
    { id: 3, name: '徽章3', innerImage: 'images/badge3.png' },
    { id: 4, name: '徽章4', innerImage: 'images/badge4.png' },
    { id: 5, name: '徽章5', innerImage: 'images/badge5.png' },
    { id: 6, name: '徽章6', innerImage: 'images/badge6.png' },
    { id: 7, name: '徽章7', innerImage: 'images/badge7.png' },
    { id: 8, name: '徽章8', innerImage: 'images/badge8.png' },
    { id: 9, name: '徽章9', innerImage: 'images/badge9.png' }
];

// 获取选中的徽章和颜色
let selectedBadges = {
    player1: 1, // 默认徽章
    player2: 2  // 默认徽章
};

let badgeColors = {
    player1: '#ffcc00', // 默认黄色
    player2: '#ff6b6b'  // 默认红色
};

// 尝试从localStorage读取游戏数据
const savedGameData = localStorage.getItem('gameData');
let isAIFromStorage = true; // 默认启用AI
let aiDifficultyFromStorage = 'easy'; // 默认难度
if (savedGameData) {
    const parsed = JSON.parse(savedGameData);
    if (parsed.selectedBadges) {
        if (parsed.selectedBadges.player1) selectedBadges.player1 = parsed.selectedBadges.player1;
        if (parsed.selectedBadges.player2) selectedBadges.player2 = parsed.selectedBadges.player2;
    }
    if (parsed.badgeColors) {
        if (parsed.badgeColors.player1) badgeColors.player1 = parsed.badgeColors.player1;
        if (parsed.badgeColors.player2) badgeColors.player2 = parsed.badgeColors.player2;
    }
    if (parsed.isAI !== undefined) {
        isAIFromStorage = parsed.isAI; // 读取AI设置状态
        console.log('从localStorage读取AI设置:', isAIFromStorage);
    }
    if (parsed.aiDifficulty) {
        aiDifficultyFromStorage = parsed.aiDifficulty; // 读取AI难度设置
        console.log('从localStorage读取AI难度:', aiDifficultyFromStorage);
    }
}

// 音频对象
const AUDIO = {
    attack: new Audio('audio/attack.mp3'),
    heal: new Audio('audio/heal.mp3'),
    jump: new Audio('audio/jump.mp3'),
    trap: new Audio('audio/trap.mp3'),
    victory: new Audio('audio/victory.mp3'),
    tap: new Audio('audio/tap.mp3'),
    bgm: new Audio('audio/bgm.mp3')
};

// 初始化音频
function initAudio() {
    // 设置BGM循环播放
    AUDIO.bgm.loop = true;
    AUDIO.bgm.volume = 0.5;
    
    // 其他音效音量
    AUDIO.attack.volume = 0.7;
    AUDIO.heal.volume = 0.7;
    AUDIO.jump.volume = 0.5;
    AUDIO.trap.volume = 0.7;
    AUDIO.victory.volume = 0.8;
    AUDIO.tap.volume = 0.5;
    
    // 尝试自动播放BGM
    AUDIO.bgm.play().catch(e => {
        console.log('游戏BGM自动播放失败，等待用户交互:', e);
        // 监听用户交互事件，在用户交互后播放
        function playOnInteraction() {
            AUDIO.bgm.play().catch(e => console.log('游戏BGM播放失败:', e));
            // 移除事件监听器，避免重复触发
            document.removeEventListener('click', playOnInteraction);
            document.removeEventListener('touchstart', playOnInteraction);
            document.removeEventListener('keydown', playOnInteraction);
        }
        
        // 添加多种交互事件监听器
        document.addEventListener('click', playOnInteraction);
        document.addEventListener('touchstart', playOnInteraction);
        document.addEventListener('keydown', playOnInteraction);
    });
}

// 播放音频函数
function playAudio(audioName) {
    if (AUDIO[audioName]) {
        AUDIO[audioName].currentTime = 0;
        AUDIO[audioName].play().catch(e => console.log(`${audioName}播放失败:`, e));
    }
}

// 特效图片URL
const TRAP_EFFECT_URL = 'images/trap-effect.png';
const HEAL_EFFECT_URL = 'images/heal-effect.png';

// 石头素材URL
const STONE_IMAGES = [
    'images/stone1.png',
    'images/stone2.png',
    'images/stone3.png',
    'images/stone4.png',
    'images/stone5.png'
];

// 资源配置 - 已替换为新的素材图片
const ASSETS = {
    background: new Image(),
    mapTile: new Image(),
    trapTile: new Image(),
    healTile: new Image(),
    player1OuterRing: null,
    player1InnerRing: new Image(),
    player2OuterRing: null,
    player2InnerRing: new Image()
};

// 显示特效 - 通用函数
function showEffect(effectType, x, y) {
    const effectURL = effectType === 'trap' ? TRAP_EFFECT_URL : HEAL_EFFECT_URL;
    const effectId = effectType === 'trap' ? 'trap-overlay' : 'heal-overlay';
    const effectName = effectType === 'trap' ? '陷阱' : '恢复';
    
    console.log(`触发${effectName}效果！位置:`, x, y);
    
    // 创建游戏容器大小的DOM元素来显示效果
    const effectOverlay = document.createElement('div');
    effectOverlay.id = effectId;
    effectOverlay.style.cssText = `
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        pointer-events: none;
        z-index: 1000;
        opacity: 0;
        transition: opacity 0.5s ease-in-out;
        background-image: url('${effectURL}');
        background-repeat: no-repeat;
        background-size: cover;
        background-position: center;
    `;
    // 获取游戏容器元素
    const gameContainer = document.querySelector('#game-container') || document.body;
    
    // 设置容器为相对定位
    if (window.getComputedStyle(gameContainer).position === 'static') {
        gameContainer.style.position = 'relative';
    }
    
    // 添加到游戏容器
    gameContainer.appendChild(effectOverlay);
    console.log(`${effectName}效果DOM元素已创建，使用容器100%尺寸`);
    
    // 淡入效果
    setTimeout(() => {
        effectOverlay.style.opacity = '0.7';
        console.log(`${effectName}效果淡入完成`);
    }, 10);
    
    // 保持效果
    setTimeout(() => {
        console.log(`${effectName}效果保持结束，开始淡出`);
        // 淡出效果
        effectOverlay.style.opacity = '0';
        
        // 移除元素
        setTimeout(() => {
            if (effectOverlay.parentNode) {
                effectOverlay.parentNode.removeChild(effectOverlay);
                console.log(`${effectName}效果DOM元素已移除`);
            }
        }, 500);
    }, 1000);
}

// 显示陷阱效果
function showTrapEffect(x, y) {
    showEffect('trap', x, y);
}

// 显示恢复效果
function showHealEffect(x, y) {
    showEffect('heal', x, y);
}

// 石头类
class FloatingStone {
    constructor() {
        this.image = new Image();
        this.image.src = STONE_IMAGES[Math.floor(Math.random() * STONE_IMAGES.length)];
        this.x = Math.random() * (500 - 80); // 容器宽度 - 石头宽度
        this.y = Math.random() * (800 - 80); // 容器高度 - 石头高度
        this.vx = (Math.random() - 0.5) * 2; // 随机水平速度
        this.vy = (Math.random() - 0.5) * 2; // 随机垂直速度
        this.rotation = Math.random() * Math.PI * 2; // 初始旋转角度
        this.rotationSpeed = (Math.random() - 0.5) * 0.02; // 旋转速度
        this.opacity = Math.random() * 0.15 + 0.85; // 透明度 0.85-1.0
        this.element = null;
        this.init();
    }

    init() {
        // 创建石头DOM元素
        this.element = document.createElement('img');
        this.element.src = this.image.src;
        this.element.style.cssText = `
            position: absolute;
            width: 80px;
            height: 80px;
            pointer-events: none;
            z-index: 500;
            opacity: ${this.opacity};
            transition: none;
        `;
        
        // 添加到游戏容器
        const gameContainer = document.querySelector('#game-container');
        if (gameContainer) {
            gameContainer.appendChild(this.element);
        }
        
        this.update();
    }

    update() {
        // 更新位置
        this.x += this.vx;
        this.y += this.vy;
        
        // 更新旋转
        this.rotation += this.rotationSpeed;
        
        // 边界检测
        if (this.x < -80) this.x = 500;
        if (this.x > 500) this.x = -80;
        if (this.y < -80) this.y = 800;
        if (this.y > 800) this.y = -80;
        
        // 应用变换
        if (this.element) {
            this.element.style.left = `${this.x}px`;
            this.element.style.top = `${this.y}px`;
            this.element.style.transform = `rotate(${this.rotation}rad)`;
        }
        
        // 继续动画
        requestAnimationFrame(() => this.update());
    }

    remove() {
        if (this.element && this.element.parentNode) {
            this.element.parentNode.removeChild(this.element);
        }
    }
}

// 石头系统
class StoneSystem {
    constructor() {
        this.stones = [];
        this.minStones = 3;
        this.maxStones = 8;
    }

    init() {
        // 随机生成石头
        const stoneCount = Math.floor(Math.random() * (this.maxStones - this.minStones + 1)) + this.minStones;
        
        for (let i = 0; i < stoneCount; i++) {
            // 延迟创建石头，避免同时出现
            setTimeout(() => {
                this.stones.push(new FloatingStone());
            }, i * 200);
        }
    }

    clear() {
        // 移除所有石头
        this.stones.forEach(stone => stone.remove());
        this.stones = [];
    }
}

// 创建石头系统实例
const stoneSystem = new StoneSystem();

// 陷阱效果相关函数已移至DOM实现

// 预加载图片资源
ASSETS.background.src = 'images/background.png';
ASSETS.mapTile.src = 'images/background.png';
ASSETS.healTile.src = 'images/heal-tile.png';
ASSETS.trapTile.src = 'images/trap-tile.png';

// 设置玩家徽章图片
const player1Badge = BADGES.find(badge => badge.id === selectedBadges.player1);
const player2Badge = BADGES.find(badge => badge.id === selectedBadges.player2);

if (player1Badge && player1Badge.innerImage) {
    ASSETS.player1InnerRing.src = player1Badge.innerImage;
} else {
    // 默认黄色徽章
    ASSETS.player1InnerRing = null; // 将使用绘制的黄色圆形
}

if (player2Badge && player2Badge.innerImage) {
    ASSETS.player2InnerRing.src = player2Badge.innerImage;
} else {
    // 默认黄色徽章
    ASSETS.player2InnerRing = null; // 将使用绘制的黄色圆形
}

// 游戏常量配置
const CONFIG = {
    MAP_COLS: 6,
    MAP_ROWS: 12,
    TILE_SIZE: 50,
    BADGE_OUTER_RADIUS: 20,
    BADGE_INNER_RADIUS: 16,  // 增大内圈判定半径以匹配图片大小
    MAX_DISTANCE: 8,
    COLORS: {
        player1: {
            outer: '#ff4444',
            inner: '#ff8888'
        },
        player2: {
            outer: '#4444ff',
            inner: '#8888ff'
        },
        trap: '#aa3333',
        heal: '#33aa33',
        normal: '#445566'
    }
};

// 游戏状态
let gameState = {
    currentPlayer: 1,
    turn: 1,
    phase: 'direction',
    isAI: isAIFromStorage, // 使用从localStorage读取的AI设置
    aiDifficulty: aiDifficultyFromStorage, // AI难度设置
    players: [
        { id: 1, x: 2.5, y: 0, health: 100, skipTurn: false, onHealTile: false, isInvincible: false, isDefeated: false },
        { id: 2, x: 2.5, y: CONFIG.MAP_ROWS - 1, health: 100, skipTurn: false, onHealTile: false, isInvincible: false, isDefeated: false }
    ],
    map: [],
    directionAngle: 0,
    power: 0,
    animationId: null,
    moveProgress: 0,
    badgeScale: 1,
    goldenTile: null,
    movesToWin: 0,
    isFinalPhase: false
};

const canvas = document.getElementById('game-canvas');
const ctx = canvas.getContext('2d');
const powerSliderContainer = document.getElementById('power-slider-container');
const powerSlider = document.getElementById('power-slider');
const powerHandle = document.getElementById('power-handle');
const powerValue = document.getElementById('power-value');
const gameOver = document.getElementById('game-over');
const winnerText = document.getElementById('winner-text');
const restartBtn = document.getElementById('restart-btn');
const backHomeBtn = document.getElementById('back-home-btn');

let animationFrameId;
let lastTime = 0;
let powerDirection = 1;

function init() {
    // 清理之前的石头系统
    stoneSystem.clear();
    
    // 初始化音频系统
    initAudio();
    
    canvas.width = CONFIG.MAP_COLS * CONFIG.TILE_SIZE;
    canvas.height = CONFIG.MAP_ROWS * CONFIG.TILE_SIZE;
    initMap();
    updateUI();
    render();
    startDirectionSelection();
    
    canvas.addEventListener('click', function(event) {
        // 播放点击音效
        AUDIO.tap.currentTime = 0;
        AUDIO.tap.play().catch(e => console.log('点击音效播放失败:', e));
        handleCanvasClick(event);
    });
    powerSlider.addEventListener('click', function(event) {
        // 播放点击音效
        AUDIO.tap.currentTime = 0;
        AUDIO.tap.play().catch(e => console.log('点击音效播放失败:', e));
        handlePowerClick(event);
    });
    restartBtn.addEventListener('click', function() {
        // 播放点击音效
        AUDIO.tap.currentTime = 0;
        AUDIO.tap.play().catch(e => console.log('点击音效播放失败:', e));
        resetGame();
    });
    backHomeBtn.addEventListener('click', function() {
        // 播放点击音效
        AUDIO.tap.currentTime = 0;
        AUDIO.tap.play().catch(e => console.log('点击音效播放失败:', e));
        window.location.href = 'index.html';
    });
    
    // 初始化石头系统
    setTimeout(() => {
        stoneSystem.init();
    }, 500);
}

function initMap() {
    gameState.map = [];
    for (let y = 0; y < CONFIG.MAP_ROWS; y++) {
        gameState.map[y] = [];
        for (let x = 0; x < CONFIG.MAP_COLS; x++) {
            gameState.map[y][x] = { type: 'normal' };
        }
    }
    
    const availablePositions = [];
    for (let y = 1; y < CONFIG.MAP_ROWS - 1; y++) {
        for (let x = 0; x < CONFIG.MAP_COLS; x++) {
            if (y !== 2 && y !== 9) {
                availablePositions.push({ x, y });
            }
        }
    }
    
    for (let i = 0; i < 2; i++) {
        const randomIndex = Math.floor(Math.random() * availablePositions.length);
        const pos = availablePositions[randomIndex];
        gameState.map[pos.y][pos.x].type = 'trap';
        availablePositions.splice(randomIndex, 1);
    }
    
    if (availablePositions.length > 0) {
        const randomIndex = Math.floor(Math.random() * availablePositions.length);
        const healPos = availablePositions[randomIndex];
        gameState.map[healPos.y][healPos.x].type = 'heal';
    }
}

function startDirectionSelection() {
    gameState.phase = 'direction';
    gameState.directionAngle = 0;
    
    // 如果是AI回合，直接执行AI决策
    if (gameState.isAI && gameState.currentPlayer === 1) {
        // 根据难度调整AI思考时间
        let thinkingTime;
        switch(gameState.aiDifficulty) {
            case 'easy':
                thinkingTime = 800 + Math.random() * 500; // 0.8-1.3秒（简单难度）
                break;
            case 'medium':
                thinkingTime = 500 + Math.random() * 300; // 0.5-0.8秒（中等难度）
                break;
            case 'hard':
                thinkingTime = 300 + Math.random() * 200; // 0.3-0.5秒（困难难度反应快）
                break;
            default:
                thinkingTime = 500 + Math.random() * 300; // 默认中等难度
        }
        
        console.log(`AI回合开始，思考时间: ${thinkingTime.toFixed(0)}ms`);
        
        setTimeout(() => {
            makeAIDecision();
        }, thinkingTime);
        return;
    }
    
    function animate(timestamp) {
        if (gameState.phase !== 'direction') return;
        
        const deltaTime = timestamp - lastTime;
        lastTime = timestamp;
        
        gameState.directionAngle = (gameState.directionAngle + deltaTime * 0.005) % (Math.PI * 2);
        render();
        
        animationFrameId = requestAnimationFrame(animate);
    }
    
    lastTime = performance.now();
    animationFrameId = requestAnimationFrame(animate);
}

// AI决策函数
function makeAIDecision() {
    const aiPlayer = gameState.players[0]; // AI是玩家1
    const humanPlayer = gameState.players[1]; // 人类是玩家2
    
    // 分析游戏状态
    const aiX = (aiPlayer.x + 0.5) * CONFIG.TILE_SIZE;
    const aiY = (aiPlayer.y + 0.5) * CONFIG.TILE_SIZE;
    const aiHealth = aiPlayer.health;
    const isHumanInvincible = humanPlayer.isInvincible || false; // 检查玩家是否无敌
    const isAIInjured = aiHealth < 100; // 检查AI是否受伤（血量低于100%）
    
    let targetX, targetY;
    
    // 寻找恢复格子
    function findHealTiles() {
        const healTiles = [];
        for (let row = 0; row < CONFIG.MAP_ROWS; row++) {
            for (let col = 0; col < CONFIG.MAP_COLS; col++) {
                const tile = gameState.map[row][col];
                if (tile && tile.type === 'heal') {
                    healTiles.push({x: col, y: row});
                }
            }
        }
        return healTiles;
    }
    
    // 如果处于最终阶段（黄金圣杯阶段），优先移动到金色格子
    if (gameState.isFinalPhase && gameState.goldenTile) {
        console.log('AI: 检测到最终阶段，目标金色格子');
        targetX = (gameState.goldenTile.x + 0.5) * CONFIG.TILE_SIZE;
        targetY = (gameState.goldenTile.y + 0.5) * CONFIG.TILE_SIZE;
        
        // 简单难度的AI在最终阶段可能会犹豫
        if (gameState.aiDifficulty === 'easy' && Math.random() < 0.3) {
            // 30%的概率错误地攻击玩家而不是移动到金色格子
            targetX = (humanPlayer.x + 0.5) * CONFIG.TILE_SIZE;
            targetY = (humanPlayer.y + 0.5) * CONFIG.TILE_SIZE;
            console.log('AI (简单): 错误决策 - 攻击玩家而非金色格子');
        }
    } 
    // 如果玩家处于无敌状态，AI选择逃跑
    else if (isHumanInvincible) {
        console.log('AI: 检测到玩家无敌状态，选择逃跑');
        
        // 计算远离玩家的方向
        const escapeDirection = Math.atan2(aiY - humanPlayer.y * CONFIG.TILE_SIZE, aiX - humanPlayer.x * CONFIG.TILE_SIZE);
        
        // 根据难度调整逃跑距离
        let escapeDistance;
        switch(gameState.aiDifficulty) {
            case 'easy':
                escapeDistance = CONFIG.TILE_SIZE * (2 + Math.random() * 2); // 逃跑距离2-4格（简单）
                break;
            case 'medium':
                escapeDistance = CONFIG.TILE_SIZE * (4 + Math.random() * 2); // 逃跑距离4-6格（中等）
                break;
            case 'hard':
                escapeDistance = CONFIG.TILE_SIZE * (6 + Math.random() * 2); // 逃跑距离6-8格（困难）
                break;
            default:
                escapeDistance = CONFIG.TILE_SIZE * (4 + Math.random() * 2);
        }
        
        targetX = aiX + Math.cos(escapeDirection) * escapeDistance;
        targetY = aiY + Math.sin(escapeDirection) * escapeDistance;
        
        // 确保目标位置在地图范围内
        targetX = Math.max(CONFIG.TILE_SIZE * 0.5, Math.min(targetX, CONFIG.TILE_SIZE * (CONFIG.MAP_COLS - 0.5)));
        targetY = Math.max(CONFIG.TILE_SIZE * 0.5, Math.min(targetY, CONFIG.TILE_SIZE * (CONFIG.MAP_ROWS - 0.5)));
        
        console.log(`AI: 向方向 ${escapeDirection.toFixed(2)} 逃跑，距离 ${escapeDistance.toFixed(0)}px`);
    }
    // 如果AI受伤且有恢复格子，根据概率选择前往恢复格子
    else if (isAIInjured) {
        const healTiles = findHealTiles();
        let goToHealChance;
        
        // 根据难度设置寻找恢复格子的概率
        switch(gameState.aiDifficulty) {
            case 'easy':
                goToHealChance = 0.6; // 60%概率（简单难度，使用原来的中难度参数）
                break;
            case 'medium':
                goToHealChance = 0.78; // 78%概率（中等难度，比原来中难度难30%）
                break;
            case 'hard':
                goToHealChance = 0.9; // 90%概率（困难难度）
                break;
            default:
                goToHealChance = 0.78;
        }
        
        if (healTiles.length > 0 && Math.random() < goToHealChance) {
            // 选择最近的恢复格子
            const closestHealTile = healTiles.reduce((closest, tile) => {
                const tileX = (tile.x + 0.5) * CONFIG.TILE_SIZE;
                const tileY = (tile.y + 0.5) * CONFIG.TILE_SIZE;
                const distanceToCurrent = Math.sqrt(Math.pow(tileX - aiX, 2) + Math.pow(tileY - aiY, 2));
                const distanceToClosest = Math.sqrt(Math.pow(closest.x - aiX, 2) + Math.pow(closest.y - aiY, 2));
                return distanceToCurrent < distanceToClosest ? {x: tileX, y: tileY} : closest;
            }, {x: healTiles[0].x * CONFIG.TILE_SIZE + CONFIG.TILE_SIZE/2, y: healTiles[0].y * CONFIG.TILE_SIZE + CONFIG.TILE_SIZE/2});
            
            targetX = closestHealTile.x;
            targetY = closestHealTile.y;
            console.log(`AI: 健康值${aiHealth}%，选择前往恢复格子 (${targetX.toFixed(0)}, ${targetY.toFixed(0)})`);
        } else {
            // 正常阶段，攻击人类玩家
            targetX = (humanPlayer.x + 0.5) * CONFIG.TILE_SIZE;
            targetY = (humanPlayer.y + 0.5) * CONFIG.TILE_SIZE;
            console.log(`AI: 健康值${aiHealth}%，选择攻击玩家`);
        }
    } else {
        // 正常阶段，攻击人类玩家
        targetX = (humanPlayer.x + 0.5) * CONFIG.TILE_SIZE;
        targetY = (humanPlayer.y + 0.5) * CONFIG.TILE_SIZE;
        
        // 根据难度调整瞄准精度
        switch(gameState.aiDifficulty) {
            case 'easy':
                // 简单难度：明显的瞄准偏差
                targetX += (Math.random() - 0.5) * CONFIG.TILE_SIZE * 4;
                targetY += (Math.random() - 0.5) * CONFIG.TILE_SIZE * 4;
                break;
            case 'medium':
                // 中等难度：中等的瞄准偏差
                targetX += (Math.random() - 0.5) * CONFIG.TILE_SIZE * 2;
                targetY += (Math.random() - 0.5) * CONFIG.TILE_SIZE * 2;
                break;
            case 'hard':
                // 困难难度：很小的瞄准偏差
                targetX += (Math.random() - 0.5) * CONFIG.TILE_SIZE * 0.5;
                targetY += (Math.random() - 0.5) * CONFIG.TILE_SIZE * 0.5;
                break;
        }
    }
    
    // 计算目标角度
    let targetAngle = Math.atan2(targetY - aiY, targetX - aiX);
    
    // 根据难度调整随机性（角度偏移）
    let randomOffset;
    switch(gameState.aiDifficulty) {
        case 'easy':
            randomOffset = (Math.random() - 0.5) * 1.2; // ±60度的随机偏移（简单难度）
            break;
        case 'medium':
            randomOffset = (Math.random() - 0.5) * 0.6; // ±30度的随机偏移（中等难度）
            break;
        case 'hard':
            randomOffset = (Math.random() - 0.5) * 0.2; // ±10度的随机偏移（困难难度）
            break;
        default:
            randomOffset = (Math.random() - 0.5) * 0.6; // 默认中等难度
    }
    targetAngle += randomOffset;
    
    gameState.directionAngle = targetAngle;
    
    // 计算到目标的距离
    const distanceToTarget = Math.sqrt(Math.pow(targetX - aiX, 2) + Math.pow(targetY - aiY, 2));
    const tilesToTarget = distanceToTarget / CONFIG.TILE_SIZE;
    
    // 根据距离选择力度
    let targetPower = Math.min(tilesToTarget / CONFIG.MAX_DISTANCE, 1);
    
    // 根据难度调整力度的随机性
    let powerRandomFactor;
    switch(gameState.aiDifficulty) {
        case 'easy':
            powerRandomFactor = (Math.random() - 0.5) * 0.6; // ±30%的随机力度变化（简单难度）
            break;
        case 'medium':
            powerRandomFactor = (Math.random() - 0.5) * 0.3; // ±15%的随机力度变化（中等难度）
            break;
        case 'hard':
            powerRandomFactor = (Math.random() - 0.5) * 0.1; // ±5%的随机力度变化（困难难度）
            break;
        default:
            powerRandomFactor = (Math.random() - 0.5) * 0.3; // 默认中等难度
    }
    targetPower += powerRandomFactor;
    targetPower = Math.max(0, Math.min(1, targetPower));
    
    gameState.power = targetPower;
    
    // 模拟力度选择过程
    setTimeout(() => {
        powerSliderContainer.classList.remove('hidden');
        
        setTimeout(() => {
            powerSliderContainer.classList.add('hidden');
            gameState.phase = 'moving';
            
            const distance = gameState.power * CONFIG.MAX_DISTANCE;
            moveBadge(distance);
        }, 500);
    }, 500);
}

function handleCanvasClick(e) {
    if (gameState.phase !== 'direction') return;
    
    cancelAnimationFrame(animationFrameId);
    gameState.phase = 'power';
    startPowerSelection();
}

function startPowerSelection() {
    powerSliderContainer.classList.remove('hidden');
    gameState.power = 0;
    powerDirection = 1;
    
    function animate(timestamp) {
        if (gameState.phase !== 'power') return;
        
        const deltaTime = timestamp - lastTime;
        lastTime = timestamp;
        
        gameState.power += powerDirection * deltaTime * 0.0015;
        if (gameState.power >= 1) {
            gameState.power = 1;
            powerDirection = -1;
        } else if (gameState.power <= 0) {
            gameState.power = 0;
            powerDirection = 1;
        }
        
        const handlePos = gameState.power * (powerSlider.offsetWidth - 30);
        powerHandle.style.left = handlePos + 'px';
        
        animationFrameId = requestAnimationFrame(animate);
    }
    
    lastTime = performance.now();
    animationFrameId = requestAnimationFrame(animate);
}

function handlePowerClick(e) {
    if (gameState.phase !== 'power') return;
    
    cancelAnimationFrame(animationFrameId);
    powerSliderContainer.classList.add('hidden');
    gameState.phase = 'moving';
    
    const distance = gameState.power * CONFIG.MAX_DISTANCE;
    moveBadge(distance);
}

function moveBadge(distance) {
    // 播放移动音效
    playAudio('jump');
    
    const player = gameState.players[gameState.currentPlayer - 1];
    const angle = gameState.directionAngle;
    gameState.moveProgress = 0;
    gameState.badgeScale = 1;
    
    const startX = (player.x + 0.5) * CONFIG.TILE_SIZE;
    const startY = (player.y + 0.5) * CONFIG.TILE_SIZE;
    
    const targetX = startX + Math.cos(angle) * distance * CONFIG.TILE_SIZE;
    const targetY = startY + Math.sin(angle) * distance * CONFIG.TILE_SIZE;
    
    const prevX = player.x;
    const prevY = player.y;
    
    function animateMove(timestamp) {
        if (gameState.phase !== 'moving') return;
        
        const deltaTime = timestamp - lastTime;
        lastTime = timestamp;
        
        gameState.moveProgress += deltaTime * 0.0012;
        
        if (gameState.moveProgress >= 1) {
            gameState.moveProgress = 1;
            gameState.badgeScale = 1;
        } else {
            const jumpHeight = Math.sin(gameState.moveProgress * Math.PI);
            gameState.badgeScale = 1 + jumpHeight * 0.4;
        }
        
        const currentX = startX + (targetX - startX) * gameState.moveProgress;
        const currentY = startY + (targetY - startY) * gameState.moveProgress;
        
        player.x = (currentX / CONFIG.TILE_SIZE) - 0.5;
        player.y = (currentY / CONFIG.TILE_SIZE) - 0.5;
        
        render();
        
        if (gameState.moveProgress < 1) {
            animationFrameId = requestAnimationFrame(animateMove);
        } else {
            const isOutOfBounds = checkOutOfBounds(player);
            if (isOutOfBounds) {
                player.x = prevX;
                player.y = prevY;
                player.health = Math.max(0, player.health - 25);
                updateUI();
                
                if (gameState.isFinalPhase) {
                    const defeatedPlayer = gameState.players.find(p => p.isDefeated);
                    if (defeatedPlayer) {
                        defeatedPlayer.health = 50;
                        defeatedPlayer.isDefeated = false;
                    }
                    
                    // 不清除无敌效果，保持玩家1的无敌直到下回合
                    
                    if (gameState.goldenTile) {
                        gameState.map[gameState.goldenTile.y][gameState.goldenTile.x].type = 'normal';
                        gameState.goldenTile = null;
                    }
                    gameState.isFinalPhase = false;
                    updateUI();
                    render();
                    
                    // 切换到玩家2行动
                    gameState.currentPlayer = gameState.currentPlayer === 1 ? 2 : 1;
                    
                    setTimeout(() => {
                        startDirectionSelection();
                    }, 500);
                } else {
                    checkGameOver();
                    setTimeout(() => {
                        nextTurn();
                    }, 500);
                }
            } else {
                if (gameState.isFinalPhase) {
                    checkGoldenTile();
                } else {
                    checkCollisions();
                    checkTileEffects();
                    
                    setTimeout(() => {
                        nextTurn();
                    }, 800);
                }
            }
        }
    }
    
    lastTime = performance.now();
    animationFrameId = requestAnimationFrame(animateMove);
}

function checkCollisions() {
    const currentPlayer = gameState.players[gameState.currentPlayer - 1];
    const opponentPlayer = gameState.players[gameState.currentPlayer === 1 ? 1 : 0];
    
    const currentX = (currentPlayer.x + 0.5) * CONFIG.TILE_SIZE;
    const currentY = (currentPlayer.y + 0.5) * CONFIG.TILE_SIZE;
    const opponentX = (opponentPlayer.x + 0.5) * CONFIG.TILE_SIZE;
    const opponentY = (opponentPlayer.y + 0.5) * CONFIG.TILE_SIZE;
    
    const distance = Math.sqrt(
        Math.pow(currentX - opponentX, 2) + 
        Math.pow(currentY - opponentY, 2)
    );
    
    console.log('=== 碰撞检测 ===');
    console.log('当前玩家:', currentPlayer.id);
    console.log('两徽章距离:', distance.toFixed(2));
    console.log('内圈判定阈值:', CONFIG.BADGE_INNER_RADIUS * 2);
    console.log('外圈判定阈值:', CONFIG.BADGE_OUTER_RADIUS * 2);
    console.log('对方是否无敌:', opponentPlayer.isInvincible);
    
    let damageDealt = false;
    
    if (!opponentPlayer.isInvincible) {
        if (distance <= CONFIG.BADGE_INNER_RADIUS * 2) {
            opponentPlayer.health = Math.max(0, opponentPlayer.health - 100);
            damageDealt = true;
            console.log('内圈命中！造成 100 伤害');
        } else if (distance <= CONFIG.BADGE_OUTER_RADIUS * 2) {
            opponentPlayer.health = Math.max(0, opponentPlayer.health - 50);
            damageDealt = true;
            console.log('外圈命中！造成 50 伤害');
        }
    }
    
    console.log('是否造成伤害:', damageDealt);
    if (damageDealt) {
        // 播放攻击音效
        playAudio('attack');
        currentPlayer.isInvincible = true;
    }
    
    updateUI();
    render();
    checkGameOver();
}

function checkTileEffects() {
    const player = gameState.players[gameState.currentPlayer - 1];
    const badgeCenterX = (player.x + 0.5) * CONFIG.TILE_SIZE;
    const badgeCenterY = (player.y + 0.5) * CONFIG.TILE_SIZE;
    
    const startTileX = Math.max(0, Math.floor((badgeCenterX - CONFIG.BADGE_OUTER_RADIUS) / CONFIG.TILE_SIZE));
    const endTileX = Math.min(CONFIG.MAP_COLS - 1, Math.floor((badgeCenterX + CONFIG.BADGE_OUTER_RADIUS) / CONFIG.TILE_SIZE));
    const startTileY = Math.max(0, Math.floor((badgeCenterY - CONFIG.BADGE_OUTER_RADIUS) / CONFIG.TILE_SIZE));
    const endTileY = Math.min(CONFIG.MAP_ROWS - 1, Math.floor((badgeCenterY + CONFIG.BADGE_OUTER_RADIUS) / CONFIG.TILE_SIZE));
    
    for (let tileY = startTileY; tileY <= endTileY; tileY++) {
        for (let tileX = startTileX; tileX <= endTileX; tileX++) {
            const tile = gameState.map[tileY][tileX];
            const tileCenterX = (tileX + 0.5) * CONFIG.TILE_SIZE;
            const tileCenterY = (tileY + 0.5) * CONFIG.TILE_SIZE;
            
            const overlapArea = calculateCircleRectangleOverlap(
                badgeCenterX, badgeCenterY, CONFIG.BADGE_OUTER_RADIUS,
                tileX * CONFIG.TILE_SIZE, tileY * CONFIG.TILE_SIZE,
                (tileX + 1) * CONFIG.TILE_SIZE, (tileY + 1) * CONFIG.TILE_SIZE
            );
            
            const badgeArea = Math.PI * CONFIG.BADGE_OUTER_RADIUS * CONFIG.BADGE_OUTER_RADIUS;
            const tileArea = CONFIG.TILE_SIZE * CONFIG.TILE_SIZE;
            const coverage = overlapArea / Math.min(badgeArea, tileArea);
            
            if (coverage >= 0.5) {
                if (tile.type === 'trap') {
                    // 检查是否有玩家生命值归0，如果有则不应用陷阱效果
                    const opponentPlayer = gameState.players.find(p => p.id !== player.id);
                    if (opponentPlayer.health > 0) {
                        player.skipTurn = true;
                        // 播放陷阱音效
                        playAudio('trap');
                        // 显示陷阱效果
                        showTrapEffect(tileX, tileY);
                    } else {
                        console.log('敌人生命值已归0，陷阱效果不生效');
                    }
                } else if (tile.type === 'heal') {
                    if (!player.onHealTile) {
                        player.health = Math.min(100, player.health + 50);
                        player.onHealTile = true;
                        gameState.map[tileY][tileX].type = 'normal';
                        moveHealTile();
                        // 播放恢复音效
                        playAudio('heal');
                        // 显示恢复效果
                        showHealEffect(tileX, tileY);
                    }
                }
            }
        }
    }
    
    for (let y = 0; y < CONFIG.MAP_ROWS; y++) {
        for (let x = 0; x < CONFIG.MAP_COLS; x++) {
            if (gameState.map[y][x].type === 'heal') {
                const tileCenterX = (x + 0.5) * CONFIG.TILE_SIZE;
                const tileCenterY = (y + 0.5) * CONFIG.TILE_SIZE;
                const distance = Math.sqrt(
                    Math.pow(badgeCenterX - tileCenterX, 2) +
                    Math.pow(badgeCenterY - tileCenterY, 2)
                );
                if (distance > CONFIG.BADGE_OUTER_RADIUS + CONFIG.TILE_SIZE / 2) {
                    player.onHealTile = false;
                }
            }
        }
    }
    
    updateUI();
}

function calculateCircleRectangleOverlap(cx, cy, r, left, top, right, bottom) {
    const closestX = Math.max(left, Math.min(cx, right));
    const closestY = Math.max(top, Math.min(cy, bottom));
    
    const distanceX = cx - closestX;
    const distanceY = cy - closestY;
    const distanceSquared = distanceX * distanceX + distanceY * distanceY;
    
    if (distanceSquared < r * r) {
        if (cx >= left && cx <= right && cy >= top && cy <= bottom) {
            return Math.PI * r * r;
        }
        
        return (r * r * Math.acos(Math.sqrt(distanceSquared) / r) - 
                Math.sqrt(distanceSquared) * Math.sqrt(r * r - distanceSquared));
    }
    
    return 0;
}

function moveHealTile() {
    const availablePositions = [];
    for (let y = 0; y < CONFIG.MAP_ROWS; y++) {
        for (let x = 0; x < CONFIG.MAP_COLS; x++) {
            if (gameState.map[y][x].type === 'normal') {
                if (y !== 0 || x !== 2) {
                    if (y !== CONFIG.MAP_ROWS - 1 || x !== 2) {
                        availablePositions.push({ x, y });
                    }
                }
            }
        }
    }
    
    if (availablePositions.length > 0) {
        const randomIndex = Math.floor(Math.random() * availablePositions.length);
        const newPos = availablePositions[randomIndex];
        gameState.map[newPos.y][newPos.x].type = 'heal';
    }
}

function checkGoldenTile() {
    const player = gameState.players[gameState.currentPlayer - 1];
    const playerTileX = Math.round(player.x);
    const playerTileY = Math.round(player.y);
    
    if (gameState.goldenTile) {
        if (playerTileX === gameState.goldenTile.x && playerTileY === gameState.goldenTile.y) {
            gameState.map[gameState.goldenTile.y][gameState.goldenTile.x].type = 'normal';
            gameState.goldenTile = null;
            gameState.isFinalPhase = false;
            const defeatedPlayer = gameState.players.find(p => p.isDefeated);
            if (defeatedPlayer) {
                defeatedPlayer.health = 0;
            }
            const winnerId = gameState.currentPlayer;
            setTimeout(() => {
                showGameOver(winnerId);
            }, 300);
            updateUI();
            render();
            return;
        }
    }
    
    gameState.movesToWin--;
    
    if (gameState.movesToWin <= 0) {
        const defeatedPlayer = gameState.players.find(p => p.isDefeated);
        if (defeatedPlayer) {
            defeatedPlayer.health = 50;
            defeatedPlayer.isDefeated = false;
        }
        
        // 不清除无敌效果，保持玩家1的无敌直到下回合
        
        if (gameState.goldenTile) {
            gameState.map[gameState.goldenTile.y][gameState.goldenTile.x].type = 'normal';
            gameState.goldenTile = null;
        }
        gameState.isFinalPhase = false;
        updateUI();
        render();
        
        // 切换到玩家2行动
        gameState.currentPlayer = gameState.currentPlayer === 1 ? 2 : 1;
        
        setTimeout(() => {
            startDirectionSelection();
        }, 500);
    } else {
        setTimeout(() => {
            startDirectionSelection();
        }, 500);
    }
}

function checkOutOfBounds(player) {
    const badgeCenterX = (player.x + 0.5) * CONFIG.TILE_SIZE;
    const badgeCenterY = (player.y + 0.5) * CONFIG.TILE_SIZE;
    
    const totalArea = Math.PI * CONFIG.BADGE_OUTER_RADIUS * CONFIG.BADGE_OUTER_RADIUS;
    const outOfBoundsArea = calculateOutOfBoundsArea(badgeCenterX, badgeCenterY, CONFIG.BADGE_OUTER_RADIUS, 
                                                    canvas.width, canvas.height);
    
    const coverage = outOfBoundsArea / totalArea;
    return coverage >= 0.5;
}

function calculateOutOfBoundsArea(centerX, centerY, radius, canvasWidth, canvasHeight) {
    let outOfBoundsArea = 0;
    
    // 左侧超出
    if (centerX - radius < 0) {
        const rectLeft = centerX - radius;
        const rectTop = centerY - radius;
        const rectRight = 0;
        const rectBottom = centerY + radius;
        outOfBoundsArea += calculateCircleRectangleOverlap(centerX, centerY, radius, 
                                                         rectLeft, rectTop, rectRight, rectBottom);
    }
    
    // 右侧超出
    if (centerX + radius > canvasWidth) {
        const rectLeft = canvasWidth;
        const rectTop = centerY - radius;
        const rectRight = centerX + radius;
        const rectBottom = centerY + radius;
        outOfBoundsArea += calculateCircleRectangleOverlap(centerX, centerY, radius, 
                                                         rectLeft, rectTop, rectRight, rectBottom);
    }
    
    // 上侧超出
    if (centerY - radius < 0) {
        const rectLeft = centerX - radius;
        const rectTop = centerY - radius;
        const rectRight = centerX + radius;
        const rectBottom = 0;
        outOfBoundsArea += calculateCircleRectangleOverlap(centerX, centerY, radius, 
                                                         rectLeft, rectTop, rectRight, rectBottom);
    }
    
    // 下侧超出
    if (centerY + radius > canvasHeight) {
        const rectLeft = centerX - radius;
        const rectTop = canvasHeight;
        const rectRight = centerX + radius;
        const rectBottom = centerY + radius;
        outOfBoundsArea += calculateCircleRectangleOverlap(centerX, centerY, radius, 
                                                         rectLeft, rectTop, rectRight, rectBottom);
    }
    
    return outOfBoundsArea;
}

function nextTurn() {
    if (gameState.players[0].health <= 0 || gameState.players[1].health <= 0) {
        return;
    }
    
    const previousPlayer = gameState.currentPlayer;
    gameState.currentPlayer = gameState.currentPlayer === 1 ? 2 : 1;
    
    const currentPlayer = gameState.players[gameState.currentPlayer - 1];
    
    if (currentPlayer.skipTurn) {
        currentPlayer.skipTurn = false;
        gameState.players.forEach(player => {
            player.isInvincible = false;
        });
        if (previousPlayer === 2) {
            gameState.turn++;
        }
        updateUI();
        setTimeout(() => nextTurn(), 1000);
        return;
    }
    
    // 无敌效果只在玩家自己回合开始时清除
    // 玩家1的无敌效果持续到玩家2行动结束后，下一次玩家1行动开始时才清除
    if (gameState.currentPlayer === 1) {
        gameState.turn++;
        gameState.players[0].isInvincible = false; // 玩家1回合开始时清除无敌
    } else {
        // 玩家2回合开始时不清除玩家1的无敌效果
        // 只清除玩家2自己的无敌
        gameState.players[1].isInvincible = false;
    }
    
    updateUI();
    startDirectionSelection();
}

function checkGameOver() {
    if (gameState.isFinalPhase) {
        if (gameState.movesToWin <= 0) {
            const defeatedPlayer = gameState.players.find(p => p.isDefeated);
            if (defeatedPlayer) {
                defeatedPlayer.health = 50;
                defeatedPlayer.isDefeated = false;
                if (gameState.goldenTile) {
                    gameState.map[gameState.goldenTile.y][gameState.goldenTile.x].type = 'normal';
                    gameState.goldenTile = null;
                }
                gameState.isFinalPhase = false;
                updateUI();
                render();
            }
        }
        return;
    }
    
    if (gameState.players[0].health <= 0 && !gameState.players[0].isDefeated) {
        gameState.players[0].isDefeated = true;
        startFinalPhase(1);
    } else if (gameState.players[1].health <= 0 && !gameState.players[1].isDefeated) {
        gameState.players[1].isDefeated = true;
        startFinalPhase(2);
    }
}

function startFinalPhase(defeatedPlayerId) {
    const survivor = gameState.players.find(p => p.id !== defeatedPlayerId);
    const survivorX = Math.round(survivor.x);
    const survivorY = Math.round(survivor.y);
    
    const farPositions = [];
    const mediumPositions = [];
    
    for (let y = 0; y < CONFIG.MAP_ROWS; y++) {
        for (let x = 0; x < CONFIG.MAP_COLS; x++) {
            if (gameState.map[y][x].type === 'normal') {
                const distance = Math.abs(x - survivorX) + Math.abs(y - survivorY);
                if (distance >= 6) {
                    farPositions.push({ x, y });
                } else if (distance >= 4) {
                    mediumPositions.push({ x, y });
                }
            }
        }
    }
    
    let availablePositions = farPositions;
    if (availablePositions.length === 0) {
        availablePositions = mediumPositions;
    }
    if (availablePositions.length === 0) {
        for (let y = 0; y < CONFIG.MAP_ROWS; y++) {
            for (let x = 0; x < CONFIG.MAP_COLS; x++) {
                if (gameState.map[y][x].type === 'normal') {
                    const distance = Math.abs(x - survivorX) + Math.abs(y - survivorY);
                    if (distance >= 3) {
                        availablePositions.push({ x, y });
                    }
                }
            }
        }
    }
    
    if (availablePositions.length > 0) {
        const randomIndex = Math.floor(Math.random() * availablePositions.length);
        const goldenPos = availablePositions[randomIndex];
        gameState.map[goldenPos.y][goldenPos.x].type = 'golden';
        gameState.goldenTile = goldenPos;
        gameState.movesToWin = 2;
        gameState.isFinalPhase = true;
        
        if (survivor) {
            gameState.currentPlayer = survivor.id;
        }
        
        updateUI();
        render();
        startDirectionSelection();
    } else {
        const defeatedPlayer = gameState.players.find(p => p.id === defeatedPlayerId);
        defeatedPlayer.health = 50;
        defeatedPlayer.isDefeated = false;
        const survivorId = defeatedPlayerId === 1 ? 2 : 1;
        showGameOver(survivorId);
    }
}

function showGameOver(winner) {
    // 播放胜利音效
    playAudio('victory');
    // 停止BGM
    AUDIO.bgm.pause();
    
    winnerText.textContent = '玩家 ' + winner + ' 获胜！';
    
    // 显示获胜玩家的徽章
    const winnerBadgeId = winner === 1 ? selectedBadges.player1 : selectedBadges.player2;
    const winnerBadge = BADGES.find(badge => badge.id === winnerBadgeId);
    const winnerBadgeElement = document.getElementById('winner-badge');
    
    if (winnerBadge && winnerBadge.innerImage) {
        winnerBadgeElement.style.backgroundImage = `url('${winnerBadge.innerImage}')`;
    } else {
        winnerBadgeElement.style.backgroundImage = 'none';
        winnerBadgeElement.style.backgroundColor = '#ffcc00';
    }
    
    gameOver.classList.remove('hidden');
}

function updateUI() {
    document.getElementById('player1-health').style.width = gameState.players[0].health + '%';
    document.getElementById('player1-health-text').textContent = gameState.players[0].health;
    document.getElementById('player2-health').style.width = gameState.players[1].health + '%';
    document.getElementById('player2-health-text').textContent = gameState.players[1].health;
    
    let player1Status = gameState.players[0].skipTurn ? '跳过本回合' : '';
    if (gameState.players[0].isInvincible) {
        player1Status = player1Status ? player1Status + ' | ' : '';
        player1Status += '🛡 无敌';
    }
    document.getElementById('player1-skip').textContent = player1Status;
    
    let player2Status = gameState.players[1].skipTurn ? '跳过本回合' : '';
    if (gameState.players[1].isInvincible) {
        player2Status = player2Status ? player2Status + ' | ' : '';
        player2Status += '🛡 无敌';
    }
    document.getElementById('player2-skip').textContent = player2Status;
    
    document.getElementById('turn-text').textContent = '回合：' + gameState.turn;
    document.getElementById('current-player').textContent = '当前玩家：' + gameState.currentPlayer;
    
    if (gameState.isFinalPhase) {
        document.getElementById('current-player').textContent += ' | ⭐ 剩余步数：' + gameState.movesToWin;
    }
}

function render() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // 绘制背景图片
    if (ASSETS.background.complete) {
        ctx.drawImage(ASSETS.background, 0, 0, canvas.width, canvas.height);
    } else {
        // 如果背景图片未加载完成，使用黑色背景
        ctx.fillStyle = '#000000';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
    
    renderMap();
    
    if (gameState.phase === 'direction') {
        renderDirectionIndicator();
    }
    
    renderBadges();
}

function renderMap() {
    const time = Date.now() * 0.002;
    
    for (let y = 0; y < CONFIG.MAP_ROWS; y++) {
        for (let x = 0; x < CONFIG.MAP_COLS; x++) {
            const tile = gameState.map[y][x];
            const px = x * CONFIG.TILE_SIZE;
            const py = y * CONFIG.TILE_SIZE;
            
            // 使用新的地图格子素材图片绘制
            if (tile.type === 'normal' && ASSETS.mapTile.complete) {
                ctx.drawImage(ASSETS.mapTile, px, py, CONFIG.TILE_SIZE, CONFIG.TILE_SIZE);
            } else if (tile.type === 'heal' && ASSETS.healTile.complete) {
                ctx.drawImage(ASSETS.healTile, px, py, CONFIG.TILE_SIZE, CONFIG.TILE_SIZE);
            } else if (tile.type === 'trap' && ASSETS.trapTile.complete) {
                ctx.drawImage(ASSETS.trapTile, px, py, CONFIG.TILE_SIZE, CONFIG.TILE_SIZE);
            } else {
                // 金色格子和其他情况仍然使用颜色填充
                let color;
                if (tile.type === 'trap') {
                    const pulse = Math.sin(time * 3) * 0.2 + 0.8;
                    color = `rgba(255, ${Math.floor(80 * pulse)}, ${Math.floor(80 * pulse)}, 0.7)`;
                } else if (tile.type === 'heal') {
                    const pulse = Math.sin(time * 2) * 0.2 + 0.8;
                    color = `rgba(${Math.floor(80 * pulse)}, 255, ${Math.floor(80 * pulse)}, 0.7)`;
                } else if (tile.type === 'golden') {
                    const pulse = Math.sin(time * 4) * 0.2 + 0.8;
                    color = `rgba(255, ${Math.floor(204 * pulse)}, 0, 0.8)`;
                } else {
                    color = 'rgba(50, 50, 50, 0.6)';
                }
                
                ctx.fillStyle = color;
                ctx.fillRect(px, py, CONFIG.TILE_SIZE, CONFIG.TILE_SIZE);
                
                ctx.fillStyle = 'rgba(255, 255, 255, 0.05)';
                ctx.fillRect(px + 2, py + 2, CONFIG.TILE_SIZE - 4, CONFIG.TILE_SIZE - 4);
            }
            
            if (gameState.isFinalPhase) {
                ctx.strokeStyle = 'rgba(255, 204, 0, 0.5)';
                ctx.lineWidth = 2;
            } else {
                ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
                ctx.lineWidth = 1;
            }
            ctx.strokeRect(px, py, CONFIG.TILE_SIZE, CONFIG.TILE_SIZE);
            
            if (tile.type === 'trap') {
                const scale = 1 + Math.sin(time * 3) * 0.1;
                ctx.save();
                ctx.translate(px + CONFIG.TILE_SIZE / 2, py + CONFIG.TILE_SIZE / 2);
                ctx.scale(scale, scale);
                ctx.fillStyle = '#fff';
                ctx.font = 'bold 24px Arial';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.shadowColor = 'rgba(255, 100, 100, 0.8)';
                ctx.shadowBlur = 15;
                ctx.fillText('⚠', 0, 0);
                ctx.restore();
                ctx.shadowBlur = 0;
            } else if (tile.type === 'heal') {
                const scale = 1 + Math.sin(time * 2) * 0.1;
                ctx.save();
                ctx.translate(px + CONFIG.TILE_SIZE / 2, py + CONFIG.TILE_SIZE / 2);
                ctx.scale(scale, scale);
                ctx.fillStyle = '#fff';
                ctx.font = 'bold 24px Arial';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.shadowColor = 'rgba(100, 255, 100, 0.8)';
                ctx.shadowBlur = 15;
                ctx.fillText('❤', 0, 0);
                ctx.restore();
                ctx.shadowBlur = 0;
            } else if (tile.type === 'golden') {
                const rotation = time * 0.5;
                const scale = 1 + Math.sin(time * 4) * 0.15;
                ctx.save();
                ctx.translate(px + CONFIG.TILE_SIZE / 2, py + CONFIG.TILE_SIZE / 2);
                ctx.rotate(rotation);
                ctx.scale(scale, scale);
                ctx.fillStyle = '#fff';
                ctx.font = 'bold 28px Arial';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.shadowColor = '#ffcc00';
                ctx.shadowBlur = 25;
                ctx.fillText('⭐', 0, 0);
                ctx.restore();
                ctx.shadowBlur = 0;
            }
        }
    }
}

function renderBadges() {
    gameState.players.forEach(player => {
        if (player.isDefeated) return;
        
        const px = (player.x + 0.5) * CONFIG.TILE_SIZE;
        const py = (player.y + 0.5) * CONFIG.TILE_SIZE;
        
        let scale = 1;
        if (gameState.phase === 'moving' && player.id === gameState.currentPlayer) {
            scale = gameState.badgeScale;
        }
        
        ctx.save();
        ctx.translate(px, py);
        ctx.scale(scale, scale);
        
        if (player.isInvincible) {
            ctx.beginPath();
            ctx.arc(0, 0, CONFIG.BADGE_OUTER_RADIUS + 8, 0, Math.PI * 2);
            ctx.strokeStyle = 'rgba(255, 204, 0, 0.8)';
            ctx.lineWidth = 4;
            ctx.shadowColor = '#ffcc00';
            ctx.shadowBlur = 20;
            ctx.stroke();
            ctx.shadowBlur = 0;
        }
        
        ctx.beginPath();
        ctx.arc(0, 0, CONFIG.BADGE_OUTER_RADIUS, 0, Math.PI * 2);
        
        let outerGradient;
        const playerColor = player.id === 1 ? badgeColors.player1 : badgeColors.player2;
        
        // 根据颜色创建径向渐变
        outerGradient = ctx.createRadialGradient(-5, -5, 0, 0, 0, CONFIG.BADGE_OUTER_RADIUS);
        
        // 将十六进制颜色转换为rgba
        function hexToRgba(hex, alpha) {
            const r = parseInt(hex.slice(1, 3), 16);
            const g = parseInt(hex.slice(3, 5), 16);
            const b = parseInt(hex.slice(5, 7), 16);
            return `rgba(${r}, ${g}, ${b}, ${alpha})`;
        }
        
        outerGradient.addColorStop(0, hexToRgba(playerColor, 0.9));
        outerGradient.addColorStop(1, hexToRgba(playerColor, 0.7));
        // 添加外发光效果
        ctx.save();
        ctx.shadowColor = playerColor;
        ctx.shadowBlur = 20;
        ctx.fillStyle = outerGradient;
        ctx.fill();
        ctx.restore();
        
        ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
        ctx.beginPath();
        ctx.arc(-3, -3, CONFIG.BADGE_OUTER_RADIUS * 0.4, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.6)';
        ctx.lineWidth = 2;
        ctx.stroke();
        
        // 绘制内圈徽章图片
        const innerImage = player.id === 1 ? ASSETS.player1InnerRing : ASSETS.player2InnerRing;
        const innerSize = CONFIG.BADGE_INNER_RADIUS * 2; // 图片大小与判定半径匹配
        
        if (innerImage && innerImage.complete) {
            ctx.drawImage(innerImage, -innerSize/2, -innerSize/2, innerSize, innerSize);
        } else {
            // 如果没有图片或图片未加载完成，绘制黄色圆形
            ctx.beginPath();
            ctx.arc(0, 0, CONFIG.BADGE_INNER_RADIUS, 0, Math.PI * 2);
            
            // 黄色渐变
            const innerGradient = ctx.createRadialGradient(-3, -3, 0, 0, 0, CONFIG.BADGE_INNER_RADIUS);
            innerGradient.addColorStop(0, 'rgba(255, 215, 0, 0.9)');    // 金色
            innerGradient.addColorStop(1, 'rgba(255, 165, 0, 0.7)');    // 橙金色
            
            ctx.fillStyle = innerGradient;
            ctx.fill();
            
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)';
            ctx.lineWidth = 2;
            ctx.stroke();
        }
        
        // 移除了数字显示，现在只显示徽章图片
        
        ctx.restore();
    });
}

function renderDirectionIndicator() {
    const player = gameState.players[gameState.currentPlayer - 1];
    const px = (player.x + 0.5) * CONFIG.TILE_SIZE;
    const py = (player.y + 0.5) * CONFIG.TILE_SIZE;
    
    const indicatorRadius = CONFIG.BADGE_OUTER_RADIUS + 20;
    const indicatorX = px + Math.cos(gameState.directionAngle) * indicatorRadius;
    const indicatorY = py + Math.sin(gameState.directionAngle) * indicatorRadius;
    
    ctx.beginPath();
    ctx.arc(indicatorX, indicatorY, 8, 0, Math.PI * 2);
    
    const indicatorGradient = ctx.createRadialGradient(indicatorX - 2, indicatorY - 2, 0, indicatorX, indicatorY, 8);
    indicatorGradient.addColorStop(0, 'rgba(255, 255, 255, 0.9)');
    indicatorGradient.addColorStop(1, 'rgba(255, 204, 0, 0.8)');
    ctx.fillStyle = indicatorGradient;
    ctx.fill();
    
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.6)';
    ctx.lineWidth = 2;
    ctx.stroke();
    
    ctx.shadowColor = '#ffcc00';
    ctx.shadowBlur = 15;
    ctx.beginPath();
    ctx.arc(indicatorX, indicatorY, 5, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
    ctx.fill();
    ctx.shadowBlur = 0;
}

function resetGame() {
    // 清理石头系统
    stoneSystem.clear();
    cancelAnimationFrame(animationFrameId);
    
    gameState = {
        currentPlayer: 1,
        turn: 1,
        phase: 'direction',
        isAI: gameState.isAI, // 保持当前的AI设置状态
        players: [
            { id: 1, x: 2.5, y: 0, health: 100, skipTurn: false, onHealTile: false, isInvincible: false, isDefeated: false },
            { id: 2, x: 2.5, y: CONFIG.MAP_ROWS - 1, health: 100, skipTurn: false, onHealTile: false, isInvincible: false, isDefeated: false }
        ],
        map: [],
        directionAngle: 0,
        power: 0,
        animationId: null,
        moveProgress: 0,
        badgeScale: 1,
        goldenTile: null,
        movesToWin: 0,
        isFinalPhase: false
    };
    
    gameOver.classList.add('hidden');
    powerSliderContainer.classList.add('hidden');
    
    // 重新启动BGM
    if (AUDIO.bgm.paused) {
        AUDIO.bgm.currentTime = 0;
        AUDIO.bgm.play().catch(e => console.log('BGM播放失败:', e));
    }
    
    initMap();
    updateUI();
    render();
    startDirectionSelection();
}

init();