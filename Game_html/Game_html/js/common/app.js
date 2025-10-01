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

    if (burgerMenu) burgerMenu.addEventListener('click', toggleSidebar);
    if (closeSidebar) closeSidebar.addEventListener('click', closeSidebarMenu);
    overlay.addEventListener('click', closeSidebarMenu);

    const gamesList = document.querySelectorAll('.games-list li');
    gamesList.forEach(item => {
        const button = item.querySelector('button');
        if (!button) return;

        button.addEventListener('click', function(e) {
            e.preventDefault();
            const gameName = this.textContent.trim();
            if (item.classList.contains('coming-soon')) return;

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
                case '4. Пинг-Понг':
                    window.location.href = 'pong.html';
                    break;
                case '5. Пятнашки':
                    window.location.href = 'fifteen.html';
                    break;
            }
        });
    });

    const currentPage = window.location.pathname.split('/').pop();
    if (currentPage === 'minesweeper.html') {
        let game;
        function startNewGame(width, height, mines) {
            if (game) game.stopTimer();
            game = new Minesweeper(width, height, mines);
            game.renderBoard();
        }
        const resetBtn = document.getElementById('reset-button');
        if (resetBtn) {
            resetBtn.addEventListener('click', () => {
                startNewGame(16, 16, 40);
            });
        }
        startNewGame(16, 16, 40);
    } else if (currentPage === 'snake.html') {
        new Snake();
    } else if (currentPage === 'tetris.html') {
        new Tetris();
    } else if (currentPage === 'pong.html') {
        new Pong();
    } else if (currentPage === 'fifteen.html') {
        new Fifteen();
    }
});


