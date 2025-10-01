class Fifteen {
    constructor(size = 4) {
        this.size = size;
        this.tiles = [];
        this.empty = { row: size - 1, col: size - 1 };
        this.moves = 0;
        this.initUI();
        this.init();
    }

    initUI() {
        const board = document.getElementById('game-board');
        board.innerHTML = '';
        board.style.display = 'grid';
        board.style.gridTemplateColumns = `repeat(${this.size}, 90px)`;
        board.style.gridTemplateRows = `repeat(${this.size}, 90px)`;
        board.style.gap = '6px';
        board.style.justifyContent = 'center';

        const info = document.createElement('div');
        info.id = 'fifteen-info';
        info.style.cssText = 'color:#33ff99;font-family:Orbitron, sans-serif;font-size:18px;text-align:center;margin-bottom:12px;';
        info.textContent = `Ходы: ${this.moves}`;
        board.parentElement.insertBefore(info, board);
    }

    init() {
        this.tiles = Array.from({ length: this.size * this.size - 1 }, (_, i) => i + 1);
        this.tiles.push(0); // 0 — пустая ячейка
        this.shuffleSolvable();
        this.render();
    }

    shuffleSolvable() {
        // Тасуем, пока конфигурация не станет решаемой
        do {
            for (let i = this.tiles.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [this.tiles[i], this.tiles[j]] = [this.tiles[j], this.tiles[i]];
            }
        } while (!this.isSolvable());

        const zeroIndex = this.tiles.indexOf(0);
        this.empty = { row: Math.floor(zeroIndex / this.size), col: zeroIndex % this.size };
    }

    isSolvable() {
        const arr = this.tiles.filter(v => v !== 0);
        let inv = 0;
        for (let i = 0; i < arr.length; i++) {
            for (let j = i + 1; j < arr.length; j++) {
                if (arr[i] > arr[j]) inv++;
            }
        }
        if (this.size % 2 === 1) {
            return inv % 2 === 0;
        } else {
            const zeroRowFromBottom = this.size - Math.floor(this.tiles.indexOf(0) / this.size);
            if (zeroRowFromBottom % 2 === 0) {
                return inv % 2 === 1;
            } else {
                return inv % 2 === 0;
            }
        }
    }

    render() {
        const board = document.getElementById('game-board');
        board.innerHTML = '';
        this.tiles.forEach((value, index) => {
            const row = Math.floor(index / this.size);
            const col = index % this.size;
            const tile = document.createElement('div');
            tile.style.cssText = `
                width: 90px; height: 90px; display:flex; align-items:center; justify-content:center;
                font-family: 'Orbitron', sans-serif; font-size: 28px; font-weight: 700;
                color:#00ff88; background: linear-gradient(145deg,#1a1a2e,#0d0d1a);
                border:1px solid rgba(0,255,136,0.3); border-radius:8px; text-shadow:0 0 8px rgba(0,255,136,0.6);
                box-shadow: 0 0 20px rgba(0,255,136,0.15);
                cursor: ${value ? 'pointer' : 'default'};
            `;
            if (value) {
                tile.textContent = value;
                tile.addEventListener('click', () => this.tryMove(row, col));
            } else {
                tile.style.visibility = 'hidden';
            }
            board.appendChild(tile);
        });
        const info = document.getElementById('fifteen-info');
        if (info) info.textContent = `Ходы: ${this.moves}`;
    }

    tryMove(row, col) {
        if ((row === this.empty.row && Math.abs(col - this.empty.col) === 1) ||
            (col === this.empty.col && Math.abs(row - this.empty.row) === 1)) {
            const clickedIndex = row * this.size + col;
            const emptyIndex = this.empty.row * this.size + this.empty.col;
            [this.tiles[clickedIndex], this.tiles[emptyIndex]] = [this.tiles[emptyIndex], this.tiles[clickedIndex]];
            this.empty = { row, col };
            this.moves++;
            this.render();
            if (this.isCompleted()) this.showWin();
        }
    }

    isCompleted() {
        for (let i = 0; i < this.tiles.length - 1; i++) {
            if (this.tiles[i] !== i + 1) return false;
        }
        return this.tiles[this.tiles.length - 1] === 0;
    }

    showWin() {
        const board = document.getElementById('game-board');
        const overlay = document.createElement('div');
        overlay.style.cssText = `
            position:absolute; inset:0; background:rgba(0,0,0,0.7); display:flex; align-items:center; justify-content:center;
            border-radius: 15px;`;
        const msg = document.createElement('div');
        msg.style.cssText = `
            color:#ff3366; font-family:'Orbitron',sans-serif; font-size: 28px; text-shadow:0 0 12px rgba(255,51,102,0.6);
            background: rgba(16,16,32,0.9); padding: 20px 28px; border:1px solid rgba(0,255,136,0.3); border-radius:10px;`;
        msg.textContent = `Победа! Ходов: ${this.moves}`;
        overlay.appendChild(msg);
        board.parentElement.style.position = 'relative';
        board.parentElement.appendChild(overlay);
        setTimeout(() => {
            overlay.remove();
            this.moves = 0;
            this.init();
        }, 1800);
    }
}

window.Fifteen = Fifteen;


