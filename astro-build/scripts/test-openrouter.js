import OpenAI from 'openai';

const openrouter = new OpenAI({
  baseURL: 'https://openrouter.ai/api/v1',
  apiKey: process.env.OPENROUTER_API_KEY,
  defaultHeaders: {
    'HTTP-Referer': 'https://blog.ninochavez.co',
    'X-Title': 'Signal Dispatch Blog'
  }
});

async function test() {
  const response = await openrouter.chat.completions.create({
    model: 'google/gemini-2.5-flash-preview-image',
    modalities: ['text', 'image'],
    messages: [
      {
        role: 'user',
        content: 'Generate a simple illustration of a lighthouse on a dark navy background with gold line art.'
      }
    ]
  });

  const message = response.choices?.[0]?.message;
  console.log('Message keys:', Object.keys(message || {}));
  console.log('Images:', message?.images);
  console.log('Images type:', typeof message?.images);
  if (message?.images) {
    console.log('First image type:', typeof message.images[0]);
    if (typeof message.images[0] === 'object') {
      console.log('First image keys:', Object.keys(message.images[0]));
    } else {
      console.log('First image (first 100 chars):', String(message.images[0]).substring(0, 100));
    }
  }
  console.log('Content type:', typeof message?.content);
  if (Array.isArray(message?.content)) {
    console.log('Content parts:', message.content.map(p => ({ type: p.type, keys: Object.keys(p) })));
  }
}

test().catch(console.error);
