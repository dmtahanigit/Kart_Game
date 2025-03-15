/**
 * Toronto Adventure - Level System
 * Defines level data, backgrounds, and game objects
 */

/**
 * Level class
 * Represents a playable level in the game
 */
class Level {
    /**
     * Create a new level
     * @param {string} id - Level identifier
     * @param {Object} data - Level data
     */
    constructor(id, data) {
        this.id = id;
        this.name = data.name || "Unnamed Level";
        this.description = data.description || "";
        this.difficulty = data.difficulty || 1;
        this.unlocks = data.unlocks || null;
        
        // Level dimensions
        this.width = data.width || 3000;
        this.height = data.height || 600;
        
        // Level objects
        this.platforms = [];
        this.coins = [];
        this.obstacles = [];
        this.decorations = [];
        this.checkpoints = [];
        
        // Player spawn point
        this.spawnX = data.spawnX || 100;
        this.spawnY = data.spawnY || 300;
        
        // Level end point
        this.endX = data.endX || this.width - 100;
        this.endY = data.endY || 300;
        
        // Background layers for parallax effect
        this.backgrounds = [];
        
        // Level state
        this.completed = false;
        this.stars = 0; // 0-3 stars based on performance
        this.bestTime = null;
        this.bestCoins = 0;
        
        // Initialize level
        this.init(data);
    }
    
    /**
     * Initialize level with data
     * @param {Object} data - Level data
     */
    init(data) {
        // Load background layers
        if (data.backgrounds) {
            for (let i = 0; i < data.backgrounds.length; i++) {
                const bg = data.backgrounds[i];
                this.addBackground(bg.image, bg.speedFactor || (1 - i * 0.2));
            }
        } else {
            // Default backgrounds based on level ID
            this.loadDefaultBackgrounds();
        }
        
        // Load platforms
        if (data.platforms) {
            for (const platform of data.platforms) {
                this.addPlatform(platform);
            }
        } else {
            // Generate default platforms
            this.generateDefaultPlatforms();
        }
        
        // Load coins
        if (data.coins) {
            for (const coin of data.coins) {
                this.addCoin(coin.x, coin.y);
            }
        } else {
            // Generate random coins
            this.generateRandomCoins(50);
        }
        
        // Load obstacles
        if (data.obstacles) {
            for (const obstacle of data.obstacles) {
                this.addObstacle(obstacle.x, obstacle.y, obstacle.width, obstacle.height, obstacle.type);
            }
        } else {
            // Generate random obstacles
            this.generateRandomObstacles(20);
        }
        
        // Load decorations
        if (data.decorations) {
            for (const decoration of data.decorations) {
                this.addDecoration(decoration.x, decoration.y, decoration.image, decoration.width, decoration.height);
            }
        }
        
        // Load checkpoints
        if (data.checkpoints) {
            for (const checkpoint of data.checkpoints) {
                this.addCheckpoint(checkpoint.x, checkpoint.y);
            }
        }
        
        // Load level completion data from storage
        this.loadProgress();
    }
    
    /**
     * Load default backgrounds based on level ID
     */
    loadDefaultBackgrounds() {
        // Each level has 3 parallax layers
        for (let i = 1; i <= 3; i++) {
            const imageKey = `${this.id}_bg_${i}`;
            const speedFactor = 1 - (i - 1) * 0.3; // Layer 1: 1.0, Layer 2: 0.7, Layer 3: 0.4
            this.addBackground(imageKey, speedFactor);
        }
    }
    
    /**
     * Generate default platforms for the level
     */
    generateDefaultPlatforms() {
        // Ground platform
        this.addPlatform({
            x: 0,
            y: 500,
            width: this.width,
            height: 100,
            type: 'ground'
        });
        
        // Add some random platforms
        const platformCount = 20 + Math.floor(this.difficulty * 5);
        
        for (let i = 0; i < platformCount; i++) {
            const x = Math.random() * (this.width - 200) + 100;
            const y = Math.random() * 300 + 150;
            const width = Math.random() * 150 + 50;
            
            this.addPlatform({
                x: x,
                y: y,
                width: width,
                height: 20,
                type: 'normal'
            });
        }
        
        // Add some moving platforms
        const movingPlatformCount = Math.floor(this.difficulty * 2);
        
        for (let i = 0; i < movingPlatformCount; i++) {
            const x = Math.random() * (this.width - 400) + 200;
            const y = Math.random() * 250 + 150;
            const width = 80;
            const moveX = Math.random() > 0.5 ? 150 : 0;
            const moveY = moveX === 0 ? 100 : 0;
            
            this.addMovingPlatform(x, y, width, 20, moveX, moveY, 0.01);
        }
    }
    
