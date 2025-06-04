class Snake {
    constructor() {
        this.canvas = document.createElement('canvas');
        this.canvas.width = 800;
        this.canvas.height = 500;
        this.ctx = this.canvas.getContext('2d');
        this.gridSize = 25;
        this.snake = [{x: 15, y: 10}];
        this.food = this.generateFood();
        this.direction = 'right';
        this.score = 0;
        this.gameOver = false;
        this.speed = 150;
        this.lastRenderTime = 0;
        this.animationFrameId = null;
        this.keyHandler = this.handleKeyPress.bind(this);
        
        // Создаем свой интерфейс для Змейки
        const gameBoard = document.getElementById('game-board');
        gameBoard.innerHTML = '';
        
        // Создаем контейнер для игры
        const gameContainer = document.createElement('div');
        gameContainer.style.cssText = `
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 20px;
            padding: 20px;
            width: 100%;
            max-width: 900px;
            margin: 0 auto;
        `;
        
        // Создаем заголовок
        const title = document.createElement('h2');
        title.textContent = 'SNAKE';
        title.style.cssText = `
            color: #ff3366;
            font-family: 'Orbitron', sans-serif;
            font-size: 42px;
            margin: 0;
            text-shadow: 0 0 10px rgba(255, 51, 102, 0.5);
        `;
        
        // Создаем счетчик очков
        const scoreDisplay = document.createElement('div');
        scoreDisplay.id = 'snake-score';
        scoreDisplay.style.cssText = `
            color: #33ff99;
            font-family: 'Orbitron', sans-serif;
            font-size: 28px;
            text-shadow: 0 0 10px rgba(51, 255, 153, 0.5);
            margin-bottom: 10px;
        `;
        
        // Стилизация canvas
        this.canvas.style.cssText = `
            background: rgba(25, 25, 35, 0.95);
            border: 3px solid #ff3366;
            border-radius: 15px;
            box-shadow: 0 0 30px rgba(255, 51, 102, 0.3);
            margin: 0 auto;
            display: block;
        `;
        
        // Собираем интерфейс
        gameContainer.appendChild(title);
        gameContainer.appendChild(scoreDisplay);
        gameContainer.appendChild(this.canvas);
        gameBoard.appendChild(gameContainer);
        
        // Инициализация игры
        this.init();
    }

    init() {
        // Сбрасываем состояние игры
        this.snake = [{x: 15, y: 10}];
        this.direction = 'right';
        this.score = 0;
        this.gameOver = false;
        this.speed = 150;
        this.lastRenderTime = 0;
        this.food = this.generateFood();
        
        // Обработчики клавиш
        document.addEventListener('keydown', this.keyHandler);
        
        // Запуск игрового цикла
        this.animationFrameId = requestAnimationFrame(this.gameLoop.bind(this));
        
        // Обновляем счет
        this.updateScore();
    }

    handleKeyPress(event) {
        const key = event.key;
        
        if (this.gameOver && key === ' ') {
            this.init();
            return;
        }
        
        switch(key) {
            case 'ArrowUp':
                if (this.direction !== 'down') this.direction = 'up';
                break;
            case 'ArrowDown':
                if (this.direction !== 'up') this.direction = 'down';
                break;
            case 'ArrowLeft':
                if (this.direction !== 'right') this.direction = 'left';
                break;
            case 'ArrowRight':
                if (this.direction !== 'left') this.direction = 'right';
                break;
        }
    }

    generateFood() {
        const x = Math.floor(Math.random() * (this.canvas.width / this.gridSize));
        const y = Math.floor(Math.random() * (this.canvas.height / this.gridSize));
        return {x, y};
    }

    update() {
        if (this.gameOver) return;

        const head = {...this.snake[0]};

        switch(this.direction) {
            case 'up': head.y--; break;
            case 'down': head.y++; break;
            case 'left': head.x--; break;
            case 'right': head.x++; break;
        }

        // Проверка столкновений со стенами
        if (head.x < 0 || head.x >= this.canvas.width / this.gridSize ||
            head.y < 0 || head.y >= this.canvas.height / this.gridSize) {
            this.gameOver = true;
            return;
        }

        // Проверка столкновений с собой
        for (let segment of this.snake) {
            if (head.x === segment.x && head.y === segment.y) {
                this.gameOver = true;
                return;
            }
        }

        this.snake.unshift(head);

        // Проверка поедания еды
        if (head.x === this.food.x && head.y === this.food.y) {
            this.score += 10;
            this.updateScore();
            this.food = this.generateFood();
            // Увеличиваем скорость
            this.speed = Math.max(50, this.speed - 2);
        } else {
            this.snake.pop();
        }
    }

    draw() {
        // Очистка canvas
        this.ctx.fillStyle = 'rgba(25, 25, 35, 0.95)';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // Отрисовка сетки
        this.ctx.strokeStyle = 'rgba(255, 51, 102, 0.1)';
        this.ctx.lineWidth = 1;
        for (let i = 0; i < this.canvas.width; i += this.gridSize) {
            this.ctx.beginPath();
            this.ctx.moveTo(i, 0);
            this.ctx.lineTo(i, this.canvas.height);
            this.ctx.stroke();
        }
        for (let i = 0; i < this.canvas.height; i += this.gridSize) {
            this.ctx.beginPath();
            this.ctx.moveTo(0, i);
            this.ctx.lineTo(this.canvas.width, i);
            this.ctx.stroke();
        }

        // Отрисовка змейки
        this.snake.forEach((segment, index) => {
            const gradient = this.ctx.createLinearGradient(
                segment.x * this.gridSize,
                segment.y * this.gridSize,
                (segment.x + 1) * this.gridSize,
                (segment.y + 1) * this.gridSize
            );
            
            if (index === 0) {
                // Голова змейки
                gradient.addColorStop(0, '#ff3366');
                gradient.addColorStop(1, '#ff6699');
            } else {
                // Тело змейки
                gradient.addColorStop(0, '#ff3366');
                gradient.addColorStop(1, '#cc3366');
            }

            this.ctx.fillStyle = gradient;
            this.ctx.shadowColor = '#ff3366';
            this.ctx.shadowBlur = 15;
            this.ctx.fillRect(
                segment.x * this.gridSize + 1,
                segment.y * this.gridSize + 1,
                this.gridSize - 2,
                this.gridSize - 2
            );
        });

        // Отрисовка еды
        this.ctx.fillStyle = '#33ff99';
        this.ctx.shadowColor = '#33ff99';
        this.ctx.shadowBlur = 20;
        this.ctx.beginPath();
        this.ctx.arc(
            this.food.x * this.gridSize + this.gridSize/2,
            this.food.y * this.gridSize + this.gridSize/2,
            this.gridSize/2 - 2,
            0,
            Math.PI * 2
        );
        this.ctx.fill();

        // Отрисовка Game Over
        if (this.gameOver) {
            this.ctx.fillStyle = 'rgba(25, 25, 35, 0.9)';
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
            
            this.ctx.font = 'bold 36px Orbitron';
            this.ctx.fillStyle = '#ff3366';
            this.ctx.textAlign = 'center';
            this.ctx.shadowColor = '#ff3366';
            this.ctx.shadowBlur = 25;
            this.ctx.fillText('GAME OVER', this.canvas.width/2, this.canvas.height/2 - 20);
            
            this.ctx.font = 'bold 24px Orbitron';
            this.ctx.fillText(`Score: ${this.score}`, this.canvas.width/2, this.canvas.height/2 + 30);
            
            this.ctx.font = '18px Orbitron';
            this.ctx.fillText('Press SPACE to restart', this.canvas.width/2, this.canvas.height/2 + 70);
        }
    }

    updateScore() {
        const scoreDisplay = document.getElementById('snake-score');
        if (scoreDisplay) {
            scoreDisplay.textContent = `SCORE: ${this.score}`;
        }
    }

    gameLoop(currentTime) {
        if (this.lastRenderTime === 0) {
            this.lastRenderTime = currentTime;
        }

        const elapsed = currentTime - this.lastRenderTime;

        if (elapsed > this.speed) {
            this.update();
            this.lastRenderTime = currentTime;
        }

        this.draw();
        this.animationFrameId = requestAnimationFrame(this.gameLoop.bind(this));
    }

    stopGame() {
        if (this.animationFrameId) {
            cancelAnimationFrame(this.animationFrameId);
            this.animationFrameId = null;
        }
        document.removeEventListener('keydown', this.keyHandler);
        this.gameOver = true;
    }
}

// Экспорт класса для использования в основном файле
window.Snake = Snake; 