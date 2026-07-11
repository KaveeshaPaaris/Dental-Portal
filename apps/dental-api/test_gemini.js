const { GoogleGenAI } = require('@google/genai');

async function run() {
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  try {
    const chatResult = await ai.models.generateContent({
      model: 'gemini-2.5-flash-lite',
      contents: 'hello',
    });
    console.log('Chat worked with 2.5-flash-lite:', chatResult.text);
  } catch (err) {
    console.error('Chat failed with 2.5-flash-lite:', err.message);
  }
}

run();
