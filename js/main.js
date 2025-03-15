// main.js - Entry point for the game

// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', () => {
    // Update game title
    document.title = 'Mario Bros Style Game';
    document.querySelector('.game-title').textContent = 'Mario Bros Style Game';
    document.querySelector('#loading-screen h1').textContent = 'Mario Bros Style Game';
    
    // Create and initialize the game
    const game = new Game();
    game.init().catch(error => {
        console.error('Error initializing game:', error);
    });
});

// Character class
class Character {
    constructor(game, type) {
        this.game = game;
        this.type = type;
        
        // Position and size
        this.x = 100;
        this.y = 100;
        this.width = 40;
        this.height = 60;
        
        // Movement
        this.velocityX = 0;
        this.velocityY = 0;
        this.speed = 5;
        this.jumpForce = 15;
        this.onGround = false;
        
        // Character state
        this.direction = 'right';
        this.isJumping = false;
        this.isInvulnerable = false;
        this.invulnerabilityTime = 0;
        
        // Character abilities (based on type)
        switch (type) {
            case 'maple':
                this.color = '#FF0000'; // Red
                this.speed = 6;
                this.jumpForce = 15;
                this.specialAbility = 'speed_boost';
                break;
            case 'cn-tower':
                this.color = '#4169E1'; // Royal Blue
                this.speed = 4;
                this.jumpForce = 18;
                this.specialAbility = 'high_jump';
                break;
            case 'casa-loma':
                this.color = '#808080'; // Gray
                this.speed = 4;
                this.jumpForce = 14;
                this.specialAbility = 'shield';
                break;
            case 'raccoon':
                this.color = '#696969'; // Dark Gray
                this.speed = 5;
                this.jumpForce = 15;
                this.specialAbility = 'coin_magnet';
                break;
            default:
                this.color = '#FF0000'; // Red
                this.speed = 5;
                this.jumpForce = 15;
                this.specialAbility = 'none';
        }
    }
    
    update(deltaTime, level) {
        // Handle input
        this.handleInput();
        
        // Apply gravity
        this.velocityY += level.gravity;
        
        // Update position
        this.x += this.velocityX;
        this.y += this.velocityY;
        
        // Constrain to level bounds
        this.x = Math.max(0, Math.min(this.x, level.width - this.width));
        
        // Update invulnerability
        if (this.isInvulnerable) {
            this.invulnerabilityTime -= deltaTime;
            if (this.invulnerabilityTime <= 0) {
                this.isInvulnerable = false;
            }
        }
    }
    
    handleInput() {
        // Reset horizontal velocity
        this.velocityX = 0;
        
        // Move left
        if (this.game.input.keys.left) {
            this.velocityX = -this.speed;
            this.direction = 'left';
        }
        
        // Move right
        if (this.game.input.keys.right) {
            this.velocityX = this.speed;
            this.direction = 'right';
        }
        
        // Jump
        if (this.game.input.keys.up && this.onGround) {
            this.velocityY = -this.jumpForce;
            this.onGround = false;
            this.isJumping = true;
        }
        
        // Special ability
        if (this.game.input.keys.space && this.game.specialMeter >= 20) {
            this.useSpecialAbility();
        }
    }
    
    useSpecialAbility() {
        switch (this.specialAbility) {
            case 'speed_boost':
                // Temporary speed boost
                const originalSpeed = this.speed;
                this.speed *= 2;
                setTimeout(() => {
                    this.speed = originalSpeed;
                }, 3000);
                break;
            case 'high_jump':
                // Extra high jump
                if (this.onGround) {
                    this.velocityY = -this.jumpForce * 1.5;
                    this.onGround = false;
                }
                break;
            case 'shield':
                // Temporary invulnerability
                this.makeInvulnerable(5000);
                break;
            case 'coin_magnet':
                // Attract nearby coins
                this.attractCoins();
                break;
        }
        
        // Consume special meter
        this.game.specialMeter -= 20;
        this.game.ui.updateSpecialMeter(this.game.specialMeter);
    }
    
    attractCoins() {
        // Find coins within range
        const range = 150;
        const coins = this.game.currentLevel.coins.filter(coin => {
            const dx = coin.x - this.x;
            const dy = coin.y - this.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            return distance < range;
        });
        
        // Move coins toward player
        coins.forEach(coin => {
            const dx = this.x - coin.x;
            const dy = this.y - coin.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            coin.x += dx / distance * 5;
            coin.y += dy / distance * 5;
        });
    }
    
    render(ctx) {
        // Apply camera transform
        ctx.save();
        ctx.translate(-this.game.currentLevel.cameraX, 0);
        
        // Draw character
        if (!this.isInvulnerable || Math.floor(this.invulnerabilityTime / 100) % 2 === 0) {
            ctx.fillStyle = this.color;
            ctx.fillRect(this.x, this.y, this.width, this.height);
            
            // Draw face (simple representation)
            ctx.fillStyle = '#FFFFFF';
            
            // Eyes
            const eyeSize = 5;
            const eyeY = this.y + 15;
            
            if (this.direction === 'right') {
                ctx.fillRect(this.x + 25, eyeY, eyeSize, eyeSize);
                ctx.fillRect(this.x + 10, eyeY, eyeSize, eyeSize);
            } else {
                ctx.fillRect(this.x + 10, eyeY, eyeSize, eyeSize);
                ctx.fillRect(this.x + 25, eyeY, eyeSize, eyeSize);
            }
            
            // Mouth
            ctx.fillRect(this.x + 15, this.y + 30, 10, 3);
        }
        
        // Restore context
        ctx.restore();
    }
    
    makeInvulnerable(time = 2000) {
        this.isInvulnerable = true;
        this.invulnerabilityTime = time;
    }
    
    collidesWith(object) {
        return (
            this.x < object.x + object.width &&
            this.x + this.width > object.x &&
            this.y < object.y + object.height &&
            this.y + this.height > object.y
        );
    }
    
    isOnPlatform(platform) {
        // Check if character is standing on a platform
        const wasAbove = this.y + this.height - this.velocityY <= platform.y;
        const isAbovePlatformNow = 
            this.x + this.width > platform.x &&
            this.x < platform.x + platform.width &&
            this.y + this.height >= platform.y &&
            this.y + this.height <= platform.y + 10;
        
        if (wasAbove && isAbovePlatformNow) {
            this.y = platform.y - this.height;
            this.velocityY = 0;
            this.isJumping = false;
            return true;
        }
        
        return false;
    }
}
