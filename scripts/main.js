/* ═══════════════════════════════════════════════════════════════════════════
   PATELARYAN.COM - Main JavaScript
   Glitch effects, scroll reveal, AI Twin chat, Command Palette, Keyboard Nav
   ═══════════════════════════════════════════════════════════════════════════ */

// ═══════════════════════════════════════════════════════════════════════════
// GLITCH TEXT EFFECT
// ═══════════════════════════════════════════════════════════════════════════
const asciiTitle = document.getElementById('ascii-title');
const glitchChars = "█▓▒░╔╗╚╝║═╠╣╦╩╬▀▄■□●○◘◙♦♣♠•";

function createGlitchEffect(element) {
    if (!element) return;

    const originalHTML = element.innerHTML;
    const textContent = element.textContent;
    let iterations = 0;

    const interval = setInterval(() => {
        const glitchedText = textContent.split('').map((char, index) => {
            if (char === '\n' || char === ' ') return char;
            if (index < iterations) return textContent[index];
            return glitchChars[Math.floor(Math.random() * glitchChars.length)];
        }).join('');

        if (iterations >= textContent.length) {
            clearInterval(interval);
            element.innerHTML = originalHTML;
            return;
        }

        element.textContent = glitchedText;
        iterations += 3;
    }, 30);
}

// Trigger glitch on hover
if (asciiTitle) {
    asciiTitle.addEventListener('mouseenter', () => createGlitchEffect(asciiTitle));
    // Initial glitch effect on page load
    setTimeout(() => createGlitchEffect(asciiTitle), 800);
}

// ═══════════════════════════════════════════════════════════════════════════
// SCROLL REVEAL ANIMATION
// ═══════════════════════════════════════════════════════════════════════════
const observerOptions = {
    threshold: 0.1,
    rootMargin: "0px 0px -50px 0px"
};

const scrollObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry, index) => {
        if (entry.isIntersecting) {
            setTimeout(() => {
                entry.target.classList.add('is-visible');
            }, index * 100);
            scrollObserver.unobserve(entry.target);
        }
    });
}, observerOptions);

document.querySelectorAll('.reveal-on-scroll').forEach(el => {
    scrollObserver.observe(el);
});

// ═══════════════════════════════════════════════════════════════════════════
// CURRENTLY READING (Fetches from /data/reading.json)
// ═══════════════════════════════════════════════════════════════════════════
async function fetchCurrentlyReading() {
    const quoteEl = document.querySelector('.reading-quote');
    const sourceEl = document.querySelector('.reading-source');

    if (!quoteEl || !sourceEl) return;

    try {
        const response = await fetch('./data/reading.json');
        if (!response.ok) throw new Error('Failed to fetch reading data');
        const data = await response.json();

        quoteEl.textContent = `"${data.quote}"`;
        sourceEl.textContent = `— ${data.source} by ${data.author}`;
    } catch (error) {
        console.warn('Failed to fetch reading data:', error);
        // Keep default content on error
    }
}

// ═══════════════════════════════════════════════════════════════════════════
// NOW PLAYING (Fetches from /data/now-playing.json)
// ═══════════════════════════════════════════════════════════════════════════
async function updateNowPlaying() {
    const playerCard = document.getElementById('now-playing');
    const trackEl = document.getElementById('np-track');
    const artistEl = document.getElementById('np-artist');
    const artEl = document.getElementById('np-art');
    const timeEl = document.getElementById('np-time');

    if (!trackEl || !artistEl || !artEl || !timeEl) return;

    try {
        const response = await fetch('./data/now-playing.json');
        if (!response.ok) throw new Error('Failed to fetch now playing data');
        const data = await response.json();

        trackEl.textContent = data.track;
        artistEl.textContent = data.artist;
        timeEl.textContent = data.isPlaying ? '♫ Now Playing' : data.album || 'Last played';

        // Only update art if album art URL is provided
        if (data.albumArt) {
            artEl.src = data.albumArt;
            artEl.onerror = () => {
                artEl.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100'%3E%3Crect fill='%23111' width='100' height='100'/%3E%3Ctext x='50' y='55' text-anchor='middle' fill='%23333' font-size='20'%3E♫%3C/text%3E%3C/svg%3E";
            };
        }

        // Make card clickable if link is provided
        if (data.link && playerCard) {
            playerCard.style.cursor = 'pointer';
            playerCard.title = 'Click to open';
            playerCard.onclick = () => window.open(data.link, '_blank');
        }
    } catch (error) {
        console.warn('Failed to fetch now playing data:', error);
        // Show fallback content
        trackEl.textContent = 'Offline Mode';
        artistEl.textContent = 'Music data unavailable';
        timeEl.textContent = '';
    }
}

