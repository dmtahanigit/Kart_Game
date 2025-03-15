/**
 * Toronto Adventure - Physics System
 * Handles collision detection, platform physics, and movement
 */

const Physics = {
    // Physics constants
    gravity: 0.5,
    terminalVelocity: 12,
    friction: 0.8,
    
    /**
     * Apply physics to an entity
     * @param {Object} entity - Entity to update
     * @param {Object} level - Current level
     * @param {number} deltaTime - Time since last update
     */
    updateEntity: function(entity, level, deltaTime) {
        // Apply gravity
        entity.velocityY += this.gravity;
        
        // Limit terminal velocity
        if (entity.velocityY > this.terminalVelocity) {
            entity.velocityY = this.terminalVelocity;
        }
        
        // Apply friction if on ground
        if (entity.isGrounded) {
            entity.velocityX *= this.friction;
        }
        
        // Apply velocity
        const prevX = entity.x;
        const prevY = entity.y;
        
        entity.x += entity.velocityX;
        entity.y += entity.velocityY;
        
        // Check for collisions
        this.handleCollisions(entity, level, prevX, prevY);
    },
    
    /**
     * Handle collisions between entity and level
     * @param {Object} entity - Entity to check
     * @param {Object} level - Current level
     * @param {number} prevX - Previous X position
     * @param {number} prevY - Previous Y position
     */
    handleCollisions: function(entity, level, prevX, prevY) {
        // Reset grounded state
        const wasGrounded = entity.isGrounded;
        entity.isGrounded = false;
        
        // Get entity bounds
        const entityBounds = {
            x: entity.x,
            y: entity.y,
            width: entity.width,
            height: entity.height
        };
        
        // Check platform collisions
        for (const platform of level.platforms) {
            // Skip if platform is not solid
            if (!platform.solid) continue;
            
            // Get platform bounds
            const platformBounds = {
                x: platform.x,
                y: platform.y,
                width: platform.width,
                height: platform.height
            };
            
            // Check if collision occurred
            if (this.checkCollision(entityBounds, platformBounds)) {
                // Determine collision side
                // Vertical collision (landing or hitting head)
                if (prevY + entity.height <= platform.y && entity.velocityY > 0) {
                    // Landing on platform
                    entity.y = platform.y - entity.height;
                    entity.velocityY = 0;
                    entity.isGrounded = true;
                    
                    if (!wasGrounded) {
                        entity.isJumping = false;
                    }
                } else if (prevY >= platform.y + platform.height && entity.velocityY < 0) {
                    // Hitting head on platform
                    entity.y = platform.y + platform.height;
                    entity.velocityY = 0;
                } 
                // Horizontal collision (walls)
                else if (prevX + entity.width <= platform.x) {
                    // Collision from left
                    entity.x = platform.x - entity.width;
                    entity.velocityX = 0;
                } else if (prevX >= platform.x + platform.width) {
                    // Collision from right
                    entity.x = platform.x + platform.width;
                    entity.velocityX = 0;
                }
            }
        }
        
        // Check level boundaries
        if (entity.x < 0) {
            entity.x = 0;
            entity.velocityX = 0;
        } else if (entity.x + entity.width > level.width) {
            entity.x = level.width - entity.width;
            entity.velocityX = 0;
        }
        
        // Check if entity fell out of the level
        if (entity.y > level.height) {
            // Reset to spawn point or handle death
            if (entity.respawn) {
                entity.respawn();
            }
        }
    },
    
    /**
     * Check if two rectangles are colliding
     * @param {Object} rect1 - First rectangle {x, y, width, height}
     * @param {Object} rect2 - Second rectangle {x, y, width, height}
     * @returns {boolean} True if colliding
     */
    checkCollision: function(rect1, rect2) {
        return rect1.x < rect2.x + rect2.width &&
               rect1.x + rect1.width > rect2.x &&
               rect1.y < rect2.y + rect2.height &&
               rect1.y + rect1.height > rect2.y;
    },
    
    /**
     * Check if a point is inside a rectangle
     * @param {number} x - Point X
     * @param {number} y - Point Y
     * @param {Object} rect - Rectangle {x, y, width, height}
     * @returns {boolean} True if point is inside rectangle
     */
    pointInRect: function(x, y, rect) {
        return x >= rect.x && x <= rect.x + rect.width &&
               y >= rect.y && y <= rect.y + rect.height;
    },
    
    /**
     * Calculate distance between two points
     * @param {number} x1 - First point X
     * @param {number} y1 - First point Y
     * @param {number} x2 - Second point X
     * @param {number} y2 - Second point Y
     * @returns {number} Distance between points
     */
    distance: function(x1, y1, x2, y2) {
        const dx = x2 - x1;
        const dy = y2 - y1;
        return Math.sqrt(dx * dx + dy * dy);
    },
    
    /**
     * Check if entity is colliding with any collectible items
     * @param {Object} entity - Entity to check
     * @param {Array} items - Array of collectible items
     * @param {number} range - Collection range (for magnet abilities)
     * @returns {Array} Array of collided items
     */
    checkItemCollisions: function(entity, items, range = 0) {
        const collidedItems = [];
        const entityCenter = {
            x: entity.x + entity.width / 2,
            y: entity.y + entity.height / 2
        };
        
        for (let i = 0; i < items.length; i++) {
            const item = items[i];
            
            // Skip if item is already collected
            if (item.collected) continue;
            
            // Check for direct collision
            if (this.checkCollision(entity, item)) {
                collidedItems.push(item);
                continue;
            }
            
            // Check for range-based collection (magnet ability)
            if (range > 0) {
                const itemCenter = {
                    x: item.x + item.width / 2,
                    y: item.y + item.height / 2
                };
                
                const dist = this.distance(
                    entityCenter.x, entityCenter.y,
                    itemCenter.x, itemCenter.y
                );
                
                if (dist <= range) {
                    // Move item towards player for magnet effect
                    const angle = Math.atan2(
                        entityCenter.y - itemCenter.y,
                        entityCenter.x - itemCenter.x
                    );
                    
                    const speed = Math.min(5, dist / 10);
                    
                    item.x += Math.cos(angle) * speed;
                    item.y += Math.sin(angle) * speed;
                    
                    // Check if item now collides with player after moving
                    if (this.checkCollision(entity, item)) {
                        collidedItems.push(item);
                    }
                }
            }
        }
        
        return collidedItems;
    },
    
    /**
     * Check if entity is colliding with any obstacles
     * @param {Object} entity - Entity to check
     * @param {Array} obstacles - Array of obstacles
     * @returns {boolean} True if colliding with any obstacle
     */
    checkObstacleCollisions: function(entity, obstacles) {
        // Skip if entity is invulnerable
        if (entity.invulnerable) return false;
        
        for (const obstacle of obstacles) {
            if (this.checkCollision(entity, obstacle)) {
                return true;
            }
        }
        
        return false;
    },
    
    /**
     * Apply a force to an entity
     * @param {Object} entity - Entity to apply force to
     * @param {number} forceX - X component of force
     * @param {number} forceY - Y component of force
     */
    applyForce: function(entity, forceX, forceY) {
        entity.velocityX += forceX;
        entity.velocityY += forceY;
    },
    
    /**
     * Apply an impulse to an entity (immediate velocity change)
     * @param {Object} entity - Entity to apply impulse to
     * @param {number} impulseX - X component of impulse
     * @param {number} impulseY - Y component of impulse
     */
    applyImpulse: function(entity, impulseX, impulseY) {
        entity.velocityX = impulseX;
        entity.velocityY = impulseY;
    },
    
    /**
     * Make entity jump
     * @param {Object} entity - Entity to make jump
     * @param {number} force - Jump force
     */
    jump: function(entity, force) {
        if (entity.isGrounded) {
            entity.velocityY = -force;
            entity.isJumping = true;
            entity.isGrounded = false;
        }
    },
    
    /**
     * Create a moving platform
     * @param {number} x - Initial X position
     * @param {number} y - Initial Y position
     * @param {number} width - Platform width
     * @param {number} height - Platform height
     * @param {number} moveX - X movement distance
     * @param {number} moveY - Y movement distance
     * @param {number} speed - Movement speed
     * @returns {Object} Moving platform object
     */
    createMovingPlatform: function(x, y, width, height, moveX, moveY, speed) {
        return {
            x: x,
            y: y,
            width: width,
            height: height,
            solid: true,
            startX: x,
            startY: y,
            moveX: moveX,
            moveY: moveY,
            speed: speed,
            progress: 0,
            direction: 1,
            
            update: function(deltaTime) {
                // Update platform position based on movement pattern
                this.progress += this.speed * this.direction * deltaTime / 60;
                
                if (this.progress > 1) {
                    this.progress = 1;
                    this.direction = -1;
                } else if (this.progress < 0) {
                    this.progress = 0;
                    this.direction = 1;
                }
                
                this.x = this.startX + this.moveX * this.progress;
                this.y = this.startY + this.moveY * this.progress;
            },
            
            draw: function(ctx, offsetX, offsetY) {
                ctx.fillStyle = '#555555';
                ctx.fillRect(
                    this.x - offsetX,
                    this.y - offsetY,
                    this.width,
                    this.height
                );
            }
        };
    },
    
    /**
     * Create a one-way platform (can jump through from below)
     * @param {number} x - X position
     * @param {number} y - Y position
     * @param {number} width - Platform width
     * @param {number} height - Platform height
     * @returns {Object} One-way platform object
     */
    createOneWayPlatform: function(x, y, width, height) {
        return {
            x: x,
            y: y,
            width: width,
            height: height,
            solid: true,
            oneWay: true,
            
            checkCollision: function(entity, prevY) {
                // Only collide if entity is falling and was above the platform
                return entity.velocityY > 0 && prevY + entity.height <= this.y;
            },
            
            draw: function(ctx, offsetX, offsetY) {
                ctx.fillStyle = '#777777';
                ctx.fillRect(
                    this.x - offsetX,
                    this.y - offsetY,
                    this.width,
                    this.height
                );
            }
        };
    }
};
