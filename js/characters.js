/**
 * Toronto Adventure - Character System
 * Defines character classes and their behaviors
 */

/**
 * Base Character class
 * Provides common functionality for all characters
 */
class Character {
    /**
     * Create a new character
     * @param {string} id - Character identifier
     * @param {Object} stats - Character stats
     * @param {number} x - Initial X position
     * @param {number} y - Initial Y position
     */
    constructor(id, stats, x = 0, y = 0) {
        // Character properties
        this.id = id;
        this.x = x;
        this.y = y;
        this.width = 64;
        this.height = 64;
        this.velocityX = 0;
        this.velocityY = 0;
        this.direction = 1; // 1 = right, -1 = left
        this.isJumping = false;
        this.isGrounded = false;
        this.isDucking = false;
        this.isHurt = false;
        this.isUsingSpecial = false;
        
        // Character stats
        this.stats = stats || {
            speed: 0.5,
            jump: 0.5,
            special: 0.5
        };
        
        // Derived stats
        this.maxSpeed = 5 + (this.stats.speed * 3);
        this.jumpForce = 12 + (this.stats.jump * 4);
        this.specialMeter = 0;
        this.specialMaxMeter = 100;
        this.specialCost = 30;
        this.specialCooldown = 0;
        
        // Animation properties
        this.currentState = 'idle';
        this.frameIndex = 0;
        this.frameCount = 0;
        this.frameTick = 0;
        this.frameDelay = 5; // Frames to wait before next animation frame
        
        // Game state
        this.score = 0;
        this.coins = 0;
        this.lives = 3;
        this.invulnerable = false;
        this.invulnerableTime = 0;
    }
    
    /**
     * Update character state
     * @param {Object} input - Input state
     * @param {Object} level - Current level
     * @param {number} deltaTime - Time since last update
     */
    update(input, level, deltaTime) {
        // Handle input
        this.handleInput(input);
        
        // Apply physics
        this.applyPhysics(level, deltaTime);
        
        // Update animation
        this.updateAnimation();
        
        // Update special meter
        this.updateSpecialMeter(deltaTime);
        
        // Update invulnerability
        this.updateInvulnerability(deltaTime);
    }
    
    /**
     * Handle player input
     * @param {Object} input - Input state
     */
    handleInput(input) {
        // Movement
        if (input.isLeftActive()) {
            this.velocityX = Math.max(this.velocityX - 0.5, -this.maxSpeed);
            this.direction = -1;
        } else if (input.isRightActive()) {
            this.velocityX = Math.min(this.velocityX + 0.5, this.maxSpeed);
            this.direction = 1;
        } else {
            // Apply friction
            if (this.velocityX > 0) {
                this.velocityX = Math.max(0, this.velocityX - 0.3);
            } else if (this.velocityX < 0) {
                this.velocityX = Math.min(0, this.velocityX + 0.3);
            }
        }
        
        // Jumping
        if (input.isJumpActive() && this.isGrounded && !this.isJumping) {
            this.velocityY = -this.jumpForce;
            this.isJumping = true;
            this.isGrounded = false;
            
            // Play jump sound
            Assets.playAudio('jump', 0.5);
        }
        
        // Special ability
        if (input.isSpecialActive() && !this.isUsingSpecial && this.specialMeter >= this.specialCost && this.specialCooldown <= 0) {
            this.activateSpecialAbility();
        }
    }
    
    /**
     * Apply physics to character
     * @param {Object} level - Current level
     * @param {number} deltaTime - Time since last update
     */
    applyPhysics(level, deltaTime) {
        // Apply gravity
        this.velocityY += 0.5;
        
        // Apply velocity
        this.x += this.velocityX;
        this.y += this.velocityY;
        
        // Check for ground collision
        const wasGrounded = this.isGrounded;
        this.isGrounded = false;
        
        // Simple ground collision (to be replaced with platform collision)
        if (this.y > 400) { // Temporary ground level
            this.y = 400;
            this.velocityY = 0;
            this.isGrounded = true;
            
            if (!wasGrounded) {
                this.isJumping = false;
            }
        }
        
        // Check for level boundaries
        if (this.x < 0) {
            this.x = 0;
            this.velocityX = 0;
        } else if (this.x + this.width > level.width) {
            this.x = level.width - this.width;
            this.velocityX = 0;
        }
    }
    
