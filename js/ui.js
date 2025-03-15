// ui.js - Handles the game's user interface elements

window.GameUI = class GameUI {
    constructor(game) {
        this.game = game;
        this.scoreValue = document.getElementById('score-value');
        this.livesIcons = document.getElementById('lives-icons');
        this.specialMeter = document.getElementById('special-meter');
        this.finalScore = document.getElementById('final-score');
        this.coinsCollected = document.getElementById('coins-collected');
        this.completionTime = document.getElementById('completion-time');
        this.gameOverScore = document.getElementById('game-over-score');
        this.gameOverCoins = document.getElementById('game-over-coins');
        
        // Mobile controls
        this.leftButton = document.getElementById('left-button');
        this.rightButton = document.getElementById('right-button');
        this.jumpButton = document.getElementById('jump-button');
        this.specialButton = document.getElementById('special-button');
        
        // Pause button
        this.pauseButton = document.getElementById('pause-button');
        
        this.isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    }
    
    init() {
        // Initialize UI elements
        this.updateScore(0);
        this.updateLives(3);
        this.updateSpecialMeter(0);
        
        // Show mobile controls on mobile devices
        if (this.isMobile) {
            document.querySelector('.mobile-controls').style.display = 'flex';
        } else {
            document.querySelector('.mobile-controls').style.display = 'none';
        }
        
        // Add event listeners for UI buttons
        this.addEventListeners();
    }
    
    addEventListeners() {
        // Main menu buttons
        document.getElementById('play-button').addEventListener('click', () => {
            this.game.showScreen('character-select');
        });
        
        document.getElementById('how-to-play-button').addEventListener('click', () => {
            this.game.showScreen('how-to-play');
        });
        
        document.getElementById('credits-button').addEventListener('click', () => {
            this.game.showScreen('credits');
        });
        
        // Character selection buttons
        document.getElementById('back-to-menu').addEventListener('click', () => {
            this.game.showScreen('main-menu');
        });
        
        document.getElementById('select-character').addEventListener('click', () => {
            const selectedCharacter = document.querySelector('.character-option:not(.locked).selected');
            if (selectedCharacter) {
                this.game.selectCharacter(selectedCharacter.dataset.character);
                this.game.showScreen('toronto-map');
            } else {
                // Select the first unlocked character by default
                const firstUnlocked = document.querySelector('.character-option:not(.locked)');
                if (firstUnlocked) {
                    firstUnlocked.classList.add('selected');
                    this.game.selectCharacter(firstUnlocked.dataset.character);
                    this.game.showScreen('toronto-map');
                }
            }
        });
        
        // Make character options selectable
        document.querySelectorAll('.character-option:not(.locked)').forEach(option => {
            option.addEventListener('click', () => {
                document.querySelectorAll('.character-option').forEach(opt => {
                    opt.classList.remove('selected');
                });
                option.classList.add('selected');
            });
        });
        
        // How to play back button
        document.getElementById('back-from-instructions').addEventListener('click', () => {
            this.game.showScreen('main-menu');
        });
        
        // Credits back button
        document.getElementById('back-from-credits').addEventListener('click', () => {
            this.game.showScreen('main-menu');
        });
        
        // Pause menu buttons
        document.getElementById('resume-button').addEventListener('click', () => {
            this.game.resumeGame();
        });
        
        document.getElementById('restart-button').addEventListener('click', () => {
            this.game.restartLevel();
        });
        
        document.getElementById('exit-to-map').addEventListener('click', () => {
            this.game.exitToMap();
        });
        
        // Level complete buttons
        document.getElementById('next-level').addEventListener('click', () => {
            this.game.nextLevel();
        });
        
        document.getElementById('replay-level').addEventListener('click', () => {
            this.game.restartLevel();
        });
        
        document.getElementById('back-to-map').addEventListener('click', () => {
            this.game.exitToMap();
        });
        
        // Game over buttons
        document.getElementById('try-again').addEventListener('click', () => {
            this.game.restartLevel();
        });
        
        document.getElementById('game-over-to-map').addEventListener('click', () => {
            this.game.exitToMap();
        });
        
        // Pause button
        this.pauseButton.addEventListener('click', () => {
            this.game.togglePause();
        });
        
        // Mobile control buttons
        if (this.isMobile) {
            this.setupMobileControls();
        }
    }
    
    setupMobileControls() {
        // Left button
        this.leftButton.addEventListener('touchstart', () => {
            this.game.input.keys.left = true;
        });
        
        this.leftButton.addEventListener('touchend', () => {
            this.game.input.keys.left = false;
        });
        
        // Right button
        this.rightButton.addEventListener('touchstart', () => {
            this.game.input.keys.right = true;
        });
        
        this.rightButton.addEventListener('touchend', () => {
            this.game.input.keys.right = false;
        });
        
        // Jump button
        this.jumpButton.addEventListener('touchstart', () => {
            this.game.input.keys.up = true;
        });
        
        this.jumpButton.addEventListener('touchend', () => {
            this.game.input.keys.up = false;
        });
        
        // Special button
        this.specialButton.addEventListener('touchstart', () => {
            this.game.input.keys.space = true;
        });
        
        this.specialButton.addEventListener('touchend', () => {
            this.game.input.keys.space = false;
        });
    }
    
    updateScore(score) {
        this.scoreValue.textContent = score;
    }
    
    updateLives(lives) {
        this.livesIcons.innerHTML = '';
        for (let i = 0; i < lives; i++) {
            const lifeIcon = document.createElement('div');
            lifeIcon.className = 'life-icon';
            this.livesIcons.appendChild(lifeIcon);
        }
    }
    
    updateSpecialMeter(value) {
        this.specialMeter.style.width = `${value}%`;
    }
    
    showLevelComplete(stats) {
        this.finalScore.textContent = stats.score;
        this.coinsCollected.textContent = stats.coins;
        this.completionTime.textContent = this.formatTime(stats.time);
        
        // Update stars based on performance
        const stars = document.querySelectorAll('.level-stars .big-star');
        const starsEarned = Math.min(Math.floor(stats.score / 1000) + 1, 3);
        
        for (let i = 0; i < stars.length; i++) {
            if (i < starsEarned) {
                stars[i].classList.add('earned');
            } else {
                stars[i].classList.remove('earned');
            }
        }
        
        // Show/hide unlock notification
        const unlockNotification = document.getElementById('unlock-notification');
        if (stats.unlocked) {
            unlockNotification.classList.add('show');
            document.getElementById('unlocked-item-name').textContent = stats.unlocked;
        } else {
            unlockNotification.classList.remove('show');
        }
        
        this.game.showScreen('level-complete');
    }
    
    showGameOver(stats) {
        this.gameOverScore.textContent = stats.score;
        this.gameOverCoins.textContent = stats.coins;
        this.game.showScreen('game-over');
    }
    
    formatTime(milliseconds) {
        const seconds = Math.floor(milliseconds / 1000);
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
    }
}
