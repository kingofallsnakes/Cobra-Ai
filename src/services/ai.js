import OpenAI from 'openai';

const openai = new OpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: import.meta.env.VITE_OPENROUTER_API_KEY,
  dangerouslyAllowBrowser: true,
  defaultHeaders: {
    "HTTP-Referer": "http://localhost:5173", // Required for OpenRouter free tier
    "X-Title": "Cobra AI", 
  }
});

export const getAIStream = async (prompt, imageFile = null, model = 'google/gemma-4-31b-it:free', options = {}) => {
  const { systemPrompt, temperature = 1, top_p = 1 } = options;
  const messages = [];

  if (systemPrompt) {
    messages.push({ role: 'system', content: systemPrompt });
  }

  if (imageFile) {
    const base64Image = await new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(imageFile);
    });

    messages.push({
      role: 'user',
      content: [
        { type: 'text', text: prompt },
        {
          type: 'image_url',
          image_url: {
            url: base64Image,
          },
        },
      ],
    });
  } else {
    messages.push({ role: 'user', content: prompt });
  }

  let retries = 3;
  let delay = 1000;
  let currentModel = model;
  let usePollinations = false;
  
  const fallbacks = [
    "meta-llama/llama-3.3-70b-instruct:free",
    "openai/gpt-oss-20b:free",
    "google/gemma-4-31b-it:free",
    "qwen/qwen3-coder:free",
    "meta-llama/llama-3.2-3b-instruct:free"
  ].filter(m => m !== model); // Don't duplicate the initially requested model
  
  let fallbackIndex = 0;

  while (retries > 0) {
    try {
      if (usePollinations) {
        const fullTextPrompt = systemPrompt ? `${systemPrompt}\n\n${prompt}` : prompt;
        const res = await fetch(`https://text.pollinations.ai/${encodeURIComponent(fullTextPrompt)}?model=openai`);
        if (!res.ok) throw new Error("Pollinations fetch failed");
        const finalString = await res.text();
        
        return (async function* () {
          for (let i = 0; i < finalString.length; i += 5) {
            await new Promise(r => setTimeout(r, 5));
            yield { choices: [{ delta: { content: finalString.substring(i, i + 5) } }] };
          }
        })();
      }
      
      const responseStream = await openai.chat.completions.create({
        model: currentModel,
        messages: messages,
        stream: true,
        temperature: temperature,
        top_p: top_p,
      });
      return responseStream;
    } catch (error) {
      if (!usePollinations && fallbackIndex >= fallbacks.length) {
        console.warn("ALL OpenRouter nodes failed. Engaging Pollinations AI Emergency Core.");
        usePollinations = true;
        continue;
      }
      
      if (!usePollinations && (error.status === 429 || error.status === 404 || error.status === 400 || error.status >= 500) && fallbackIndex < fallbacks.length) {
        console.warn(`Model ${currentModel} failed (${error.status}). Falling back to ${fallbacks[fallbackIndex]}`);
        currentModel = fallbacks[fallbackIndex];
        fallbackIndex++;
      } else if (error.status === 429 && retries > 1) {
        retries--;
        console.warn(`Rate limit hit on final fallback. Retrying in ${delay}ms...`);
        await new Promise(res => setTimeout(res, delay));
        delay *= 2; 
      } else {
        throw error;
      }
    }
  }
};

export const generateImageOpenAI = async (prompt, apiKey) => {
  const client = new OpenAI({
    apiKey: apiKey,
    dangerouslyAllowBrowser: true,
  });

  const response = await client.images.generate({
    model: "dall-e-3",
    prompt: prompt,
    n: 1,
    size: "1024x1024",
  });

  return response.data[0].url;
};

export const generateImageHuggingFace = async (prompt, apiKey) => {
  const response = await fetch(
    "https://api-inference.huggingface.co/models/stabilityai/stable-diffusion-xl-base-1.0",
    {
      headers: { Authorization: `Bearer ${apiKey}` },
      method: "POST",
      body: JSON.stringify({ inputs: prompt }),
    }
  );

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || "Hugging Face API Request Failed");
  }

  const blob = await response.blob();
  return URL.createObjectURL(blob);
};
