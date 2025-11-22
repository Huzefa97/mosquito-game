// Configuration - Set the path to your Lottie JSON file here
// Leave as null to use the default SVG mosquito
const LOTTIE_MOSQUITO_PATH = null; // e.g., 'animations/mosquito.json'

// GIF Configuration - Set path to your mosquito GIF file
// Leave as null to use SVG mosquito
  const MOSQUITO_GIF_PATH = 'images/mosquito-flying.gif'; // e.g., 'images/mosquito.gif'

// Audio Configuration - Set paths to your audio files
const AUDIO_BUZZ_PATH = 'audio/mosquito-buzz.mp3'; // Mosquito buzz sound
const AUDIO_KILL_PATH = 'audio/mosquito-kill.mp3'; // Kill sound effect

// Game state
let gameState = {
    score: 0,
    timeLeft: 60,
    lives: 3,
    mosquitoes: [],
    spawnInterval: null,
    gameInterval: null,
    animationFrame: null,
    isGameActive: false,
    elapsedTime: 0,
    lastTime: 0,
    lastSecond: 0,
    audioContext: null, // Web Audio API context for spatial audio
    killSound: null, // Pre-loaded kill sound
    playerName: '', // Current player's name
    isNewSession: true // Whether this is a new game session
};

// Initialize audio context
function initAudio() {
    try {
        gameState.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        // Pre-load kill sound
        if (AUDIO_KILL_PATH) {
            loadKillSound();
        }
    } catch (e) {
        console.warn('Web Audio API not supported:', e);
    }
}

// Load kill sound
function loadKillSound() {
    if (!gameState.audioContext) return;
    
    fetch(AUDIO_KILL_PATH)
        .then(response => response.arrayBuffer())
        .then(data => gameState.audioContext.decodeAudioData(data))
        .then(buffer => {
            gameState.killSound = buffer;
        })
        .catch(err => console.warn('Could not load kill sound:', err));
}

// Play kill sound
function playKillSound() {
    // Resume audio context if suspended
    if (gameState.audioContext && gameState.audioContext.state === 'suspended') {
        gameState.audioContext.resume();
    }
    
    if (!gameState.audioContext || !gameState.killSound) {
        // Fallback: use HTML5 Audio if Web Audio API fails
        const audio = new Audio(AUDIO_KILL_PATH);
        audio.volume = 0.5;
        audio.play().catch(err => console.warn('Kill sound play failed:', err));
        return;
    }
    
    const source = gameState.audioContext.createBufferSource();
    const gainNode = gameState.audioContext.createGain();
    
    source.buffer = gameState.killSound;
    source.connect(gainNode);
    gainNode.connect(gameState.audioContext.destination);
    
    gainNode.gain.value = 0.5; // Volume
    source.start(0);
}

// Create buzz audio for mosquito
function createBuzzAudio() {
    if (!AUDIO_BUZZ_PATH) return null;
    
    const audio = new Audio(AUDIO_BUZZ_PATH);
    audio.loop = true;
    audio.volume = 0; // Start at 0, will be adjusted based on position
    audio.preload = 'auto';
    
    // Try to play - will work after user interaction
    const playPromise = audio.play();
    if (playPromise !== undefined) {
        playPromise.catch(err => {
            console.warn('Audio play failed:', err);
            // Audio will start when user interacts with the game
        });
    }
    
    return audio;
}

// Update buzz volume based on distance from center
function updateBuzzVolume(mosquito, audio) {
    if (!audio) return;
    
    const gameWidth = gameArea.offsetWidth;
    const gameHeight = gameArea.offsetHeight;
    const centerX = gameWidth / 2;
    const centerY = gameHeight / 2;
    
    // Calculate distance from center
    const dx = mosquito.x - centerX;
    const dy = mosquito.y - centerY;
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    // Calculate max distance (corner to center)
    const maxDistance = Math.sqrt(centerX * centerX + centerY * centerY);
    
    // Volume is highest at center (1.0), fades to 0 at edges
    // Inverse relationship: closer to center = louder
    const normalizedDistance = Math.min(distance / maxDistance, 1);
    const volume = 1 - normalizedDistance; // 1 at center, 0 at edge
    
    // Clamp volume between 0 and 0.7 (max volume for buzz)
    audio.volume = Math.max(0, Math.min(0.7, volume));
}

