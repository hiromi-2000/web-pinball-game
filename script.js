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
  
  // パーティクルシステム
  const particles = [];
  const maxParticles = 50;

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
    
    // パーティクルをクリア
    particles.length = 0;
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
    
    // 既存のパーティクルを削除
    const existingParticles = document.querySelectorAll('.particle');
    existingParticles.forEach(particle => {
      if (particle.parentNode) {
        particle.parentNode.removeChild(particle);
      }
    });
  }

  // バンパーを作成
  function createBumpers() {
    // 上部のバンパー
    createBumper(100, 100, 40);
    createBumper(300, 150, 40);
    createBumper(200, 250, 40);
    createBumper(400, 200, 40);
    
    // 追加のバンパー
    createBumper(150, 350, 30);
    createBumper(450, 350, 30);
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
    
    // 追加の斜めの壁
    createWall(100, 400, 80, 15, 30);
    createWall(400, 400, 80, 15, -30);
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
  
  // パーティクルを作成
  function createParticle(x, y, color) {
    if (particles.length > maxParticles) {
      const oldParticle = particles.shift();
      if (oldParticle.element && oldParticle.element.parentNode) {
        oldParticle.element.parentNode.removeChild(oldParticle.element);
      }
    }
    
    const size = Math.random() * 5 + 2;
    const speedX = (Math.random() - 0.5) * 5;
    const speedY = (Math.random() - 0.5) * 5;
    const lifetime = Math.random() * 1000 + 500;
    
    const particleElement = document.createElement('div');
    particleElement.className = 'particle';
    particleElement.style.width = `${size}px`;
    particleElement.style.height = `${size}px`;
    particleElement.style.backgroundColor = color;
    particleElement.style.left = `${x}px`;
    particleElement.style.top = `${y}px`;
    particleElement.style.position = 'absolute';
    particleElement.style.borderRadius = '50%';
    particleElement.style.boxShadow = `0 0 ${size}px ${color}`;
    particleElement.style.opacity = '1';
    particleElement.style.zIndex = '1';
    
    gameArea.appendChild(particleElement);
    
    const particle = {
      x,
      y,
      speedX,
      speedY,
      size,
      element: particleElement,
      lifetime,
      born: Date.now()
    };
    
    particles.push(particle);
  }
  
  // パーティクルを更新
  function updateParticles() {
    const now = Date.now();
    
    for (let i = particles.length - 1; i >= 0; i--) {
      const particle = particles[i];
      const age = now - particle.born;
      
      if (age > particle.lifetime) {
        if (particle.element && particle.element.parentNode) {
          particle.element.parentNode.removeChild(particle.element);
        }
        particles.splice(i, 1);
        continue;
      }
      
      // 位置を更新
      particle.x += particle.speedX;
      particle.y += particle.speedY;
      
      // 重力と摩擦を適用
      particle.speedY += 0.1;
      particle.speedX *= 0.99;
      particle.speedY *= 0.99;
      
      // 透明度を更新
      const opacity = 1 - (age / particle.lifetime);
      
      // 要素を更新
      particle.element.style.left = `${particle.x}px`;
      particle.element.style.top = `${particle.y}px`;
      particle.element.style.opacity = opacity.toString();
    }
  }

  // ボールの位置を更新
  function updateBallPosition() {
    ball.style.left = `${ballX}px`;
    ball.style.top = `${ballY}px`;
  }

  // パドルの位置を更新
  function updatePaddlePosition() {
    paddle.style.left = `${paddleX}px`;
    // bottomではなくtopプロパティを使用
    paddle.style.top = `${paddleY}px`;
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
    
    // パーティクルを更新
    updateParticles();

    // ボールが画面外に出たかチェック
    if (ballY > gameArea.clientHeight) {
      gameOver();
      return;
    }

    // ボールの位置を更新
    updateBallPosition();

    // 次のフレームを要求
    requestAnimationFrame(gameLoop);
  }
  
  // ゲームオーバー処理
  function gameOver() {
    gameRunning = false;
    
    // ゲームオーバーエフェクト
    for (let i = 0; i < 30; i++) {
      setTimeout(() => {
        createParticle(
          ballX + ballSize / 2, 
          gameArea.clientHeight - 10, 
          '#f44336'
        );
      }, i * 50);
    }
    
    // ゲームオーバーメッセージ
    setTimeout(() => {
      alert(`ゲームオーバー！\nスコア: ${score}`);
    }, 1000);
  }

  // 壁との衝突判定
  function checkWallCollisions() {
    // 左右の壁
    if (ballX < 0) {
      ballX = 0;
      ballSpeedX = -ballSpeedX * bounce;
      createCollisionEffect(ballX, ballY, '#9c27b0');
    } else if (ballX > gameArea.clientWidth - ballSize) {
      ballX = gameArea.clientWidth - ballSize;
      ballSpeedX = -ballSpeedX * bounce;
      createCollisionEffect(ballX + ballSize, ballY, '#9c27b0');
    }

    // 上の壁
    if (ballY < 0) {
      ballY = 0;
      ballSpeedY = -ballSpeedY * bounce;
      createCollisionEffect(ballX, ballY, '#9c27b0');
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
        
        // 衝突エフェクト
        createCollisionEffect(ballX + ballSize/2, ballY + ballSize/2, '#9c27b0');
        
        // 壁を光らせる
        wall.element.style.boxShadow = '0 0 20px rgba(156, 39, 176, 0.9)';
        setTimeout(() => {
          wall.element.style.boxShadow = '0 0 15px rgba(156, 39, 176, 0.7)';
        }, 100);
      }
    });
  }
  
  // 衝突エフェクトを作成
  function createCollisionEffect(x, y, color) {
    // パーティクルを作成
    for (let i = 0; i < 8; i++) {
      createParticle(x, y, color);
    }
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
        bumper.element.style.boxShadow = "0 0 25px rgba(63, 81, 181, 0.9)";
        setTimeout(() => {
          bumper.element.style.transform = "scale(1)";
          bumper.element.style.boxShadow = "0 0 15px rgba(63, 81, 181, 0.7)";
        }, 100);
        
        // 衝突エフェクト
        createCollisionEffect(ballCenterX, ballCenterY, '#3f51b5');
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
      
      // パドルを一時的に光らせる
      paddle.style.boxShadow = "0 0 25px rgba(76, 175, 80, 0.9)";
      setTimeout(() => {
        paddle.style.boxShadow = "0 0 15px rgba(76, 175, 80, 0.7)";
      }, 100);
      
      // 衝突エフェクト
      createCollisionEffect(ballX + ballSize/2, paddleY, '#4CAF50');
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
      
      // スタートエフェクト
      for (let i = 0; i < 20; i++) {
        setTimeout(() => {
          createParticle(
            ballX + ballSize / 2, 
            ballY + ballSize / 2, 
            '#ff5722'
          );
        }, i * 50);
      }

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
      
      // スタートエフェクト
      for (let i = 0; i < 20; i++) {
        setTimeout(() => {
          createParticle(
            ballX + ballSize / 2, 
            ballY + ballSize / 2, 
            '#ff5722'
          );
        }, i * 50);
      }
      
      gameLoop();
    }
  });

  // ゲームを初期化
  initGame();
  
  // 初期エフェクト
  setTimeout(() => {
    for (let i = 0; i < 30; i++) {
      setTimeout(() => {
        const x = Math.random() * gameArea.clientWidth;
        const y = Math.random() * gameArea.clientHeight;
        const colors = ['#ff5722', '#4CAF50', '#3f51b5', '#9c27b0'];
        const color = colors[Math.floor(Math.random() * colors.length)];
        createParticle(x, y, color);
      }, i * 100);
    }
  }, 500);
});