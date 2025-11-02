class TicTacToe {
    constructor() {
        this.board = Array(9).fill(null);
        this.currentPlayer = 'X';
        this.gameOver = false;
        this.winner = null;
        this.init();
    }

    init() {
        const board = document.getElementById('game-board');
        board.innerHTML = '';
        board.style.display = 'grid';
        board.style.gridTemplateColumns = 'repeat(3, 90px)';
        board.style.gridTemplateRows = 'repeat(3, 90px)';
        board.style.gap = '6px';
        board.style.justifyContent = 'center';
        board.style.margin = '0 auto';
        board.style.position = 'relative';

        // Создаем canvas для оверлея победы
        if (!this.overlayCanvas) {
            this.overlayCanvas = document.createElement('canvas');
            this.overlayCanvas.width = 282; // 3*90 + 2*6
            this.overlayCanvas.height = 282;
            this.overlayCanvas.style.cssText = `
                position: absolute;
                top: 0;
                left: 50%;
                transform: translateX(-50%);
                pointer-events: none;
                z-index: 100;
                display: none;
            `;
            board.appendChild(this.overlayCanvas);
            this.overlayCtx = this.overlayCanvas.getContext('2d');
        }

        for (let i = 0; i < 9; i++) {
            const cell = document.createElement('div');
            cell.className = 'ttt-cell';
            cell.style.cssText = `
                width: 90px;
                height: 90px;
                display: flex;
                align-items: center;
                justify-content: center;
                font-family: 'Orbitron', sans-serif;
                font-size: 36px;
                font-weight: 700;
                color: #00ff88;
                background: linear-gradient(145deg, #1a1a2e, #0d0d1a);
                border: 1px solid rgba(0, 255, 136, 0.3);
                border-radius: 8px;
                text-shadow: 0 0 8px rgba(0, 255, 136, 0.6);
                box-shadow: 0 0 20px rgba(0, 255, 136, 0.15);
                cursor: pointer;
                transition: all 0.3s ease;
            `;
            cell.dataset.index = i;
            cell.addEventListener('click', () => this.handleClick(i));
            cell.addEventListener('mouseenter', function() {
                if (!this.textContent && !this.closest('#game-board').dataset.gameOver) {
                    this.style.borderColor = 'rgba(0, 255, 136, 0.6)';
                    this.style.boxShadow = '0 0 25px rgba(0, 255, 136, 0.4)';
                    this.style.transform = 'scale(1.05)';
                }
            });
            cell.addEventListener('mouseleave', function() {
                this.style.borderColor = 'rgba(0, 255, 136, 0.3)';
                this.style.boxShadow = '0 0 20px rgba(0, 255, 136, 0.15)';
                this.style.transform = 'scale(1)';
            });
            board.appendChild(cell);
        }

        document.getElementById('reset-btn').addEventListener('click', () => this.reset());
        this.updateStatus();
    }

    handleClick(index) {
        if (this.gameOver || this.board[index] !== null) return;

        this.board[index] = this.currentPlayer;
        this.updateCell(index);
        
        if (this.checkWinner()) {
            this.gameOver = true;
            this.updateStatus();
            document.getElementById('game-board').dataset.gameOver = 'true';
            setTimeout(() => this.showGameOver(this.winner === 'X' ? '#00ff88' : '#ff3366', this.winner === 'X' ? 'ПОБЕДА!' : 'GAME OVER'), 300);
            return;
        }

        if (this.checkDraw()) {
            this.gameOver = true;
            this.updateStatus();
            document.getElementById('game-board').dataset.gameOver = 'true';
            setTimeout(() => this.showGameOver('#00ff88', 'НИЧЬЯ!'), 300);
            return;
        }

        this.currentPlayer = this.currentPlayer === 'X' ? 'O' : 'X';
        this.updateStatus();
    }

    updateCell(index) {
        const cells = document.querySelectorAll('.ttt-cell');
        cells[index].textContent = this.board[index];
        if (this.board[index] === 'X') {
            cells[index].style.color = '#00ff88';
            cells[index].style.textShadow = '0 0 12px rgba(0, 255, 136, 0.8)';
        } else {
            cells[index].style.color = '#ff3366';
            cells[index].style.textShadow = '0 0 12px rgba(255, 51, 102, 0.8)';
        }
    }

    checkWinner() {
        const winPatterns = [
            [0, 1, 2], [3, 4, 5], [6, 7, 8],
            [0, 3, 6], [1, 4, 7], [2, 5, 8],
            [0, 4, 8], [2, 4, 6]
        ];

        for (let pattern of winPatterns) {
            const [a, b, c] = pattern;
            if (this.board[a] && 
                this.board[a] === this.board[b] && 
                this.board[a] === this.board[c]) {
                this.winner = this.board[a];
                this.highlightWinner(pattern);
                return true;
            }
        }
        return false;
    }

    highlightWinner(pattern) {
        const cells = document.querySelectorAll('.ttt-cell');
        pattern.forEach(index => {
            cells[index].style.background = 'linear-gradient(145deg, rgba(0, 255, 136, 0.4), rgba(0, 255, 136, 0.2))';
            cells[index].style.borderColor = 'rgba(0, 255, 136, 0.9)';
            cells[index].style.boxShadow = '0 0 30px rgba(0, 255, 136, 0.7)';
        });
    }

    checkDraw() {
        return this.board.every(cell => cell !== null);
    }

    updateStatus() {
        const statusEl = document.getElementById('status');
        if (this.winner) {
            statusEl.textContent = `Победитель: ${this.winner}`;
            statusEl.style.color = this.winner === 'X' ? '#00ff88' : '#ff3366';
            statusEl.style.textShadow = this.winner === 'X' 
                ? '0 0 12px rgba(0, 255, 136, 0.8)' 
                : '0 0 12px rgba(255, 51, 102, 0.8)';
        } else if (this.gameOver) {
            statusEl.textContent = 'Ничья!';
            statusEl.style.color = '#00ff88';
            statusEl.style.textShadow = '0 0 10px rgba(0, 255, 136, 0.6)';
        } else {
            statusEl.textContent = `Ход: ${this.currentPlayer}`;
            statusEl.style.color = this.currentPlayer === 'X' ? '#00ff88' : '#ff3366';
            statusEl.style.textShadow = this.currentPlayer === 'X' 
                ? '0 0 10px rgba(0, 255, 136, 0.6)' 
                : '0 0 10px rgba(255, 51, 102, 0.6)';
        }
    }

    reset() {
        if (this.overlayCanvas) {
            this.overlayCanvas.style.display = 'none';
        }
        this.board = Array(9).fill(null);
        this.currentPlayer = 'X';
        this.gameOver = false;
        this.winner = null;
        document.getElementById('game-board').dataset.gameOver = 'false';
        
        const cells = document.querySelectorAll('.ttt-cell');
        cells.forEach(cell => {
            cell.textContent = '';
            cell.style.background = 'linear-gradient(145deg, #1a1a2e, #0d0d1a)';
            cell.style.borderColor = 'rgba(0, 255, 136, 0.3)';
            cell.style.boxShadow = '0 0 20px rgba(0, 255, 136, 0.15)';
            cell.style.transform = 'scale(1)';
        });
        this.updateStatus();
    }

    showGameOver(color, message) {
        if (!this.overlayCanvas) return;
        this.overlayCanvas.style.display = 'block';
        this.overlayCanvas.style.pointerEvents = 'auto';
        
        const draw = () => {
            const ctx = this.overlayCtx;
            const time = Date.now() * 0.001;
            const pulse = Math.sin(time * 2) * 0.15 + 0.85;
            
            // Фон точно как в змейке
            ctx.fillStyle = 'rgba(25, 25, 35, 0.95)';
            ctx.fillRect(0, 0, this.overlayCanvas.width, this.overlayCanvas.height);
            
            // Главный текст - точно как в змейке с пульсацией
            ctx.font = 'bold 36px Orbitron';
            ctx.fillStyle = color;
            ctx.textAlign = 'center';
            ctx.shadowColor = color;
            ctx.shadowBlur = 25 * pulse;
            ctx.fillText(message, this.overlayCanvas.width/2, this.overlayCanvas.height/2 - 20);
            
            // Дополнительный текст с инструкцией - как в змейке
            ctx.font = '18px Orbitron';
            ctx.fillStyle = '#00ff88';
            ctx.shadowColor = '#00ff88';
            ctx.shadowBlur = 15;
            ctx.fillText('Нажмите "Новая игра"', this.overlayCanvas.width/2, this.overlayCanvas.height/2 + 70);
            
            if (this.overlayCanvas.style.display !== 'none') {
                requestAnimationFrame(draw);
            }
        };
        
        draw();
        
        this.overlayCanvas.addEventListener('click', () => {
            this.overlayCanvas.style.display = 'none';
            this.reset();
        }, { once: true });
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new TicTacToe();
});

