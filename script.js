const contentLibrary = {
    beginner: [
        "The quick brown fox jumps over the lazy dog.",
        "Practice makes perfect when learning to type quickly and accurately.",
        "Typing is an essential skill in today's digital workplace environment.",
        "Keep your fingers on the home row for optimal typing efficiency.",
        "Accuracy is more important than speed when first learning to type."
    ],
    intermediate: [
        "Effective communication skills are crucial for professional success in any career field.",
        "The modern workplace demands proficiency with various digital tools and technologies.",
        "Time management and organizational skills significantly impact productivity levels.",
        "Continuous learning and skill development are key to career advancement opportunities.",
        "Team collaboration often requires clear, concise written communication methods."
    ],
    advanced: [
        "According to recent productivity studies, the average professional spends approximately 28% of their workday reading and responding to emails.",
        "Research indicates that touch typing can increase productivity by up to 40% compared to hunt-and-peck methods.",
        "The global digital transformation has accelerated the need for workforce upskilling in technical competencies.",
        "Ergonomic workplace setups have been shown to reduce repetitive strain injuries by significant margins.",
        "Cognitive studies suggest that proper typing technique reduces mental fatigue during extended computer use."
    ]
};

// DOM Elements
const gameContainer = document.getElementById('game-container');
const themeToggle = document.getElementById('theme-toggle');
const body = document.body;

const sentenceDisplay = document.getElementById('sentence-display');
const textInput = document.getElementById('text-input');
const progressBar = document.getElementById('progress-bar');
const wpmStat = document.getElementById('wpm-stat');
const accuracyStat = document.getElementById('accuracy-stat');
const timeStat = document.getElementById('time-stat');
const scoreStat = document.getElementById('score-stat');
const startBtn = document.getElementById('start-btn');
const resetBtn = document.getElementById('reset-btn');
const levelBtns = document.querySelectorAll('.difficulty-tab');

const resultsModal = document.getElementById('results-modal');
const resultWpm = document.getElementById('result-wpm');
const resultAccuracy = document.getElementById('result-accuracy');
const resultTime = document.getElementById('result-time');
const resultScore = document.getElementById('result-score');
const closeModalBtn = document.getElementById('close-modal-btn');
const tryAgainBtn = document.getElementById('try-again-btn');

// Game Variables
let currentLevel = 'beginner';
let testActive = false;
let startTime;
let timerInterval;
let currentSentence = '';
let correctChars = 0;
let totalTyped = 0;

// Initialize the application
function init() {
    gameContainer.style.display = 'flex';
    
    // Set up event listeners
    setupEventListeners();
}

// Set up event listeners
function setupEventListeners() {
    // Theme toggle
    themeToggle.addEventListener('click', toggleTheme);
    
    // Change level
    levelBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            levelBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentLevel = btn.dataset.level;
            resetTest();
        });
    });

    // Start test
    startBtn.addEventListener('click', startTest);

    // Reset test
    resetBtn.addEventListener('click', resetTest);

    // Handle typing input
    textInput.addEventListener('input', handleTyping);

    // Close results modal
    closeModalBtn.addEventListener('click', () => {
        resultsModal.classList.remove('active');
        resetTest();
    });

    // Try again button
    tryAgainBtn.addEventListener('click', () => {
        resultsModal.classList.remove('active');
        resetTest();
        startBtn.click();
    });
}

// Toggle theme
function toggleTheme() {
    body.classList.toggle('dark-theme');
    const isDark = body.classList.contains('dark-theme');
    themeToggle.innerHTML = isDark ? '<i class="fas fa-sun"></i>' : '<i class="fas fa-moon"></i>';
}

