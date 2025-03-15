/**
 * Mario Bros Style Game - Asset Management System
 */

// AssetManager class that wraps the Assets object
class AssetManager {
    constructor() {
        // Initialize properties
        this.images = {};
        this.audio = {};
        this.data = {};
        this.totalAssets = 0;
        this.loadedAssets = 0;
    }
    
    async loadAssets() {
        return new Promise((resolve, reject) => {
            // Set up callbacks
            Assets.init(
                (percent) => {
                    // Update loading progress
                    const progressBar = document.querySelector('.loading-progress');
                    if (progressBar) {
                        progressBar.style.width = `${percent}%`;
                    }
                },
                () => {
                    // On complete
                    console.log('All assets loaded successfully');
                    this.images = Assets.images;
                    this.audio = Assets.audio;
                    this.data = Assets.data;
                    resolve();
                },
                (error, path) => {
                    // On error
                    console.error(`Failed to load asset: ${path}`, error);
                    // Continue loading other assets instead of rejecting
                    // reject(error);
                }
            );
            
            // For development, use placeholder assets instead of trying to load real ones
            Assets.createPlaceholderAssets();
            
            // In a real scenario, we would load actual assets
            // Assets.loadGameAssets();
        });
    }
    
    getImage(key) {
        return Assets.getImage(key);
    }
    
    getAudio(key) {
        return Assets.getAudio(key);
    }
    
    getData(key) {
        return Assets.getData(key);
    }
    
    playSound(key, volume = 1, loop = false) {
        return Assets.playAudio(key, volume, loop);
    }
    
    stopSound(audioElement) {
        Assets.stopAudio(audioElement);
    }
}