// DOM elements
const nameInputScreen = document.getElementById('name-input-screen');
const gameScreen = document.getElementById('game-screen');
const gameEndScreen = document.getElementById('game-end-screen');
const startBtn = document.getElementById('start-btn');
const restartBtn = document.getElementById('restart-btn');
const newGameBtn = document.getElementById('new-game-btn');
const playerNameInput = document.getElementById('player-name-input');
const gameArea = document.getElementById('game-area');
const timerEl = document.getElementById('timer');
const scoreEl = document.getElementById('score');
const heartsEl = document.getElementById('hearts');
const finalScoreEl = document.getElementById('final-score');
const leaderboardListEl = document.getElementById('leaderboard-list');

// Start button event
startBtn.addEventListener('click', () => {
    const name = playerNameInput.value.trim();
    if (name === '') {
        alert('Please enter your name to continue');
        playerNameInput.focus();
        return;
    }
    gameState.playerName = name;
    gameState.isNewSession = false;
    startGame();
});

// Enter key on name input
playerNameInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        startBtn.click();
    }
});

// Restart button event (same session, no name input)
restartBtn.addEventListener('click', () => {
    gameEndScreen.classList.add('hidden');
    gameScreen.classList.remove('hidden');
    startGame();
});

// New game button event (new session, ask for name)
newGameBtn.addEventListener('click', () => {
    gameEndScreen.classList.add('hidden');
    nameInputScreen.classList.remove('hidden');
    playerNameInput.value = '';
    playerNameInput.focus();
    gameState.isNewSession = true;
});

// Initialize audio on page load
initAudio();

// Start game function
function startGame() {
    nameInputScreen.classList.add('hidden');
    gameScreen.classList.remove('hidden');
    
    // Resume audio context if suspended (required for autoplay policies)
    if (gameState.audioContext && gameState.audioContext.state === 'suspended') {
        gameState.audioContext.resume().then(() => {
            console.log('Audio context resumed');
        });
    }
    
    // Ensure audio context is initialized if it wasn't before
    if (!gameState.audioContext) {
        initAudio();
    }
    
    // Reset game state
    gameState.score = 0;
    gameState.timeLeft = 60;
    gameState.lives = 3;
    gameState.mosquitoes = [];
    gameState.isGameActive = true;
    gameState.elapsedTime = 0;
    
    // Clear any existing mosquitoes
    gameArea.innerHTML = '';
    
    updateUI();
    
    // Start game loop (timer updates every second)
    gameState.gameInterval = setInterval(gameLoop, 1000);
    gameState.lastTime = performance.now();
    gameState.lastSecond = Date.now();
    
    // Start smooth animation loop
    animate();
    
    // Start spawning mosquitoes
    spawnMosquito();
    scheduleNextSpawn();
}

// Get spawn rate based on elapsed time (gradually decreases)
function getSpawnRate() {
    // Start at 2000ms, gradually decrease to 300ms over 60 seconds
    // Using linear interpolation for smooth progression
    const startRate = 2000; // Start slower
    const endRate = 300;    // End faster
    const totalTime = 60;   // Total game time in seconds
    
    // Calculate progress (0 to 1)
    const progress = Math.min(gameState.elapsedTime / totalTime, 1);
    
    // Linear interpolation: startRate - (startRate - endRate) * progress
    const spawnRate = startRate - (startRate - endRate) * progress;
    
    // Ensure it doesn't go below minimum
    return Math.max(spawnRate, endRate);
}

// Schedule next mosquito spawn
function scheduleNextSpawn() {
    if (!gameState.isGameActive) return;
    
    const spawnRate = getSpawnRate();
    gameState.spawnInterval = setTimeout(() => {
        if (gameState.isGameActive) {
            spawnMosquito();
            scheduleNextSpawn(); // Schedule the next one
        }
    }, spawnRate);
}

// Game loop (runs every second for timer)
function gameLoop() {
    if (!gameState.isGameActive) return;
    
    gameState.timeLeft--;
    gameState.elapsedTime++;
    
    // Spawn rate is handled by scheduleNextSpawn() which checks elapsed time
    
    // Update timer display
    const minutes = Math.floor(gameState.timeLeft / 60);
    const seconds = gameState.timeLeft % 60;
    timerEl.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
    
    // Check for game over
    if (gameState.timeLeft <= 0 || gameState.lives <= 0) {
        endGame();
    }
}

// Smooth animation loop using requestAnimationFrame
function animate() {
    if (!gameState.isGameActive) return;
    
    const currentTime = performance.now();
    const deltaTime = (currentTime - gameState.lastTime) / 16.67; // Normalize to 60fps
    gameState.lastTime = currentTime;
    
    updateMosquitoes(deltaTime);
    
    gameState.animationFrame = requestAnimationFrame(animate);
}