// Start test
function startTest() {
    if (testActive) return;
    
    // Get random sentence
    const sentences = contentLibrary[currentLevel];
    currentSentence = sentences[Math.floor(Math.random() * sentences.length)];
    
    // Display sentence with spans
    displaySentence();
    
    // Enable input
    textInput.disabled = false;
    textInput.value = '';
    textInput.focus();
    
    // Reset progress bar
    progressBar.style.width = '0%';
    
    // Start timer
    startTime = new Date();
    timerInterval = setInterval(updateStats, 100);
    
    // Update UI
    testActive = true;
    startBtn.innerHTML = '<i class="fas fa-running"></i> Test in Progress...';
    startBtn.disabled = true;
    resetBtn.disabled = false;
}

// Display sentence with spans
function displaySentence() {
    sentenceDisplay.innerHTML = '';
    currentSentence.split('').forEach(char => {
        const span = document.createElement('span');
        span.textContent = char;
        sentenceDisplay.appendChild(span);
    });
}

// Update stats during test
function updateStats() {
    const currentTime = new Date();
    const elapsedSeconds = (currentTime - startTime) / 1000;
    
    // Update time
    timeStat.textContent = `${elapsedSeconds.toFixed(1)}s`;
    
    // Calculate WPM (5 chars = 1 word)
    const words = totalTyped / 5;
    const minutes = elapsedSeconds / 60;
    const wpm = Math.round(words / minutes) || 0;
    wpmStat.textContent = wpm;
    
    // Calculate accuracy
    const accuracy = totalTyped > 0 ? Math.round((correctChars / totalTyped) * 100) : 0;
    accuracyStat.textContent = `${accuracy}%`;
    
    // Calculate score
    const score = Math.round(wpm * accuracy / 100);
    scoreStat.textContent = score;
    
    // Update progress bar
    const progress = (totalTyped / currentSentence.length) * 100;
    progressBar.style.width = `${progress}%`;
}

// Handle typing input
function handleTyping(e) {
    const typedText = textInput.value;
    const sentenceSpans = sentenceDisplay.querySelectorAll('span');
    
    correctChars = 0;
    totalTyped = typedText.length;
    
    sentenceSpans.forEach((span, index) => {
        // Reset classes
        span.classList.remove('correct', 'incorrect', 'current');
        
        const typedChar = typedText[index];
        
        if (typedChar === undefined) {
            // Mark current position
            if (index === typedText.length) {
                span.classList.add('current');
            }
        } else if (typedChar === span.textContent) {
            span.classList.add('correct');
            correctChars++;
        } else {
            span.classList.add('incorrect');
        }
    });
    
    // Check if test is complete
    if (typedText.length === currentSentence.length) {
        finishTest();
    }
}

// Finish test
function finishTest() {
    clearInterval(timerInterval);
    testActive = false;
    
    const endTime = new Date();
    const elapsedSeconds = (endTime - startTime) / 1000;
    
    // Calculate final stats
    const words = currentSentence.length / 5;
    const minutes = elapsedSeconds / 60;
    const wpm = Math.round(words / minutes);
    const accuracy = Math.round((correctChars / currentSentence.length) * 100);
    const score = Math.round(wpm * accuracy / 100);
    
    // Show results
    showResults(wpm, accuracy, elapsedSeconds.toFixed(1), score);
}

// Show results modal
function showResults(wpm, accuracy, time, score) {
    resultWpm.textContent = wpm;
    resultAccuracy.textContent = `${accuracy}%`;
    resultTime.textContent = `${time}s`;
    resultScore.textContent = score;
    
    // Show modal
    resultsModal.classList.add('active');
    
    // Disable text input
    textInput.disabled = true;
}

// Reset test
function resetTest() {
    clearInterval(timerInterval);
    testActive = false;
    
    sentenceDisplay.textContent = 'Click "Start Test" to begin your typing assessment.';
    textInput.value = '';
    textInput.disabled = true;
    
    wpmStat.textContent = '0';
    accuracyStat.textContent = '0%';
    timeStat.textContent = '0s';
    scoreStat.textContent = '0';
    
    progressBar.style.width = '0%';
    
    startBtn.innerHTML = '<i class="fas fa-play"></i> Start Test';
    startBtn.disabled = false;
    resetBtn.disabled = true;
}

// Initialize the app
init();