// Lazy load album art
function lazyLoadImages() {
    const images = document.querySelectorAll('img[data-src]');
    const imageObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                img.src = img.dataset.src;
                img.removeAttribute('data-src');
                imageObserver.unobserve(img);
            }
        });
    });
    images.forEach(img => imageObserver.observe(img));
}

// Fetch data on page load
fetchCurrentlyReading();
setTimeout(updateNowPlaying, 500);
lazyLoadImages();

// ═══════════════════════════════════════════════════════════════════════════
// GITHUB LAST COMMIT (Currently Building)
// ═══════════════════════════════════════════════════════════════════════════
const GITHUB_USERNAME = 'aryanxpatel';

function timeAgo(date) {
    const seconds = Math.floor((new Date() - date) / 1000);
    const intervals = [
        { label: 'year', seconds: 31536000 },
        { label: 'month', seconds: 2592000 },
        { label: 'week', seconds: 604800 },
        { label: 'day', seconds: 86400 },
        { label: 'hour', seconds: 3600 },
        { label: 'minute', seconds: 60 }
    ];
    for (const interval of intervals) {
        const count = Math.floor(seconds / interval.seconds);
        if (count >= 1) {
            return `${count} ${interval.label}${count > 1 ? 's' : ''} ago`;
        }
    }
    return 'just now';
}

async function fetchLastGitHubCommit() {
    const repoEl = document.getElementById('commit-repo');
    const messageEl = document.getElementById('commit-message');
    const timeEl = document.getElementById('commit-time');
    const statusEl = document.getElementById('commit-status');

    if (!repoEl || !messageEl || !timeEl || !statusEl) return;

    try {
        // Fetch user's recent events (includes push events with commits)
        const eventsResponse = await fetch(`https://api.github.com/users/${GITHUB_USERNAME}/events/public?per_page=30`);

        if (!eventsResponse.ok) {
            throw new Error('Failed to fetch GitHub events');
        }

        const events = await eventsResponse.json();

        // Find the most recent PushEvent with commits
        const pushEvent = events.find(event => event.type === 'PushEvent' && event.payload.commits?.length > 0);

        if (pushEvent) {
            const commit = pushEvent.payload.commits[pushEvent.payload.commits.length - 1]; // Last commit in the push
            const repoName = pushEvent.repo.name.split('/')[1]; // Get repo name without username
            const commitDate = new Date(pushEvent.created_at);
            const commitUrl = `https://github.com/${pushEvent.repo.name}/commit/${commit.sha}`;

            repoEl.innerHTML = `<a href="https://github.com/${pushEvent.repo.name}" target="_blank" rel="noopener">${repoName}</a>`;
            messageEl.textContent = commit.message.split('\n')[0].substring(0, 80) + (commit.message.length > 80 ? '...' : '');
            timeEl.innerHTML = `<a href="${commitUrl}" target="_blank" rel="noopener">📍 ${timeAgo(commitDate)}</a>`;
            statusEl.textContent = 'LAST COMMIT';
        } else {
            // Fallback: Try to get commits from a specific repo
            const reposResponse = await fetch(`https://api.github.com/users/${GITHUB_USERNAME}/repos?sort=updated&per_page=1`);

            if (reposResponse.ok) {
                const repos = await reposResponse.json();
                if (repos.length > 0) {
                    const latestRepo = repos[0];
                    const commitsResponse = await fetch(`https://api.github.com/repos/${GITHUB_USERNAME}/${latestRepo.name}/commits?per_page=1`);

                    if (commitsResponse.ok) {
                        const commits = await commitsResponse.json();
                        if (commits.length > 0) {
                            const latestCommit = commits[0];
                            const commitDate = new Date(latestCommit.commit.author.date);

                            repoEl.innerHTML = `<a href="${latestRepo.html_url}" target="_blank" rel="noopener">${latestRepo.name}</a>`;
                            messageEl.textContent = latestCommit.commit.message.split('\n')[0].substring(0, 80);
                            timeEl.innerHTML = `<a href="${latestCommit.html_url}" target="_blank" rel="noopener">📍 ${timeAgo(commitDate)}</a>`;
                            statusEl.textContent = 'LAST COMMIT';
                            return;
                        }
                    }
                }
            }

            // If all else fails, show a fallback
            repoEl.textContent = 'Local-First Apps';
            messageEl.textContent = 'Exploring offline-capable, user-owned software patterns.';
            timeEl.textContent = '';
            statusEl.textContent = 'IN PROGRESS';
        }
    } catch (error) {
        console.warn('Failed to fetch GitHub commits:', error);
        // Fallback content
        repoEl.textContent = 'Local-First Apps';
        messageEl.textContent = 'Exploring offline-capable, user-owned software patterns.';
        timeEl.textContent = '';
        statusEl.textContent = 'IN PROGRESS';
    }
}

