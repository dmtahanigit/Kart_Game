// game.js - Main game engine

window.Game = class Game {
    constructor() {
        this.canvas = document.getElementById('game-canvas');
        this.ctx = this.canvas.getContext('2d');
        this.gameContainer = document.getElementById('game-container');
        
        // Game state
        this.currentScreen = 'loading-screen';
        this.isRunning = false;
        this.isPaused = false;
        this.gameTime = 0;
        this.lastTime = 0;
        
        // Game objects
        this.player = null;
        this.currentLevel = null;
        this.selectedCharacter = 'maple';
        
        // Game stats
        this.score = 0;
        this.lives = 3;
        this.coins = 0;
        this.specialMeter = 0;
        
        // Initialize components
        this.assets = new AssetManager();
        this.input = new InputHandler();
        this.ui = new GameUI(this);
        this.map = new GameMap(this);
        
        // Bind methods
        this.gameLoop = this.gameLoop.bind(this);
        this.handleResize = this.handleResize.bind(this);
        
        // Event listeners
        window.addEventListener('resize', this.handleResize);
    }
    
    async init() {
        // Show loading screen
        this.showScreen('loading-screen');
        
        // Load assets
        await this.assets.loadAssets();
        
        // Initialize UI
        this.ui.init();
        
        // Initialize map
        this.map.init();
        
        // Set canvas size
        this.handleResize();
        
        // Show main menu
        this.showScreen('main-menu');
    }
    
    showScreen(screenId) {
        // Hide all screens
        document.querySelectorAll('.screen, .overlay-screen').forEach(screen => {
            screen.classList.remove('active');
        });
        
        // Show the requested screen
        document.getElementById(screenId).classList.add('active');
        this.currentScreen = screenId;
        
        // Special handling for game screen
        if (screenId === 'game-screen') {
            this.isRunning = true;
            this.lastTime = performance.now();
            requestAnimationFrame(this.gameLoop);
        } else {
            this.isRunning = false;
        }
    }
    
    selectCharacter(characterId) {
        this.selectedCharacter = characterId;
    }
    
    startLevel(levelId) {
        // Create level
        this.currentLevel = new Level(this, levelId);
        
        // Create player
        this.player = new Character(this, this.selectedCharacter);
        
        // Reset game stats
        this.score = 0;
        this.lives = 3;
        this.coins = 0;
        this.specialMeter = 0;
        
        // Update UI
        this.ui.updateScore(this.score);
        this.ui.updateLives(this.lives);
        this.ui.updateSpecialMeter(this.specialMeter);
        
        // Start the game
        this.gameTime = 0;
        this.isRunning = true;
        this.isPaused = false;
        this.lastTime = performance.now();
        this.showScreen('game-screen');
    }
    
    gameLoop(timestamp) {
        if (!this.isRunning) return;
        
        // Calculate delta time
        const deltaTime = timestamp - this.lastTime;
        this.lastTime = timestamp;
        
        // Skip if paused
        if (this.isPaused) {
            requestAnimationFrame(this.gameLoop);
            return;
        }
        
        // Update game time
        this.gameTime += deltaTime;
        
        // Clear canvas
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Update and render level
        this.currentLevel.update(deltaTime);
        this.currentLevel.render(this.ctx);
        
        // Update and render player
        this.player.update(deltaTime, this.currentLevel);
        this.player.render(this.ctx);
        
        // Check for collisions
        this.checkCollisions();
        
        // Request next frame
        requestAnimationFrame(this.gameLoop);
    }
    
    checkCollisions() {
        if (!this.currentLevel || !this.player) return;
        
        // Check for coin collisions
        for (let i = this.currentLevel.coins.length - 1; i >= 0; i--) {
            const coin = this.currentLevel.coins[i];
            if (this.player.collidesWith(coin)) {
                // Collect coin
                this.currentLevel.coins.splice(i, 1);
                this.coins++;
                this.score += 100;
                this.specialMeter = Math.min(this.specialMeter + 5, 100);
                
                // Update UI
                this.ui.updateScore(this.score);
                this.ui.updateSpecialMeter(this.specialMeter);
                
                // Play sound
                // this.assets.playSound('coin');
            }
        }
        
        // Check for obstacle collisions
        for (const obstacle of this.currentLevel.obstacles) {
            if (this.player.collidesWith(obstacle)) {
                if (!this.player.isInvulnerable) {
                    this.playerHit();
                }
            }
        }
        
        // Check for platform collisions (for jumping)
        let onGround = false;
        for (const platform of this.currentLevel.platforms) {
            if (this.player.isOnPlatform(platform)) {
                onGround = true;
                break;
            }
        }
        this.player.onGround = onGround;
        
        // Check if player fell off the level
        if (this.player.y > this.canvas.height) {
            this.playerHit();
        }
        
        // Check if level is complete (all coins collected or reached end)
        if (this.currentLevel.isComplete(this.player)) {
            this.levelComplete();
        }
    }
    
    playerHit() {
        if (this.player.isInvulnerable) return;
        
        this.lives--;
        this.ui.updateLives(this.lives);
        
        if (this.lives <= 0) {
            this.gameOver();
        } else {
            this.player.makeInvulnerable();
            // this.assets.playSound('hit');
        }
    }
    
    levelComplete() {
        const stats = {
            score: this.score,
            coins: this.coins,
            time: this.gameTime,
            unlocked: null
        };
        
        // Check for unlocks
        if (this.currentLevel.id === 'downtown' && this.coins >= 10) {
            this.map.unlockLocation('park');
            stats.unlocked = 'Park Area';
        } else if (this.currentLevel.id === 'park' && this.coins >= 15) {
            this.map.unlockLocation('beach');
            stats.unlocked = 'Beach';
        }
        
        // Show level complete screen
        this.ui.showLevelComplete(stats);
        this.isRunning = false;
    }
    
    gameOver() {
        const stats = {
            score: this.score,
            coins: this.coins
        };
        
        // Show game over screen
        this.ui.showGameOver(stats);
        this.isRunning = false;
    }
    
    togglePause() {
        this.isPaused = !this.isPaused;
        
        if (this.isPaused) {
            document.getElementById('pause-menu').classList.add('active');
        } else {
            document.getElementById('pause-menu').classList.remove('active');
        }
    }
    
    resumeGame() {
        this.isPaused = false;
        document.getElementById('pause-menu').classList.remove('active');
    }
    
    restartLevel() {
        if (this.currentLevel) {
            this.startLevel(this.currentLevel.id);
        }
    }
    
    exitToMap() {
        this.isRunning = false;
        this.showScreen('toronto-map');
    }
    
    nextLevel() {
        if (this.currentLevel.id === 'downtown') {
            this.startLevel('park');
        } else if (this.currentLevel.id === 'park') {
            this.startLevel('beach');
        } else {
            // If there are no more levels, go back to the map
            this.exitToMap();
        }
    }
    
    handleResize() {
        // Set canvas size to match container
        const containerWidth = this.gameContainer.clientWidth;
        const containerHeight = this.gameContainer.clientHeight;
        
        // Maintain 16:9 aspect ratio
        const aspectRatio = 16 / 9;
        let width = containerWidth;
        let height = containerWidth / aspectRatio;
        
        if (height > containerHeight) {
            height = containerHeight;
            width = containerHeight * aspectRatio;
        }
        
        this.canvas.width = width;
        this.canvas.height = height;
        
        // Center the canvas
        this.canvas.style.marginLeft = `${(containerWidth - width) / 2}px`;
        this.canvas.style.marginTop = `${(containerHeight - height) / 2}px`;
    }
}

