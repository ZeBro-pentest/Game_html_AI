class Minesweeper {
    constructor(width, height, mines) {
        this.width = width;
        this.height = height;
        this.mines = mines;
        this.board = [];
        this.gameOver = false;
        this.firstClick = true;
        this.timer = 0;
        this.timerInterval = null;
        this.minesLeft = mines;
        this.init();
    }

    init() {
        this.board = Array(this.height).fill().map(() =>
            Array(this.width).fill().map(() => ({
                isMine: false,
                isRevealed: false,
                isFlagged: false,
                neighborMines: 0
            }))
        );

        this.updateMinesCount();
        const resetBtn = document.getElementById('reset-button');
        if (resetBtn) resetBtn.textContent = '😊';
    }

    startTimer() {
        if (this.timerInterval) return;
        this.timer = 0;
        const timerEl = document.getElementById('timer');
        if (timerEl) timerEl.textContent = '0';
        this.timerInterval = setInterval(() => {
            this.timer++;
            const el = document.getElementById('timer');
            if (el) el.textContent = this.timer;
        }, 1000);
    }

    stopTimer() {
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
            this.timerInterval = null;
        }
    }

    placeMines(firstX, firstY) {
        let minesPlaced = 0;
        while (minesPlaced < this.mines) {
            const x = Math.floor(Math.random() * this.width);
            const y = Math.floor(Math.random() * this.height);
            if (!this.board[y][x].isMine && 
                (Math.abs(x - firstX) > 1 || Math.abs(y - firstY) > 1)) {
                this.board[y][x].isMine = true;
                minesPlaced++;
            }
        }

        for (let y = 0; y < this.height; y++) {
            for (let x = 0; x < this.width; x++) {
                if (!this.board[y][x].isMine) {
                    this.board[y][x].neighborMines = this.countNeighborMines(x, y);
                }
            }
        }
    }

    countNeighborMines(x, y) {
        let count = 0;
        for (let dy = -1; dy <= 1; dy++) {
            for (let dx = -1; dx <= 1; dx++) {
                const newY = y + dy;
                const newX = x + dx;
                if (newY >= 0 && newY < this.height && 
                    newX >= 0 && newX < this.width && 
                    this.board[newY][newX].isMine) {
                    count++;
                }
            }
        }
        return count;
    }

    reveal(x, y) {
        if (this.gameOver || this.board[y][x].isFlagged) return;
        if (this.firstClick) {
            this.firstClick = false;
            this.placeMines(x, y);
            this.startTimer();
        }

        const cell = this.board[y][x];
        if (cell.isRevealed) return;
        cell.isRevealed = true;
        
        if (cell.isMine) {
            this.gameOver = true;
            this.revealAll();
            const resetBtn = document.getElementById('reset-button');
            if (resetBtn) resetBtn.textContent = '😵';
            this.stopTimer();
            return;
        }

        if (cell.neighborMines === 0) {
            for (let dy = -1; dy <= 1; dy++) {
                for (let dx = -1; dx <= 1; dx++) {
                    const newY = y + dy;
                    const newX = x + dx;
                    if (newY >= 0 && newY < this.height && 
                        newX >= 0 && newX < this.width) {
                        this.reveal(newX, newY);
                    }
                }
            }
        }

        if (!this.gameOver) {
            this.renderBoard();
        }

        if (this.checkWin()) {
            this.gameOver = true;
            const resetBtn = document.getElementById('reset-button');
            if (resetBtn) resetBtn.textContent = '😎';
            this.stopTimer();
        }
    }

    toggleFlag(x, y) {
        if (this.gameOver || this.board[y][x].isRevealed) return;
        const cell = this.board[y][x];
        cell.isFlagged = !cell.isFlagged;
        this.minesLeft += cell.isFlagged ? -1 : 1;
        this.updateMinesCount();
        this.renderBoard();
    }

    updateMinesCount() {
        const el = document.getElementById('mines-count');
        if (el) el.textContent = this.minesLeft;
    }

    revealAll() {
        for (let y = 0; y < this.height; y++) {
            for (let x = 0; x < this.width; x++) {
                this.board[y][x].isRevealed = true;
            }
        }
        this.renderBoard();
    }

    checkWin() {
        for (let y = 0; y < this.height; y++) {
            for (let x = 0; x < this.width; x++) {
                const cell = this.board[y][x];
                if (!cell.isMine && !cell.isRevealed) return false;
            }
        }
        return true;
    }

    renderBoard() {
        const board = document.getElementById('game-board');
        board.style.gridTemplateColumns = `repeat(${this.width}, 35px)`;
        board.innerHTML = '';

        for (let y = 0; y < this.height; y++) {
            for (let x = 0; x < this.width; x++) {
                const cell = document.createElement('div');
                cell.className = 'cell';
                const cellData = this.board[y][x];
                if (cellData.isRevealed) {
                    cell.classList.add('revealed');
                    if (cellData.isMine) {
                        cell.classList.add('mine');
                        cell.textContent = '💣';
                    } else if (cellData.neighborMines > 0) {
                        cell.textContent = cellData.neighborMines;
                        cell.setAttribute('data-number', cellData.neighborMines);
                    }
                } else if (cellData.isFlagged) {
                    cell.classList.add('flagged');
                    cell.textContent = '🚩';
                }
                cell.addEventListener('click', () => {
                    this.reveal(x, y);
                });
                cell.addEventListener('contextmenu', (e) => {
                    e.preventDefault();
                    this.toggleFlag(x, y);
                });
                board.appendChild(cell);
            }
        }
    }
}

window.Minesweeper = Minesweeper;


