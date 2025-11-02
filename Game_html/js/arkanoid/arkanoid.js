class Arkanoid {
    constructor() {
        this.canvas = document.getElementById('game-canvas');
        this.ctx = this.canvas.getContext('2d');
        this.currentLevel = 'easy';
        this.levels = {
            easy: {
                rows: 3,
                cols: 8,
                ballSpeed: 2.5,
                paddleWidth: 120,
                paddleSpeed: 6,
                lives: 5
            },
            medium: {
                rows: 5,
                cols: 10,
                ballSpeed: 3.5,
                paddleWidth: 100,
                paddleSpeed: 5,
                lives: 3
            },
            hard: {
                rows: 6,
                cols: 11,
                ballSpeed: 4.5,
                paddleWidth: 90,
                paddleSpeed: 4.5,
                lives: 2
            }
        };
        this.paddle = { x: 300, y: 420, width: 100, height: 10, speed: 5 };
        this.ball = { x: 350, y: 400, radius: 8, dx: 3, dy: -3, speed: 3 };
        this.bricks = [];
        this.score = 0;
        this.lives = 3;
        this.gameRunning = false;
        this.keys = {};
        
        this.setupEventListeners();
        this.applyLevel('easy');
    }

    initBricks() {
        this.bricks = [];
        const level = this.levels[this.currentLevel];
        const rows = level.rows;
        const cols = level.cols;
        const brickWidth = Math.floor((650 - (cols - 1) * 5) / cols);
        const brickHeight = 20;
        const padding = 5;
        const offsetTop = 40;
        const totalWidth = cols * brickWidth + (cols - 1) * padding;
        const offsetLeft = (this.canvas.width - totalWidth) / 2;

        for (let r = 0; r < rows; r++) {
            for (let c = 0; c < cols; c++) {
                this.bricks.push({
                    x: c * (brickWidth + padding) + offsetLeft,
                    y: r * (brickHeight + padding) + offsetTop,
                    width: brickWidth,
                    height: brickHeight,
                    visible: true,
                    color: `hsl(${(r * 360 / rows + (this.currentLevel === 'easy' ? 180 : this.currentLevel === 'medium' ? 240 : 300)) % 360}, 70%, 60%)`
                });
            }
        }
    }

    setupEventListeners() {
        document.addEventListener('keydown', (e) => {
            this.keys[e.key] = true;
            if (e.key === ' ') e.preventDefault();
        });

        document.addEventListener('keyup', (e) => {
            this.keys[e.key] = false;
        });

        // Выбор уровня
        document.querySelectorAll('.level-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const level = btn.dataset.level;
                this.applyLevel(level);
                document.querySelectorAll('.level-btn').forEach(b => {
                    b.classList.remove('active');
                    b.style.background = 'linear-gradient(145deg, rgba(0,255,136,0.2), rgba(0,200,100,0.15))';
                    b.style.borderColor = 'rgba(0,255,136,0.4)';
                    b.style.boxShadow = '0 0 10px rgba(0,255,136,0.15)';
                });
                btn.classList.add('active');
                btn.style.background = 'linear-gradient(145deg, rgba(0,255,136,0.3), rgba(0,200,100,0.2))';
                btn.style.borderColor = 'rgba(0,255,136,0.5)';
                btn.style.boxShadow = '0 0 15px rgba(0,255,136,0.2)';
            });
        });

        document.getElementById('start-btn').addEventListener('click', () => {
            if (!this.gameRunning) {
                this.startGame();
            }
        });

        this.canvas.addEventListener('mousemove', (e) => {
            const rect = this.canvas.getBoundingClientRect();
            this.paddle.x = e.clientX - rect.left - this.paddle.width / 2;
            this.paddle.x = Math.max(0, Math.min(this.canvas.width - this.paddle.width, this.paddle.x));
        });
    }

    applyLevel(level) {
        this.currentLevel = level;
        const levelConfig = this.levels[level];
        this.paddle.width = levelConfig.paddleWidth;
        this.paddle.speed = levelConfig.paddleSpeed;
        this.ball.speed = levelConfig.ballSpeed;
        this.lives = levelConfig.lives;
        this.score = 0;
        this.gameRunning = false;
        this.initBricks();
        this.updateDisplay();
        
        // Сброс позиций
        this.paddle.x = (this.canvas.width - this.paddle.width) / 2;
        this.paddle.y = this.canvas.height - 30;
        this.ball.x = this.canvas.width / 2;
        this.ball.y = this.canvas.height - 50;
    }

    startGame() {
        this.gameRunning = true;
        this.score = 0;
        const levelConfig = this.levels[this.currentLevel];
        this.lives = levelConfig.lives;
        this.ball.x = this.canvas.width / 2;
        this.ball.y = this.canvas.height - 50;
        this.ball.dx = (Math.random() > 0.5 ? 1 : -1) * this.ball.speed;
        this.ball.dy = -this.ball.speed;
        this.paddle.x = (this.canvas.width - this.paddle.width) / 2;
        this.paddle.y = this.canvas.height - 30;
        this.initBricks();
        this.updateDisplay();
        this.gameLoop();
        // Очистка оверлея при старте
        this.draw();
    }

    gameLoop() {
        if (this.gameRunning) {
            this.update();
        }
        
        this.draw();
        
        // Продолжаем анимацию даже если игра остановлена (для анимации экрана окончания)
        const gameEnded = !this.gameRunning && (this.lives === 0 || !this.bricks.some(b => b.visible));
        
        if (this.gameRunning || gameEnded) {
            requestAnimationFrame(() => this.gameLoop());
        }
    }

    update() {
        // Движение платформы
        if (this.keys['ArrowLeft'] || this.keys['a'] || this.keys['A']) {
            this.paddle.x = Math.max(0, this.paddle.x - this.paddle.speed);
        }
        if (this.keys['ArrowRight'] || this.keys['d'] || this.keys['D']) {
            this.paddle.x = Math.min(this.canvas.width - this.paddle.width, this.paddle.x + this.paddle.speed);
        }

        // Движение мяча
        this.ball.x += this.ball.dx;
        this.ball.y += this.ball.dy;

        // Отскок от стен
        if (this.ball.x - this.ball.radius <= 0 || this.ball.x + this.ball.radius >= this.canvas.width) {
            this.ball.dx = -this.ball.dx;
        }
        if (this.ball.y - this.ball.radius <= 0) {
            this.ball.dy = -this.ball.dy;
        }

        // Отскок от платформы
        if (this.ball.y + this.ball.radius >= this.paddle.y &&
            this.ball.y + this.ball.radius <= this.paddle.y + this.paddle.height &&
            this.ball.x >= this.paddle.x &&
            this.ball.x <= this.paddle.x + this.paddle.width) {
            const hitPos = (this.ball.x - this.paddle.x) / this.paddle.width;
            this.ball.dx = (hitPos - 0.5) * 6;
            this.ball.dy = -Math.abs(this.ball.dy);
        }

        // Потеря жизни
        if (this.ball.y + this.ball.radius >= this.canvas.height) {
            this.lives--;
            this.updateDisplay();
            if (this.lives > 0) {
                this.ball.x = this.canvas.width / 2;
                this.ball.y = this.canvas.height - 50;
                this.ball.dx = (Math.random() > 0.5 ? 1 : -1) * this.ball.speed;
                this.ball.dy = -this.ball.speed;
                this.paddle.x = (this.canvas.width - this.paddle.width) / 2;
                this.paddle.y = this.canvas.height - 30;
            } else {
                this.gameRunning = false;
            }
        }

        // Столкновение с блоками
        this.bricks.forEach(brick => {
            if (brick.visible &&
                this.ball.x + this.ball.radius >= brick.x &&
                this.ball.x - this.ball.radius <= brick.x + brick.width &&
                this.ball.y + this.ball.radius >= brick.y &&
                this.ball.y - this.ball.radius <= brick.y + brick.height) {
                brick.visible = false;
                this.score += 10;
                this.updateDisplay();
                this.ball.dy = -this.ball.dy;
            }
        });

        // Проверка победы (все блоки уничтожены)
        if (!this.bricks.some(b => b.visible)) {
            this.gameRunning = false;
        }
    }

    draw() {
        // Если игра окончена, показываем экран завершения
        if (!this.gameRunning && (this.lives === 0 || !this.bricks.some(b => b.visible))) {
            if (this.lives === 0) {
                this.showGameOver('#ff3366', `GAME OVER`, `Score: ${this.score}`);
            } else {
                this.showGameOver('#00ff88', `ПОБЕДА!`, `Score: ${this.score}`);
            }
            return;
        }
        
        // Очистка
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // Платформа
        this.ctx.fillStyle = '#00ff88';
        this.ctx.shadowBlur = 15;
        this.ctx.shadowColor = '#00ff88';
        this.ctx.fillRect(this.paddle.x, this.paddle.y, this.paddle.width, this.paddle.height);
        this.ctx.shadowBlur = 0;

        // Мяч
        this.ctx.beginPath();
        this.ctx.arc(this.ball.x, this.ball.y, this.ball.radius, 0, Math.PI * 2);
        this.ctx.fillStyle = '#ff00ff';
        this.ctx.shadowBlur = 10;
        this.ctx.shadowColor = '#ff00ff';
        this.ctx.fill();
        this.ctx.shadowBlur = 0;

        // Блоки
        this.bricks.forEach(brick => {
            if (brick.visible) {
                this.ctx.fillStyle = brick.color;
                this.ctx.shadowBlur = 5;
                this.ctx.shadowColor = brick.color;
                this.ctx.fillRect(brick.x, brick.y, brick.width, brick.height);
                this.ctx.shadowBlur = 0;
                this.ctx.strokeStyle = '#00ff88';
                this.ctx.lineWidth = 1;
                this.ctx.strokeRect(brick.x, brick.y, brick.width, brick.height);
            }
        });
    }

    updateDisplay() {
        document.getElementById('score').textContent = this.score;
        document.getElementById('lives').textContent = this.lives;
    }

    showGameOver(color, title, score) {
        const time = Date.now() * 0.001;
        const pulse = Math.sin(time * 2) * 0.15 + 0.85;
        
        // Фон точно как в змейке
        this.ctx.fillStyle = 'rgba(25, 25, 35, 0.95)';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Главный заголовок - точно как в змейке с пульсацией
        this.ctx.font = 'bold 36px Orbitron';
        this.ctx.fillStyle = color;
        this.ctx.textAlign = 'center';
        this.ctx.shadowColor = color;
        this.ctx.shadowBlur = 25 * pulse;
        this.ctx.fillText(title, this.canvas.width/2, this.canvas.height/2 - 20);
        
        // Счет - точно как в змейке
        this.ctx.font = 'bold 24px Orbitron';
        this.ctx.fillStyle = color;
        this.ctx.shadowColor = color;
        this.ctx.shadowBlur = 20;
        this.ctx.fillText(score, this.canvas.width/2, this.canvas.height/2 + 30);
        
        // Инструкция - как в змейке
        this.ctx.font = '18px Orbitron';
        this.ctx.fillStyle = '#00ff88';
        this.ctx.shadowColor = '#00ff88';
        this.ctx.shadowBlur = 15;
        this.ctx.fillText('Нажмите "Старт" для новой игры', this.canvas.width/2, this.canvas.height/2 + 70);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new Arkanoid();
});

