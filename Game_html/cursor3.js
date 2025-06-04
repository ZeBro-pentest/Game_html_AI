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
        // Создаем пустое поле
        this.board = Array(this.height).fill().map(() =>
            Array(this.width).fill().map(() => ({
                isMine: false,
                isRevealed: false,
                isFlagged: false,
                neighborMines: 0
            }))
        );

        // Обновляем счетчик мин
        this.updateMinesCount();
        
        // Сбрасываем смайлик
        document.getElementById('reset-button').textContent = '😊';
    }

    startTimer() {
        if (this.timerInterval) return;
        
        this.timer = 0;
        document.getElementById('timer').textContent = '0';
        
        this.timerInterval = setInterval(() => {
            this.timer++;
            document.getElementById('timer').textContent = this.timer;
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
            
            // Проверяем, что не ставим мину на первую клетку или рядом с ней
            if (!this.board[y][x].isMine && 
                (Math.abs(x - firstX) > 1 || Math.abs(y - firstY) > 1)) {
                this.board[y][x].isMine = true;
                minesPlaced++;
            }
        }

        // Вычисляем количество мин вокруг каждой клетки
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
            document.getElementById('reset-button').textContent = '😵';
            this.stopTimer();
            return;
        }

        if (cell.neighborMines === 0) {
            // Рекурсивно открываем соседние клетки
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
            document.getElementById('reset-button').textContent = '😎';
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
        document.getElementById('mines-count').textContent = this.minesLeft;
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

// Функционал бургер-меню
document.addEventListener('DOMContentLoaded', () => {
    const burgerMenu = document.querySelector('.burger-menu');
    const sidebar = document.querySelector('.sidebar');
    const closeSidebar = document.querySelector('.close-sidebar');
    const overlay = document.createElement('div');
    overlay.className = 'overlay';
    document.body.appendChild(overlay);

    function toggleSidebar() {
        sidebar.classList.toggle('active');
        overlay.classList.toggle('active');
        document.body.style.overflow = sidebar.classList.contains('active') ? 'hidden' : '';
    }

    function closeSidebarMenu() {
        sidebar.classList.remove('active');
        overlay.classList.remove('active');
        document.body.style.overflow = '';
    }

    burgerMenu.addEventListener('click', toggleSidebar);
    closeSidebar.addEventListener('click', closeSidebarMenu);
    overlay.addEventListener('click', closeSidebarMenu);

    // Добавляем обработчики для меню
    const gamesList = document.querySelectorAll('.games-list li');

    // Добавляем обработчики для каждой кнопки
    gamesList.forEach(item => {
        const button = item.querySelector('button');
        if (!button) {
            console.error('Button not found in list item:', item);
            return;
        }

        button.addEventListener('click', function(e) {
            e.preventDefault();
            const gameName = this.textContent.trim();
            
            // Проверяем, не является ли игра "coming soon"
            if (item.classList.contains('coming-soon')) {
                return;
            }

            // Определяем, какую игру запустить
            switch(gameName) {
                case 'Главное меню':
                    window.location.href = 'index.html';
                    break;
                case '1. Сапер':
                    window.location.href = 'minesweeper.html';
                    break;
                case '2. Змейка':
                    window.location.href = 'snake.html';
                    break;
                case '3. Тетрис':
                    window.location.href = 'tetris.html';
                    break;
            }
        });
    });

    // Инициализация игры в зависимости от страницы
    const currentPage = window.location.pathname.split('/').pop();
    if (currentPage === 'minesweeper.html') {
        // Инициализация Сапера
        let game;
        function startNewGame(width, height, mines) {
            if (game) {
                game.stopTimer();
            }
            game = new Minesweeper(width, height, mines);
            game.renderBoard();
        }

        // Обработчик кнопки
        document.getElementById('reset-button').addEventListener('click', () => {
            startNewGame(16, 16, 40);
        });

        // Начинаем с размером 16x16 и 40 минами
        startNewGame(16, 16, 40);
    } else if (currentPage === 'snake.html') {
        // Инициализация Змейки
        new Snake();
    } else if (currentPage === 'tetris.html') {
        // Инициализация Тетриса
        new Tetris();
    }
});