// Fetch GitHub commit info on page load
fetchLastGitHubCommit();

// ═══════════════════════════════════════════════════════════════════════════
// AI TWIN CHAT (Gemini API Integration)
// ═══════════════════════════════════════════════════════════════════════════
const chatForm = document.getElementById('chat-form');
const chatInput = document.getElementById('chat-input');
const chatMessages = document.getElementById('chat-messages');

// Conversation history for context
let conversationHistory = [];
let messageCount = 0;
const MAX_MESSAGES_PER_SESSION = 30;
let isWaitingForResponse = false;

// Fallback responses when API is unavailable
const fallbackResponses = {
    default: "I'm Aryan's AI twin. I can tell you about his projects, skills, or how to get in touch. What would you like to know?",
    projects: "Aryan has built Monolith (local-first notes), AiThena (AI study copilot), and several Shopify stores. Which one interests you?",
    skills: "Aryan works with Next.js, Node.js, and is currently learning Java and Python. Also experienced with Shopify development.",
    contact: "You can reach Aryan at offaryanpatel@gmail.com or connect on LinkedIn/GitHub/Twitter @aryanxpatel"
};

function getFallbackResponse(message) {
    const lower = message.toLowerCase();
    if (lower.includes('project') || lower.includes('built') || lower.includes('work')) return fallbackResponses.projects;
    if (lower.includes('skill') || lower.includes('tech') || lower.includes('stack') || lower.includes('know')) return fallbackResponses.skills;
    if (lower.includes('contact') || lower.includes('email') || lower.includes('reach') || lower.includes('hire')) return fallbackResponses.contact;
    return fallbackResponses.default;
}

function addMessage(text, isUser = false, isTyping = false) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `chat-message ${isUser ? 'user' : 'bot'}${isTyping ? ' typing' : ''}`;

    if (isTyping) {
        messageDiv.innerHTML = `<span class="chat-text"><span class="typing-dots">...</span></span>`;
        messageDiv.id = 'typing-indicator';
    } else {
        // Escape HTML but preserve line breaks
        const escapedText = text.replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/\n/g, '<br>');
        messageDiv.innerHTML = `<span class="chat-text">${escapedText}</span>`;
    }

    chatMessages.appendChild(messageDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
    return messageDiv;
}

function removeTypingIndicator() {
    const indicator = document.getElementById('typing-indicator');
    if (indicator) indicator.remove();
}

async function sendToGemini(message) {
    try {
        const response = await fetch('/api/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                message,
                history: conversationHistory.slice(-10) // Last 10 messages for context
            })
        });

        if (!response.ok) {
            throw new Error('API request failed');
        }

        const data = await response.json();
        return data.response;
    } catch (error) {
        console.warn('Gemini API error, using fallback:', error);
        return null;
    }
}

async function handleChatSubmit(e) {
    e.preventDefault();

    if (isWaitingForResponse) return;

    const message = chatInput.value.trim();
    if (!message) return;

    // Rate limiting
    if (messageCount >= MAX_MESSAGES_PER_SESSION) {
        addMessage("Session limit reached. Refresh the page to continue chatting.", false);
        return;
    }

    // Add user message
    addMessage(message, true);
    chatInput.value = '';
    messageCount++;

    // Add to history
    conversationHistory.push({ role: 'user', content: message });

    // Show typing indicator
    isWaitingForResponse = true;
    chatInput.disabled = true;
    addMessage('', false, true);

    // Try Gemini API first, fallback if it fails
    let response = await sendToGemini(message);

    if (!response) {
        response = getFallbackResponse(message);
    }

    // Remove typing indicator and show response
    removeTypingIndicator();
    addMessage(response, false);

    // Add to history
    conversationHistory.push({ role: 'assistant', content: response });

    isWaitingForResponse = false;
    chatInput.disabled = false;
    chatInput.focus();
}

