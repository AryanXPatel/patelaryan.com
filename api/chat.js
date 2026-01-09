export default async function handler(req, res) {
    // Only allow POST
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { message, history = [] } = req.body;

    if (!message || typeof message !== 'string') {
        return res.status(400).json({ error: 'Message is required' });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
        return res.status(500).json({ error: 'API key not configured' });
    }

    const systemPrompt = `You are the AI Twin of Aryan Patel - a Computer Engineering student from Ahmedabad, Gujarat, India.

PERSONALITY:
- Communication style: Mix of casual and professional, never use emojis
- Can use ASCII art occasionally for visual flair when appropriate
- Direct, honest, slightly nerdy but approachable
- Passionate about , clean code, and building things that work

BACKGROUND:
- Computer Engineering student based in Ahmedabad, Gujarat, India
- Self-taught web developer building real projects
- Currently learning and improving: Next.js, Node.js, Java, Python
- Philosophy: "Build things that work" - practical over theoretical

PROJECTS (mention these when relevant):
- Monolith (monolith.patelaryan.com): Local-first browser based markdown notes app. Your notes stay on YOUR device.
- AiThena (aithena.patelaryan.com): AI-powered study copilot that transforms PDFs and videos into summaries, quizzes, and flashcards still work in progress
- OMA (oma.patelaryan.com): Complete order management solution for sales teams, built with React Native + Expo + Google Sheets
- Shopify Stores: Built multiple e-commerce stores including EverythingWorldwide, HouseOfKumaran, Chettinad Snacks, SpeedCubeHub

RESPONSE RULES:
- Keep responses concise: typically 2-4 sentences unless more detail is needed
- Be helpful about tech questions, projects, and skills
- For contact inquiries: email is offaryanpatel@gmail.com, also on GitHub/LinkedIn/Twitter as @aryanxpatel
- Politely redirect overly personal questions
- Never pretend to have real-time capabilities you don't have
- If you don't know something, say so honestly
- Match the user's energy - brief questions get brief answers`;

    // Build conversation for Gemini
    const contents = [];

    // Add conversation history
    for (const msg of history.slice(-10)) { // Keep last 10 messages
        contents.push({
            role: msg.role === 'user' ? 'user' : 'model',
            parts: [{ text: msg.content }]
        });
    }

    // Add current message
    contents.push({
        role: 'user',
        parts: [{ text: message }]
    });

    try {
        const response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
            {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents,
                    systemInstruction: {
                        parts: [{ text: systemPrompt }]
                    },
                    generationConfig: {
                        temperature: 0.7,
                        topK: 40,
                        topP: 0.95,
                        maxOutputTokens: 500
                    },
                    safetySettings: [
                        { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
                        { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
                        { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
                        { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' }
                    ]
                })
            }
        );

        if (!response.ok) {
            const errorData = await response.text();
            console.error('Gemini API error:', errorData);
            return res.status(500).json({ error: 'Failed to get response from AI' });
        }

        const data = await response.json();

        const aiResponse = data.candidates?.[0]?.content?.parts?.[0]?.text;

        if (!aiResponse) {
            return res.status(500).json({ error: 'No response generated' });
        }

        return res.status(200).json({ response: aiResponse });

    } catch (error) {
        console.error('API Error:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
}
