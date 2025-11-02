class Platformer {
    constructor() {
        this.canvas = document.getElementById('game-canvas');
        this.ctx = this.canvas.getContext('2d');
        this.keys = {};
        this.score = 0;
        this.lives = 3;
        
        this.player = {
            x: 50,
            y: 300,
            width: 30,
            height: 40,
            vx: 0,
            vy: 0,
            speed: 4,
            jumpPower: -12,
            onGround: false,
            color: '#00ff88'
        };

        this.platforms = [
            { x: 0, y: 380, width: 200, height: 20 },
            { x: 250, y: 320, width: 150, height: 20 },
            { x: 450, y: 260, width: 150, height: 20 },
            { x: 650, y: 200, width: 150, height: 20 },
            { x: 0, y: 140, width: 150, height: 20 },
            { x: 200, y: 80, width: 600, height: 20 }
        ];

        this.coins = [
            { x: 300, y: 290, width: 20, height: 20, collected: false },
            { x: 500, y: 230, width: 20, height: 20, collected: false },
            { x: 700, y: 170, width: 20, height: 20, collected: false },
            { x: 100, y: 110, width: 20, height: 20, collected: false }
        ];

        this.gravity = 0.6;
        this.gameRunning = true;

        this.setupEventListeners();
        this.updateDisplay();
        this.gameLoop();
    }

    setupEventListeners() {
        document.addEventListener('keydown', (e) => {
            this.keys[e.key.toLowerCase()] = true;
            if (e.key === ' ') e.preventDefault();
        });

        document.addEventListener('keyup', (e) => {
            this.keys[e.key.toLowerCase()] = false;
        });
    }

    gameLoop() {
        if (!this.gameRunning) return;

        this.update();
        this.draw();
        requestAnimationFrame(() => this.gameLoop());
    }

    update() {
        // Движение игрока
        this.player.vx = 0;
        
        if (this.keys['a'] || this.keys['arrowleft']) {
            this.player.vx = -this.player.speed;
        }
        if (this.keys['d'] || this.keys['arrowright']) {
            this.player.vx = this.player.speed;
        }

        // Прыжок
        if ((this.keys['w'] || this.keys['arrowup'] || this.keys[' ']) && this.player.onGround) {
            this.player.vy = this.player.jumpPower;
            this.player.onGround = false;
        }

        // Применение гравитации
        this.player.vy += this.gravity;

        // Обновление позиции
        this.player.x += this.player.vx;
        this.player.y += this.player.vy;

        // Ограничение по горизонтали
        this.player.x = Math.max(0, Math.min(this.canvas.width - this.player.width, this.player.x));

        // Проверка столкновений с платформами
        this.player.onGround = false;
        for (let platform of this.platforms) {
            if (this.isColliding(this.player, platform)) {
                if (this.player.vy > 0 && this.player.y < platform.y) {
                    this.player.y = platform.y - this.player.height;
                    this.player.vy = 0;
                    this.player.onGround = true;
                } else if (this.player.vy < 0) {
                    this.player.y = platform.y + platform.height;
                    this.player.vy = 0;
                }
            }
        }

        // Проверка выхода за пределы
        if (this.player.y > this.canvas.height) {
            this.lives--;
            this.updateDisplay();
            if (this.lives > 0) {
                this.player.x = 50;
                this.player.y = 300;
                this.player.vx = 0;
                this.player.vy = 0;
            } else {
                this.gameRunning = false;
            }
        }

        // Сбор монет
        this.coins.forEach(coin => {
            if (!coin.collected && this.isColliding(this.player, coin)) {
                coin.collected = true;
                this.score += 50;
                this.updateDisplay();
            }
        });

        // Проверка победы
        if (this.coins.every(coin => coin.collected)) {
            this.gameRunning = false;
        }
    }

    isColliding(rect1, rect2) {
        return rect1.x < rect2.x + rect2.width &&
               rect1.x + rect1.width > rect2.x &&
               rect1.y < rect2.y + rect2.height &&
               rect1.y + rect1.height > rect2.y;
    }

    draw() {
        // Если игра окончена, показываем экран завершения
        if (!this.gameRunning) {
            if (this.lives === 0) {
                this.showGameOver('#ff3366', `GAME OVER`, `Score: ${this.score}`);
            } else if (this.coins.every(coin => coin.collected)) {
                this.showGameOver('#00ff88', `ПОБЕДА!`, `Score: ${this.score}`);
            }
            return;
        }
        
        // Очистка с эффектом трассировки
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.15)';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // Фоновый градиент
        const gradient = this.ctx.createLinearGradient(0, 0, 0, this.canvas.height);
        gradient.addColorStop(0, 'rgba(26, 26, 46, 0.3)');
        gradient.addColorStop(1, 'rgba(13, 13, 26, 0.3)');
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // Платформы с градиентом
        this.platforms.forEach(platform => {
            const platGradient = this.ctx.createLinearGradient(platform.x, platform.y, platform.x, platform.y + platform.height);
            platGradient.addColorStop(0, '#00ff88');
            platGradient.addColorStop(1, '#00cc66');
            this.ctx.fillStyle = platGradient;
            this.ctx.shadowBlur = 15;
            this.ctx.shadowColor = '#00ff88';
            this.ctx.fillRect(platform.x, platform.y, platform.width, platform.height);
            this.ctx.shadowBlur = 0;
            
            // Обводка платформы
            this.ctx.strokeStyle = 'rgba(0, 255, 136, 0.6)';
            this.ctx.lineWidth = 2;
            this.ctx.strokeRect(platform.x, platform.y, platform.width, platform.height);
        });

        // Монеты с анимацией
        this.coins.forEach(coin => {
            if (!coin.collected) {
                const coinX = coin.x + coin.width/2;
                const coinY = coin.y + coin.height/2;
                const coinRadius = coin.width/2;
                
                // Внешнее свечение
                const coinGradient = this.ctx.createRadialGradient(coinX, coinY, 0, coinX, coinY, coinRadius);
                coinGradient.addColorStop(0, '#ffcc00');
                coinGradient.addColorStop(0.7, '#ffaa00');
                coinGradient.addColorStop(1, '#ff8800');
                
                this.ctx.fillStyle = coinGradient;
                this.ctx.shadowBlur = 20;
                this.ctx.shadowColor = '#ffaa00';
                this.ctx.beginPath();
                this.ctx.arc(coinX, coinY, coinRadius, 0, Math.PI * 2);
                this.ctx.fill();
                this.ctx.shadowBlur = 0;
                
                // Внутренний круг
                this.ctx.fillStyle = '#ffff00';
                this.ctx.beginPath();
                this.ctx.arc(coinX, coinY, coinRadius * 0.6, 0, Math.PI * 2);
                this.ctx.fill();
            }
        });

        // Игрок с градиентом и улучшенной графикой
        const playerGradient = this.ctx.createLinearGradient(
            this.player.x, this.player.y, 
            this.player.x, this.player.y + this.player.height
        );
        playerGradient.addColorStop(0, '#00ff88');
        playerGradient.addColorStop(1, '#00cc66');
        this.ctx.fillStyle = playerGradient;
        this.ctx.shadowBlur = 20;
        this.ctx.shadowColor = '#00ff88';
        this.ctx.fillRect(this.player.x, this.player.y, this.player.width, this.player.height);
        this.ctx.shadowBlur = 0;
        
        // Обводка игрока
        this.ctx.strokeStyle = 'rgba(0, 255, 136, 0.8)';
        this.ctx.lineWidth = 2;
        this.ctx.strokeRect(this.player.x, this.player.y, this.player.width, this.player.height);
        
        // Глаза игрока
        this.ctx.fillStyle = '#000';
        this.ctx.fillRect(this.player.x + 8, this.player.y + 10, 4, 4);
        this.ctx.fillRect(this.player.x + 18, this.player.y + 10, 4, 4);
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
        this.ctx.fillText('Обновите страницу для новой игры', this.canvas.width/2, this.canvas.height/2 + 70);
        
        // Продолжаем анимацию
        if (!this.gameRunning) {
            requestAnimationFrame(() => this.gameLoop());
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new Platformer();
});

