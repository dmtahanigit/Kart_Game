/**
 * Toronto Adventure - Utility Functions
 */

const Utils = {
    /**
     * Generate a random number between min and max (inclusive)
     * @param {number} min - Minimum value
     * @param {number} max - Maximum value
     * @returns {number} Random number between min and max
     */
    randomBetween: function(min, max) {
        return Math.floor(Math.random() * (max - min + 1) + min);
    },

    /**
     * Check if two rectangles are colliding
     * @param {Object} rect1 - First rectangle {x, y, width, height}
     * @param {Object} rect2 - Second rectangle {x, y, width, height}
     * @returns {boolean} True if colliding, false otherwise
     */
    checkCollision: function(rect1, rect2) {
        return rect1.x < rect2.x + rect2.width &&
               rect1.x + rect1.width > rect2.x &&
               rect1.y < rect2.y + rect2.height &&
               rect1.y + rect1.height > rect2.y;
    },

    /**
     * Clamp a value between min and max
     * @param {number} value - Value to clamp
     * @param {number} min - Minimum value
     * @param {number} max - Maximum value
     * @returns {number} Clamped value
     */
    clamp: function(value, min, max) {
        return Math.max(min, Math.min(max, value));
    },

    /**
     * Format time in seconds to MM:SS format
     * @param {number} seconds - Time in seconds
     * @returns {string} Formatted time string
     */
    formatTime: function(seconds) {
        const minutes = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${minutes}:${secs < 10 ? '0' : ''}${secs}`;
    },

    /**
     * Detect if the device is mobile
     * @returns {boolean} True if mobile, false otherwise
     */
    isMobile: function() {
        return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || window.innerWidth <= 768;
    },

    /**
     * Ease a value towards a target
     * @param {number} current - Current value
     * @param {number} target - Target value
     * @param {number} ease - Ease factor (0-1)
     * @returns {number} Eased value
     */
    ease: function(current, target, ease) {
        return current + (target - current) * ease;
    },

    /**
     * Create a particle effect
     * @param {CanvasRenderingContext2D} ctx - Canvas context
     * @param {number} x - X position
     * @param {number} y - Y position
     * @param {number} count - Number of particles
     * @param {string} color - Particle color
     * @param {number} size - Particle size
     * @param {number} speed - Particle speed
     */
    createParticles: function(ctx, x, y, count, color, size, speed) {
        const particles = [];
        
        for (let i = 0; i < count; i++) {
            const angle = Math.random() * Math.PI * 2;
            const velocity = Math.random() * speed;
            
            particles.push({
                x: x,
                y: y,
                vx: Math.cos(angle) * velocity,
                vy: Math.sin(angle) * velocity,
                size: Math.random() * size + 1,
                color: color,
                alpha: 1,
                life: 30 + Math.random() * 30
            });
        }
        
        function update() {
            ctx.save();
            
            for (let i = 0; i < particles.length; i++) {
                const p = particles[i];
                
                p.x += p.vx;
                p.y += p.vy;
                p.vy += 0.1; // Gravity
                p.alpha -= 0.01;
                p.life--;
                
                if (p.life <= 0 || p.alpha <= 0) {
                    particles.splice(i, 1);
                    i--;
                    continue;
                }
                
                ctx.globalAlpha = p.alpha;
                ctx.fillStyle = p.color;
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
                ctx.fill();
            }
            
            ctx.restore();
            
            if (particles.length > 0) {
                requestAnimationFrame(update);
            }
        }
        
        update();
    },

    /**
     * Save game data to localStorage
     * @param {string} key - Storage key
     * @param {*} data - Data to store
     */
    saveToStorage: function(key, data) {
        try {
            localStorage.setItem(key, JSON.stringify(data));
        } catch (e) {
            console.error('Failed to save to localStorage:', e);
        }
    },

    /**
     * Load game data from localStorage
     * @param {string} key - Storage key
     * @param {*} defaultValue - Default value if key doesn't exist
     * @returns {*} Loaded data or default value
     */
    loadFromStorage: function(key, defaultValue) {
        try {
            const data = localStorage.getItem(key);
            return data ? JSON.parse(data) : defaultValue;
        } catch (e) {
            console.error('Failed to load from localStorage:', e);
            return defaultValue;
        }
    },

    /**
     * Shake the screen (camera effect)
     * @param {HTMLElement} element - Element to shake
     * @param {number} intensity - Shake intensity
     * @param {number} duration - Shake duration in ms
     */
    shakeScreen: function(element, intensity, duration) {
        const startTime = Date.now();
        const originalTransform = element.style.transform || '';
        
        function shake() {
            const elapsed = Date.now() - startTime;
            const remaining = Math.max(0, duration - elapsed);
            
            if (remaining > 0) {
                const factor = remaining / duration;
                const x = (Math.random() * 2 - 1) * intensity * factor;
                const y = (Math.random() * 2 - 1) * intensity * factor;
                
                element.style.transform = `${originalTransform} translate(${x}px, ${y}px)`;
                
                requestAnimationFrame(shake);
            } else {
                element.style.transform = originalTransform;
            }
        }
        
        shake();
    }
};