if (chatForm) {
    chatForm.addEventListener('submit', handleChatSubmit);
}

// ═══════════════════════════════════════════════════════════════════════════
// MARQUEE DUPLICATE FOR SEAMLESS LOOP
// ═══════════════════════════════════════════════════════════════════════════
const marqueeContent = document.querySelector('.marquee-content');
if (marqueeContent) {
    marqueeContent.innerHTML = marqueeContent.innerHTML + ' // ' + marqueeContent.innerHTML;
}

// ═══════════════════════════════════════════════════════════════════════════
// COMMAND PALETTE (Ctrl+K)
// ═══════════════════════════════════════════════════════════════════════════
const cmdPalette = document.getElementById('command-palette');
const cmdInput = document.getElementById('cmd-input');
const cmdResults = document.getElementById('cmd-results');
const cmdItems = cmdResults ? cmdResults.querySelectorAll('.cmd-item') : [];
let cmdActiveIndex = 0;

const cmdActions = {
    projects: () => document.getElementById('projects')?.scrollIntoView({ behavior: 'smooth' }),
    stores: () => document.getElementById('stores')?.scrollIntoView({ behavior: 'smooth' }),
    links: () => document.getElementById('links')?.scrollIntoView({ behavior: 'smooth' }),
    github: () => window.open('https://github.com/aryanxpatel', '_blank'),
    email: () => window.location.href = 'mailto:offaryanpatel@gmail.com',
    crt: () => toggleCRT(),
    monolith: () => window.open('https://monolith.patelaryan.com', '_blank')
};

function toggleCommandPalette(show) {
    if (!cmdPalette) return;
    if (show) {
        cmdPalette.classList.remove('hidden');
        cmdInput.value = '';
        cmdInput.focus();
        cmdActiveIndex = 0;
        updateCmdActive();
        filterCmdItems('');
    } else {
        cmdPalette.classList.add('hidden');
    }
}

function updateCmdActive() {
    const visibleItems = [...cmdItems].filter(item => !item.classList.contains('hidden-item'));
    visibleItems.forEach((item, index) => {
        item.classList.toggle('active', index === cmdActiveIndex);
    });
}

function filterCmdItems(query) {
    const lowerQuery = query.toLowerCase();
    let visibleCount = 0;
    cmdItems.forEach(item => {
        const text = item.textContent.toLowerCase();
        const matches = text.includes(lowerQuery);
        item.classList.toggle('hidden-item', !matches);
        if (!matches) item.style.display = 'none';
        else {
            item.style.display = '';
            visibleCount++;
        }
    });
    cmdActiveIndex = 0;
    updateCmdActive();
}

function executeCmdAction() {
    const visibleItems = [...cmdItems].filter(item => !item.classList.contains('hidden-item'));
    const activeItem = visibleItems[cmdActiveIndex];
    if (activeItem) {
        const action = activeItem.dataset.action;
        if (cmdActions[action]) {
            cmdActions[action]();
            toggleCommandPalette(false);
        }
    }
}

if (cmdInput) {
    cmdInput.addEventListener('input', (e) => filterCmdItems(e.target.value));
}

if (cmdResults) {
    cmdItems.forEach((item, index) => {
        item.addEventListener('click', () => {
            cmdActiveIndex = index;
            executeCmdAction();
        });
        item.addEventListener('mouseenter', () => {
            cmdActiveIndex = [...cmdItems].filter(i => !i.classList.contains('hidden-item')).indexOf(item);
            updateCmdActive();
        });
    });
}

// ═══════════════════════════════════════════════════════════════════════════
// CRT TOGGLE
// ═══════════════════════════════════════════════════════════════════════════
let crtEnabled = true;
const scanlines = document.querySelector('.scanlines');

function toggleCRT() {
    crtEnabled = !crtEnabled;
    if (scanlines) {
        scanlines.style.display = crtEnabled ? '' : 'none';
    }
    document.querySelector('.frame').style.animation = crtEnabled ? 'flicker 8s infinite' : 'none';
    showNotification(crtEnabled ? 'CRT Effect: ON' : 'CRT Effect: OFF');
}

