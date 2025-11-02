class Puzzle {
    constructor(size = 3) {
        this.size = size;
        this.tiles = [];
        this.emptyIndex = size * size - 1;
        this.moves = 0;
        this.init();
    }

    init() {
        const board = document.getElementById('game-board');
        board.innerHTML = '';
        board.style.display = 'grid';
        board.style.gridTemplateColumns = `repeat(${this.size}, 100px)`;
        board.style.gridTemplateRows = `repeat(${this.size}, 100px)`;
        board.style.gap = '8px';
        board.style.justifyContent = 'center';
        board.style.margin = '0 auto';

        this.tiles = Array.from({ length: this.size * this.size - 1 }, (_, i) => i + 1);
        this.tiles.push(0); // Пустая ячейка
        this.emptyIndex = this.size * this.size - 1;

        this.shuffle();
        this.render();

        document.getElementById('shuffle-btn').addEventListener('click', () => this.shuffle());
        document.getElementById('reset-btn').addEventListener('click', () => this.reset());
    }

    shuffle() {
        // Простое перемешивание
        for (let i = 0; i < 1000; i++) {
            const neighbors = this.getNeighbors(this.emptyIndex);
            if (neighbors.length > 0) {
                const randomNeighbor = neighbors[Math.floor(Math.random() * neighbors.length)];
                this.swap(this.emptyIndex, randomNeighbor);
                this.emptyIndex = randomNeighbor;
            }
        }
        this.moves = 0;
        this.updateMoves();
        this.render();
    }

    getNeighbors(index) {
        const neighbors = [];
        const row = Math.floor(index / this.size);
        const col = index % this.size;

        if (row > 0) neighbors.push(index - this.size);
        if (row < this.size - 1) neighbors.push(index + this.size);
        if (col > 0) neighbors.push(index - 1);
        if (col < this.size - 1) neighbors.push(index + 1);

        return neighbors;
    }

    swap(index1, index2) {
        [this.tiles[index1], this.tiles[index2]] = [this.tiles[index2], this.tiles[index1]];
    }

    handleClick(index) {
        if (this.tiles[index] === 0) return;

        const neighbors = this.getNeighbors(this.emptyIndex);
        if (neighbors.includes(index)) {
            this.swap(index, this.emptyIndex);
            this.emptyIndex = index;
            this.moves++;
            this.updateMoves();
            this.render();

            if (this.isSolved()) {
                setTimeout(() => {
                    this.showGameOver('#00ff88', `ПОБЕДА!`, `Moves: ${this.moves}`);
                }, 100);
            }
        }
    }

    isSolved() {
        for (let i = 0; i < this.tiles.length - 1; i++) {
            if (this.tiles[i] !== i + 1) return false;
        }
        return this.tiles[this.tiles.length - 1] === 0;
    }

    render() {
        const board = document.getElementById('game-board');
        board.innerHTML = '';

        for (let i = 0; i < this.tiles.length; i++) {
            const cell = document.createElement('div');
            const value = this.tiles[i];
            
            if (value === 0) {
                cell.style.cssText = `
                    width: 100px;
                    height: 100px;
                    background: rgba(0, 0, 0, 0.3);
                    border: 1px solid rgba(0, 255, 136, 0.1);
                    border-radius: 8px;
                `;
            } else {
                cell.style.cssText = `
                    width: 100px;
                    height: 100px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-family: 'Orbitron', sans-serif;
                    font-size: 28px;
                    font-weight: 700;
                    color: #00ff88;
                    background: linear-gradient(145deg, #1a1a2e, #0d0d1a);
                    border: 1px solid rgba(0, 255, 136, 0.3);
                    border-radius: 8px;
                    text-shadow: 0 0 8px rgba(0, 255, 136, 0.6);
                    box-shadow: 0 0 20px rgba(0, 255, 136, 0.15);
                    cursor: pointer;
                    transition: all 0.3s ease;
                    user-select: none;
                `;
                cell.textContent = value;
                cell.addEventListener('click', () => this.handleClick(i));
                cell.addEventListener('mouseenter', function() {
                    this.style.borderColor = 'rgba(0, 255, 136, 0.6)';
                    this.style.boxShadow = '0 0 25px rgba(0, 255, 136, 0.4)';
                    this.style.transform = 'scale(1.05)';
                });
                cell.addEventListener('mouseleave', function() {
                    this.style.borderColor = 'rgba(0, 255, 136, 0.3)';
                    this.style.boxShadow = '0 0 20px rgba(0, 255, 136, 0.15)';
                    this.style.transform = 'scale(1)';
                });
            }

            board.appendChild(cell);
        }
    }

    updateMoves() {
        document.getElementById('moves').textContent = `Ходы: ${this.moves}`;
    }

    reset() {
        if (this.overlayCanvas) {
            this.overlayCanvas.style.display = 'none';
        }
        this.tiles = Array.from({ length: this.size * this.size - 1 }, (_, i) => i + 1);
        this.tiles.push(0);
        this.emptyIndex = this.size * this.size - 1;
        this.moves = 0;
        this.updateMoves();
        this.render();
    }

    showGameOver(color, title, moves) {
        const board = document.getElementById('game-board');
        if (!this.overlayCanvas) {
            this.overlayCanvas = document.createElement('canvas');
            this.overlayCanvas.width = 324; // 3*100 + 2*8 + 8
            this.overlayCanvas.height = 324;
            this.overlayCanvas.style.cssText = `
                position: absolute;
                top: 0;
                left: 50%;
                transform: translateX(-50%);
                pointer-events: none;
                z-index: 100;
                display: none;
                border-radius: 8px;
            `;
            board.style.position = 'relative';
            board.appendChild(this.overlayCanvas);
            this.overlayCtx = this.overlayCanvas.getContext('2d');
        }
        
        this.overlayCanvas.style.display = 'block';
        this.overlayCanvas.style.pointerEvents = 'auto';
        
        const draw = () => {
            const ctx = this.overlayCtx;
            const time = Date.now() * 0.001;
            const pulse = Math.sin(time * 2) * 0.15 + 0.85;
            
            // Фон точно как в змейке
            ctx.fillStyle = 'rgba(25, 25, 35, 0.95)';
            ctx.fillRect(0, 0, this.overlayCanvas.width, this.overlayCanvas.height);
            
            // Главный заголовок - точно как в змейке с пульсацией
            ctx.font = 'bold 36px Orbitron';
            ctx.fillStyle = color;
            ctx.textAlign = 'center';
            ctx.shadowColor = color;
            ctx.shadowBlur = 25 * pulse;
            ctx.fillText(title, this.overlayCanvas.width/2, this.overlayCanvas.height/2 - 20);
            
            // Счет - точно как в змейке
            ctx.font = 'bold 24px Orbitron';
            ctx.fillStyle = color;
            ctx.shadowColor = color;
            ctx.shadowBlur = 20;
            ctx.fillText(moves, this.overlayCanvas.width/2, this.overlayCanvas.height/2 + 30);
            
            // Инструкция - как в змейке
            ctx.font = '18px Orbitron';
            ctx.fillStyle = '#00ff88';
            ctx.shadowColor = '#00ff88';
            ctx.shadowBlur = 15;
            ctx.fillText('Нажмите "Сброс" для новой игры', this.overlayCanvas.width/2, this.overlayCanvas.height/2 + 70);
            
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
    new Puzzle(3);
});

