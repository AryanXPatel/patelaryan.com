/* ═══════════════════════════════════════════════════════════════════════════
   PATELARYAN.COM - Main JavaScript
   Glitch effects, scroll reveal, AI Twin chat
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
            // Stagger the animations
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
// LAST.FM NOW PLAYING (Simulated - replace with real API)
// ═══════════════════════════════════════════════════════════════════════════
const nowPlayingData = {
    track: "Blinding Lights",
    artist: "The Weeknd",
    art: "https://i.scdn.co/image/ab67616d0000b2738863bc11d2aa12b54f5aeb36",
    time: "2 min ago"
};

function updateNowPlaying() {
    const trackEl = document.getElementById('np-track');
    const artistEl = document.getElementById('np-artist');
    const artEl = document.getElementById('np-art');
    const timeEl = document.getElementById('np-time');

    if (trackEl && artistEl && artEl && timeEl) {
        trackEl.textContent = nowPlayingData.track;
        artistEl.textContent = nowPlayingData.artist;
        artEl.src = nowPlayingData.art;
        artEl.onerror = () => {
            artEl.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100'%3E%3Crect fill='%23111' width='100' height='100'/%3E%3Ctext x='50' y='55' text-anchor='middle' fill='%23333' font-size='20'%3E♫%3C/text%3E%3C/svg%3E";
        };
        timeEl.textContent = nowPlayingData.time;
    }
}

// Update on load
setTimeout(updateNowPlaying, 500);

// ═══════════════════════════════════════════════════════════════════════════
// AI TWIN CHAT (Basic Implementation)
// ═══════════════════════════════════════════════════════════════════════════
const chatForm = document.getElementById('chat-form');
const chatInput = document.getElementById('chat-input');
const chatMessages = document.getElementById('chat-messages');

// Pre-defined responses for demo (replace with Gemini API in production)
const aiResponses = {
    default: "I'm Aryan's AI twin! I can tell you about his projects, skills, or how to get in touch. What would you like to know?",
    projects: "Aryan has built some cool stuff! Check out Monolith (local-first notes), AiThena (AI study copilot), and several Shopify stores. Which one interests you?",
    skills: "Aryan is fluent in React, TypeScript, and Next.js. He's currently diving deep into Java, Spring Boot, and distributed systems. Also experienced with Shopify development!",
    contact: "You can reach Aryan at offaryanpatel@gmail.com or connect on LinkedIn/GitHub. Links are in the sidebar!",
    shopify: "Aryan has built multiple e-commerce stores on Shopify - from fashion brands to tech stores. He handles custom themes, product configurators, and advanced features.",
    monolith: "Monolith is a local-first markdown app with 60x faster rendering using virtual scrolling. Your notes stay on YOUR device. Check it out at monolith.patelaryan.com!",
    aithena: "AiThena is an AI-powered study copilot that transforms PDFs and videos into summaries, quizzes, and flashcards. Perfect for students!",
    hello: "Hey there! 👋 Great to meet you. I'm a digital version of Aryan. Ask me anything about his work!",
    hi: "Hello! 👋 I'm Aryan's AI twin. What would you like to know about his projects or skills?"
};

function getAIResponse(message) {
    const lowerMessage = message.toLowerCase();

    if (lowerMessage.includes('project')) return aiResponses.projects;
    if (lowerMessage.includes('skill') || lowerMessage.includes('tech') || lowerMessage.includes('stack')) return aiResponses.skills;
    if (lowerMessage.includes('contact') || lowerMessage.includes('email') || lowerMessage.includes('reach')) return aiResponses.contact;
    if (lowerMessage.includes('shopify') || lowerMessage.includes('store') || lowerMessage.includes('ecommerce')) return aiResponses.shopify;
    if (lowerMessage.includes('monolith') || lowerMessage.includes('notes')) return aiResponses.monolith;
    if (lowerMessage.includes('aithena') || lowerMessage.includes('study')) return aiResponses.aithena;
    if (lowerMessage.includes('hello') || lowerMessage.includes('hey')) return aiResponses.hello;
    if (lowerMessage.includes('hi')) return aiResponses.hi;

    return aiResponses.default;
}

function addMessage(text, isUser = false) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `chat-message ${isUser ? 'user' : 'bot'}`;
    messageDiv.innerHTML = `<span class="chat-text">${text}</span>`;
    chatMessages.appendChild(messageDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

if (chatForm) {
    chatForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const message = chatInput.value.trim();
        if (!message) return;

        // Add user message
        addMessage(message, true);
        chatInput.value = '';

        // Simulate typing delay
        setTimeout(() => {
            const response = getAIResponse(message);
            addMessage(response, false);
        }, 500 + Math.random() * 500);
    });
}

// ═══════════════════════════════════════════════════════════════════════════
// MARQUEE DUPLICATE FOR SEAMLESS LOOP
// ═══════════════════════════════════════════════════════════════════════════
const marqueeContent = document.querySelector('.marquee-content');
if (marqueeContent) {
    marqueeContent.innerHTML = marqueeContent.innerHTML + ' // ' + marqueeContent.innerHTML;
}

// ═══════════════════════════════════════════════════════════════════════════
// EASTER EGG: Konami Code
// ═══════════════════════════════════════════════════════════════════════════
let konamiCode = [];
const konamiSequence = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a'];

document.addEventListener('keydown', (e) => {
    konamiCode.push(e.key);
    konamiCode = konamiCode.slice(-10);

    if (konamiCode.join(',') === konamiSequence.join(',')) {
        document.body.style.animation = 'hueRotate 2s infinite';
        setTimeout(() => {
            document.body.style.animation = '';
        }, 5000);
    }
});

// Add the hue rotate keyframes dynamically
const style = document.createElement('style');
style.textContent = `
    @keyframes hueRotate {
        0% { filter: hue-rotate(0deg); }
        100% { filter: hue-rotate(360deg); }
    }
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
console.log('%cWant to connect? → offaryanpatel@gmail.com', 'color: #00ff88;');