    /**
     * Update character animation
     */
    updateAnimation() {
        // Determine animation state
        let newState = 'idle';
        
        if (this.isHurt) {
            newState = 'hurt';
        } else if (this.isUsingSpecial) {
            newState = 'special';
        } else if (this.isJumping || !this.isGrounded) {
            newState = 'jump';
        } else if (Math.abs(this.velocityX) > 0.5) {
            newState = 'run';
        }
        
        // Reset animation if state changed
        if (newState !== this.currentState) {
            this.currentState = newState;
            this.frameIndex = 0;
            this.frameTick = 0;
        }
        
        // Update animation frame
        this.frameTick++;
        if (this.frameTick >= this.frameDelay) {
            this.frameTick = 0;
            this.frameIndex = (this.frameIndex + 1) % this.getFrameCount(this.currentState);
        }
    }
    
    /**
     * Get frame count for animation state
     * @param {string} state - Animation state
     * @returns {number} Number of frames
     */
    getFrameCount(state) {
        // Default frame counts (can be overridden by specific characters)
        const frameCounts = {
            idle: 4,
            run: 6,
            jump: 2,
            special: 4,
            hurt: 1
        };
        
        return frameCounts[state] || 1;
    }
    
    /**
     * Update special ability meter
     * @param {number} deltaTime - Time since last update
     */
    updateSpecialMeter(deltaTime) {
        // Regenerate special meter over time
        if (this.specialMeter < this.specialMaxMeter && !this.isUsingSpecial) {
            this.specialMeter += 0.1;
        }
        
        // Update cooldown
        if (this.specialCooldown > 0) {
            this.specialCooldown -= deltaTime;
        }
    }
    
    /**
     * Update invulnerability state
     * @param {number} deltaTime - Time since last update
     */
    updateInvulnerability(deltaTime) {
        if (this.invulnerable) {
            this.invulnerableTime -= deltaTime;
            
            if (this.invulnerableTime <= 0) {
                this.invulnerable = false;
            }
        }
    }
    
    /**
     * Activate character's special ability
     * Base implementation (to be overridden)
     */
    activateSpecialAbility() {
        this.isUsingSpecial = true;
        this.specialMeter -= this.specialCost;
        this.specialCooldown = 60; // 1 second at 60 FPS
        
        // Play special ability sound
        Assets.playAudio('special', 0.7);
        
        // Reset special after a delay
        setTimeout(() => {
            this.isUsingSpecial = false;
        }, 500);
    }
    
    /**
     * Handle collision with a coin
     */
    collectCoin() {
        this.coins++;
        this.score += 100;
        
        // Increase special meter
        this.specialMeter = Math.min(this.specialMeter + 5, this.specialMaxMeter);
        
        // Play coin sound
        Assets.playAudio('coin', 0.5);
    }
    
    /**
     * Handle collision with an obstacle
     */
    hitObstacle() {
        if (!this.invulnerable) {
            this.lives--;
            this.isHurt = true;
            this.invulnerable = true;
            this.invulnerableTime = 120; // 2 seconds at 60 FPS
            
            // Apply knockback
            this.velocityY = -5;
            this.velocityX = -this.direction * 3;
            
            // Play hurt sound
            Assets.playAudio('hurt', 0.6);
            
            // Reset hurt state after a delay
            setTimeout(() => {
                this.isHurt = false;
            }, 500);
        }
    }
    