// Level class
window.Level = class Level {
    constructor(game, id) {
        this.game = game;
        this.id = id;
        
        // Level objects
        this.platforms = [];
        this.coins = [];
        this.obstacles = [];
        this.endPoint = null;
        
        // Level properties
        this.width = 3000; // Level width (scrolling)
        this.height = game.canvas.height;
        this.gravity = 0.5;
        
        // Camera
        this.cameraX = 0;
        
        // Initialize level
        this.init();
    }
    
    init() {
        // Create level based on ID
        switch (this.id) {
            case 'downtown':
                this.createDowntownLevel();
                break;
            case 'park':
                this.createParkLevel();
                break;
            case 'beach':
                this.createBeachLevel();
                break;
            default:
                this.createDowntownLevel();
        }
    }
    
    createDowntownLevel() {
        // Ground platform
        this.platforms.push({
            x: 0,
            y: this.height - 50,
            width: this.width,
            height: 50,
            color: '#8B4513'
        });
        
        // Add some platforms
        for (let i = 0; i < 10; i++) {
            const x = 300 + i * 250;
            const y = this.height - 150 - Math.random() * 100;
            const width = 100 + Math.random() * 100;
            
            this.platforms.push({
                x,
                y,
                width,
                height: 20,
                color: '#8B4513'
            });
            
            // Add coins on platforms
            for (let j = 0; j < 3; j++) {
                this.coins.push({
                    x: x + j * 30 + 20,
                    y: y - 30,
                    width: 20,
                    height: 20,
                    color: '#FFD700'
                });
            }
        }
        
        // Add some obstacles
        for (let i = 0; i < 5; i++) {
            this.obstacles.push({
                x: 500 + i * 500,
                y: this.height - 80,
                width: 30,
                height: 30,
                color: '#FF0000'
            });
        }
        
        // End point
        this.endPoint = {
            x: this.width - 100,
            y: this.height - 100,
            width: 50,
            height: 50,
            color: '#00FF00'
        };
    }
    
    createParkLevel() {
        // Ground platform with gaps
        for (let i = 0; i < 5; i++) {
            this.platforms.push({
                x: i * 700,
                y: this.height - 50,
                width: 500,
                height: 50,
                color: '#228B22'
            });
        }
        
        // Add more challenging platforms
        for (let i = 0; i < 15; i++) {
            const x = 200 + i * 200;
            const y = this.height - 150 - Math.random() * 150;
            const width = 80 + Math.random() * 60;
            
            this.platforms.push({
                x,
                y,
                width,
                height: 20,
                color: '#228B22'
            });
            
            // Add coins on platforms
            for (let j = 0; j < 2; j++) {
                this.coins.push({
                    x: x + j * 30 + 20,
                    y: y - 30,
                    width: 20,
                    height: 20,
                    color: '#FFD700'
                });
            }
        }
        
        // Add some special coins in harder to reach places
        for (let i = 0; i < 5; i++) {
            this.coins.push({
                x: 400 + i * 500,
                y: this.height - 250,
                width: 30,
                height: 30,
                color: '#FFA500'
            });
        }
        
        // Add more obstacles
        for (let i = 0; i < 8; i++) {
            this.obstacles.push({
                x: 400 + i * 350,
                y: this.height - 80,
                width: 40,
                height: 30,
                color: '#FF0000'
            });
        }
        
        // End point
        this.endPoint = {
            x: this.width - 100,
            y: this.height - 100,
            width: 50,
            height: 50,
            color: '#00FF00'
        };
    }
    
    createBeachLevel() {
        // Ground platform with water gaps
        for (let i = 0; i < 8; i++) {
            this.platforms.push({
                x: i * 400,
                y: this.height - 50,
                width: 300,
                height: 50,
                color: '#F5DEB3'
            });
        }
        
        // Add floating platforms
        for (let i = 0; i < 20; i++) {
            const x = 150 + i * 150;
            const y = this.height - 150 - Math.random() * 200;
            const width = 60 + Math.random() * 40;
            
            this.platforms.push({
                x,
                y,
                width,
                height: 20,
                color: '#8B4513'
            });
            
            // Add coins on platforms
            for (let j = 0; j < 2; j++) {
                this.coins.push({
                    x: x + j * 25 + 10,
                    y: y - 30,
                    width: 20,
                    height: 20,
                    color: '#FFD700'
                });
            }
        }
        
        // Add hidden coins underwater
        for (let i = 0; i < 5; i++) {
            this.coins.push({
                x: 300 + i * 600,
                y: this.height - 30,
                width: 25,
                height: 25,
                color: '#FFA500'
            });
        }
        
        // Add more challenging obstacles
        for (let i = 0; i < 10; i++) {
            this.obstacles.push({
                x: 350 + i * 300,
                y: this.height - 80,
                width: 50,
                height: 30,
                color: '#FF0000'
            });
        }
        
        // End point
        this.endPoint = {
            x: this.width - 100,
            y: this.height - 100,
            width: 50,
            height: 50,
            color: '#00FF00'
        };
    }
    
    update(deltaTime) {
        // Update camera position based on player position
        if (this.game.player) {
            // Center camera on player
            const targetX = this.game.player.x - this.game.canvas.width / 2;
            
            // Clamp camera to level bounds
            this.cameraX = Math.max(0, Math.min(targetX, this.width - this.game.canvas.width));
        }
    }
    
    render(ctx) {
        // Draw background
        ctx.fillStyle = '#87CEEB'; // Sky blue
        ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
        
        // Apply camera transform
        ctx.save();
        ctx.translate(-this.cameraX, 0);
        
        // Draw platforms
        for (const platform of this.platforms) {
            ctx.fillStyle = platform.color;
            ctx.fillRect(platform.x, platform.y, platform.width, platform.height);
        }
        
        // Draw coins
        for (const coin of this.coins) {
            ctx.fillStyle = coin.color;
            ctx.beginPath();
            ctx.arc(coin.x + coin.width / 2, coin.y + coin.height / 2, coin.width / 2, 0, Math.PI * 2);
            ctx.fill();
        }
        
        // Draw obstacles
        for (const obstacle of this.obstacles) {
            ctx.fillStyle = obstacle.color;
            ctx.fillRect(obstacle.x, obstacle.y, obstacle.width, obstacle.height);
        }
        
        // Draw end point
        if (this.endPoint) {
            ctx.fillStyle = this.endPoint.color;
            ctx.fillRect(this.endPoint.x, this.endPoint.y, this.endPoint.width, this.endPoint.height);
        }
        
        // Restore context
        ctx.restore();
    }
    
    isComplete(player) {
        // Check if player reached the end point
        if (this.endPoint && player.collidesWith(this.endPoint)) {
            return true;
        }
        
        // Check if all coins are collected
        if (this.coins.length === 0) {
            return true;
        }
        
        return false;
    }
}
