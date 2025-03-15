// debug.js - Helps identify issues with the game

console.log('Debug script loaded');

// Check if all required scripts are loaded
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM fully loaded');
    
    // Check if key elements exist
    const elements = [
        'game-container',
        'loading-screen',
        'main-menu',
        'game-canvas',
        'game-screen'
    ];
    
    elements.forEach(id => {
        const element = document.getElementById(id);
        console.log(`Element #${id} exists: ${element !== null}`);
    });
    
    // Check if key classes are defined
    const classes = [
        'Game',
        'Character',
        'Level',
        'GameUI',
        'GameMap',
        'AssetManager',
        'InputHandler'
    ];
    
    classes.forEach(className => {
        console.log(`Class ${className} defined: ${typeof window[className] !== 'undefined'}`);
    });
    
    // Try to initialize the game with error handling
    try {
        console.log('Attempting to create game instance');
        const game = new Game();
        console.log('Game instance created successfully');
        
        game.init().catch(error => {
            console.error('Error initializing game:', error);
        });
    } catch (error) {
        console.error('Failed to create game instance:', error);
        
        // Show error on screen
        const gameContainer = document.getElementById('game-container');
        if (gameContainer) {
            const errorDiv = document.createElement('div');
            errorDiv.style.position = 'absolute';
            errorDiv.style.top = '10px';
            errorDiv.style.left = '10px';
            errorDiv.style.backgroundColor = 'rgba(255, 0, 0, 0.8)';
            errorDiv.style.color = 'white';
            errorDiv.style.padding = '10px';
            errorDiv.style.borderRadius = '5px';
            errorDiv.style.zIndex = '1000';
            errorDiv.innerHTML = `<h3>Game Error</h3><p>${error.message}</p>`;
            gameContainer.appendChild(errorDiv);
        }
    }
});