    /**
     * Draw the character
     * @param {CanvasRenderingContext2D} ctx - Canvas context
     * @param {number} offsetX - Camera X offset
     * @param {number} offsetY - Camera Y offset
     */
    draw(ctx, offsetX = 0, offsetY = 0) {
        // Skip drawing if character is hurt and flashing
        if (this.invulnerable && Math.floor(Date.now() / 100) % 2 === 0) {
            return;
        }
        
        // Get the appropriate sprite based on state
        const sprite = Assets.getImage(`${this.id}_${this.currentState}`);
        
        if (sprite) {
            const drawX = this.x - offsetX;
            const drawY = this.y - offsetY;
            
            ctx.save();
            
            // Flip horizontally if facing left
            if (this.direction === -1) {
                ctx.translate(drawX + this.width, drawY);
                ctx.scale(-1, 1);
                ctx.drawImage(sprite, 0, 0, this.width, this.height);
            } else {
                ctx.drawImage(sprite, drawX, drawY, this.width, this.height);
            }
            
            ctx.restore();
        } else {
            // Fallback if sprite not loaded
            ctx.fillStyle = 'red';
            ctx.fillRect(this.x - offsetX, this.y - offsetY, this.width, this.height);
        }
    }
}

/**
 * Maple Leaf Mascot character
 * Fast runner with speed boost ability
 */
class MapleLeafMascot extends Character {
    constructor(x = 0, y = 0) {
        super('maple', {
            speed: 0.8,
            jump: 0.6,
            special: 0.7
        }, x, y);
        
        this.specialDuration = 180; // 3 seconds at 60 FPS
        this.specialTimer = 0;
        this.normalMaxSpeed = this.maxSpeed;
    }
    
    /**
     * Activate speed boost special ability
     */
    activateSpecialAbility() {
        super.activateSpecialAbility();
        
        // Speed boost effect
        this.maxSpeed = this.normalMaxSpeed * 1.8;
        this.specialTimer = this.specialDuration;
        
        // Create particle effect
        if (Game.ctx) {
            Utils.createParticles(
                Game.ctx,
                this.x + this.width / 2,
                this.y + this.height / 2,
                20,
                '#e94560',
                5,
                3
            );
        }
    }
    
    /**
     * Update character state
     * @param {Object} input - Input state
     * @param {Object} level - Current level
     * @param {number} deltaTime - Time since last update
     */
    update(input, level, deltaTime) {
        super.update(input, level, deltaTime);
        
        // Update special ability timer
        if (this.specialTimer > 0) {
            this.specialTimer -= deltaTime;
            
            if (this.specialTimer <= 0) {
                // Reset speed when special ends
                this.maxSpeed = this.normalMaxSpeed;
            }
        }
    }
}

/**
 * CN Tower Explorer character
 * High jumper with extended air time
 */
class CNTowerExplorer extends Character {
    constructor(x = 0, y = 0) {
        super('cn_tower', {
            speed: 0.6,
            jump: 0.9,
            special: 0.7
        }, x, y);
        
        this.doubleJumpAvailable = false;
        this.normalGravity = 0.5;
    }
    
    /**
     * Handle player input
     * @param {Object} input - Input state
     */
    handleInput(input) {
        super.handleInput(input);
        
        // Double jump ability
        if (input.isJumpActive() && !this.isGrounded && !this.doubleJumpAvailable && !this.isJumping && this.velocityY > 0) {
            this.velocityY = -this.jumpForce * 0.8;
            this.doubleJumpAvailable = true;
            this.isJumping = true;
            
            // Play jump sound
            Assets.playAudio('jump', 0.4);
        }
    }
    
    /**
     * Apply physics to character
     * @param {Object} level - Current level
     * @param {number} deltaTime - Time since last update
     */
    applyPhysics(level, deltaTime) {
        super.applyPhysics(level, deltaTime);
        
        // Reset double jump when grounded
        if (this.isGrounded) {
            this.doubleJumpAvailable = false;
        }
    }
    
    /**
     * Activate high jump special ability
     */
    activateSpecialAbility() {
        super.activateSpecialAbility();
        
        // Super high jump
        this.velocityY = -this.jumpForce * 1.5;
        this.isJumping = true;
        this.isGrounded = false;
        
        // Create particle effect
        if (Game.ctx) {
            Utils.createParticles(
                Game.ctx,
                this.x + this.width / 2,
                this.y + this.height,
                15,
                '#4287f5',
                5,
                4
            );
        }
    }
}

