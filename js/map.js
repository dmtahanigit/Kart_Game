// map.js - Handles the game map and level selection

window.GameMap = class GameMap {
    constructor(game) {
        this.game = game;
        this.mapContainer = document.querySelector('.toronto-map-svg');
        this.locationMarkers = document.querySelector('.map-location-markers');
        this.locationName = document.getElementById('location-name');
        this.locationDescription = document.getElementById('location-description');
        this.locationImage = document.getElementById('location-image');
        this.playLevelButton = document.getElementById('play-level');
        
        this.locations = [
            {
                id: 'downtown',
                name: 'Downtown',
                description: 'A bustling area with coins to collect and obstacles to jump over.',
                difficulty: 1,
                unlocked: true,
                x: 50,
                y: 50
            },
            {
                id: 'park',
                name: 'Park Area',
                description: 'A green space with more challenging jumps and special coins.',
                difficulty: 2,
                unlocked: false,
                x: 30,
                y: 70
            },
            {
                id: 'beach',
                name: 'Beach',
                description: 'Sandy terrain with water hazards and hidden coins.',
                difficulty: 3,
                unlocked: false,
                x: 70,
                y: 80
            }
        ];
        
        this.selectedLocation = null;
        this.zoomLevel = 1;
    }
    
    init() {
        // Create a simple map background
        this.mapContainer.innerHTML = `
            <svg width="100%" height="100%" viewBox="0 0 100 100">
                <rect width="100" height="100" fill="#e6e6fa" />
                <path d="M20,20 L80,20 L80,80 L20,80 Z" fill="#c4e3f3" stroke="#333" stroke-width="0.5" />
                <path d="M30,30 C40,20 60,20 70,30 S80,60 70,70 S40,80 30,70 S20,40 30,30 Z" fill="#90caf9" stroke="#333" stroke-width="0.5" />
            </svg>
        `;
        
        // Create location markers
        this.createLocationMarkers();
        
        // Add event listeners
        this.addEventListeners();
    }
    
    createLocationMarkers() {
        this.locationMarkers.innerHTML = '';
        
        this.locations.forEach(location => {
            const marker = document.createElement('div');
            marker.className = `location-marker ${location.unlocked ? 'unlocked' : 'locked'}`;
            marker.dataset.locationId = location.id;
            marker.style.left = `${location.x}%`;
            marker.style.top = `${location.y}%`;
            
            if (!location.unlocked) {
                marker.innerHTML = '<span class="lock-icon">🔒</span>';
            }
            
            marker.addEventListener('click', () => {
                if (location.unlocked) {
                    this.selectLocation(location);
                } else {
                    this.showLockedMessage(location);
                }
            });
            
            this.locationMarkers.appendChild(marker);
        });
    }
    
    selectLocation(location) {
        // Remove selection from all markers
        document.querySelectorAll('.location-marker').forEach(marker => {
            marker.classList.remove('selected');
        });
        
        // Select the clicked marker
        document.querySelector(`.location-marker[data-location-id="${location.id}"]`).classList.add('selected');
        
        // Update location info
        this.selectedLocation = location;
        this.locationName.textContent = location.name;
        this.locationDescription.textContent = location.description;
        
        // Update difficulty stars
        const starsContainer = document.querySelector('.stars-container');
        starsContainer.innerHTML = '';
        for (let i = 0; i < 3; i++) {
            const star = document.createElement('span');
            star.className = 'star';
            star.textContent = '★';
            star.style.color = i < location.difficulty ? '#ffd700' : '#ccc';
            starsContainer.appendChild(star);
        }
        
        // Enable play button
        this.playLevelButton.disabled = false;
        
        // Set a placeholder image for the location
        this.locationImage.style.backgroundImage = `url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="200" height="120" viewBox="0 0 200 120"><rect width="200" height="120" fill="%23${location.id === 'downtown' ? '6495ed' : location.id === 'park' ? '8fbc8f' : 'f4a460'}" /><text x="50%" y="50%" font-family="Arial" font-size="16" fill="white" text-anchor="middle">${location.name}</text></svg>')`;
    }
    
    showLockedMessage(location) {
        this.locationName.textContent = `${location.name} (Locked)`;
        this.locationDescription.textContent = `Complete previous levels to unlock this location.`;
        this.playLevelButton.disabled = true;
    }
    
    addEventListeners() {
        // Zoom controls
        document.getElementById('zoom-in').addEventListener('click', () => {
            this.zoomLevel = Math.min(this.zoomLevel + 0.2, 2);
            this.updateZoom();
        });
        
        document.getElementById('zoom-out').addEventListener('click', () => {
            this.zoomLevel = Math.max(this.zoomLevel - 0.2, 0.5);
            this.updateZoom();
        });
        
        document.getElementById('reset-view').addEventListener('click', () => {
            this.zoomLevel = 1;
            this.updateZoom();
        });
        
        // Play level button
        this.playLevelButton.addEventListener('click', () => {
            if (this.selectedLocation) {
                this.game.startLevel(this.selectedLocation.id);
            }
        });
        
        // Back button
        document.getElementById('back-to-character').addEventListener('click', () => {
            this.game.showScreen('character-select');
        });
    }
    
    updateZoom() {
        this.mapContainer.style.transform = `scale(${this.zoomLevel})`;
    }
    
    unlockLocation(locationId) {
        const location = this.locations.find(loc => loc.id === locationId);
        if (location) {
            location.unlocked = true;
            this.createLocationMarkers();
        }
    }
}