    /**
     * Generate random coins throughout the level
     * @param {number} count - Number of coins to generate
     */
    generateRandomCoins(count) {
        for (let i = 0; i < count; i++) {
            const x = Math.random() * (this.width - 200) + 100;
            const y = Math.random() * 400 + 50;
            
            this.addCoin(x, y);
        }
    }
    
    /**
     * Generate random obstacles throughout the level
     * @param {number} count - Number of obstacles to generate
     */
    generateRandomObstacles(count) {
        for (let i = 0; i < count; i++) {
            const x = Math.random() * (this.width - 300) + 150;
            const y = Math.random() * 400 + 50;
            const width = Math.random() * 30 + 20;
            const height = Math.random() * 30 + 20;
            
            this.addObstacle(x, y, width, height);
        }
    }
    
    /**
     * Add a background layer
     * @param {string} imageKey - Image key in Assets
     * @param {number} speedFactor - Parallax speed factor (0-1)
     */
    addBackground(imageKey, speedFactor) {
        this.backgrounds.push({
            imageKey: imageKey,
            speedFactor: speedFactor,
            x: 0,
            y: 0,
            width: this.width,
            height: this.height
        });
    }
    
    /**
     * Add a platform to the level
     * @param {Object} platform - Platform data
     */
    addPlatform(platform) {
        this.platforms.push({
            x: platform.x,
            y: platform.y,
            width: platform.width,
            height: platform.height || 20,
            type: platform.type || 'normal',
            solid: true,
            
            draw: function(ctx, offsetX, offsetY) {
                ctx.fillStyle = this.type === 'ground' ? '#3a7d44' : '#555555';
                ctx.fillRect(
                    this.x - offsetX,
                    this.y - offsetY,
                    this.width,
                    this.height
                );
                
                // Draw platform top
                ctx.fillStyle = this.type === 'ground' ? '#4caf50' : '#777777';
                ctx.fillRect(
                    this.x - offsetX,
                    this.y - offsetY,
                    this.width,
                    5
                );
            }
        });
    }
    
    /**
     * Add a moving platform to the level
     * @param {number} x - Initial X position
     * @param {number} y - Initial Y position
     * @param {number} width - Platform width
     * @param {number} height - Platform height
     * @param {number} moveX - X movement distance
     * @param {number} moveY - Y movement distance
     * @param {number} speed - Movement speed
     */
    addMovingPlatform(x, y, width, height, moveX, moveY, speed) {
        this.platforms.push(
            Physics.createMovingPlatform(x, y, width, height, moveX, moveY, speed)
        );
    }
    
    /**
     * Add a coin to the level
     * @param {number} x - X position
     * @param {number} y - Y position
     */
    addCoin(x, y) {
        this.coins.push({
            x: x,
            y: y,
            width: 20,
            height: 20,
            collected: false,
            value: 1,
            rotation: 0,
            
            update: function(deltaTime) {
                // Coin animation
                this.rotation += 0.05;
                
                // Floating animation
                this.y += Math.sin(Date.now() / 200) * 0.2;
            },
            
            draw: function(ctx, offsetX, offsetY) {
                if (this.collected) return;
                
                const coinImage = Assets.getImage('coin');
                
                if (coinImage) {
                    ctx.save();
                    ctx.translate(
                        this.x - offsetX + this.width / 2,
                        this.y - offsetY + this.height / 2
                    );
                    ctx.rotate(this.rotation);
                    ctx.drawImage(
                        coinImage,
                        -this.width / 2,
                        -this.height / 2,
                        this.width,
                        this.height
                    );
                    ctx.restore();
                } else {
                    // Fallback if image not loaded
                    ctx.save();
                    ctx.fillStyle = '#ffd700';
                    ctx.beginPath();
                    ctx.arc(
                        this.x - offsetX + this.width / 2,
                        this.y - offsetY + this.height / 2,
                        this.width / 2,
                        0,
                        Math.PI * 2
                    );
                    ctx.fill();
                    ctx.restore();
                }
            }
        });
    }
    
    /**
     * Add an obstacle to the level
     * @param {number} x - X position
     * @param {number} y - Y position
     * @param {number} width - Obstacle width
     * @param {number} height - Obstacle height
     * @param {string} type - Obstacle type
     */
    addObstacle(x, y, width, height, type = 'spike') {
        this.obstacles.push({
            x: x,
            y: y,
            width: width,
            height: height,
            type: type,
            
            update: function(deltaTime) {
                // Obstacle animation or movement if needed
            },
            
            draw: function(ctx, offsetX, offsetY) {
                const obstacleImage = Assets.getImage('obstacle');
                
                if (obstacleImage) {
                    ctx.drawImage(
                        obstacleImage,
                        this.x - offsetX,
                        this.y - offsetY,
                        this.width,
                        this.height
                    );
                } else {
                    // Fallback if image not loaded
                    ctx.fillStyle = '#ff0000';
                    
                    if (this.type === 'spike') {
                        // Draw spike
                        ctx.beginPath();
                        ctx.moveTo(this.x - offsetX, this.y - offsetY + this.height);
                        ctx.lineTo(this.x - offsetX + this.width / 2, this.y - offsetY);
                        ctx.lineTo(this.x - offsetX + this.width, this.y - offsetY + this.height);
                        ctx.closePath();
                        ctx.fill();
                    } else {
                        // Draw generic obstacle
                        ctx.fillRect(
                            this.x - offsetX,
                            this.y - offsetY,
                            this.width,
                            this.height
                        );
                    }
                }
            }
        });
    }
    
