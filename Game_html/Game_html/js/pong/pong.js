class Pong {
    constructor() {
        this.canvas = document.createElement('canvas');
        this.canvas.width = 1000;
        this.canvas.height = 500;
        this.ctx = this.canvas.getContext('2d');

        this.paddleWidth = 12;
        this.paddleHeight = 100;
        this.ballRadius = 8;
        this.playerY = (this.canvas.height - this.paddleHeight) / 2;
        this.aiY = (this.canvas.height - this.paddleHeight) / 2;
        this.playerSpeed = 10; // ещё немного быстрее игроку
        // Параметры сложности ИИ (адаптивная скорость)
        this.aiBaseSpeed = 4; // ещё слабее базовая скорость ИИ
        this.aiSpeed = this.aiBaseSpeed;
        this.aiMinSpeed = 1.5;
        this.aiMaxSpeed = 8;
        // Базовые скорости мяча
        this.baseBallSpeedX = 6;
        this.baseBallSpeedY = 4;
        this.ballX = this.canvas.width / 2;
        this.ballY = this.canvas.height / 2;
        this.ballSpeedX = this.baseBallSpeedX;
        this.ballSpeedY = this.baseBallSpeedY;
        this.playerScore = 0;
        this.aiScore = 0;
        this.maxScore = 10;
        this.upPressed = false;
        this.downPressed = false;
        this.gameOver = false;
        this.animationFrameId = null;
        this.keyDownHandler = this.onKeyDown.bind(this);
        this.keyUpHandler = this.onKeyUp.bind(this);

        const gameBoard = document.getElementById('game-board');
        gameBoard.innerHTML = '';

        const container = document.createElement('div');
        container.style.cssText = `
            display: flex; flex-direction: column; align-items: center; gap: 20px;
            padding: 20px; width: 100%; max-width: 1100px; margin: 0 auto;`;

        const title = document.createElement('h2');
        title.textContent = 'PONG';
        title.style.cssText = `color:#ff3366;font-family:'Orbitron',sans-serif;font-size:42px;margin:0;text-shadow:0 0 10px rgba(255,51,102,0.5);`;

        const score = document.createElement('div');
        score.id = 'pong-score';
        score.style.cssText = `color:#33ff99;font-family:'Orbitron',sans-serif;font-size:28px;text-shadow:0 0 10px rgba(51,255,153,0.5);`;

        this.canvas.style.cssText = `
            background: rgba(25, 25, 35, 0.95);
            border: 3px solid #ff3366; border-radius: 15px; box-shadow: 0 0 30px rgba(255, 51, 102, 0.3);
        `;

        container.appendChild(title);
        container.appendChild(score);
        container.appendChild(this.canvas);
        gameBoard.appendChild(container);

        document.addEventListener('keydown', this.keyDownHandler);
        document.addEventListener('keyup', this.keyUpHandler);

        this.updateScore();
        this.loop = this.loop.bind(this);
        this.animationFrameId = requestAnimationFrame(this.loop);
    }

    onKeyDown(e) {
        if (e.key === 'ArrowUp') this.upPressed = true;
        if (e.key === 'ArrowDown') this.downPressed = true;
        if (this.gameOver && e.key === ' ') this.reset();
    }

    onKeyUp(e) {
        if (e.key === 'ArrowUp') this.upPressed = false;
        if (e.key === 'ArrowDown') this.downPressed = false;
    }

    reset() {
        this.playerScore = 0;
        this.aiScore = 0;
        this.gameOver = false;
        this.aiSpeed = this.aiBaseSpeed;
        this.ballX = this.canvas.width / 2;
        this.ballY = this.canvas.height / 2;
        this.ballSpeedX = this.baseBallSpeedX * (Math.random() < 0.5 ? 1 : -1);
        this.ballSpeedY = this.baseBallSpeedY * (Math.random() < 0.5 ? 1 : -1);
    }

    update() {
        if (this.gameOver) return;

        if (this.upPressed) this.playerY = Math.max(0, this.playerY - this.playerSpeed);
        if (this.downPressed) this.playerY = Math.min(this.canvas.height - this.paddleHeight, this.playerY + this.playerSpeed);

        // Простая AI логика: следовать за мячом с ограничением скорости
        const aiCenter = this.aiY + this.paddleHeight / 2;
        const aiFollowSpeed = this.ballSpeedX > 0 ? this.aiSpeed : this.aiSpeed * 0.4; // слабее, если мяч не летит к ИИ
        if (aiCenter < this.ballY - 15) this.aiY = Math.min(this.canvas.height - this.paddleHeight, this.aiY + aiFollowSpeed);
        else if (aiCenter > this.ballY + 15) this.aiY = Math.max(0, this.aiY - aiFollowSpeed);

        // Движение мяча
        this.ballX += this.ballSpeedX;
        this.ballY += this.ballSpeedY;

        // Столкновения со стенами по Y
        if (this.ballY - this.ballRadius < 0 || this.ballY + this.ballRadius > this.canvas.height) {
            this.ballSpeedY *= -1;
        }

        // Левый игрок
        if (this.ballX - this.ballRadius < 30 + this.paddleWidth &&
            this.ballY > this.playerY && this.ballY < this.playerY + this.paddleHeight) {
            this.ballSpeedX = Math.abs(this.ballSpeedX);
            const offset = (this.ballY - (this.playerY + this.paddleHeight / 2)) / (this.paddleHeight / 2);
            this.ballSpeedY = 5 * offset;
        }

        // Правый AI
        if (this.ballX + this.ballRadius > this.canvas.width - 30 - this.paddleWidth &&
            this.ballY > this.aiY && this.ballY < this.aiY + this.paddleHeight) {
            this.ballSpeedX = -Math.abs(this.ballSpeedX);
            const offset = (this.ballY - (this.aiY + this.paddleHeight / 2)) / (this.paddleHeight / 2);
            this.ballSpeedY = 5 * offset;
        }

        // Голы
        if (this.ballX + this.ballRadius < 0) {
            this.aiScore++;
            this.adjustDifficulty('ai');
            this.serve();
        }
        if (this.ballX - this.ballRadius > this.canvas.width) {
            this.playerScore++;
            this.adjustDifficulty('player');
            this.serve(true);
        }

        if (this.playerScore >= this.maxScore || this.aiScore >= this.maxScore) {
            this.gameOver = true;
        }
    }

    serve(toLeft = false) {
        this.ballX = this.canvas.width / 2;
        this.ballY = this.canvas.height / 2;
        // Замедлённая подача после гола: скорость ниже базовой
        const serveFactorX = 0.6;
        const serveFactorY = 0.6;
        this.ballSpeedX = (toLeft ? -this.baseBallSpeedX : this.baseBallSpeedX) * serveFactorX;
        this.ballSpeedY = this.baseBallSpeedY * (Math.random() < 0.5 ? 1 : -1) * serveFactorY;
        this.updateScore();
    }

    adjustDifficulty(winner) {
        if (winner === 'player') {
            // Игрок забил → усиливаем ИИ
            this.aiSpeed = Math.min(this.aiMaxSpeed, this.aiSpeed + 1.0);
        } else if (winner === 'ai') {
            // ИИ забил → ослабляем ИИ
            this.aiSpeed = Math.max(this.aiMinSpeed, this.aiSpeed - 1.0);
        }
    }

    drawNet() {
        this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
        this.ctx.lineWidth = 2;
        for (let y = 0; y < this.canvas.height; y += 20) {
            this.ctx.beginPath();
            this.ctx.moveTo(this.canvas.width / 2, y);
            this.ctx.lineTo(this.canvas.width / 2, y + 10);
            this.ctx.stroke();
        }
    }

    draw() {
        // Фон
        this.ctx.fillStyle = 'rgba(25, 25, 35, 0.95)';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // Сетка
        this.drawNet();

        // Ракетки
        this.ctx.fillStyle = '#00ff88';
        this.ctx.shadowColor = '#00ff88';
        this.ctx.shadowBlur = 15;
        this.ctx.fillRect(30, this.playerY, this.paddleWidth, this.paddleHeight);
        this.ctx.fillRect(this.canvas.width - 30 - this.paddleWidth, this.aiY, this.paddleWidth, this.paddleHeight);

        // Мяч
        this.ctx.fillStyle = '#ff3366';
        this.ctx.shadowColor = '#ff3366';
        this.ctx.shadowBlur = 20;
        this.ctx.beginPath();
        this.ctx.arc(this.ballX, this.ballY, this.ballRadius, 0, Math.PI * 2);
        this.ctx.fill();

        // Финальный экран
        if (this.gameOver) {
            this.ctx.fillStyle = 'rgba(25, 25, 35, 0.9)';
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
            this.ctx.font = 'bold 36px Orbitron';
            this.ctx.fillStyle = '#ff3366';
            this.ctx.textAlign = 'center';
            this.ctx.shadowColor = '#ff3366';
            this.ctx.shadowBlur = 25;
            const winner = this.playerScore > this.aiScore ? 'YOU WIN' : 'YOU LOSE';
            this.ctx.fillText(winner, this.canvas.width/2, this.canvas.height/2 - 20);
            this.ctx.font = 'bold 24px Orbitron';
            this.ctx.fillText(`Score: ${this.playerScore} : ${this.aiScore}`, this.canvas.width/2, this.canvas.height/2 + 30);
            this.ctx.font = '18px Orbitron';
            this.ctx.fillText('Press SPACE to restart', this.canvas.width/2, this.canvas.height/2 + 70);
        }
    }

    updateScore() {
        const el = document.getElementById('pong-score');
        if (el) el.textContent = `SCORE: ${this.playerScore} : ${this.aiScore}`;
    }

    loop() {
        this.update();
        this.draw();
        this.animationFrameId = requestAnimationFrame(this.loop);
    }

    stop() {
        if (this.animationFrameId) cancelAnimationFrame(this.animationFrameId);
        document.removeEventListener('keydown', this.keyDownHandler);
        document.removeEventListener('keyup', this.keyUpHandler);
        this.gameOver = true;
    }
}

window.Pong = Pong;


