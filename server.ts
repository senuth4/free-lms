import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import { Agent, setGlobalDispatcher } from "undici";

// Configure global undici dispatcher with a 10-minute timeout to avoid HeadersTimeoutError during long OCR extraction runs
const globalAgent = new Agent({
  connect: {
    timeout: 600000,
  },
  headersTimeout: 600000,
  bodyTimeout: 600000,
});
setGlobalDispatcher(globalAgent);

// Mock JSON data for A/L Biology Resource Book to use as context
const resourceBookData = [
  {
    id: 1,
    unit: 'Unit 1: Introduction to Biology',
    topic: 'Characteristics of Organisms',
    subTopic: 'Cellular Organization',
    page: 5,
    content: 'All living organisms are composed of one or more cells. Cells are the basic structural and functional units of living organisms.'
  },
  {
    id: 2,
    unit: 'Unit 2: Chemical and Cellular Basis of Life',
    topic: 'Water',
    subTopic: 'Properties of Water',
    page: 25,
    content: 'Water is a polar molecule, consisting of two hydrogen atoms covalently bonded to one oxygen atom. The high heat of vaporization of water is important for cooling down biological systems.'
  },
  {
    id: 3,
    unit: 'Unit 3: Evolution and Diversity of Organisms',
    topic: 'Origin of Life',
    subTopic: 'Chemical Evolution',
    page: 110,
    content: 'The first organisms on Earth were prokaryotes, which originated in the ocean.'
  },
  {
    id: 4,
    unit: 'Unit 4: Plant Form and Function',
    topic: 'Plant Nutrition',
    subTopic: 'Essential Elements',
    page: 180,
    content: 'Plants require 17 essential elements for their growth and development. These are divided into macronutrients and micronutrients.'
  },
  {
    id: 5,
    unit: 'Unit 5: Animal Form and Function',
    topic: 'Digestion',
    subTopic: 'Human Digestive System',
    page: 250,
    content: 'Digestion is the process of breaking down food into smaller absorbable components. The human digestive system consists of the alimentary canal and accessory glands.'
  }
];

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