/**
 * Casa Loma Knight character
 * Durable character with shield ability
 */
class CasaLomaKnight extends Character {
    constructor(x = 0, y = 0) {
        super('casa_loma', {
            speed: 0.5,
            jump: 0.6,
            special: 0.9
        }, x, y);
        
        this.shieldActive = false;
        this.shieldDuration = 300; // 5 seconds at 60 FPS
        this.shieldTimer = 0;
    }
    
    /**
     * Activate shield special ability
     */
    activateSpecialAbility() {
        super.activateSpecialAbility();
        
        // Shield effect
        this.shieldActive = true;
        this.shieldTimer = this.shieldDuration;
        this.invulnerable = true;
        
        // Create particle effect
        if (Game.ctx) {
            Utils.createParticles(
                Game.ctx,
                this.x + this.width / 2,
                this.y + this.height / 2,
                30,
                '#ffd700',
                6,
                2
            );
        }
    }
    
    /**
     * Update character state
     * @param {Object} input - Input state
     * @param {Object} level - Current level
     * @param {number} deltaTime - Time since last update
     */
    update(input, level, deltaTime) {
        super.update(input, level, deltaTime);
        
        // Update shield timer
        if (this.shieldActive) {
            this.shieldTimer -= deltaTime;
            
            if (this.shieldTimer <= 0) {
                this.shieldActive = false;
                this.invulnerable = false;
            }
        }
    }
    
    /**
     * Draw the character
     * @param {CanvasRenderingContext2D} ctx - Canvas context
     * @param {number} offsetX - Camera X offset
     * @param {number} offsetY - Camera Y offset
     */
    draw(ctx, offsetX = 0, offsetY = 0) {
        super.draw(ctx, offsetX, offsetY);
        
        // Draw shield effect if active
        if (this.shieldActive) {
            const drawX = this.x - offsetX;
            const drawY = this.y - offsetY;
            
            ctx.save();
            ctx.beginPath();
            ctx.arc(
                drawX + this.width / 2,
                drawY + this.height / 2,
                this.width * 0.7,
                0,
                Math.PI * 2
            );
            ctx.strokeStyle = '#ffd700';
            ctx.lineWidth = 3;
            ctx.globalAlpha = 0.5 + Math.sin(Date.now() / 100) * 0.2;
            ctx.stroke();
            ctx.restore();
        }
    }
}

/**
 * Raccoon Rascal character
 * Can collect items from a distance
 */
class RaccoonRascal extends Character {
    constructor(x = 0, y = 0) {
        super('raccoon', {
            speed: 0.7,
            jump: 0.7,
            special: 0.8
        }, x, y);
        
        this.itemMagnetActive = false;
        this.itemMagnetDuration = 240; // 4 seconds at 60 FPS
        this.itemMagnetTimer = 0;
        this.itemMagnetRange = 150; // Normal range is 50
    }
    
    /**
     * Activate item magnet special ability
     */
    activateSpecialAbility() {
        super.activateSpecialAbility();
        
        // Item magnet effect
        this.itemMagnetActive = true;
        this.itemMagnetTimer = this.itemMagnetDuration;
        
        // Create particle effect
        if (Game.ctx) {
            Utils.createParticles(
                Game.ctx,
                this.x + this.width / 2,
                this.y + this.height / 2,
                25,
                '#32CD32',
                4,
                3
            );
        }
    }
    
    /**
     * Update character state
     * @param {Object} input - Input state
     * @param {Object} level - Current level
     * @param {number} deltaTime - Time since last update
     */
    update(input, level, deltaTime) {
        super.update(input, level, deltaTime);
        
        // Update item magnet timer
        if (this.itemMagnetActive) {
            this.itemMagnetTimer -= deltaTime;
            
            if (this.itemMagnetTimer <= 0) {
                this.itemMagnetActive = false;
            }
        }
    }
    