// Original Assets object
const Assets = {
    // Asset storage
    images: {},
    audio: {},
    data: {},
    
    // Tracking variables
    totalAssets: 0,
    loadedAssets: 0,
    
    // Callbacks
    onProgress: null,
    onComplete: null,
    onError: null,
    
    /**
     * Initialize the asset manager
     * @param {Function} onProgress - Progress callback (percent)
     * @param {Function} onComplete - Completion callback
     * @param {Function} onError - Error callback (error, assetPath)
     */
    init: function(onProgress, onComplete, onError) {
        this.onProgress = onProgress || function() {};
        this.onComplete = onComplete || function() {};
        this.onError = onError || function() {};
        
        this.totalAssets = 0;
        this.loadedAssets = 0;
    },
    
    /**
     * Update loading progress
     */
    updateProgress: function() {
        this.loadedAssets++;
        const percent = (this.loadedAssets / this.totalAssets) * 100;
        this.onProgress(percent);
        
        if (this.loadedAssets >= this.totalAssets) {
            this.onComplete();
        }
    },
    
    /**
     * Load an image asset
     * @param {string} key - Asset key for retrieval
     * @param {string} path - Asset file path
     */
    loadImage: function(key, path) {
        this.totalAssets++;
        
        const img = new Image();
        
        img.onload = () => {
            this.images[key] = img;
            this.updateProgress();
        };
        
        img.onerror = (err) => {
            console.error(`Failed to load image: ${path}`);
            this.onError(err, path);
            this.updateProgress();
        };
        
        img.src = path;
    },
    
    /**
     * Load an audio asset
     * @param {string} key - Asset key for retrieval
     * @param {string} path - Asset file path
     */
    loadAudio: function(key, path) {
        this.totalAssets++;
        
        const audio = new Audio();
        
        audio.oncanplaythrough = () => {
            this.audio[key] = audio;
            this.updateProgress();
        };
        
        audio.onerror = (err) => {
            console.error(`Failed to load audio: ${path}`);
            this.onError(err, path);
            this.updateProgress();
        };
        
        audio.src = path;
        audio.load();
    },
    
    /**
     * Load a JSON data asset
     * @param {string} key - Asset key for retrieval
     * @param {string} path - Asset file path
     */
    loadJSON: function(key, path) {
        this.totalAssets++;
        
        fetch(path)
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP error! Status: ${response.status}`);
                }
                return response.json();
            })
            .then(data => {
                this.data[key] = data;
                this.updateProgress();
            })
            .catch(err => {
                console.error(`Failed to load JSON: ${path}`);
                this.onError(err, path);
                this.updateProgress();
            });
    },
    
    /**
     * Get an image asset
     * @param {string} key - Asset key
     * @returns {HTMLImageElement} Image element
     */
    getImage: function(key) {
        return this.images[key];
    },
    
    /**
     * Get an audio asset
     * @param {string} key - Asset key
     * @returns {HTMLAudioElement} Audio element
     */
    getAudio: function(key) {
        return this.audio[key];
    },
    
    /**
     * Get a data asset
     * @param {string} key - Asset key
     * @returns {Object} JSON data
     */
    getData: function(key) {
        return this.data[key];
    },
    
    /**
     * Play an audio asset
     * @param {string} key - Asset key
     * @param {number} volume - Volume (0-1)
     * @param {boolean} loop - Whether to loop the audio
     */
    playAudio: function(key, volume = 1, loop = false) {
        const audio = this.getAudio(key);
        
        if (audio) {
            const sound = audio.cloneNode();
            sound.volume = volume;
            sound.loop = loop;
            sound.play();
            return sound;
        }
        
        return null;
    },
    
    /**
     * Stop an audio element
     * @param {HTMLAudioElement} audioElement - Audio element to stop
     */
    stopAudio: function(audioElement) {
        if (audioElement) {
            audioElement.pause();
            audioElement.currentTime = 0;
        }
    },
    
    /**
     * Load all game assets
     */
    loadGameAssets: function() {
        // Character sprites
        this.loadImage('maple_idle', 'assets/images/characters/maple/idle.png');
        this.loadImage('maple_run', 'assets/images/characters/maple/run.png');
        this.loadImage('maple_jump', 'assets/images/characters/maple/jump.png');
        this.loadImage('maple_special', 'assets/images/characters/maple/special.png');
        
        this.loadImage('cn_tower_idle', 'assets/images/characters/cn_tower/idle.png');
        this.loadImage('cn_tower_run', 'assets/images/characters/cn_tower/run.png');
        this.loadImage('cn_tower_jump', 'assets/images/characters/cn_tower/jump.png');
        this.loadImage('cn_tower_special', 'assets/images/characters/cn_tower/special.png');
        
        this.loadImage('casa_loma_idle', 'assets/images/characters/casa_loma/idle.png');
        this.loadImage('casa_loma_run', 'assets/images/characters/casa_loma/run.png');
        this.loadImage('casa_loma_jump', 'assets/images/characters/casa_loma/jump.png');
        this.loadImage('casa_loma_special', 'assets/images/characters/casa_loma/special.png');
        
        this.loadImage('raccoon_idle', 'assets/images/characters/raccoon/idle.png');
        this.loadImage('raccoon_run', 'assets/images/characters/raccoon/run.png');
        this.loadImage('raccoon_jump', 'assets/images/characters/raccoon/jump.png');
        this.loadImage('raccoon_special', 'assets/images/characters/raccoon/special.png');
        
        // Toronto backgrounds
        this.loadImage('downtown_bg_1', 'assets/images/backgrounds/downtown/layer1.png');
        this.loadImage('downtown_bg_2', 'assets/images/backgrounds/downtown/layer2.png');
        this.loadImage('downtown_bg_3', 'assets/images/backgrounds/downtown/layer3.png');
        
        this.loadImage('casa_loma_bg_1', 'assets/images/backgrounds/casa_loma/layer1.png');
        this.loadImage('casa_loma_bg_2', 'assets/images/backgrounds/casa_loma/layer2.png');
        this.loadImage('casa_loma_bg_3', 'assets/images/backgrounds/casa_loma/layer3.png');
        
        this.loadImage('chinatown_bg_1', 'assets/images/backgrounds/chinatown/layer1.png');
        this.loadImage('chinatown_bg_2', 'assets/images/backgrounds/chinatown/layer2.png');
        this.loadImage('chinatown_bg_3', 'assets/images/backgrounds/chinatown/layer3.png');
        
        this.loadImage('little_india_bg_1', 'assets/images/backgrounds/little_india/layer1.png');
        this.loadImage('little_india_bg_2', 'assets/images/backgrounds/little_india/layer2.png');
        this.loadImage('little_india_bg_3', 'assets/images/backgrounds/little_india/layer3.png');
        
        this.loadImage('high_park_bg_1', 'assets/images/backgrounds/high_park/layer1.png');
        this.loadImage('high_park_bg_2', 'assets/images/backgrounds/high_park/layer2.png');
        this.loadImage('high_park_bg_3', 'assets/images/backgrounds/high_park/layer3.png');
        
        this.loadImage('centre_island_bg_1', 'assets/images/backgrounds/centre_island/layer1.png');
        this.loadImage('centre_island_bg_2', 'assets/images/backgrounds/centre_island/layer2.png');
        this.loadImage('centre_island_bg_3', 'assets/images/backgrounds/centre_island/layer3.png');
        
        this.loadImage('wonderland_bg_1', 'assets/images/backgrounds/wonderland/layer1.png');
        this.loadImage('wonderland_bg_2', 'assets/images/backgrounds/wonderland/layer2.png');
        this.loadImage('wonderland_bg_3', 'assets/images/backgrounds/wonderland/layer3.png');
        
        // Game elements
        this.loadImage('coin', 'assets/images/items/coin.png');
        this.loadImage('platform', 'assets/images/items/platform.png');
        this.loadImage('obstacle', 'assets/images/obstacles/obstacle.png');
        
        // Map icons
        this.loadImage('map_cn_tower', 'assets/images/map/cn_tower_icon.png');
        this.loadImage('map_casa_loma', 'assets/images/map/casa_loma_icon.png');
        this.loadImage('map_chinatown', 'assets/images/map/chinatown_icon.png');
        this.loadImage('map_little_india', 'assets/images/map/little_india_icon.png');
        this.loadImage('map_high_park', 'assets/images/map/high_park_icon.png');
        this.loadImage('map_centre_island', 'assets/images/map/centre_island_icon.png');
        this.loadImage('map_wonderland', 'assets/images/map/wonderland_icon.png');
        
        // Toronto map
        this.loadImage('toronto_map', 'assets/images/map/toronto_map.png');
        
        // Location preview images
        this.loadImage('downtown_preview', 'assets/images/locations/downtown.jpg');
        this.loadImage('casa_loma_preview', 'assets/images/locations/casa_loma.jpg');
        this.loadImage('chinatown_preview', 'assets/images/locations/chinatown.jpg');
        this.loadImage('little_india_preview', 'assets/images/locations/little_india.jpg');
        this.loadImage('high_park_preview', 'assets/images/locations/high_park.jpg');
        this.loadImage('centre_island_preview', 'assets/images/locations/centre_island.jpg');
        this.loadImage('wonderland_preview', 'assets/images/locations/wonderland.jpg');
        
        // UI elements
        this.loadImage('life_icon', 'assets/images/ui/life.png');
        
        // Sound effects
        this.loadAudio('jump', 'assets/sounds/effects/jump.mp3');
        this.loadAudio('coin', 'assets/sounds/effects/coin.mp3');
        this.loadAudio('special', 'assets/sounds/effects/special.mp3');
        this.loadAudio('hurt', 'assets/sounds/effects/hurt.mp3');
        this.loadAudio('level_complete', 'assets/sounds/effects/level_complete.mp3');
        this.loadAudio('game_over', 'assets/sounds/effects/game_over.mp3');
        this.loadAudio('unlock', 'assets/sounds/effects/unlock.mp3');
        this.loadAudio('button_click', 'assets/sounds/effects/button_click.mp3');
        
        // Music
        this.loadAudio('menu_music', 'assets/sounds/music/menu.mp3');
        this.loadAudio('downtown_music', 'assets/sounds/music/downtown.mp3');
        this.loadAudio('casa_loma_music', 'assets/sounds/music/casa_loma.mp3');
        this.loadAudio('chinatown_music', 'assets/sounds/music/chinatown.mp3');
        this.loadAudio('little_india_music', 'assets/sounds/music/little_india.mp3');
        this.loadAudio('high_park_music', 'assets/sounds/music/high_park.mp3');
        this.loadAudio('centre_island_music', 'assets/sounds/music/centre_island.mp3');
        this.loadAudio('wonderland_music', 'assets/sounds/music/wonderland.mp3');
        
        // Level data
        this.loadJSON('levels', 'assets/data/levels.json');
        this.loadJSON('characters', 'assets/data/characters.json');
        this.loadJSON('toronto_facts', 'assets/data/toronto_facts.json');
    },
    
    /**
     * Create placeholder assets for development
     * This allows the game to run without actual asset files during development
     */
    createPlaceholderAssets: function() {
        // Create a canvas for generating placeholder images
        const canvas = document.createElement('canvas');
        canvas.width = 64;
        canvas.height = 64;
        const ctx = canvas.getContext('2d');
        
        // Helper function to create a placeholder image
        const createPlaceholderImage = (key, color, text) => {
            ctx.fillStyle = color;
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            
            ctx.fillStyle = 'white';
            ctx.font = '10px Arial';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(text, canvas.width / 2, canvas.height / 2);
            
            const dataURL = canvas.toDataURL();
            const img = new Image();
            img.src = dataURL;
            this.images[key] = img;
        };
        
        // Create placeholder character sprites
        const characters = ['maple', 'cn_tower', 'casa_loma', 'raccoon'];
        const actions = ['idle', 'run', 'jump', 'special'];
        
        characters.forEach(char => {
            actions.forEach(action => {
                createPlaceholderImage(`${char}_${action}`, '#e94560', `${char}\n${action}`);
            });
        });
        
        // Create placeholder backgrounds
        const locations = ['downtown', 'casa_loma', 'chinatown', 'little_india', 'high_park', 'centre_island', 'wonderland'];
        const layers = ['layer1', 'layer2', 'layer3'];
        
        locations.forEach(location => {
            layers.forEach((layer, index) => {
                const color = index === 0 ? '#0f3460' : (index === 1 ? '#16213e' : '#1a1a2e');
                createPlaceholderImage(`${location}_bg_${index + 1}`, color, `${location}\n${layer}`);
            });
            
            // Create location preview
            createPlaceholderImage(`${location}_preview`, '#e94560', `${location}\npreview`);
        });
        
        // Create game elements
        createPlaceholderImage('coin', '#ffd700', 'coin');
        createPlaceholderImage('platform', '#555555', 'platform');
        createPlaceholderImage('obstacle', '#ff0000', 'obstacle');
        
        // Create map icons
        locations.forEach(location => {
            createPlaceholderImage(`map_${location}`, '#e94560', location);
        });
        
        // Create Toronto map
        canvas.width = 512;
        canvas.height = 384;
        ctx.fillStyle = '#16213e';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        ctx.fillStyle = '#0f3460';
        ctx.fillRect(100, 100, 312, 184);
        
        ctx.fillStyle = '#1a1a2e';
        ctx.font = '20px Arial';
        ctx.fillText('Toronto Map', canvas.width / 2, canvas.height / 2);
        
        const mapDataURL = canvas.toDataURL();
        const mapImg = new Image();
        mapImg.src = mapDataURL;
        this.images['toronto_map'] = mapImg;
        
        // Create UI elements
        canvas.width = 64;
        canvas.height = 64;
        ctx.fillStyle = '#e94560';
        ctx.beginPath();
        ctx.arc(32, 32, 16, 0, Math.PI * 2);
        ctx.fill();
        
        const lifeDataURL = canvas.toDataURL();
        const lifeImg = new Image();
        lifeImg.src = lifeDataURL;
        this.images['life_icon'] = lifeImg;
        
        // Create placeholder data
        this.data['levels'] = {
            downtown: {
                name: "Downtown Toronto",
                description: "Navigate through the bustling streets of downtown Toronto with the CN Tower in the background.",
                difficulty: 1,
                unlocks: "cn_tower"
            },
            casa_loma: {
                name: "Casa Loma",
                description: "Explore the historic Casa Loma castle and its beautiful gardens.",
                difficulty: 2,
                unlocks: "casa_loma"
            },
            chinatown: {
                name: "Chinatown",
                description: "Experience the vibrant culture and delicious food of Toronto's Chinatown.",
                difficulty: 3,
                unlocks: "special_power"
            },
            little_india: {
                name: "Little India",
                description: "Discover the colorful shops and spicy aromas of Little India.",
                difficulty: 4,
                unlocks: "costume"
            },
            high_park: {
                name: "High Park",
                description: "Enjoy the natural beauty of High Park with its cherry blossoms and peaceful trails.",
                difficulty: 5,
                unlocks: "speed_boost"
            },
            centre_island: {
                name: "Centre Island",
                description: "Relax on the beaches and enjoy the attractions of Toronto's Centre Island.",
                difficulty: 6,
                unlocks: "jump_boost"
            },
            wonderland: {
                name: "Canada's Wonderland",
                description: "Experience the thrills and excitement of Canada's largest amusement park.",
                difficulty: 7,
                unlocks: "secret_character"
            }
        };
        
        this.data['characters'] = {
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
        
        this.data['toronto_facts'] = [
            "The CN Tower was the world's tallest free-standing structure for 32 years until 2007.",
            "Casa Loma is a Gothic Revival castle built in the early 20th century.",
            "Toronto's Chinatown is one of the largest in North America.",
            "Little India, also known as the Gerrard India Bazaar, is the largest South Asian marketplace in North America.",
            "High Park's cherry blossoms, gifted from Japan, attract thousands of visitors each spring.",
            "Centre Island is part of the Toronto Islands, the largest urban car-free community in North America.",
            "Canada's Wonderland features more than 200 attractions including 17 roller coasters."
        ];
    }
};