// Spawn a new mosquito
function spawnMosquito() {
    if (!gameState.isGameActive) return;
    
    // Create container for mosquito and hitbox
    const mosquitoContainer = document.createElement('div');
    mosquitoContainer.className = 'mosquito-container';
    
    const mosquito = document.createElement('div');
    mosquito.className = 'mosquito';
    
    // Use Lottie animation if path is provided, otherwise check for GIF, then SVG
    if (LOTTIE_MOSQUITO_PATH) {
        // Create container for Lottie animation
        const lottieContainer = document.createElement('div');
        lottieContainer.className = 'lottie-container';
        mosquito.appendChild(lottieContainer);
        
        // Load Lottie animation
        const animation = lottie.loadAnimation({
            container: lottieContainer,
            renderer: 'svg',
            loop: true,
            autoplay: true,
            path: LOTTIE_MOSQUITO_PATH
        });
        
        // Store animation reference for cleanup if needed
        mosquito._lottieAnimation = animation;
    } else if (MOSQUITO_GIF_PATH) {
        // Use GIF image
        const img = document.createElement('img');
        img.src = MOSQUITO_GIF_PATH;
        img.alt = 'Mosquito';
        img.style.width = '100%';
        img.style.height = '100%';
        img.style.objectFit = 'contain';
        mosquito.appendChild(img);
    } else {
        // Create mosquito SVG (fallback)
        const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        svg.setAttribute('viewBox', '0 0 100 100');
        svg.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
        
        // Mosquito body
        const body = document.createElementNS('http://www.w3.org/2000/svg', 'ellipse');
        body.setAttribute('cx', '50');
        body.setAttribute('cy', '45');
        body.setAttribute('rx', '8');
        body.setAttribute('ry', '12');
        body.setAttribute('fill', '#4A4A4A');
        svg.appendChild(body);
        
        // Wings with motion lines
        const wing1 = document.createElementNS('http://www.w3.org/2000/svg', 'ellipse');
        wing1.setAttribute('cx', '42');
        wing1.setAttribute('cy', '40');
        wing1.setAttribute('rx', '6');
        wing1.setAttribute('ry', '10');
        wing1.setAttribute('fill', '#D3D3D3');
        wing1.setAttribute('opacity', '0.7');
        svg.appendChild(wing1);
        
        const wing2 = document.createElementNS('http://www.w3.org/2000/svg', 'ellipse');
        wing2.setAttribute('cx', '58');
        wing2.setAttribute('cy', '40');
        wing2.setAttribute('rx', '6');
        wing2.setAttribute('ry', '10');
        wing2.setAttribute('fill', '#D3D3D3');
        wing2.setAttribute('opacity', '0.7');
        svg.appendChild(wing2);
        
        // Motion lines
        for (let i = 0; i < 3; i++) {
            const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
            line.setAttribute('x1', `${38 + i * 2}`);
            line.setAttribute('y1', `${35 + i * 2}`);
            line.setAttribute('x2', `${35 + i * 2}`);
            line.setAttribute('y2', `${30 + i * 2}`);
            line.setAttribute('stroke', '#D3D3D3');
            line.setAttribute('stroke-width', '1');
            line.setAttribute('opacity', '0.5');
            svg.appendChild(line);
        }
        
        // Legs
        const legs = [
            [45, 50, 40, 60], [50, 52, 48, 62], [55, 50, 60, 60],
            [45, 48, 38, 55], [55, 48, 62, 55]
        ];
        legs.forEach(([x1, y1, x2, y2]) => {
            const leg = document.createElementNS('http://www.w3.org/2000/svg', 'line');
            leg.setAttribute('x1', x1);
            leg.setAttribute('y1', y1);
            leg.setAttribute('x2', x2);
            leg.setAttribute('y2', y2);
            leg.setAttribute('stroke', '#4A4A4A');
            leg.setAttribute('stroke-width', '1');
            svg.appendChild(leg);
        });
        
        // Antennae
        const ant1 = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        ant1.setAttribute('x1', '48');
        ant1.setAttribute('y1', '35');
        ant1.setAttribute('x2', '46');
        ant1.setAttribute('y2', '25');
        ant1.setAttribute('stroke', '#4A4A4A');
        ant1.setAttribute('stroke-width', '1');
        svg.appendChild(ant1);
        
        const ant2 = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        ant2.setAttribute('x1', '52');
        ant2.setAttribute('y1', '35');
        ant2.setAttribute('x2', '54');
        ant2.setAttribute('y2', '25');
        ant2.setAttribute('stroke', '#4A4A4A');
        ant2.setAttribute('stroke-width', '1');
        svg.appendChild(ant2);
        
        // Proboscis
        const proboscis = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        proboscis.setAttribute('x1', '50');
        proboscis.setAttribute('y1', '55');
        proboscis.setAttribute('x2', '50');
        proboscis.setAttribute('y2', '65');
        proboscis.setAttribute('stroke', '#4A4A4A');
        proboscis.setAttribute('stroke-width', '1.5');
        svg.appendChild(proboscis);
        
        mosquito.appendChild(svg);
    }
    
    // Initial position - spawn from random edge
    const edge = Math.floor(Math.random() * 4); // 0: top, 1: right, 2: bottom, 3: left
    let x, y, vx, vy;
    
    const gameWidth = gameArea.offsetWidth;
    const gameHeight = gameArea.offsetHeight;
    
    // Calculate initial velocity with normalized direction
    let angle, baseVx, baseVy;
    
    if (edge === 0) { // Top
        x = Math.random() * gameWidth;
        y = -40;
        angle = Math.PI / 2 + (Math.random() - 0.5) * 0.8; // Downward with slight variation
        baseVx = Math.cos(angle);
        baseVy = Math.sin(angle);
    } else if (edge === 1) { // Right
        x = gameWidth + 40;
        y = Math.random() * gameHeight;
        angle = Math.PI + (Math.random() - 0.5) * 0.8; // Leftward
        baseVx = Math.cos(angle);
        baseVy = Math.sin(angle);
    } else if (edge === 2) { // Bottom
        x = Math.random() * gameWidth;
        y = gameHeight + 40;
        angle = -Math.PI / 2 + (Math.random() - 0.5) * 0.8; // Upward
        baseVx = Math.cos(angle);
        baseVy = Math.sin(angle);
    } else { // Left
        x = -40;
        y = Math.random() * gameHeight;
        angle = (Math.random() - 0.5) * 0.8; // Rightward
        baseVx = Math.cos(angle);
        baseVy = Math.sin(angle);
    }
    
    // Normalize and scale velocity
    const speed = 2 + Math.random() * 1.5;
    vx = baseVx * speed;
    vy = baseVy * speed;
    
    // Random size variation (0.6x to 1.4x)
    const size = 0.6 + Math.random() * 0.8;
    
    // Initialize position and size using transform (on inner element)
    mosquito.style.transform = `scale(${size})`;
    
    // Add mosquito to container
    mosquitoContainer.appendChild(mosquito);
    
    // Create buzz audio for this mosquito
    const buzzAudio = createBuzzAudio();
    
    // Ensure audio plays after user interaction (game has started)
    if (buzzAudio) {
        // Try to play again now that user has interacted
        buzzAudio.play().catch(err => {
            console.warn('Buzz audio play failed:', err);
        });
    }
    
    // Store mosquito data
    const mosquitoData = {
        element: mosquitoContainer, // Container for larger hitbox
        innerElement: mosquito,    // Inner element for visual
        x: x,
        y: y,
        vx: vx,
        vy: vy,
        targetVx: vx,
        targetVy: vy,
        size: size,
        speedMultiplier: 1, // Multiplier for speed variation
        acceleration: 0.01,
        directionChange: 0,
        directionChangeInterval: 60 + Math.random() * 40,
        floatOffset: Math.random() * Math.PI * 2, // For floating animation
        floatSpeed: 0.05 + Math.random() * 0.05,
        floatAmplitude: 2 + Math.random() * 2,
        buzzAudio: buzzAudio // Audio element for buzz sound
    };
    
    gameState.mosquitoes.push(mosquitoData);
    
    // Click handler on container (larger hit area)
    mosquitoContainer.addEventListener('click', () => killMosquito(mosquitoData));
    mosquitoContainer.addEventListener('touchstart', (e) => {
        e.preventDefault();
        killMosquito(mosquitoData);
    });
    
    gameArea.appendChild(mosquitoContainer);
}

