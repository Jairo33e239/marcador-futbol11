// Variables globales
let timerInterval = null;
let seconds = 0;
let isTimerRunning = false;
let editMode = true;

// Inicialización
document.addEventListener('DOMContentLoaded', function() {
    loadFromLocalStorage();
    updateTimeDisplay();
    
    // Ocultar controles en pantallas pequeñas
    if (window.innerWidth <= 768) {
        document.getElementById('controlsPanel').classList.add('hidden');
        document.getElementById('floatingBtn').style.display = 'flex';
    }
});

// Función para actualizar el marcador
function updateScore(team, change) {
    const scoreElement = document.getElementById(`score-${team}`);
    let currentScore = parseInt(scoreElement.textContent);
    currentScore += change;
    
    if (currentScore < 0) currentScore = 0;
    if (currentScore > 99) currentScore = 99;
    
    scoreElement.textContent = currentScore;
    saveToLocalStorage();
}

// Función para cambiar logos
function changeLogo(team) {
    const inputId = `logo-${team}-input`;
    document.getElementById(inputId).click();
}

function uploadLogo(team, input) {
    const file = input.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            const logoId = team === 'local' ? 'escudo-local' : 'escudo-visitante';
            document.getElementById(logoId).src = e.target.result;
            saveToLocalStorage();
        };
        reader.readAsDataURL(file);
    }
}

// Control del temporizador
function controlTime(action) {
    switch(action) {
        case 'start':
            if (!isTimerRunning) {
                isTimerRunning = true;
                timerInterval = setInterval(() => {
                    seconds++;
                    updateTimeDisplay();
                }, 1000);
            }
            break;
            
        case 'pause':
            isTimerRunning = false;
            clearInterval(timerInterval);
            break;
            
        case 'reset':
            isTimerRunning = false;
            clearInterval(timerInterval);
            seconds = 0;
            updateTimeDisplay();
            break;
    }
}

function updateTimeDisplay() {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    let timeString = '';
    if (hours > 0) {
        timeString = `${hours.toString().padStart(2, '0')}:`;
    }
    timeString += `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    
    document.getElementById('time').textContent = timeString;
}

// Cambiar color del marcador
function changeColor(color) {
    document.getElementById('scoreboard').style.borderColor = color;
    document.getElementById('controlsPanel').style.borderColor = color;
    
    // Aplicar gradiente basado en el color
    const scoreElements = document.querySelectorAll('.score');
    scoreElements.forEach(score => {
        score.style.background = `linear-gradient(135deg, ${color} 0%, ${adjustColor(color, -30)} 100%)`;
        score.style.webkitBackgroundClip = 'text';
    });
    
    saveToLocalStorage();
}

function adjustColor(color, amount) {
    let usePound = false;
    if (color[0] === "#") {
        color = color.slice(1);
        usePound = true;
    }
    
    let num = parseInt(color, 16);
    let r = (num >> 16) + amount;
    let b = ((num >> 8) & 0x00FF) + amount;
    let g = (num & 0x0000FF) + amount;
    
    r = Math.min(Math.max(0, r), 255);
    g = Math.min(Math.max(0, g), 255);
    b = Math.min(Math.max(0, b), 255);
    
    return (usePound ? "#" : "") + (g | (b << 8) | (r << 16)).toString(16).padStart(6, '0');
}

// Cambiar estilo del marcador
function changeStyle(style) {
    const scoreboard = document.getElementById('scoreboard');
    scoreboard.className = 'scoreboard';
    
    if (style !== 'default') {
        scoreboard.classList.add(style);
    }
    
    saveToLocalStorage();
}

// Guardar/Cargar configuración
function saveToLocalStorage() {
    const config = {
        local: {
            name: document.getElementById('nombre-local').value,
            score: document.getElementById('score-local').textContent,
            logo: document.getElementById('escudo-local').src
        },
        visitor: {
            name: document.getElementById('nombre-visitante').value,
            score: document.getElementById('score-visitor').textContent,
            logo: document.getElementById('escudo-visitante').src
        },
        time: seconds,
        isTimerRunning: isTimerRunning,
        color: document.getElementById('color-picker').value,
        style: document.getElementById('style-selector').value
    };
    
    localStorage.setItem('scoreboardConfig', JSON.stringify(config));
}

function loadFromLocalStorage() {
    const saved = localStorage.getItem('scoreboardConfig');
    if (saved) {
        const config = JSON.parse(saved);
        
        // Cargar datos de equipos
        document.getElementById('nombre-local').value = config.local.name;
        document.getElementById('score-local').textContent = config.local.score;
        document.getElementById('escudo-local').src = config.local.logo;
        
        document.getElementById('nombre-visitante').value = config.visitor.name;
        document.getElementById('score-visitor').textContent = config.visitor.score;
        document.getElementById('escudo-visitante').src = config.visitor.logo;
        
        // Cargar tiempo
        seconds = config.time || 0;
        isTimerRunning = config.isTimerRunning || false;
        updateTimeDisplay();
        
        // Cargar estilo
        if (config.color) {
            document.getElementById('color-picker').value = config.color;
            changeColor(config.color);
        }
        
        if (config.style) {
            document.getElementById('style-selector').value = config.style;
            changeStyle(config.style);
        }
    }
}

function saveConfig() {
    saveToLocalStorage();
    alert('Configuración guardada exitosamente!');
}

function loadConfig() {
    loadFromLocalStorage();
    alert('Configuración cargada exitosamente!');
}

function resetAll() {
    if (confirm('¿Estás seguro de querer resetear todo?')) {
        localStorage.removeItem('scoreboardConfig');
        location.reload();
    }
}

// Alternar modo edición
function toggleEditMode() {
    const controlsPanel = document.getElementById('controlsPanel');
    const floatingBtn = document.getElementById('floatingBtn');
    
    if (window.innerWidth <= 768) {
        controlsPanel.classList.toggle('hidden');
        floatingBtn.style.display = controlsPanel.classList.contains('hidden') ? 'flex' : 'none';
    } else {
        editMode = !editMode;
        controlsPanel.classList.toggle('hidden', !editMode);
    }
}

// Guardar automáticamente cuando se editan los nombres
document.querySelectorAll('.team-name').forEach(input => {
    input.addEventListener('input', saveToLocalStorage);
});

// Guardar cuando se cambia el estilo
document.getElementById('style-selector').addEventListener('change', function() {
    changeStyle(this.value);
    saveToLocalStorage();
});