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
      // Use standalone provider when API key is unconfigured
      aiProviderInstance = new StandaloneAIProvider();
    } else {
      aiProviderInstance = new GeminiProvider(apiKey);
    }
  }
  return aiProviderInstance;
}

// =============================================================================
// Standalone Educational AI Provider (Fallback)
// =============================================================================

class StandaloneAIProvider implements AIProvider {
  async generateExplanation(input: ExplanationInput): Promise<Explanation> {
    return {
      text: `Let's understand ${input.topic} clearly. In Grade ${input.gradeLevel || 8}, this concept forms an essential foundation for your studies. Break it down into key principles: first identify what is given, understand the core rule, and apply it step-by-step.`,
      examples: [
        `Practical Example: Applying ${input.topic} to solve everyday problems.`,
        `Academic Example: Standard textbook problem step-by-step resolution.`,
      ],
      analogy: `Think of ${input.topic} like building a strong brick house: each fundamental rule is a brick that supports the next concept.`,
    };
  }

  async generateQuiz(input: QuizGenerationInput): Promise<GeneratedQuiz> {
    return {
      questions: Array.from({ length: input.count }, (_, i) => ({
        text: `Concept Test ${i + 1}: What is the primary principle behind ${input.topic}?`,
        options: [
          'It states that values must balance across both sides.',
          'It applies only to theoretical calculations.',
          'It decreases as complexity increases.',
          'None of the above.',
        ],
        correctIndex: 0,
        explanation: 'In mathematics and science, core formulas and equations require equal balancing across expressions.',
      })),
    };
  }

  async chat(): Promise<string> {
    return 'Hello! I am Padhai AI. How can I help you understand your lesson today? Feel free to ask any question about Math, Science, English, or Coding.';
  }

  async *chatStream(): AsyncIterable<string> {
    const responseText = 'Hello! I am Padhai AI. I can help you solve step-by-step problems, explain difficult concepts, and prepare for your examinations. What would you like to learn today?';
    const words = responseText.split(' ');
    for (const word of words) {
      await new Promise(resolve => setTimeout(resolve, 40));
      yield word + ' ';
    }
  }
}