    /**
     * Get the current item collection range
     * @returns {number} Collection range
     */
    getItemCollectionRange() {
        return this.itemMagnetActive ? this.itemMagnetRange : 50;
    }
    
    /**
     * Draw the character
     * @param {CanvasRenderingContext2D} ctx - Canvas context
     * @param {number} offsetX - Camera X offset
     * @param {number} offsetY - Camera Y offset
     */
    draw(ctx, offsetX = 0, offsetY = 0) {
        super.draw(ctx, offsetX, offsetY);
        
        // Draw item magnet effect if active
        if (this.itemMagnetActive) {
            const drawX = this.x - offsetX;
            const drawY = this.y - offsetY;
            
            ctx.save();
            ctx.beginPath();
            ctx.arc(
                drawX + this.width / 2,
                drawY + this.height / 2,
                this.itemMagnetRange,
                0,
                Math.PI * 2
            );
            ctx.strokeStyle = '#32CD32';
            ctx.lineWidth = 2;
            ctx.globalAlpha = 0.3;
            ctx.stroke();
            ctx.restore();
        }
    }
}

/**
 * Character Factory
 * Creates character instances based on ID
 */
const CharacterFactory = {
    /**
     * Create a character instance
     * @param {string} id - Character ID
     * @param {number} x - Initial X position
     * @param {number} y - Initial Y position
     * @returns {Character} Character instance
     */
    createCharacter: function(id, x = 0, y = 0) {
        switch (id) {
            case 'maple':
                return new MapleLeafMascot(x, y);
            case 'cn_tower':
                return new CNTowerExplorer(x, y);
            case 'casa_loma':
                return new CasaLomaKnight(x, y);
            case 'raccoon':
                return new RaccoonRascal(x, y);
            default:
                return new MapleLeafMascot(x, y);
        }
    },
    
    /**
     * Get character data
     * @returns {Object} Character data
     */
    getCharacterData: function() {
        return Assets.getData('characters') || {
            maple: {
                name: "Maple Leaf Mascot",
                description: "Fast runner with speed boost ability",
                stats: {
                    speed: 0.8,
                    jump: 0.6,
                    special: 0.7
                },
                specialAbility: "Speed Boost"
            },
            cn_tower: {
                name: "CN Tower Explorer",
                description: "High jumper with extended air time",
                stats: {
                    speed: 0.6,
                    jump: 0.9,
                    special: 0.7
                },
                specialAbility: "High Jump",
                unlockRequirement: "Complete Downtown level"
            },
            casa_loma: {
                name: "Casa Loma Knight",
                description: "Durable character with shield ability",
                stats: {
                    speed: 0.5,
                    jump: 0.6,
                    special: 0.9
                },
                specialAbility: "Shield",
                unlockRequirement: "Complete Casa Loma level"
            },
            raccoon: {
                name: "Raccoon Rascal",
                description: "Can collect items from a distance",
                stats: {
                    speed: 0.7,
                    jump: 0.7,
                    special: 0.8
                },
                specialAbility: "Item Magnet",
                unlockRequirement: "Collect 100 coins"
            }
        };
    },
    
    /**
     * Check if a character is unlocked
     * @param {string} id - Character ID
     * @returns {boolean} True if character is unlocked
     */
    isCharacterUnlocked: function(id) {
        // Maple Leaf Mascot is always unlocked
        if (id === 'maple') {
            return true;
        }
        
        // Check unlocked characters in local storage
        const unlockedCharacters = Utils.loadFromStorage('unlockedCharacters', ['maple']);
        return unlockedCharacters.includes(id);
    },
    
    /**
     * Unlock a character
     * @param {string} id - Character ID
     */
    unlockCharacter: function(id) {
        if (id === 'maple' || this.isCharacterUnlocked(id)) {
            return; // Already unlocked
        }
        
        const unlockedCharacters = Utils.loadFromStorage('unlockedCharacters', ['maple']);
        unlockedCharacters.push(id);
        Utils.saveToStorage('unlockedCharacters', unlockedCharacters);
        
        // Play unlock sound
        Assets.playAudio('unlock', 0.7);
    }
};
