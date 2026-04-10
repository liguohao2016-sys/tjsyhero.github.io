// 主页背景音乐
const homeBgm = new Audio('audio/home bgm.mp3');
// 点击音效
const tapSound = new Audio('audio/tap.mp3');

// 初始化主页音频
function initHomeAudio() {
    homeBgm.loop = true;
    homeBgm.volume = 0.5;
    
    // 尝试自动播放
    homeBgm.play().catch(e => {
        console.log('主页BGM自动播放失败，等待用户交互:', e);
        // 监听用户交互事件，在用户交互后播放
        function playOnInteraction() {
            homeBgm.play().catch(e => console.log('主页BGM播放失败:', e));
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

// 停止主页音频
function stopHomeAudio() {
    homeBgm.pause();
}

// 播放点击音效
function playTapSound() {
    tapSound.currentTime = 0;
    tapSound.play().catch(e => console.log('点击音效播放失败:', e));
}

// 等待DOM加载完成
document.addEventListener('DOMContentLoaded', function() {
    // 初始化音频
    initHomeAudio();
    
    // 获取所有需要的元素
    const startGameBtn = document.getElementById('start-game-btn');
    const gameRulesBtn = document.getElementById('game-rules-btn');
    const rulesModal = document.getElementById('rules-modal');
    const closeRulesBtn = document.getElementById('close-rules-btn');
    
    // 开始游戏按钮
    if (startGameBtn) {
        startGameBtn.addEventListener('click', function() {
            // 播放点击音效
            playTapSound();
            // 停止主页背景音乐
            stopHomeAudio();
            window.location.href = 'select-badge.html';
        });
    }
    
    // 网络对战按钮
    const networkGameBtn = document.getElementById('network-game-btn');
    if (networkGameBtn) {
        networkGameBtn.addEventListener('click', function() {
            // 播放点击音效
            playTapSound();
            // 停止主页背景音乐
            stopHomeAudio();
            window.location.href = 'room-match.html';
        });
    }
    
    // 游戏说明按钮
    if (gameRulesBtn && rulesModal) {
        gameRulesBtn.addEventListener('click', function() {
            // 播放点击音效
            playTapSound();
            rulesModal.classList.remove('hidden');
        });
    }
    
    // 关闭游戏说明按钮
    if (closeRulesBtn && rulesModal) {
        closeRulesBtn.addEventListener('click', function(e) {
            // 播放点击音效
            playTapSound();
            e.stopPropagation(); // 阻止事件冒泡
            rulesModal.classList.add('hidden');
        });
    }
    
    // 点击模态框背景关闭
    if (rulesModal) {
        rulesModal.addEventListener('click', function(e) {
            if (e.target === rulesModal) {
                // 播放点击音效
                playTapSound();
                rulesModal.classList.add('hidden');
            }
        });
    }
});