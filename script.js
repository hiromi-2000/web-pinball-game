// ゲーム要素の取得
const gameArea = document.getElementById("game-area");
const ball = document.getElementById("ball");
const paddle = document.getElementById("paddle");
const scoreElement = document.getElementById("score");
const startButton = document.getElementById("start-button");
const resetButton = document.getElementById("reset-button");

// ゲーム設定
let gameRunning = false;
let score = 0;
let ballX = 290;
let ballY = 300;
let ballSpeedX = 0;
let ballSpeedY = 0;
let paddleX = 250;
const paddleY = gameArea.clientHeight - 40;
const paddleWidth = 100;
const paddleHeight = 20;
const ballSize = 20;
const gravity = 0.2;
const bounce = 0.8;
const friction = 0.99;

// バンパーの設定
const bumpers = [];
const walls = [];

// ゲーム初期化
function initGame() {
  // スコアリセット
  score = 0;
  scoreElement.textContent = score;

  // ボールの初期位置
  ballX = gameArea.clientWidth / 2 - ballSize / 2;
  ballY = gameArea.clientHeight / 2 - ballSize / 2;
  ballSpeedX = 0;
  ballSpeedY = 0;

  // パドルの初期位置
  paddleX = gameArea.clientWidth / 2 - paddleWidth / 2;

  // ボールとパドルの位置を更新
  updateBallPosition();
  updatePaddlePosition();

  // バンパーとウォールをクリア
  clearElements();

  // バンパーを追加
  createBumpers();

  // ウォールを追加
  createWalls();
}

// ゲーム要素をクリア
function clearElements() {
  // 既存のバンパーを削除
  bumpers.forEach((bumper) => {
    if (bumper.element && bumper.element.parentNode) {
      bumper.element.parentNode.removeChild(bumper.element);
    }
  });
  bumpers.length = 0;

  // 既存のウォールを削除
  walls.forEach((wall) => {
    if (wall.element && wall.element.parentNode) {
      wall.element.parentNode.removeChild(wall.element);
    }
  });
  walls.length = 0;
}

// バンパーを作成
function createBumpers() {
  // 上部のバンパー
  createBumper(100, 100, 40);
  createBumper(300, 150, 40);
  createBumper(200, 250, 40);
  createBumper(400, 200, 40);
}

// 個別のバンパーを作成
function createBumper(x, y, size) {
  const bumperElement = document.createElement("div");
  bumperElement.className = "bumper";
  bumperElement.style.width = `${size}px`;
  bumperElement.style.height = `${size}px`;
  bumperElement.style.left = `${x}px`;
  bumperElement.style.top = `${y}px`;

  gameArea.appendChild(bumperElement);

  bumpers.push({
    x,
    y,
    size,
    element: bumperElement,
  });
}

// ウォールを作成
function createWalls() {
  // 左の壁
  createWall(0, 0, 10, gameArea.clientHeight);

  // 右の壁
  createWall(gameArea.clientWidth - 10, 0, 10, gameArea.clientHeight);

  // 上の壁
  createWall(0, 0, gameArea.clientWidth, 10);

  // 斜めの壁（左）
  createWall(50, 200, 100, 15, -45);

  // 斜めの壁（右）
  createWall(450, 200, 100, 15, 45);
}

// 個別のウォールを作成
function createWall(x, y, width, height, angle = 0) {
  const wallElement = document.createElement("div");
  wallElement.className = "wall";
  wallElement.style.width = `${width}px`;
  wallElement.style.height = `${height}px`;
  wallElement.style.left = `${x}px`;
  wallElement.style.top = `${y}px`;

  if (angle !== 0) {
    wallElement.style.transform = `rotate(${angle}deg)`;
  }

  gameArea.appendChild(wallElement);

  walls.push({
    x,
    y,
    width,
    height,
    angle,
    element: wallElement,
  });
}

// ボールの位置を更新
function updateBallPosition() {
  ball.style.left = `${ballX}px`;
  ball.style.top = `${ballY}px`;
}

// パドルの位置を更新
function updatePaddlePosition() {
  paddle.style.left = `${paddleX}px`;
  paddle.style.bottom = `${20}px`;
}

// ゲームループ
function gameLoop() {
  if (!gameRunning) return;

  // 重力を適用
  ballSpeedY += gravity;

  // 摩擦を適用
  ballSpeedX *= friction;
  ballSpeedY *= friction;

  // ボールの位置を更新
  ballX += ballSpeedX;
  ballY += ballSpeedY;

  // 壁との衝突判定
  checkWallCollisions();

  // バンパーとの衝突判定
  checkBumperCollisions();

  // パドルとの衝突判定
  checkPaddleCollision();

  // ボールが画面外に出たかチェック
  if (ballY > gameArea.clientHeight) {
    gameRunning = false;
    alert(`ゲームオーバー！\nスコア: ${score}`);
    return;
  }

  // ボールの位置を更新
  updateBallPosition();

  // 次のフレームを要求
  requestAnimationFrame(gameLoop);
}

// 壁との衝突判定
function checkWallCollisions() {
  // 左右の壁
  if (ballX < 0) {
    ballX = 0;
    ballSpeedX = -ballSpeedX * bounce;
  } else if (ballX > gameArea.clientWidth - ballSize) {
    ballX = gameArea.clientWidth - ballSize;
    ballSpeedX = -ballSpeedX * bounce;
  }

  // 上の壁
  if (ballY < 0) {
    ballY = 0;
    ballSpeedY = -ballSpeedY * bounce;
  }

  // カスタムウォールとの衝突
  walls.forEach((wall) => {
    // 簡易的な衝突判定（実際のゲームではもっと複雑な判定が必要）
    if (
      ballX < wall.x + wall.width &&
      ballX + ballSize > wall.x &&
      ballY < wall.y + wall.height &&
      ballY + ballSize > wall.y
    ) {
      // 衝突方向に応じて反射
      if (wall.angle === 0) {
        // 水平または垂直の壁
        if (wall.width > wall.height) {
          // 水平の壁
          ballSpeedY = -ballSpeedY * bounce;
          if (ballY < wall.y) {
            ballY = wall.y - ballSize;
          } else {
            ballY = wall.y + wall.height;
          }
        } else {
          // 垂直の壁
          ballSpeedX = -ballSpeedX * bounce;
          if (ballX < wall.x) {
            ballX = wall.x - ballSize;
          } else {
            ballX = wall.x + wall.width;
          }
        }
      } else {
        // 斜めの壁（簡易的な反射）
        const temp = ballSpeedX;
        ballSpeedX = ballSpeedY * bounce;
        ballSpeedY = temp * bounce;
      }

      // スコア加算
      score += 10;
      scoreElement.textContent = score;
    }
  });
}