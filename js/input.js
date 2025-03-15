/**
 * Mario Bros Style Game - Input Handler
 * Manages keyboard, touch, and mouse input for both desktop and mobile
 */

// InputHandler class that wraps the Input object
class InputHandler {
    constructor() {
        // Initialize key states
        this.keys = {
            left: false,
            right: false,
            up: false,
            down: false,
            space: false
        };
        
        // Initialize Input object
        Input.init();
        
        // Set up keyboard event listeners
        document.addEventListener('keydown', this.handleKeyDown.bind(this));
        document.addEventListener('keyup', this.handleKeyUp.bind(this));
    }
    
    handleKeyDown(e) {
        switch(e.key) {
            case 'ArrowLeft':
                this.keys.left = true;
                break;
            case 'ArrowRight':
                this.keys.right = true;
                break;
            case 'ArrowUp':
                this.keys.up = true;
                break;
            case 'ArrowDown':
                this.keys.down = true;
                break;
            case ' ':
                this.keys.space = true;
                break;
        }
    }
    
    handleKeyUp(e) {
        switch(e.key) {
            case 'ArrowLeft':
                this.keys.left = false;
                break;
            case 'ArrowRight':
                this.keys.right = false;
                break;
            case 'ArrowUp':
                this.keys.up = false;
                break;
            case 'ArrowDown':
                this.keys.down = false;
                break;
            case ' ':
                this.keys.space = false;
                break;
        }
    }
    
    isLeftActive() {
        return this.keys.left || Input.isLeftActive();
    }
    
    isRightActive() {
        return this.keys.right || Input.isRightActive();
    }
    
    isJumpActive() {
        return this.keys.up || Input.isJumpActive();
    }
    
    isSpecialActive() {
        return this.keys.space || Input.isSpecialActive();
    }
    
    reset() {
        this.keys = {
            left: false,
            right: false,
            up: false,
            down: false,
            space: false
        };
        Input.reset();
    }
}

