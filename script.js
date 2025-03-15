// DOMが完全に読み込まれてから実行
document.addEventListener('DOMContentLoaded', function() {
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

  // バンパーとの衝突判定
  function checkBumperCollisions() {
    bumpers.forEach((bumper) => {
      // バンパーの中心
      const bumperCenterX = bumper.x + bumper.size / 2;
      const bumperCenterY = bumper.y + bumper.size / 2;

      // ボールの中心
      const ballCenterX = ballX + ballSize / 2;
      const ballCenterY = ballY + ballSize / 2;

      // 中心間の距離
      const dx = ballCenterX - bumperCenterX;
      const dy = ballCenterY - bumperCenterY;
      const distance = Math.sqrt(dx * dx + dy * dy);

      // 衝突判定（円と円）
      if (distance < bumper.size / 2 + ballSize / 2) {
        // 衝突方向に応じて反射
        const angle = Math.atan2(dy, dx);
        const power = 10; // バンパーの反発力

        ballSpeedX = Math.cos(angle) * power;
        ballSpeedY = Math.sin(angle) * power;

        // ボールをバンパーの外側に移動
        const newDistance = bumper.size / 2 + ballSize / 2;
        ballX = bumperCenterX + Math.cos(angle) * newDistance - ballSize / 2;
        ballY = bumperCenterY + Math.sin(angle) * newDistance - ballSize / 2;

        // スコア加算
        score += 50;
        scoreElement.textContent = score;

        // バンパーを一時的に大きくする（視覚効果）
        bumper.element.style.transform = "scale(1.2)";
        setTimeout(() => {
          bumper.element.style.transform = "scale(1)";
        }, 100);
      }
    });
  }

  // パドルとの衝突判定
  function checkPaddleCollision() {
    if (
      ballY + ballSize >= paddleY &&
      ballY <= paddleY + paddleHeight &&
      ballX + ballSize >= paddleX &&
      ballX <= paddleX + paddleWidth
    ) {
      // パドルとの衝突位置に応じて反射角度を変える
      const hitPosition = ballX + ballSize / 2 - paddleX;
      const normalizedHitPosition = hitPosition / paddleWidth; // 0～1の値

      // -1～1の範囲に変換（パドルの左端で-1、中央で0、右端で1）
      const angle = (normalizedHitPosition - 0.5) * 2;

      // 反射角度と速度を設定
      const power = 10;
      ballSpeedX = angle * power;
      ballSpeedY = -Math.abs(ballSpeedY) - 5;

      // ボールをパドルの上に移動
      ballY = paddleY - ballSize;

      // スコア加算
      score += 10;
      scoreElement.textContent = score;
    }
  }

  // マウス移動でパドルを操作
  gameArea.addEventListener("mousemove", (e) => {
    const rect = gameArea.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;

    // パドルの位置を更新（画面内に収める）
    paddleX = Math.max(
      0,
      Math.min(mouseX - paddleWidth / 2, gameArea.clientWidth - paddleWidth)
    );
    updatePaddlePosition();
  });

  // タッチ操作でパドルを移動（モバイル対応）
  gameArea.addEventListener(
    "touchmove",
    (e) => {
      e.preventDefault();
      const rect = gameArea.getBoundingClientRect();
      const touchX = e.touches[0].clientX - rect.left;

      // パドルの位置を更新（画面内に収める）
      paddleX = Math.max(
        0,
        Math.min(touchX - paddleWidth / 2, gameArea.clientWidth - paddleWidth)
      );
      updatePaddlePosition();
    },
    { passive: false }
  );

  // スタートボタンのイベントリスナー
  startButton.addEventListener("click", () => {
    if (!gameRunning) {
      gameRunning = true;

      // ボールに初速を与える
      ballSpeedX = Math.random() * 6 - 3;
      ballSpeedY = -10;

      // ゲームループを開始
      gameLoop();
    }
  });

  // リセットボタンのイベントリスナー
  resetButton.addEventListener("click", () => {
    gameRunning = false;
    initGame();
  });

  // キーボード操作
  document.addEventListener("keydown", (e) => {
    if (e.key === "ArrowLeft") {
      // 左矢印キー
      paddleX = Math.max(0, paddleX - 20);
      updatePaddlePosition();
    } else if (e.key === "ArrowRight") {
      // 右矢印キー
      paddleX = Math.min(gameArea.clientWidth - paddleWidth, paddleX + 20);
      updatePaddlePosition();
    } else if (e.key === " " && !gameRunning) {
      // スペースキーでゲーム開始
      gameRunning = true;
      ballSpeedX = Math.random() * 6 - 3;
      ballSpeedY = -10;
      gameLoop();
    }
  });

  // ゲームを初期化
  initGame();
});