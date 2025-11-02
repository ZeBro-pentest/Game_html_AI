class Battleship {
    constructor() {
        this.size = 10;
        this.playerBoard = Array(this.size).fill(null).map(() => Array(this.size).fill(0));
        this.enemyBoard = Array(this.size).fill(null).map(() => Array(this.size).fill(0));
        this.enemyShipsPositions = [];
        this.playerShips = [];
        this.enemyShips = [];
        this.shipsToPlace = [4, 3, 3, 2, 2];
        this.currentShipIndex = 0;
        this.placingShips = true;
        this.gameStarted = false;
        this.playerTurn = true;

        this.init();
    }

    init() {
        this.createBoards();
        this.setupEventListeners();
        this.placeEnemyShips();
    }

    createBoards() {
        const playerBoard = document.getElementById('player-board');
        const enemyBoard = document.getElementById('enemy-board');
        
        playerBoard.innerHTML = '';
        enemyBoard.innerHTML = '';

        for (let row = 0; row < this.size; row++) {
            for (let col = 0; col < this.size; col++) {
                const cell = document.createElement('div');
                cell.className = 'bs-cell';
                cell.dataset.row = row;
                cell.dataset.col = col;
                cell.dataset.board = 'player';
                cell.style.cssText = `
                    width: 40px;
                    height: 40px;
                    background: linear-gradient(145deg, rgba(0, 100, 200, 0.4), rgba(0, 50, 100, 0.3));
                    border: 2px solid rgba(0, 255, 136, 0.4);
                    border-radius: 5px;
                    cursor: pointer;
                    transition: all 0.3s ease;
                    box-shadow: 0 0 10px rgba(0, 255, 136, 0.1);
                `;
                
                if (this.placingShips) {
                    cell.addEventListener('click', () => this.placeShip(row, col));
                    cell.addEventListener('mouseenter', function() {
                        if (this.dataset.board === 'player' && !this.dataset.ship) {
                            this.style.background = 'linear-gradient(145deg, rgba(0, 255, 136, 0.3), rgba(0, 200, 100, 0.2))';
                            this.style.borderColor = 'rgba(0, 255, 136, 0.7)';
                            this.style.boxShadow = '0 0 15px rgba(0, 255, 136, 0.4)';
                            this.style.transform = 'scale(1.1)';
                        }
                    });
                    cell.addEventListener('mouseleave', function() {
                        if (this.dataset.board === 'player' && !this.dataset.ship) {
                            this.style.background = 'linear-gradient(145deg, rgba(0, 100, 200, 0.4), rgba(0, 50, 100, 0.3))';
                            this.style.borderColor = 'rgba(0, 255, 136, 0.4)';
                            this.style.boxShadow = '0 0 10px rgba(0, 255, 136, 0.1)';
                            this.style.transform = 'scale(1)';
                        }
                    });
                }
                playerBoard.appendChild(cell);

                const enemyCell = document.createElement('div');
                enemyCell.className = 'bs-cell';
                enemyCell.dataset.row = row;
                enemyCell.dataset.col = col;
                enemyCell.dataset.board = 'enemy';
                enemyCell.style.cssText = `
                    width: 40px;
                    height: 40px;
                    background: linear-gradient(145deg, rgba(0, 100, 200, 0.4), rgba(0, 50, 100, 0.3));
                    border: 2px solid rgba(0, 255, 136, 0.4);
                    border-radius: 5px;
                    cursor: pointer;
                    transition: all 0.3s ease;
                    box-shadow: 0 0 10px rgba(0, 255, 136, 0.1);
                `;
                enemyCell.addEventListener('click', () => this.attackEnemy(row, col));
                enemyCell.addEventListener('mouseenter', function() {
                    if (this.dataset.board === 'enemy' && !this.dataset.hit) {
                        this.style.background = 'linear-gradient(145deg, rgba(255, 255, 0, 0.4), rgba(255, 200, 0, 0.3))';
                        this.style.borderColor = 'rgba(255, 255, 0, 0.7)';
                        this.style.boxShadow = '0 0 15px rgba(255, 255, 0, 0.4)';
                        this.style.transform = 'scale(1.1)';
                    }
                });
                enemyCell.addEventListener('mouseleave', function() {
                    if (this.dataset.board === 'enemy' && !this.dataset.hit) {
                        this.style.background = 'linear-gradient(145deg, rgba(0, 100, 200, 0.4), rgba(0, 50, 100, 0.3))';
                        this.style.borderColor = 'rgba(0, 255, 136, 0.4)';
                        this.style.boxShadow = '0 0 10px rgba(0, 255, 136, 0.1)';
                        this.style.transform = 'scale(1)';
                    }
                });
                enemyBoard.appendChild(enemyCell);
            }
        }
    }

    setupEventListeners() {
        document.getElementById('random-btn').addEventListener('click', () => {
            this.randomPlacePlayerShips();
        });
        document.getElementById('start-btn').addEventListener('click', () => {
            if (this.currentShipIndex >= this.shipsToPlace.length) {
                this.startGame();
            }
        });
    }

    placeShip(row, col) {
        if (!this.placingShips || this.currentShipIndex >= this.shipsToPlace.length) return;

        const shipSize = this.shipsToPlace[this.currentShipIndex];
        
        // Пробуем разместить горизонтально
        if (col + shipSize <= this.size && this.canPlaceShip(row, col, shipSize, true)) {
            this.addShip(row, col, shipSize, true, 'player');
            this.currentShipIndex++;
            this.updateStatus();
            if (this.currentShipIndex >= this.shipsToPlace.length) {
                document.getElementById('start-btn').style.display = 'inline-block';
            }
        }
        // Если не получилось, пробуем вертикально
        else if (row + shipSize <= this.size && this.canPlaceShip(row, col, shipSize, false)) {
            this.addShip(row, col, shipSize, false, 'player');
            this.currentShipIndex++;
            this.updateStatus();
            if (this.currentShipIndex >= this.shipsToPlace.length) {
                document.getElementById('start-btn').style.display = 'inline-block';
            }
        }
    }

    canPlaceShip(row, col, size, horizontal) {
        for (let i = 0; i < size; i++) {
            const r = horizontal ? row : row + i;
            const c = horizontal ? col + i : col;
            if (this.playerBoard[r][c] === 1) return false;
            
            // Проверка соседних клеток
            for (let dr = -1; dr <= 1; dr++) {
                for (let dc = -1; dc <= 1; dc++) {
                    const nr = r + dr;
                    const nc = c + dc;
                    if (nr >= 0 && nr < this.size && nc >= 0 && nc < this.size) {
                        if (this.playerBoard[nr][nc] === 1) return false;
                    }
                }
            }
        }
        return true;
    }

    addShip(row, col, size, horizontal, board) {
        const ship = { cells: [] };
        for (let i = 0; i < size; i++) {
            const r = horizontal ? row : row + i;
            const c = horizontal ? col + i : col;
            
            if (board === 'player') {
                this.playerBoard[r][c] = 1;
                const cell = document.querySelector(`[data-board="player"][data-row="${r}"][data-col="${c}"]`);
                cell.dataset.ship = '1';
                cell.style.background = 'linear-gradient(145deg, rgba(0, 255, 136, 0.7), rgba(0, 200, 100, 0.6))';
                cell.style.borderColor = 'rgba(0, 255, 136, 0.8)';
                cell.style.boxShadow = '0 0 15px rgba(0, 255, 136, 0.4)';
                ship.cells.push({ row: r, col: c });
            } else {
                this.enemyBoard[r][c] = 1;
                ship.cells.push({ row: r, col: c });
            }
        }
        
        if (board === 'player') {
            this.playerShips.push(ship);
        } else {
            this.enemyShips.push(ship);
        }
    }

    randomPlacePlayerShips() {
        this.playerBoard = Array(this.size).fill(null).map(() => Array(this.size).fill(0));
        this.playerShips = [];
        this.currentShipIndex = 0;
        
        this.createBoards();
        
        for (let shipSize of this.shipsToPlace) {
            let placed = false;
            let attempts = 0;
            
            while (!placed && attempts < 100) {
                attempts++;
                const horizontal = Math.random() > 0.5;
                const row = Math.floor(Math.random() * this.size);
                const col = Math.floor(Math.random() * this.size);
                
                if (horizontal && col + shipSize <= this.size && this.canPlaceShip(row, col, shipSize, true)) {
                    this.addShip(row, col, shipSize, true, 'player');
                    placed = true;
                } else if (!horizontal && row + shipSize <= this.size && this.canPlaceShip(row, col, shipSize, false)) {
                    this.addShip(row, col, shipSize, false, 'player');
                    placed = true;
                }
            }
        }
        
        this.currentShipIndex = this.shipsToPlace.length;
        document.getElementById('start-btn').style.display = 'inline-block';
        this.updateStatus();
    }

    placeEnemyShips() {
        this.enemyBoard = Array(this.size).fill(null).map(() => Array(this.size).fill(0));
        this.enemyShips = [];
        
        for (let shipSize of this.shipsToPlace) {
            let placed = false;
            let attempts = 0;
            
            while (!placed && attempts < 100) {
                attempts++;
                const horizontal = Math.random() > 0.5;
                const row = Math.floor(Math.random() * this.size);
                const col = Math.floor(Math.random() * this.size);
                
                if (horizontal && col + shipSize <= this.size && this.canPlaceEnemyShip(row, col, shipSize, true)) {
                    this.addShip(row, col, shipSize, true, 'enemy');
                    placed = true;
                } else if (!horizontal && row + shipSize <= this.size && this.canPlaceEnemyShip(row, col, shipSize, false)) {
                    this.addShip(row, col, shipSize, false, 'enemy');
                    placed = true;
                }
            }
        }
    }

    canPlaceEnemyShip(row, col, size, horizontal) {
        for (let i = 0; i < size; i++) {
            const r = horizontal ? row : row + i;
            const c = horizontal ? col + i : col;
            if (this.enemyBoard[r][c] === 1) return false;
            
            for (let dr = -1; dr <= 1; dr++) {
                for (let dc = -1; dc <= 1; dc++) {
                    const nr = r + dr;
                    const nc = c + dc;
                    if (nr >= 0 && nr < this.size && nc >= 0 && nc < this.size) {
                        if (this.enemyBoard[nr][nc] === 1) return false;
                    }
                }
            }
        }
        return true;
    }

    startGame() {
        this.gameStarted = true;
        this.placingShips = false;
        this.playerTurn = true;
        
        // Отключаем клики на своем поле
        document.querySelectorAll('[data-board="player"]').forEach(cell => {
            cell.style.cursor = 'default';
        });
        
        this.updateStatus();
    }

    attackEnemy(row, col) {
        if (!this.gameStarted || !this.playerTurn) return;
        
        const cell = document.querySelector(`[data-board="enemy"][data-row="${row}"][data-col="${col}"]`);
        if (cell.dataset.hit) return;

        if (this.enemyBoard[row][col] === 1) {
            cell.dataset.hit = 'hit';
            cell.style.background = 'linear-gradient(145deg, rgba(255, 51, 102, 0.9), rgba(200, 0, 50, 0.8))';
            cell.style.borderColor = 'rgba(255, 51, 102, 0.9)';
            cell.style.boxShadow = '0 0 20px rgba(255, 51, 102, 0.6)';
            cell.style.color = '#ff3366';
            cell.style.fontSize = '20px';
            cell.style.fontWeight = 'bold';
            cell.textContent = '×';
            
            // Проверка, потоплен ли корабль
            this.checkShipSunk(row, col, 'enemy');
            this.updateShipsCount();
            
            if (this.enemyShips.length === 0) {
                setTimeout(() => {
                    this.showGameOver('#00ff88', 'ПОБЕДА!', 'Вы потопили все корабли врага');
                }, 100);
                return;
            }
        } else {
            cell.dataset.hit = 'miss';
            cell.style.background = 'linear-gradient(145deg, rgba(200, 200, 200, 0.4), rgba(150, 150, 150, 0.3))';
            cell.style.borderColor = 'rgba(200, 200, 200, 0.6)';
            cell.style.boxShadow = '0 0 10px rgba(200, 200, 200, 0.3)';
            cell.style.color = '#ccc';
            cell.textContent = '•';
            this.playerTurn = false;
            setTimeout(() => this.enemyTurn(), 500);
        }
    }

    enemyTurn() {
        if (this.enemyShips.length === 0 || this.playerShips.length === 0) return;

        let row, col;
        let attempts = 0;
        
        do {
            row = Math.floor(Math.random() * this.size);
            col = Math.floor(Math.random() * this.size);
            attempts++;
        } while (attempts < 100 && document.querySelector(`[data-board="player"][data-row="${row}"][data-col="${col}"][data-hit]`));

        const cell = document.querySelector(`[data-board="player"][data-row="${row}"][data-col="${col}"]`);
        if (cell.dataset.hit) {
            this.enemyTurn();
            return;
        }

        if (this.playerBoard[row][col] === 1) {
            cell.dataset.hit = 'hit';
            cell.style.background = 'linear-gradient(145deg, rgba(255, 51, 102, 0.9), rgba(200, 0, 50, 0.8))';
            cell.style.borderColor = 'rgba(255, 51, 102, 0.9)';
            cell.style.boxShadow = '0 0 20px rgba(255, 51, 102, 0.6)';
            cell.style.color = '#ff3366';
            cell.style.fontSize = '20px';
            cell.style.fontWeight = 'bold';
            cell.textContent = '×';
            
            this.checkShipSunk(row, col, 'player');
            this.updateShipsCount();
            
            if (this.playerShips.length === 0) {
                setTimeout(() => {
                    this.showGameOver('#ff3366', 'GAME OVER', 'Все ваши корабли потоплены');
                }, 100);
                return;
            } else {
                setTimeout(() => this.enemyTurn(), 500);
            }
        } else {
            cell.dataset.hit = 'miss';
            cell.style.background = 'linear-gradient(145deg, rgba(200, 200, 200, 0.4), rgba(150, 150, 150, 0.3))';
            cell.style.borderColor = 'rgba(200, 200, 200, 0.6)';
            cell.style.boxShadow = '0 0 10px rgba(200, 200, 200, 0.3)';
            cell.style.color = '#ccc';
            cell.textContent = '•';
            this.playerTurn = true;
        }
    }

    checkShipSunk(row, col, board) {
        const ships = board === 'player' ? this.playerShips : this.enemyShips;
        
        for (let i = ships.length - 1; i >= 0; i--) {
            const ship = ships[i];
            if (ship.cells.some(c => c.row === row && c.col === col)) {
                // Проверяем, все ли клетки корабля поражены
                const allHit = ship.cells.every(cell => {
                    const cellEl = document.querySelector(`[data-board="${board}"][data-row="${cell.row}"][data-col="${cell.col}"]`);
                    return cellEl && cellEl.dataset.hit === 'hit';
                });
                
                if (allHit) {
                    ships.splice(i, 1);
                }
                break;
            }
        }
    }

    updateShipsCount() {
        document.getElementById('your-ships').textContent = this.playerShips.length;
        document.getElementById('enemy-ships').textContent = this.enemyShips.length;
    }

    updateStatus() {
        const statusEl = document.getElementById('status');
        if (!this.gameStarted) {
            statusEl.textContent = `Расставьте корабли (${this.currentShipIndex}/${this.shipsToPlace.length})`;
        } else if (this.playerTurn) {
            statusEl.textContent = 'Ваш ход';
        } else {
            statusEl.textContent = 'Ход врага';
        }
    }

    showGameOver(color, title, message) {
        // Создаем оверлей canvas поверх игрового поля
        const container = document.querySelector('.game-container');
        let overlay = document.getElementById('battleship-overlay');
        
        if (!overlay) {
            overlay = document.createElement('canvas');
            overlay.id = 'battleship-overlay';
            overlay.width = 900;
            overlay.height = 600;
            overlay.style.cssText = `
                position: fixed;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                z-index: 1000;
                background: transparent;
                pointer-events: auto;
            `;
            container.appendChild(overlay);
            this.overlayCtx = overlay.getContext('2d');
        } else {
            this.overlayCtx = overlay.getContext('2d');
        }
        
        overlay.style.display = 'block';
        
        const draw = () => {
            const ctx = this.overlayCtx;
            const time = Date.now() * 0.001;
            const pulse = Math.sin(time * 2) * 0.15 + 0.85;
            
            // Фон точно как в змейке
            ctx.fillStyle = 'rgba(25, 25, 35, 0.95)';
            ctx.fillRect(0, 0, overlay.width, overlay.height);
            
            // Главный заголовок - точно как в змейке с пульсацией
            ctx.font = 'bold 36px Orbitron';
            ctx.fillStyle = color;
            ctx.textAlign = 'center';
            ctx.shadowColor = color;
            ctx.shadowBlur = 25 * pulse;
            ctx.fillText(title, overlay.width/2, overlay.height/2 - 20);
            
            // Сообщение - точно как в змейке (счет)
            ctx.font = 'bold 24px Orbitron';
            ctx.fillStyle = color;
            ctx.shadowColor = color;
            ctx.shadowBlur = 20;
            ctx.fillText(message, overlay.width/2, overlay.height/2 + 30);
            
            // Инструкция - как в змейке
            ctx.font = '18px Orbitron';
            ctx.fillStyle = '#00ff88';
            ctx.shadowColor = '#00ff88';
            ctx.shadowBlur = 15;
            ctx.fillText('Обновите страницу для новой игры', overlay.width/2, overlay.height/2 + 70);
            
            if (overlay.style.display !== 'none') {
                requestAnimationFrame(draw);
            }
        };
        
        draw();
        
        overlay.addEventListener('click', () => {
            overlay.style.display = 'none';
            location.reload();
        }, { once: true });
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new Battleship();
});