async function generateContentWithRetry(ai: any, params: any, retries = 5, initialDelay = 5000) {
  for (let i = 0; i < retries; i++) {
    try {
      return await ai.models.generateContent(params);
    } catch (error: any) {
      if (
        error.status === 429 || error.message?.includes('429') ||
        error.status >= 500 || error.message?.includes('503') || error.message?.includes('500') || error.message?.includes('502') || error.message?.includes('504')
      ) {
        let delay = initialDelay * Math.pow(2, i);
        // Try to parse retryDelay from RPC if available
        try {
          if (error.message?.includes('retryDelay')) {
             const match = error.message.match(/"retryDelay":"([0-9.]+)s"/);
             if (match && match[1]) {
               delay = Math.max(delay, parseFloat(match[1]) * 1000 + 1000);
             }
          }
        } catch (e) {}

        console.warn(`[API Error ${error.status || 'Unknown'}] Retrying in ${delay}ms... (Attempt ${i + 1} of ${retries}). Message: ${error.message}`);
        await sleep(delay);
      } else {
        throw error;
      }
    }
  }
  throw new Error(`Failed to generate content after ${retries} retries.`);
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: "50mb" }));

  // API routes FIRST
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  app.post("/api/ocr", async (req, res) => {
    try {
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        return res.status(500).json({ error: "API Key not configured" });
      }

      const ai = new GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          }
        }
      });

      const { imageParams } = req.body;

      if (!imageParams) {
        return res.status(400).json({ error: "Image is required" });
      }

      const systemInstruction = `You are a professional educational OCR and document ingestion system for a comprehensive Learning Management System.
Your core objective is to analyze the provided DOCUMENT (which could be a multi-page PDF or a high-resolution image) and extract ALL text, preserving 100% of its content and page/chapter/section structure.

CRITICAL PROCESSING RULES:
1. PROCESS THE ENTIRE DOCUMENT: You MUST extract text from EVERY SINGLE PAGE represented in the input file. Do not skip, truncate, summarize, or omit any pages.
2. PARSE MULTI-PAGE SEQUENTIALLY: For each page in the document, create a distinct entry in the "resources" array.
3. EXTRACT ALL TEXT EXACTLY: Do not add commentary or summarize. Extract every word in its original language (Sinhala characters or English). Preserve technical biological terms, tables, and lists. 
   - CRITICAL: DO NOT include long sequences of leader dots (e.g., ".......") or fill-in-the-blank underscores (e.g., "_______"). Replace them with a single space or omit them completely to conserve token limits. If you see repeated dots, stop repeating them.
4. METADATA ACQUISITION: For each page/section entry:
   - "page": Extract the actual printed page number from the header/footer of the page. If no print page number is present, use the logical index starting at 1.
   - "unit": Look for chapter titles, units, or headers (e.g., "Unit 5", "පටක පද්ධතිය", "Unit 01: Introduction to Biology"). If not dynamically found on a general page, carry forward the current active Unit name or fall back.
   - "topic": Identify the active main topic on this page or chapter.
   - "subtopic": Identify the active subtopic or section header.
5. GENERATE SEARCH TAGS (FOR ROBUST PHONETIC AND TRANSCRIPTION SEARCH):
   - For every page, formulate an exhaustive string of "search_tags" containing keywords.
   - You MUST include Singlish (Romanized Sinhala) transliterations of important Sinhala words on that page so that users searching in standard Singlish strings (such as "pataka", "paddatiya", "rakshana", "shaka", "wishleshanaya", "luth", "endoplasmic", "koshaya") can hit the search terms.
   - Include synonyms and related subject keywords in both Sinhala and English.
6. STABILITY & OUTPUT FORMAT: You MUST return a strictly valid JSON object conforming exactly to the JSON scheme below. Do not wrap in markdown or include extra conversational text.

JSON Schema:
{
  "resources": [
    {
      "page": "string representing page number (e.g., '145' or '1')",
      "unit": "string representing the active unit name/chapter",
      "topic": "string representing the main topic/heading",
      "subtopic": "string representing subtopic/heading, or empty string",
      "text_content": "the complete extracted text of this page/chunk with standard newlines",
      "search_tags": "space-separated keywords and romanized/Sinhala/English transliterations of key topics"
    }
  ]
}`;

      const response = await generateContentWithRetry(ai, {
        model: "gemini-2.5-flash",
        contents: [
            {
                role: 'user',
                parts: [
                    {
                        inlineData: {
                            mimeType: imageParams.mimeType,
                            data: imageParams.data
                        }
                    },
                    { text: "Analyze this document and extract its structure into the requested JSON array." }
                ]
            }
        ],
        config: {
          systemInstruction,
          temperature: 0.1,
          maxOutputTokens: 8192,
          responseMimeType: "application/json",
          responseSchema: {
            // @ts-ignore - The types of @google/genai might not perfectly align but the API uses this standard schema
            type: "object",
            properties: {
              resources: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    page: { type: "string" },
                    unit: { type: "string" },
                    topic: { type: "string" },
                    subtopic: { type: "string" },
                    text_content: { type: "string" },
                    search_tags: { type: "string" }
                  },
                  required: ["page", "unit", "topic", "subtopic", "text_content", "search_tags"]
                }
              }
            },
            required: ["resources"]
          }
        }
      });

      res.json({ result: response.text });
    } catch (error: any) {
      console.error(error);
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/extract-quiz", async (req, res) => {
    try {
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        return res.status(500).json({ error: "API Key not configured" });
      }

      const ai = new GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          }
        }
      });

      const { imageParams } = req.body;

      if (!imageParams) {
        return res.status(400).json({ error: "Image is required" });
      }

      const systemInstruction = `You are a professional educational OCR assistant.
Your task is to analyze the provided image (a page from a quiz, past paper, or test) and extract multiple-choice questions (MCQs) or structured questions exactly as written.

CRITICAL RULES:
1. Extract the question text clearly.
2. If it's an MCQ, extract all the options.
3. If an answer key or correct option is visible or indicated, try to set the correctOptionIndex (0-4). If not visible, set it to 0 and the user will manually correct it later.
4. Output standard JSON array.
5. If the language is Sinhala, return the Sinhala text. If English, return English.

JSON Schema:
{
  "questions": [
    {
      "type": "mcq",
      "text": "Extracted question text",
      "options": ["Option 1", "Option 2", "Option 3", "Option 4", "Option 5 (if any)"],
      "correctOptionIndex": 0,
      "hints": "",
      "markingScheme": ""
    }
  ]
}`;

      const response = await generateContentWithRetry(ai, {
        model: "gemini-2.5-flash",
        contents: [
            {
                role: 'user',
                parts: [
                    {
                        inlineData: {
                            mimeType: imageParams.mimeType,
                            data: imageParams.data
                        }
                    },
                    { text: "Analyze this image and extract the questions into the requested JSON array." }
                ]
            }
        ],
        config: {
          systemInstruction,
          temperature: 0.1,
          maxOutputTokens: 8192,
          responseMimeType: "application/json",
          responseSchema: {
            // @ts-ignore
            type: "object",
            properties: {
              questions: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    type: { type: "string" },
                    text: { type: "string" },
                    options: { type: "array", items: { type: "string" } },
                    correctOptionIndex: { type: "number" },
                    hints: { type: "string" },
                    markingScheme: { type: "string" }
                  },
                  required: ["type", "text", "options", "correctOptionIndex"]
                }
              }
            },
            required: ["questions"]
          }
        }
      });

      res.json({ result: response.text });
    } catch (error: any) {
      console.error(error);
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/extract-quiz-answers", async (req, res) => {
    try {
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        return res.status(500).json({ error: "API Key not configured" });
      }

      const ai = new GoogleGenAI({ apiKey, httpOptions: { headers: { 'User-Agent': 'aistudio-build' } } });
      const { imageParams, existingQuestions } = req.body;

      if (!imageParams) {
        return res.status(400).json({ error: "Image is required" });
      }

      const systemInstruction = `You are a professional educational OCR assistant.
Your task is to analyze the provided image (a marking scheme or answer key) and map the correct answers to the provided existing questions.

CRITICAL RULES:
1. Examine the marking scheme image. It will usually contain multiple choice answer keys (e.g., Q1 -> 2, Q2 -> 4).
2. For each question in the provided array, determine if the answer key specifies its correct option.
3. If an answer key is found, set the 'correctOptionIndex' (0-indexed, so option 1 is 0, option 2 is 1).
4. Extract any marking scheme explanation/hints into 'markingScheme' or 'hints' if provided in the image.
5. Return the exact same questions array structure, just updating 'correctOptionIndex', 'hints', and 'markingScheme' fields.

JSON Schema:
{
  "questions": [
    {
      "id": "original id",
      "correctOptionIndex": 0,
      "hints": "",
      "markingScheme": ""
    }
  ]
}`;

      const response = await generateContentWithRetry(ai, {
        model: "gemini-2.5-flash",
        contents: [
            {
                role: 'user',
                parts: [
                    {
                        inlineData: {
                            mimeType: imageParams.mimeType,
                            data: imageParams.data
                        }
                    },
                    { text: "Existing questions metadata: " + JSON.stringify(existingQuestions.map((q: any) => ({ id: q.id, text: q.text }))) },
                    { text: "Analyze this marking scheme image and output the updated fields for the questions into the requested JSON array." }
                ]
            }
        ],
        config: {
          systemInstruction,
          temperature: 0.1,
          maxOutputTokens: 8192,
          responseMimeType: "application/json",
          responseSchema: {
            // @ts-ignore
            type: "object",
            properties: {
              questions: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    id: { type: "string" },
                    correctOptionIndex: { type: "number" },
                    hints: { type: "string" },
                    markingScheme: { type: "string" }
                  },
                  required: ["id", "correctOptionIndex"]
                }
              }
            },
            required: ["questions"]
          }
        }
      });

      res.json({ result: response.text });
    } catch (error: any) {
      console.error(error);
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/scrap", async (req, res) => {
    try {
      const q = req.query.q as string;
      const type = req.query.type as string;
      if (!q || !type) {
        return res.status(400).json({ error: "Missing query params" });
      }
      
      const fetchResponse = await fetch(`https://apola-theta.vercel.app/api/scrap?type=${type}&q=${encodeURIComponent(q)}`);
      
      const contentType = fetchResponse.headers.get("content-type");
      if (contentType && contentType.includes("application/json")) {
        const data = await fetchResponse.json();
        res.json(data);
      } else {
        const text = await fetchResponse.text();
        res.send(text);
      }
    } catch (error: any) {
      console.error(error);
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/qa", async (req, res) => {
    try {
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        return res.status(500).json({ error: "API Key not configured" });
      }

      const ai = new GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          }
        }
      });

      const { prompt, language = "Sinhala", subject = "Biology", contextData = [] } = req.body;

      const systemInstruction = `You are an expert educational AI assistant for an advanced Learning Management System (LMS). Your task is to answer the student's question accurately based ONLY on the provided textbook context.

STUDENT CONFIGURATION:
- Target Subject: ${subject}
- Requested Response Language: ${language}

CRITICAL RULES:
1. RESPONSE LANGUAGE: You MUST generate the entire response in the exact language specified in the "Requested Response Language" configuration above. 
   - If the language is "Sinhala", you must write the response using proper Sinhala script (සිංහල අකුරෙන්).
   - If the language is "English", you must write the response in English.
   - Do not mix languages unless a specific technical term has no translation.

2. STRICT GROUNDING: Rely only on the clear facts mentioned inside the <context> tags. Do not assume or extrapolate. If the context does not contain enough information to answer the question, respond exactly with:
   - If Sinhala: "කණගාටුයි, ලබා දී ඇති මූලාශ්ර වල මේ සඳහා පිළිතුරක් හමු නොවීය."
   - If English: "Sorry, the answer to this question could not be found in the provided resources."

3. SOURCE CITATION: At the very end of your answer, you MUST dynamically output the exact source details extracted from the context metadata. Use this exact format on a new line:
   - If Sinhala: "\\n\\n**මූලාශ්රය:** [Unit: {{UNIT}}, Topic: {{TOPIC}}, Subtopic: {{SUBTOPIC}}, Page: {{PAGE}}]"
   - If English: "\\n\\n**Source:** [Unit: {{UNIT}}, Topic: {{TOPIC}}, Subtopic: {{SUBTOPIC}}, Page: {{PAGE}}]"`;

      const contextString = ((contextData.length > 0) ? contextData : resourceBookData).map((item: any) => 
        `<context metadata="Unit: ${item.unit}, Topic: ${item.topic}, Subtopic: ${item.subtopic || item.subTopic}, Page: ${item.page}">${item.textContent || item.content}</context>`
      ).join("\\n\\n");

      const finalPrompt = `CONTEXT:\n${contextString}\n\nQUESTION: ${prompt}`;

      const response = await generateContentWithRetry(ai, {
        model: "gemini-2.5-flash",
        contents: finalPrompt,
        config: {
          systemInstruction,
          temperature: 0.2
        }
      });

      res.json({ text: response.text });
    } catch (error: any) {
      console.error(error);
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/science-solver", async (req, res) => {
    try {
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        return res.status(500).json({ error: "API Key not configured" });
      }

      const ai = new GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          }
        }
      });

      const { prompt } = req.body;

      const systemInstruction = `You are a powerful, highly intelligent Science AI Solver.
Your goal is to solve science (Physics, Chemistry, Biology, Mathematics) problems for students accurately and beautifully.
Format your answer elegantly using Markdown, with clear headings, bullet points, and step-by-step explanations.
Always answer in Sinhala (සිංහල), as the primary audience speaks Sinhala, but you can use English terms in brackets for scientific names/concepts if necessary.
Be engaging, encouraging, and clear. Use emojis appropriately to make the answer look beautiful and friendly.`;

      const finalPrompt = `Solve the following science problem:\n\n${prompt}`;

      const response = await generateContentWithRetry(ai, {
        model: "gemini-2.5-flash",
        contents: finalPrompt,
        config: {
          systemInstruction,
          temperature: 0.4
        }
      });

      res.json({ text: response.text });
    } catch (error: any) {
      console.error(error);
      res.status(500).json({ error: error.message });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    // For Express 4
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  // Global error handler to prevent Express from sending HTML errors
  app.use((err: any, req: any, res: any, next: any) => {
    console.error('Global Express Error:', err);
    if (res.headersSent) {
      return next(err);
    }
    res.status(err.status || 500).json({ error: err.message || 'Internal Server Error' });
  });

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