// Update mosquito positions (smooth 60fps updates)
function updateMosquitoes(deltaTime = 1) {
    const gameWidth = gameArea.offsetWidth;
    const gameHeight = gameArea.offsetHeight;
    
    gameState.mosquitoes.forEach((mosquito, index) => {
        // As time passes, add random direction changes and acceleration
        mosquito.directionChange++;
        
        // Smoothly interpolate towards target velocity
        const lerpFactor = 0.05; // Smooth interpolation
        mosquito.vx += (mosquito.targetVx - mosquito.vx) * lerpFactor;
        mosquito.vy += (mosquito.targetVy - mosquito.vy) * lerpFactor;
        
        if (gameState.elapsedTime > 10) {
            // After 10 seconds, start random direction changes
            if (mosquito.directionChange >= mosquito.directionChangeInterval) {
                // Calculate new target direction (smooth change)
                const angle = Math.atan2(mosquito.vy, mosquito.vx);
                const newAngle = angle + (Math.random() - 0.5) * 0.8; // Max 45 degree change
                const speed = Math.sqrt(mosquito.vx * mosquito.vx + mosquito.vy * mosquito.vy);
                
                mosquito.targetVx = Math.cos(newAngle) * speed;
                mosquito.targetVy = Math.sin(newAngle) * speed;
                
                mosquito.directionChange = 0;
                mosquito.directionChangeInterval = 40 + Math.random() * 60;
            }
            
            // Variable speed (acceleration and deceleration)
            if (gameState.elapsedTime > 20) {
                mosquito.speedMultiplier += mosquito.acceleration * deltaTime;
                if (mosquito.speedMultiplier > 2) {
                    mosquito.acceleration = -0.015;
                } else if (mosquito.speedMultiplier < 0.5) {
                    mosquito.acceleration = 0.015;
                }
            }
        }
        
        // Add floating/bobbing effect (natural insect flight)
        mosquito.floatOffset += mosquito.floatSpeed * deltaTime;
        const floatX = Math.sin(mosquito.floatOffset) * mosquito.floatAmplitude;
        const floatY = Math.cos(mosquito.floatOffset * 0.7) * mosquito.floatAmplitude;
        
        // Update position with smooth movement
        const moveSpeed = mosquito.speedMultiplier * deltaTime;
        mosquito.x += mosquito.vx * moveSpeed + floatX * 0.1;
        mosquito.y += mosquito.vy * moveSpeed + floatY * 0.1;
        
        // Check if mosquito reached the other side (remove and lose a life)
        if (mosquito.x < -50 || mosquito.x > gameWidth + 50 || 
            mosquito.y < -50 || mosquito.y > gameHeight + 50) {
            // Stop Lottie animation if it exists
            if (mosquito.innerElement._lottieAnimation) {
                mosquito.innerElement._lottieAnimation.destroy();
            }
            // Stop and cleanup buzz audio
            if (mosquito.buzzAudio) {
                mosquito.buzzAudio.pause();
                mosquito.buzzAudio = null;
            }
            mosquito.element.remove();
            gameState.mosquitoes.splice(index, 1);
            gameState.lives--;
            updateUI();
            
            if (gameState.lives <= 0) {
                endGame();
            }
        } else {
            // Use transform for better performance and smoother movement
            // Position the container, scale the inner element
            mosquito.element.style.transform = `translate(${mosquito.x}px, ${mosquito.y}px)`;
            mosquito.innerElement.style.transform = `scale(${mosquito.size})`;
        }
    });
}

