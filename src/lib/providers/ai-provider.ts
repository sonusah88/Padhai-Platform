// =============================================================================
// AI Provider Abstraction
// Swap implementations without changing application code
// =============================================================================

export interface ExplanationInput {
  topic: string;
  context?: string;
  gradeLevel?: number;
  language?: 'en' | 'ne';
  difficulty?: 'simple' | 'moderate' | 'detailed';
}

export interface Explanation {
  text: string;
  examples?: string[];
  analogy?: string;
}

export interface QuizGenerationInput {
  topic: string;
  count: number;
  difficulty?: 'beginner' | 'intermediate' | 'advanced';
  gradeLevel?: number;
  questionTypes?: string[];
}

export interface GeneratedQuiz {
  questions: {
    text: string;
    options: string[];
    correctIndex: number;
    explanation: string;
  }[];
}

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface ChatInput {
  messages: ChatMessage[];
  context?: {
    subject?: string;
    grade?: number;
    topic?: string;
    lessonContent?: string;
  };
  maxTokens?: number;
  stream?: boolean;
}

export interface AIProvider {
  generateExplanation(input: ExplanationInput): Promise<Explanation>;
  generateQuiz(input: QuizGenerationInput): Promise<GeneratedQuiz>;
  chat(input: ChatInput): Promise<string>;
  chatStream(input: ChatInput): AsyncIterable<string>;
}

// =============================================================================
// Gemini Implementation
// =============================================================================

const SYSTEM_PROMPT = `You are Padhai AI, an educational assistant for students in Nepal.

Rules:
- Explain concepts at the student's grade level
- Use simple, clear language
- Prefer hints over direct answers for homework
- Use analogies and examples relevant to Nepal when possible
- If unsure, say so — never fabricate facts
- Support both English and Nepali
- Encourage verification: "You can confirm this in your textbook"
- Never impersonate a teacher or official examiner
- For math/science, show step-by-step solutions
- Be encouraging and patient`;

export class GeminiProvider implements AIProvider {
  private apiKey: string;
  private baseUrl = 'https://generativelanguage.googleapis.com/v1beta';

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async generateExplanation(input: ExplanationInput): Promise<Explanation> {
    const prompt = `Explain "${input.topic}" for a Grade ${input.gradeLevel || 8} student.
${input.context ? `Context: ${input.context}` : ''}
Difficulty: ${input.difficulty || 'simple'}
Language: ${input.language === 'ne' ? 'Nepali' : 'English'}

Provide:
1. A clear explanation
2. 2-3 examples
3. A relatable analogy

Format as JSON: { "text": "...", "examples": ["..."], "analogy": "..." }`;

    const response = await this.callGemini(prompt);
    try {
      return JSON.parse(response);
    } catch {
      return { text: response };
    }
  }

  async generateQuiz(input: QuizGenerationInput): Promise<GeneratedQuiz> {
    const prompt = `Generate ${input.count} quiz questions about "${input.topic}".
Grade level: ${input.gradeLevel || 8}
Difficulty: ${input.difficulty || 'intermediate'}

Format as JSON:
{
  "questions": [
    {
      "text": "question text",
      "options": ["A", "B", "C", "D"],
      "correctIndex": 0,
      "explanation": "why this is correct"
    }
  ]
}`;

    const response = await this.callGemini(prompt);
    try {
      return JSON.parse(response);
    } catch {
      return { questions: [] };
    }
  }