    /**
     * Add a decoration to the level
     * @param {number} x - X position
     * @param {number} y - Y position
     * @param {string} imageKey - Image key in Assets
     * @param {number} width - Decoration width
     * @param {number} height - Decoration height
     */
    addDecoration(x, y, imageKey, width, height) {
        this.decorations.push({
            x: x,
            y: y,
            width: width,
            height: height,
            imageKey: imageKey,
            
            draw: function(ctx, offsetX, offsetY) {
                const image = Assets.getImage(this.imageKey);
                
                if (image) {
                    ctx.drawImage(
                        image,
                        this.x - offsetX,
                        this.y - offsetY,
                        this.width,
                        this.height
                    );
                }
            }
        });
    }
    
    /**
     * Add a checkpoint to the level
     * @param {number} x - X position
     * @param {number} y - Y position
     */
    addCheckpoint(x, y) {
        this.checkpoints.push({
            x: x,
            y: y,
            width: 30,
            height: 50,
            activated: false,
            
            update: function() {
                // Checkpoint animation
            },
            
            draw: function(ctx, offsetX, offsetY) {
                ctx.fillStyle = this.activated ? '#00ff00' : '#aaaaaa';
                ctx.fillRect(
                    this.x - offsetX,
                    this.y - offsetY,
                    this.width,
                    this.height
                );
                
                // Flag
                ctx.fillStyle = this.activated ? '#ffff00' : '#888888';
                ctx.fillRect(
                    this.x - offsetX + this.width,
                    this.y - offsetY,
                    20,
                    15
                );
            },
            
            activate: function() {
                this.activated = true;
            }
        });
    }
    
    /**
     * Update level objects
     * @param {number} deltaTime - Time since last update
     */
    update(deltaTime) {
        // Update moving platforms
        for (const platform of this.platforms) {
            if (platform.update) {
                platform.update(deltaTime);
            }
        }
        
        // Update coins
        for (const coin of this.coins) {
            if (coin.update) {
                coin.update(deltaTime);
            }
        }
        
        // Update obstacles
        for (const obstacle of this.obstacles) {
            if (obstacle.update) {
                obstacle.update(deltaTime);
            }
        }
        
        // Update checkpoints
        for (const checkpoint of this.checkpoints) {
            if (checkpoint.update) {
                checkpoint.update(deltaTime);
            }
        }
    }
}

/**
 * Level Manager
 * Manages level loading, unlocking, and selection
 */
const LevelManager = {
    // Available levels
    levels: {},
    
    // Current level
    currentLevel: null,
    
    /**
     * Initialize level manager
     */
    init: function() {
        // Load level data
        this.loadLevelData();
        
        // Load unlocked levels from storage
        this.loadUnlockedLevels();
    },
    
    /**
     * Load level data from assets or create default levels
     */
    loadLevelData: function() {
        const levelData = Assets.getData('levels');
        
        if (levelData) {
            // Use level data from assets
            for (const id in levelData) {
                this.levels[id] = new Level(id, levelData[id]);
            }
        } else {
            // Create default levels
            this.createDefaultLevels();
        }
    },
    
    /**
     * Create default levels
     */
    createDefaultLevels: function() {
        // Level 1
        this.levels.level1 = new Level('level1', {
            name: "Level 1",
            description: "The first level",
            difficulty: 1,
            width: 3000,
            height: 600
        });
    },
    
    /**
     * Load unlocked levels from storage
     */
    loadUnlockedLevels: function() {
        // Default to level1 being unlocked
        const unlockedLevels = Utils.loadFromStorage('unlockedLevels', ['level1']);
        
        // Ensure level1 is always unlocked
        if (!unlockedLevels.includes('level1')) {
            unlockedLevels.push('level1');
            Utils.saveToStorage('unlockedLevels', unlockedLevels);
        }
    },
    
    /**
     * Get a level by ID
     * @param {string} id - Level ID
     * @returns {Level} Level object
     */
    getLevel: function(id) {
        return this.levels[id];
    },
    
    /**
     * Load a level
     * @param {string} id - Level ID
     * @returns {Level} Loaded level
     */
    loadLevel: function(id) {
        if (this.levels[id]) {
            this.currentLevel = this.levels[id];
            return this.currentLevel;
        }
        
        return null;
    }
};