// ═══════════════════════════════════════════════════════════════════════════
// KEYBOARD NAVIGATION
// ═══════════════════════════════════════════════════════════════════════════
const projectCards = document.querySelectorAll('.project-card');
let currentCardIndex = -1;
let keyboardModeActive = false;
let keyboardIndicatorTimeout;

// Create keyboard mode indicator
const keyboardIndicator = document.createElement('div');
keyboardIndicator.className = 'keyboard-mode-indicator';
keyboardIndicator.innerHTML = '<kbd>J</kbd>/<kbd>K</kbd> Navigate • <kbd>Enter</kbd> Open • <kbd>Ctrl+K</kbd> Commands';
document.body.appendChild(keyboardIndicator);

function showKeyboardIndicator() {
    keyboardIndicator.classList.add('visible');
    clearTimeout(keyboardIndicatorTimeout);
    keyboardIndicatorTimeout = setTimeout(() => {
        keyboardIndicator.classList.remove('visible');
    }, 3000);
}

function updateCardFocus() {
    projectCards.forEach((card, index) => {
        card.classList.toggle('keyboard-focus', index === currentCardIndex);
    });
    if (currentCardIndex >= 0 && projectCards[currentCardIndex]) {
        projectCards[currentCardIndex].scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
}

function showNotification(message) {
    const notif = document.createElement('div');
    notif.className = 'keyboard-mode-indicator visible';
    notif.textContent = message;
    notif.style.bottom = '60px';
    document.body.appendChild(notif);
    setTimeout(() => {
        notif.classList.remove('visible');
        setTimeout(() => notif.remove(), 300);
    }, 2000);
}

// ═══════════════════════════════════════════════════════════════════════════
// GLOBAL KEYBOARD HANDLER
// ═══════════════════════════════════════════════════════════════════════════
document.addEventListener('keydown', (e) => {
    const cmdPaletteOpen = cmdPalette && !cmdPalette.classList.contains('hidden');
    const isTyping = ['INPUT', 'TEXTAREA'].includes(document.activeElement.tagName);

    // Command palette controls
    if (cmdPaletteOpen) {
        if (e.key === 'Escape') {
            toggleCommandPalette(false);
            e.preventDefault();
        } else if (e.key === 'ArrowDown') {
            const visibleItems = [...cmdItems].filter(item => !item.classList.contains('hidden-item'));
            cmdActiveIndex = (cmdActiveIndex + 1) % visibleItems.length;
            updateCmdActive();
            e.preventDefault();
        } else if (e.key === 'ArrowUp') {
            const visibleItems = [...cmdItems].filter(item => !item.classList.contains('hidden-item'));
            cmdActiveIndex = (cmdActiveIndex - 1 + visibleItems.length) % visibleItems.length;
            updateCmdActive();
            e.preventDefault();
        } else if (e.key === 'Enter') {
            executeCmdAction();
            e.preventDefault();
        }
        return;
    }

    // Toggle command palette
    if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        toggleCommandPalette(true);
        e.preventDefault();
        return;
    }

    // Skip if typing in input
    if (isTyping) return;

    // Section jump shortcuts
    if (e.key === '1') {
        document.getElementById('projects')?.scrollIntoView({ behavior: 'smooth' });
        showNotification('→ Projects');
    } else if (e.key === '2') {
        document.getElementById('stores')?.scrollIntoView({ behavior: 'smooth' });
        showNotification('→ Shopify Stores');
    } else if (e.key === '3') {
        document.getElementById('links')?.scrollIntoView({ behavior: 'smooth' });
        showNotification('→ Links');
    }

    // Vim-style navigation
    if (e.key === 'j' || e.key === 'J') {
        currentCardIndex = Math.min(currentCardIndex + 1, projectCards.length - 1);
        updateCardFocus();
        showKeyboardIndicator();
        e.preventDefault();
    } else if (e.key === 'k' || e.key === 'K') {
        currentCardIndex = Math.max(currentCardIndex - 1, 0);
        updateCardFocus();
        showKeyboardIndicator();
        e.preventDefault();
    } else if (e.key === 'Enter' && currentCardIndex >= 0) {
        const card = projectCards[currentCardIndex];
        if (card && card.href) window.open(card.href, '_blank');
    } else if (e.key === 'g') {
        window.scrollTo({ top: 0, behavior: 'smooth' });
        currentCardIndex = -1;
        updateCardFocus();
    } else if (e.key === 'G') {
        window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
    }

    // Quick shortcuts
    if (e.key === '?') {
        toggleCommandPalette(true);
    }
});