  async chat(input: ChatInput): Promise<string> {
    const messages = [
      { role: 'user' as const, parts: [{ text: SYSTEM_PROMPT }] },
      ...input.messages.map(m => ({
        role: (m.role === 'assistant' ? 'model' : 'user') as 'user' | 'model',
        parts: [{ text: m.content }],
      })),
    ];

    if (input.context) {
      const contextStr = `[Context: Subject=${input.context.subject || 'general'}, Grade=${input.context.grade || 'unknown'}, Topic=${input.context.topic || 'general'}]`;
      messages[0].parts[0].text = SYSTEM_PROMPT + '\n\n' + contextStr;
    }

    const response = await fetch(
      `${this.baseUrl}/models/gemini-2.0-flash:generateContent?key=${this.apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: messages,
          generationConfig: {
            maxOutputTokens: input.maxTokens || 1024,
            temperature: 0.7,
          },
        }),
      }
    );

    if (!response.ok) {
      throw new Error(`Gemini API error: ${response.status}`);
    }

    const data = await response.json();
    return data.candidates?.[0]?.content?.parts?.[0]?.text || 'I could not generate a response.';
  }

  async *chatStream(input: ChatInput): AsyncIterable<string> {
    const messages = [
      { role: 'user' as const, parts: [{ text: SYSTEM_PROMPT }] },
      ...input.messages.map(m => ({
        role: (m.role === 'assistant' ? 'model' : 'user') as 'user' | 'model',
        parts: [{ text: m.content }],
      })),
    ];

    const response = await fetch(
      `${this.baseUrl}/models/gemini-2.0-flash:streamGenerateContent?key=${this.apiKey}&alt=sse`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: messages,
          generationConfig: {
            maxOutputTokens: input.maxTokens || 1024,
            temperature: 0.7,
          },
        }),
      }
    );

    if (!response.ok || !response.body) {
      throw new Error(`Gemini streaming error: ${response.status}`);
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          try {
            const data = JSON.parse(line.slice(6));
            const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
            if (text) yield text;
          } catch {
            // Skip malformed JSON lines
          }
        }
      }
    }
  }

  private async callGemini(prompt: string): Promise<string> {
    const response = await fetch(
      `${this.baseUrl}/models/gemini-2.0-flash:generateContent?key=${this.apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ role: 'user', parts: [{ text: prompt }] }],
          generationConfig: {
            maxOutputTokens: 2048,
            temperature: 0.7,
          },
        }),
      }
    );

    if (!response.ok) {
      throw new Error(`Gemini API error: ${response.status}`);
    }

    const data = await response.json();
    return data.candidates?.[0]?.content?.parts?.[0]?.text || '';
  }
}

// =============================================================================
// Factory
// =============================================================================

let aiProviderInstance: AIProvider | null = null;

export function getAIProvider(): AIProvider {
  if (!aiProviderInstance) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey || apiKey === 'placeholder') {
      // Return a mock provider for development
      aiProviderInstance = new MockAIProvider();
    } else {
      aiProviderInstance = new GeminiProvider(apiKey);
    }
  }
  return aiProviderInstance;
}

// =============================================================================
// Mock Provider (for development without API key)
// =============================================================================

class MockAIProvider implements AIProvider {
  async generateExplanation(input: ExplanationInput): Promise<Explanation> {
    return {
      text: `This is a mock explanation of "${input.topic}" for Grade ${input.gradeLevel || 8} students. In production, this would be generated by Gemini AI.`,
      examples: ['Example 1: ...', 'Example 2: ...'],
      analogy: 'Think of it like...',
    };
  }

  async generateQuiz(input: QuizGenerationInput): Promise<GeneratedQuiz> {
    return {
      questions: Array.from({ length: input.count }, (_, i) => ({
        text: `Sample question ${i + 1} about ${input.topic}`,
        options: ['Option A', 'Option B', 'Option C', 'Option D'],
        correctIndex: 0,
        explanation: 'This is the correct answer because...',
      })),
    };
  }

  async chat(): Promise<string> {
    return 'This is a mock AI response. Connect your Gemini API key in .env.local to enable real AI tutoring.';
  }

  async *chatStream(): AsyncIterable<string> {
    const words = 'This is a mock streaming response. Connect your Gemini API key to enable real AI tutoring.'.split(' ');
    for (const word of words) {
      await new Promise(resolve => setTimeout(resolve, 50));
      yield word + ' ';
    }
  }
}
