const container = document.getElementById('gameContainer');
const mazeContainer = document.getElementById('mazeContainer');
const customCursor = document.getElementById('customCursor');
const overlay = document.getElementById('overlay');
const startButton = document.getElementById('startButton');
const overlayMessage = document.getElementById('overlayMessage');
const startArea = document.getElementById('startArea');
const goalArea = document.getElementById('goalArea');

// --- 迷路の生成ロジック ---
const pathWidth = 60; // 道の太さ

// 迷路の頂点（折れ曲がるポイント）と、その「次の道」の属性を定義
const points = [
    { x: 50, y: 500, type: 'swamp-med', speed: 0.025 }, // スタート地点（最初から泥沼に変更）
    { x: 200, y: 500, type: 'swamp-med', speed: 0.025 }, // 右へ（泥沼）
    { x: 300, y: 400, type: 'swamp-light', speed: 0.05 }, // 右上へ斜め（少し重い）
    { x: 300, y: 200, type: 'swamp-heavy', speed: 0.01 }, // 上へ（非常に重い）
    { x: 150, y: 200, type: 'safe-fast', speed: 0.4 }, // 左へ（氷の道、速い）
    { x: 100, y: 100, type: 'safe', speed: 0.15 }, // 左上へ斜め
    { x: 350, y: 100, type: 'swamp-med', speed: 0.025 }, // 右へ（中くらい重い）
    { x: 500, y: 250, type: 'safe', speed: 0.15 }, // 右下へ斜め
    { x: 500, y: 450, type: 'swamp-heavy', speed: 0.008 }, // 下へ（激重）
    { x: 650, y: 450, type: 'safe', speed: 0.15 }, // 右へ
    { x: 730, y: 300, type: 'swamp-light', speed: 0.05 }, // 右上へ斜め
    { x: 730, y: 150, type: 'safe', speed: 0.15 } // ゴール地点
];

// スタートとゴールの位置を設定
startArea.style.left = (points[0].x - 40) + 'px';
startArea.style.top = (points[0].y - 25) + 'px';
goalArea.style.left = (points[points.length - 1].x - 40) + 'px';
goalArea.style.top = (points[points.length - 1].y - 40) + 'px';

// 頂点と頂点を結ぶDOM要素（道）を生成
for (let i = 0; i < points.length - 1; i++) {
    const p1 = points[i];
    const p2 = points[i+1];
    
    // 角を丸くするためのジョイント（関節）要素
    const joint = document.createElement('div');
    joint.className = `path ${p1.type}`;
    joint.dataset.speed = p1.speed;
    joint.style.width = pathWidth + 'px';
    joint.style.height = pathWidth + 'px';
    joint.style.borderRadius = '50%';
    joint.style.left = (p1.x - pathWidth/2) + 'px';
    joint.style.top = (p1.y - pathWidth/2) + 'px';
    mazeContainer.appendChild(joint);
    
    // p1からp2への直線要素
    const length = Math.hypot(p2.x - p1.x, p2.y - p1.y); // 2点間の距離
    const angle = Math.atan2(p2.y - p1.y, p2.x - p1.x) * 180 / Math.PI; // 角度
    
    const segment = document.createElement('div');
    segment.className = `path ${p2.type}`;
    segment.dataset.speed = p2.speed;
    segment.style.width = length + 'px';
    segment.style.height = pathWidth + 'px';
    segment.style.left = p1.x + 'px';
    segment.style.top = (p1.y - pathWidth/2) + 'px';
    segment.style.transformOrigin = '0 50%'; // 左端の中心を基準に回転
    segment.style.transform = `rotate(${angle}deg)`;
    mazeContainer.appendChild(segment);
}

// 最後のジョイント
const lastP = points[points.length - 1];
const finalJoint = document.createElement('div');
finalJoint.className = `path ${lastP.type}`;
finalJoint.dataset.speed = lastP.speed;
finalJoint.style.width = pathWidth + 'px';
finalJoint.style.height = pathWidth + 'px';
finalJoint.style.borderRadius = '50%';
finalJoint.style.left = (lastP.x - pathWidth/2) + 'px';
finalJoint.style.top = (lastP.y - pathWidth/2) + 'px';
mazeContainer.appendChild(finalJoint);