// Click to reset keyboard focus
document.addEventListener('click', () => {
    currentCardIndex = -1;
    updateCardFocus();
});

// ═══════════════════════════════════════════════════════════════════════════
// EASTER EGGS
// ═══════════════════════════════════════════════════════════════════════════
let konamiCode = [];
const konamiSequence = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a'];

document.addEventListener('keydown', (e) => {
    konamiCode.push(e.key);
    konamiCode = konamiCode.slice(-10);

    if (konamiCode.join(',') === konamiSequence.join(',')) {
        document.body.style.animation = 'hueRotate 2s infinite';
        showNotification('🎮 KONAMI CODE ACTIVATED!');
        setTimeout(() => {
            document.body.style.animation = '';
        }, 5000);
    }
});

// Matrix rain easter egg (type "matrix")
let matrixBuffer = '';
document.addEventListener('keydown', (e) => {
    if (['INPUT', 'TEXTAREA'].includes(document.activeElement.tagName)) return;
    matrixBuffer += e.key;
    matrixBuffer = matrixBuffer.slice(-6);
    if (matrixBuffer === 'matrix') {
        activateMatrixRain();
    }
});

function activateMatrixRain() {
    showNotification('🟢 ENTERING THE MATRIX...');
    const canvas = document.createElement('canvas');
    canvas.id = 'matrix-rain';
    canvas.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;z-index:10001;pointer-events:none;';
    document.body.appendChild(canvas);

    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const chars = 'PATELARYAN01アイウエオカキクケコサシスセソ';
    const fontSize = 14;
    const columns = canvas.width / fontSize;
    const drops = Array(Math.floor(columns)).fill(1);

    function draw() {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = '#00ff88';
        ctx.font = fontSize + 'px monospace';

        for (let i = 0; i < drops.length; i++) {
            const text = chars[Math.floor(Math.random() * chars.length)];
            ctx.fillText(text, i * fontSize, drops[i] * fontSize);
            if (drops[i] * fontSize > canvas.height && Math.random() > 0.975) {
                drops[i] = 0;
            }
            drops[i]++;
        }
    }

    const matrixInterval = setInterval(draw, 35);
    setTimeout(() => {
        clearInterval(matrixInterval);
        canvas.remove();
    }, 5000);
}

// Add the hue rotate keyframes dynamically
const style = document.createElement('style');
style.textContent = `
    @keyframes hueRotate {
        0% { filter: hue-rotate(0deg); }
        100% { filter: hue-rotate(360deg); }
    }
    .hidden-item { display: none !important; }
`;
document.head.appendChild(style);

// ═══════════════════════════════════════════════════════════════════════════
// CONSOLE EASTER EGG
// ═══════════════════════════════════════════════════════════════════════════
console.log(`
%c██████╗  █████╗ ████████╗███████╗██╗      █████╗ ██████╗ ██╗   ██╗ █████╗ ███╗   ██╗
██╔══██╗██╔══██╗╚══██╔══╝██╔════╝██║     ██╔══██╗██╔══██╗╚██╗ ██╔╝██╔══██╗████╗  ██║
██████╔╝███████║   ██║   █████╗  ██║     ███████║██████╔╝ ╚████╔╝ ███████║██╔██╗ ██║
██╔═══╝ ██╔══██║   ██║   ██╔══╝  ██║     ██╔══██║██╔══██╗  ╚██╔╝  ██╔══██║██║╚██╗██║
██║     ██║  ██║   ██║   ███████╗███████╗██║  ██║██║  ██║   ██║   ██║  ██║██║ ╚████║
╚═╝     ╚═╝  ╚═╝   ╚═╝   ╚══════╝╚══════╝╚═╝  ╚═╝╚═╝  ╚═╝   ╚═╝   ╚═╝  ╚═╝╚═╝  ╚═══╝
`, 'color: #ff4444; font-family: monospace;');

console.log('%c👋 Hey there, curious developer!', 'font-size: 16px; font-weight: bold;');
console.log('%c💡 Pro tip: Press Ctrl+K or ? for command palette', 'color: #00ff88;');
console.log('%c🎮 Try: Konami code or type "matrix"', 'color: #00f2ff;');
console.log('%cWant to connect? → offaryanpatel@gmail.com', 'color: #ff00c3;');
