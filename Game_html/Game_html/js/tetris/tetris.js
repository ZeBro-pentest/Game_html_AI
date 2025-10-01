class Tetris {
    constructor() {
        this.canvas = document.createElement('canvas');
        this.canvas.width = 300;
        this.canvas.height = 600;
        this.ctx = this.canvas.getContext('2d');
        this.blockSize = 30;
        this.cols = 10;
        this.rows = 20;
        this.score = 0;
        this.level = 1;
        this.gameOver = false;
        this.speed = 1000;
        this.lastRenderTime = 0;
        this.animationFrameId = null;
        this.keyHandler = this.handleKeyPress.bind(this);

        this.board = Array(this.rows).fill().map(() => Array(this.cols).fill(0));
        this.tetrominoes = {
            'I': [[0,0,0,0],[1,1,1,1],[0,0,0,0],[0,0,0,0]],
            'J': [[1,0,0],[1,1,1],[0,0,0]],
            'L': [[0,0,1],[1,1,1],[0,0,0]],
            'O': [[1,1],[1,1]],
            'S': [[0,1,1],[1,1,0],[0,0,0]],
            'T': [[0,1,0],[1,1,1],[0,0,0]],
            'Z': [[1,1,0],[0,1,1],[0,0,0]]
        };
        this.colors = {
            'I': '#00f0f0', 'O': '#f0f000', 'T': '#a000f0',
            'S': '#00f000', 'Z': '#f00000', 'J': '#0000f0', 'L': '#f0a000'
        };

        const gameBoard = document.getElementById('game-board');
        gameBoard.innerHTML = '';
        const gameContainer = document.createElement('div');
        gameContainer.style.cssText = `
            display: flex; flex-direction: column; align-items: center; gap: 20px;
            padding: 20px; width: 100%; max-width: 900px; margin: 0 auto;`;
        const title = document.createElement('h2');
        title.textContent = 'TETRIS';
        title.style.cssText = `color:#ff3366;font-family:'Orbitron',sans-serif;font-size:42px;margin:0;text-shadow:0 0 10px rgba(255,51,102,0.5);`;
        const scoreDisplay = document.createElement('div');
        scoreDisplay.id = 'tetris-score';
        scoreDisplay.style.cssText = `color:#33ff99;font-family:'Orbitron',sans-serif;font-size:28px;text-shadow:0 0 10px rgba(51,255,153,0.5);margin-bottom:10px;`;
        this.canvas.style.cssText = `background:rgba(25,25,35,0.95);border:3px solid #ff3366;border-radius:15px;box-shadow:0 0 30px rgba(255,51,102,0.3);margin:0 auto;display:block;`;
        gameContainer.appendChild(title);
        gameContainer.appendChild(scoreDisplay);
        gameContainer.appendChild(this.canvas);
        gameBoard.appendChild(gameContainer);
        this.init();
    }

    init() {
        this.board = Array(this.rows).fill().map(() => Array(this.cols).fill(0));
        this.score = 0; this.level = 1; this.gameOver = false; this.speed = 1000; this.lastRenderTime = 0;
        this.createNewPiece();
        document.addEventListener('keydown', this.keyHandler);
        this.animationFrameId = requestAnimationFrame(this.gameLoop.bind(this));
        this.updateScore();
    }

    createNewPiece() {
        const pieces = 'IJLOSTZ';
        const randomPiece = pieces[Math.floor(Math.random() * pieces.length)];
        this.currentPiece = {
            shape: this.tetrominoes[randomPiece],
            color: this.colors[randomPiece],
            x: Math.floor(this.cols / 2) - Math.floor(this.tetrominoes[randomPiece][0].length / 2),
            y: 0
        };
    }

    handleKeyPress(event) {
        if (this.gameOver) { if (event.key === ' ') { this.init(); } return; }
        switch(event.key) {
            case 'ArrowLeft': this.movePiece(-1, 0); break;
            case 'ArrowRight': this.movePiece(1, 0); break;
            case 'ArrowDown': this.movePiece(0, 1); break;
            case 'ArrowUp': this.rotatePiece(); break;
            case ' ': this.hardDrop(); break;
        }
    }

    movePiece(dx, dy) {
        const newX = this.currentPiece.x + dx;
        const newY = this.currentPiece.y + dy;
        if (this.isValidMove(newX, newY, this.currentPiece.shape)) {
            this.currentPiece.x = newX; this.currentPiece.y = newY; return true;
        }
        return false;
    }

    rotatePiece() {
        const rotated = this.currentPiece.shape[0].map((_, i) =>
            this.currentPiece.shape.map(row => row[i]).reverse()
        );
        if (this.isValidMove(this.currentPiece.x, this.currentPiece.y, rotated)) {
            this.currentPiece.shape = rotated;
        }
    }

    hardDrop() { while (this.movePiece(0, 1)) {} this.lockPiece(); }

    isValidMove(x, y, shape) {
        for (let row = 0; row < shape.length; row++) {
            for (let col = 0; col < shape[row].length; col++) {
                if (shape[row][col]) {
                    const newX = x + col; const newY = y + row;
                    if (newX < 0 || newX >= this.cols || newY >= this.rows || (newY >= 0 && this.board[newY][newX])) return false;
                }
            }
        }
        return true;
    }

    lockPiece() {
        for (let row = 0; row < this.currentPiece.shape.length; row++) {
            for (let col = 0; col < this.currentPiece.shape[row].length; col++) {
                if (this.currentPiece.shape[row][col]) {
                    const boardY = this.currentPiece.y + row; const boardX = this.currentPiece.x + col;
                    if (boardY >= 0) this.board[boardY][boardX] = this.currentPiece.color;
                }
            }
        }
        this.clearLines();
        this.createNewPiece();
        if (!this.isValidMove(this.currentPiece.x, this.currentPiece.y, this.currentPiece.shape)) this.gameOver = true;
    }

    clearLines() {
        let linesCleared = 0;
        for (let row = this.rows - 1; row >= 0; row--) {
            if (this.board[row].every(cell => cell !== 0)) {
                this.board.splice(row, 1); this.board.unshift(Array(this.cols).fill(0)); linesCleared++; row++;
            }
        }
        if (linesCleared > 0) { this.score += linesCleared * 100 * this.level; this.level = Math.floor(this.score / 1000) + 1; this.updateScore(); }
    }

    updateScore() {
        const scoreDisplay = document.getElementById('tetris-score');
        if (scoreDisplay) scoreDisplay.textContent = `SCORE: ${this.score} | LEVEL: ${this.level}`;
    }

    draw() {
        this.ctx.fillStyle = 'rgba(25, 25, 35, 0.95)';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        this.ctx.strokeStyle = 'rgba(255, 51, 102, 0.1)';
        this.ctx.lineWidth = 1;
        for (let i = 0; i <= this.cols; i++) { this.ctx.beginPath(); this.ctx.moveTo(i * this.blockSize, 0); this.ctx.lineTo(i * this.blockSize, this.canvas.height); this.ctx.stroke(); }
        for (let i = 0; i <= this.rows; i++) { this.ctx.beginPath(); this.ctx.moveTo(0, i * this.blockSize); this.ctx.lineTo(this.canvas.width, i * this.blockSize); this.ctx.stroke(); }
        for (let row = 0; row < this.rows; row++) { for (let col = 0; col < this.cols; col++) { if (this.board[row][col]) { this.drawBlock(col, row, this.board[row][col]); } } }
        if (this.currentPiece) {
            for (let row = 0; row < this.currentPiece.shape.length; row++) {
                for (let col = 0; col < this.currentPiece.shape[row].length; col++) {
                    if (this.currentPiece.shape[row][col]) { this.drawBlock(this.currentPiece.x + col, this.currentPiece.y + row, this.currentPiece.color); }
                }
            }
        }
        if (this.gameOver) {
            this.ctx.fillStyle = 'rgba(25, 25, 35, 0.9)';
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
            this.ctx.font = 'bold 36px Orbitron'; this.ctx.fillStyle = '#ff3366'; this.ctx.textAlign = 'center'; this.ctx.shadowColor = '#ff3366'; this.ctx.shadowBlur = 25;
            this.ctx.fillText('GAME OVER', this.canvas.width/2, this.canvas.height/2 - 20);
            this.ctx.font = 'bold 24px Orbitron'; this.ctx.fillText(`Score: ${this.score}`, this.canvas.width/2, this.canvas.height/2 + 30);
            this.ctx.font = '18px Orbitron'; this.ctx.fillText('Press SPACE to restart', this.canvas.width/2, this.canvas.height/2 + 70);
        }
    }

    drawBlock(x, y, color) {
        const gradient = this.ctx.createLinearGradient(x * this.blockSize, y * this.blockSize, (x + 1) * this.blockSize, (y + 1) * this.blockSize);
        gradient.addColorStop(0, color);
        gradient.addColorStop(1, this.adjustColor(color, -30));
        this.ctx.fillStyle = gradient; this.ctx.shadowColor = color; this.ctx.shadowBlur = 15;
        this.ctx.fillRect(x * this.blockSize + 1, y * this.blockSize + 1, this.blockSize - 2, this.blockSize - 2);
    }

    adjustColor(color, amount) {
        const hex = color.replace('#', '');
        const r = Math.max(0, Math.min(255, parseInt(hex.substr(0, 2), 16) + amount));
        const g = Math.max(0, Math.min(255, parseInt(hex.substr(2, 2), 16) + amount));
        const b = Math.max(0, Math.min(255, parseInt(hex.substr(4, 2), 16) + amount));
        return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
    }

    gameLoop(currentTime) {
        if (this.lastRenderTime === 0) { this.lastRenderTime = currentTime; }
        const elapsed = currentTime - this.lastRenderTime;
        if (elapsed > this.speed && !this.gameOver) {
            if (!this.movePiece(0, 1)) { this.lockPiece(); }
            this.lastRenderTime = currentTime;
        }
        this.draw();
        this.animationFrameId = requestAnimationFrame(this.gameLoop.bind(this));
    }

    stopGame() {
        if (this.animationFrameId) { cancelAnimationFrame(this.animationFrameId); this.animationFrameId = null; }
        document.removeEventListener('keydown', this.keyHandler);
        this.gameOver = true;
    }
}

window.Tetris = Tetris;