// Kill mosquito
function killMosquito(mosquitoData) {
    if (!gameState.isGameActive) return;
    
    const index = gameState.mosquitoes.indexOf(mosquitoData);
    if (index === -1) return;
    
    // Add kill animation
    mosquitoData.innerElement.classList.add('killed');
    
    // Stop Lottie animation if it exists
    if (mosquitoData.innerElement._lottieAnimation) {
        mosquitoData.innerElement._lottieAnimation.destroy();
    }
    
    // Stop buzz audio
    if (mosquitoData.buzzAudio) {
        mosquitoData.buzzAudio.pause();
        mosquitoData.buzzAudio = null;
    }
    
    // Play kill sound
    playKillSound();
    
    // Create blood drop effect
    createBloodDrop(mosquitoData.x, mosquitoData.y);
    
    // Remove mosquito
    setTimeout(() => {
        mosquitoData.element.remove();
        gameState.mosquitoes.splice(index, 1);
    }, 300);
    
    // Update score
    gameState.score++;
    updateUI();
}

// Create blood drop effect
function createBloodDrop(x, y) {
    const bloodDrop = document.createElement('div');
    bloodDrop.className = 'blood-drop';
    
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('viewBox', '0 0 100 100');
    svg.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
    
    // Main blood drop
    const drop = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    drop.setAttribute('d', 'M50,20 Q45,40 50,60 Q55,40 50,20 Z');
    drop.setAttribute('fill', '#DC143C');
    svg.appendChild(drop);
    
    // Smaller droplets
    for (let i = 0; i < 5; i++) {
        const droplet = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        const angle = (i * 72) * Math.PI / 180;
        const radius = 15 + Math.random() * 10;
        droplet.setAttribute('cx', 50 + Math.cos(angle) * radius);
        droplet.setAttribute('cy', 50 + Math.sin(angle) * radius);
        droplet.setAttribute('r', 3 + Math.random() * 2);
        droplet.setAttribute('fill', '#DC143C');
        svg.appendChild(droplet);
    }
    
    bloodDrop.appendChild(svg);
    bloodDrop.style.left = (x - 15) + 'px';
    bloodDrop.style.top = (y - 15) + 'px';
    
    gameArea.appendChild(bloodDrop);
    
    setTimeout(() => {
        bloodDrop.remove();
    }, 500);
}