// Original Input object
const Input = {
    // Key states
    keys: {},
    
    // Touch states
    touches: {},
    touchStartX: 0,
    touchStartY: 0,
    
    // Mobile control button states
    mobileButtons: {
        left: false,
        right: false,
        jump: false,
        special: false
    },
    
    // Swipe detection
    swipeThreshold: 50,
    swipeTimeout: null,
    swipeDirection: null,
    
    /**
     * Initialize input handlers
     */
    init: function() {
        // Keyboard event listeners
        window.addEventListener('keydown', this.handleKeyDown.bind(this));
        window.addEventListener('keyup', this.handleKeyUp.bind(this));
        
        // Touch event listeners
        window.addEventListener('touchstart', this.handleTouchStart.bind(this));
        window.addEventListener('touchmove', this.handleTouchMove.bind(this));
        window.addEventListener('touchend', this.handleTouchEnd.bind(this));
        
        // Mobile control buttons
        this.setupMobileControls();
        
        // Prevent context menu on right click or long press
        window.addEventListener('contextmenu', (e) => {
            e.preventDefault();
        });
    },
    
    /**
     * Set up mobile control buttons
     */
    setupMobileControls: function() {
        // Left button
        const leftButton = document.getElementById('left-button');
        if (leftButton) {
            leftButton.addEventListener('touchstart', (e) => {
                e.preventDefault();
                this.mobileButtons.left = true;
            });
            
            leftButton.addEventListener('touchend', (e) => {
                e.preventDefault();
                this.mobileButtons.left = false;
            });
        }
        
        // Right button
        const rightButton = document.getElementById('right-button');
        if (rightButton) {
            rightButton.addEventListener('touchstart', (e) => {
                e.preventDefault();
                this.mobileButtons.right = true;
            });
            
            rightButton.addEventListener('touchend', (e) => {
                e.preventDefault();
                this.mobileButtons.right = false;
            });
        }
        
        // Jump button
        const jumpButton = document.getElementById('jump-button');
        if (jumpButton) {
            jumpButton.addEventListener('touchstart', (e) => {
                e.preventDefault();
                this.mobileButtons.jump = true;
            });
            
            jumpButton.addEventListener('touchend', (e) => {
                e.preventDefault();
                this.mobileButtons.jump = false;
            });
        }
        
        // Special button
        const specialButton = document.getElementById('special-button');
        if (specialButton) {
            specialButton.addEventListener('touchstart', (e) => {
                e.preventDefault();
                this.mobileButtons.special = true;
            });
            
            specialButton.addEventListener('touchend', (e) => {
                e.preventDefault();
                this.mobileButtons.special = false;
            });
        }
    },
    
    /**
     * Handle keydown events
     * @param {KeyboardEvent} e - Keyboard event
     */
    handleKeyDown: function(e) {
        this.keys[e.code] = true;
        
        // Prevent default for game control keys
        if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space'].includes(e.code)) {
            e.preventDefault();
        }
    },
    
    /**
     * Handle keyup events
     * @param {KeyboardEvent} e - Keyboard event
     */
    handleKeyUp: function(e) {
        this.keys[e.code] = false;
    },
    
    /**
     * Handle touch start events
     * @param {TouchEvent} e - Touch event
     */
    handleTouchStart: function(e) {
        // Store initial touch position for swipe detection
        if (e.touches.length > 0) {
            this.touchStartX = e.touches[0].clientX;
            this.touchStartY = e.touches[0].clientY;
            
            // Reset swipe direction
            this.swipeDirection = null;
            
            // Clear any existing swipe timeout
            if (this.swipeTimeout) {
                clearTimeout(this.swipeTimeout);
            }
            
            // Set a timeout to reset swipe detection
            this.swipeTimeout = setTimeout(() => {
                this.swipeDirection = null;
            }, 300);
        }
    },
    
    /**
     * Handle touch move events
     * @param {TouchEvent} e - Touch event
     */
    handleTouchMove: function(e) {
        // Skip if no initial touch position
        if (this.touchStartX === 0 && this.touchStartY === 0) {
            return;
        }
        
        // Calculate swipe distance
        if (e.touches.length > 0) {
            const touchX = e.touches[0].clientX;
            const touchY = e.touches[0].clientY;
            
            const deltaX = touchX - this.touchStartX;
            const deltaY = touchY - this.touchStartY;
            
            // Detect horizontal swipe
            if (Math.abs(deltaX) > this.swipeThreshold && Math.abs(deltaX) > Math.abs(deltaY)) {
                this.swipeDirection = deltaX > 0 ? 'right' : 'left';
            }
            // Detect vertical swipe
            else if (Math.abs(deltaY) > this.swipeThreshold && Math.abs(deltaY) > Math.abs(deltaX)) {
                this.swipeDirection = deltaY > 0 ? 'down' : 'up';
            }
        }
    },
    
    /**
     * Handle touch end events
     * @param {TouchEvent} e - Touch event
     */
    handleTouchEnd: function(e) {
        // Reset touch position
        this.touchStartX = 0;
        this.touchStartY = 0;
        
        // Clear swipe timeout
        if (this.swipeTimeout) {
            clearTimeout(this.swipeTimeout);
            this.swipeTimeout = null;
        }
        
        // Reset swipe direction after a short delay
        setTimeout(() => {
            this.swipeDirection = null;
        }, 100);
    },
    
    /**
     * Check if a key is pressed
     * @param {string} code - Key code
     * @returns {boolean} True if key is pressed
     */
    isKeyPressed: function(code) {
        return this.keys[code] === true;
    },
    
    /**
     * Check if left input is active (arrow key or mobile button)
     * @returns {boolean} True if left input is active
     */
    isLeftActive: function() {
        return this.isKeyPressed('ArrowLeft') || this.mobileButtons.left || this.swipeDirection === 'left';
    },
    
    /**
     * Check if right input is active (arrow key or mobile button)
     * @returns {boolean} True if right input is active
     */
    isRightActive: function() {
        return this.isKeyPressed('ArrowRight') || this.mobileButtons.right || this.swipeDirection === 'right';
    },
    
    /**
     * Check if jump input is active (up arrow, space, or mobile button)
     * @returns {boolean} True if jump input is active
     */
    isJumpActive: function() {
        return this.isKeyPressed('ArrowUp') || this.isKeyPressed('Space') || this.mobileButtons.jump || this.swipeDirection === 'up';
    },
    
    /**
     * Check if special ability input is active (shift key or mobile button)
     * @returns {boolean} True if special ability input is active
     */
    isSpecialActive: function() {
        return this.isKeyPressed('ShiftLeft') || this.isKeyPressed('ShiftRight') || this.mobileButtons.special;
    },
    
    /**
     * Check if pause input is active (P key or Escape)
     * @returns {boolean} True if pause input is active
     */
    isPauseActive: function() {
        return this.isKeyPressed('KeyP') || this.isKeyPressed('Escape');
    },
    
    /**
     * Reset all input states
     */
    reset: function() {
        this.keys = {};
        this.touches = {};
        this.touchStartX = 0;
        this.touchStartY = 0;
        this.swipeDirection = null;
        
        this.mobileButtons = {
            left: false,
            right: false,
            jump: false,
            special: false
        };
        
        if (this.swipeTimeout) {
            clearTimeout(this.swipeTimeout);
            this.swipeTimeout = null;
        }
    },
    
    /**
     * Show mobile controls if on a mobile device
     */
    showMobileControls: function() {
        if (Utils.isMobile()) {
            const mobileControls = document.querySelector('.mobile-controls');
            if (mobileControls) {
                mobileControls.style.display = 'flex';
            }
        }
    },
    
    /**
     * Hide mobile controls
     */
    hideMobileControls: function() {
        const mobileControls = document.querySelector('.mobile-controls');
        if (mobileControls) {
            mobileControls.style.display = 'none';
        }
    }
};
