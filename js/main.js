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