// Update UI
function updateUI() {
    scoreEl.textContent = gameState.score;
    heartsEl.textContent = '❤️'.repeat(gameState.lives);
}

// End game
function endGame() {
    gameState.isGameActive = false;
    
    clearInterval(gameState.gameInterval);
    clearTimeout(gameState.spawnInterval);
    cancelAnimationFrame(gameState.animationFrame);
    
    // Remove all mosquitoes
    gameState.mosquitoes.forEach(mosquito => {
        // Stop Lottie animation if it exists
        if (mosquito.innerElement && mosquito.innerElement._lottieAnimation) {
            mosquito.innerElement._lottieAnimation.destroy();
        }
        // Stop buzz audio
        if (mosquito.buzzAudio) {
            mosquito.buzzAudio.pause();
            mosquito.buzzAudio = null;
        }
        mosquito.element.remove();
    });
    gameState.mosquitoes = [];
    
    // Show game end screen
    setTimeout(() => {
        // Update final score
        finalScoreEl.textContent = gameState.score;
        
        // Display leaderboard (placeholder for now)
        displayLeaderboard();
        
        // Hide game screen and show end screen
        gameScreen.classList.add('hidden');
        gameEndScreen.classList.remove('hidden');
    }, 500);
}

// Leaderboard functions
function saveScoreToLeaderboard(name, score) {
    // Get existing leaderboard from localStorage
    let leaderboard = JSON.parse(localStorage.getItem('mosquitoGameLeaderboard') || '[]');
    
    // Add new score
    leaderboard.push({
        name: name,
        score: score,
        date: new Date().toISOString()
    });
    
    // Sort by score (descending)
    leaderboard.sort((a, b) => b.score - a.score);
    
    // Keep only top 10
    leaderboard = leaderboard.slice(0, 10);
    
    // Save back to localStorage
    localStorage.setItem('mosquitoGameLeaderboard', JSON.stringify(leaderboard));
}

function getLeaderboard() {
    return JSON.parse(localStorage.getItem('mosquitoGameLeaderboard') || '[]');
}

// Display leaderboard
function displayLeaderboard() {
    // Save current score to leaderboard
    if (gameState.playerName && gameState.score > 0) {
        saveScoreToLeaderboard(gameState.playerName, gameState.score);
    }
    
    // Clear existing leaderboard
    leaderboardListEl.innerHTML = '';
    
    // Get leaderboard data
    const leaderboardData = getLeaderboard();
    
    if (leaderboardData.length === 0) {
        const emptyState = document.createElement('div');
        emptyState.className = 'leaderboard-empty';
        emptyState.textContent = 'No scores yet. Be the first!';
        leaderboardListEl.appendChild(emptyState);
        return;
    }
    
    // Display leaderboard entries
    leaderboardData.forEach((entry, index) => {
        const item = document.createElement('div');
        item.className = 'leaderboard-item';
        
        // Highlight current player's score
        if (entry.name === gameState.playerName && entry.score === gameState.score) {
            item.style.backgroundColor = '#FFF4E6';
            item.style.borderLeftColor = '#FFA500';
        }
        
        item.innerHTML = `
            <span class="leaderboard-rank">${index + 1}</span>
            <span class="leaderboard-name">${entry.name}</span>
            <span class="leaderboard-score">${entry.score}</span>
        `;
        leaderboardListEl.appendChild(item);
    });
}