// --- ゲームループのロジック ---

let gameState = 'START_SCREEN'; // 'START_SCREEN', 'WAITING', 'PLAYING', 'GAMEOVER', 'CLEAR'
let mouseX = points[0].x;
let mouseY = points[0].y;
let cursorX = points[0].x;
let cursorY = points[0].y;
let animationFrameId;

let containerRect = container.getBoundingClientRect();
window.addEventListener('resize', () => {
    containerRect = container.getBoundingClientRect();
});

container.addEventListener('mousemove', (e) => {
    if (gameState === 'START_SCREEN' || gameState === 'GAMEOVER' || gameState === 'CLEAR') return;
    mouseX = e.clientX - containerRect.left;
    mouseY = e.clientY - containerRect.top;
});

container.addEventListener('mouseleave', () => {
    if (gameState === 'PLAYING') gameOver("マウスが画面外に出ました！");
});

function startGame() {
    overlay.style.display = 'none';
    customCursor.style.display = 'block';
    startArea.style.backgroundColor = '#3498db'; // スタートエリアの色をリセット
    
    // 待機状態に移行（STARTエリアに乗るまで壁判定なし）
    gameState = 'WAITING';
    
    // カーソルを実際のマウス位置に一瞬で合わせる
    cursorX = mouseX;
    cursorY = mouseY;
    updateCursorPosition();
    
    if (!animationFrameId) {
        animationFrameId = requestAnimationFrame(gameLoop);
    }
}

function gameOver(reason) {
    gameState = 'GAMEOVER';
    cancelAnimationFrame(animationFrameId);
    animationFrameId = null;
    customCursor.style.display = 'none';
    overlay.style.display = 'flex';
    overlayMessage.innerText = `ゲームオーバー\n（${reason}）`;
    startButton.innerText = "もう一度挑戦";
}

function gameClear() {
    gameState = 'CLEAR';
    cancelAnimationFrame(animationFrameId);
    animationFrameId = null;
    customCursor.style.display = 'none';
    overlay.style.display = 'flex';
    overlayMessage.innerText = "✨ ゲームクリア！ ✨";
    startButton.innerText = "もう一度遊ぶ";
}

function updateCursorPosition() {
    customCursor.style.left = cursorX + 'px';
    customCursor.style.top = cursorY + 'px';
}

function gameLoop() {
    if (gameState === 'START_SCREEN' || gameState === 'GAMEOVER' || gameState === 'CLEAR') return;

    const elementUnderCursor = document.elementFromPoint(
        cursorX + containerRect.left, 
        cursorY + containerRect.top
    );

    let speedFactor = 0.15; // デフォルトスピード

    if (gameState === 'WAITING') {
        speedFactor = 1.0; // 待機中はマウスに完全同期（壁判定なし）
        
        if (elementUnderCursor && (elementUnderCursor.classList.contains('start-area') || elementUnderCursor.id === 'startArea')) {
            // STARTエリアに乗ったらゲーム開始
            gameState = 'PLAYING';
            startArea.style.backgroundColor = '#2ecc71'; // 開始の合図で色を変える
        }
    } else if (gameState === 'PLAYING') {
        if (elementUnderCursor) {
            // データ属性からスピードを取得
            if (elementUnderCursor.dataset.speed) {
                speedFactor = parseFloat(elementUnderCursor.dataset.speed);
            }

            // ゴール判定
            if (elementUnderCursor.classList.contains('goal-area') || elementUnderCursor.id === 'goalArea') {
                gameClear();
                return;
            } 
            // 壁判定
            else if (!elementUnderCursor.classList.contains('path') && 
                     !elementUnderCursor.classList.contains('start-area') && 
                     elementUnderCursor.id !== 'startArea') {
                gameOver("壁（緑色）に触れてしまいました");
                return;
            }
        }
    }

    cursorX += (mouseX - cursorX) * speedFactor;
    cursorY += (mouseY - cursorY) * speedFactor;

    updateCursorPosition();
    animationFrameId = requestAnimationFrame(gameLoop);
}

startButton.addEventListener('click', startGame);
