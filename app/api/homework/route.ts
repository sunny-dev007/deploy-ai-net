import { NextResponse } from 'next/server';
import azureOpenAI from '../../services/azure-openai';

console.log("Azure OpenAI API Key:", process.env.AZURE_OPENAI_API_KEY);
console.log("Azure OpenAI Endpoint:", process.env.AZURE_OPENAI_ENDPOINT);

// Define system prompts for different AI types
const SYSTEM_PROMPTS = {
  basic: (subject: string) => `You are a helpful AI tutor specializing in ${subject}. Only answer questions that are directly related to ${subject}. If the question is not related to ${subject}, respond with "I can only answer questions related to ${subject}.". Format your response using markdown for better readability.`,
  agentic: (subject: string) => `You are an advanced AI tutor specializing in ${subject}. Only answer questions that are directly related to ${subject}. If the question is not related to ${subject}, respond with "I can only answer questions related to ${subject}.". Your response should include:
    1. A direct answer to the question.
    2. Relevant learning resources.
    3. A step-by-step guide to improve understanding.
    4. A quiz to test understanding.
    5. A study plan based on the student's performance.
    Format your response using markdown for better readability.`,
  agent: (subject: string, agentType: string) => {
    switch (agentType) {
      case 'physics':
        return `You are a highly specialized physics tutor. Only answer questions that are directly related to physics. If the question is not related to physics, respond with "I can only answer questions related to physics.". Provide detailed explanations, examples, and problem-solving strategies. Focus on conceptual understanding and practical application. Format your response using markdown for better readability.`;
      case 'math':
        return `You are a highly specialized math tutor. Only answer questions that are directly related to math. If the question is not related to math, respond with "I can only answer questions related to math.". Provide step-by-step solutions, explanations of mathematical concepts, and practice problems. Focus on accuracy and clarity. Format your response using markdown for better readability.`;
      case 'chemistry':
        return `You are a highly specialized chemistry tutor. Only answer questions that are directly related to chemistry. If the question is not related to chemistry, respond with "I can only answer questions related to chemistry.". Provide detailed explanations of chemical reactions, concepts, and experiments. Focus on accuracy and safety. Format your response using markdown for better readability.`;
      case 'history':
        return `You are a highly specialized history tutor. Only answer questions that are directly related to history. If the question is not related to history, respond with "I can only answer questions related to history.". Provide detailed explanations of historical events, figures, and concepts. Focus on context and analysis. Format your response using markdown for better readability.`;
      default:
        return `You are a helpful AI tutor specializing in ${subject}. Only answer questions that are directly related to ${subject}. If the question is not related to ${subject}, respond with "I can only answer questions related to ${subject}.". Format your response using markdown for better readability.`;
    }
  }
};

const analyzeResponse = (response: string, aiType: string) => {
  const analysis: { [key: string]: boolean } = {
    explanation: false,
    resources: false,
    stepByStep: false,
    quiz: false,
    feedback: false,
    studyPlan: false,
  };

  if (aiType === 'agentic') {
    analysis.explanation = response.toLowerCase().includes("explanation");
    analysis.resources = response.toLowerCase().includes("resource") || response.toLowerCase().includes("link");
    analysis.stepByStep = response.toLowerCase().includes("step");
    analysis.quiz = response.toLowerCase().includes("quiz");
    analysis.feedback = response.toLowerCase().includes("feedback");
    analysis.studyPlan = response.toLowerCase().includes("study plan");
  } else if (aiType === 'agent') {
    analysis.explanation = response.toLowerCase().includes("explanation");
    analysis.resources = response.toLowerCase().includes("resource") || response.toLowerCase().includes("link");
    analysis.stepByStep = response.toLowerCase().includes("step");
  } else if (aiType === 'basic') {
    analysis.explanation = response.toLowerCase().includes("explanation");
  }

  return analysis;
};

export async function POST(req: Request) {
  try {
    const { subject, prompt, aiType, agentType } = await req.json();

    let systemPrompt = '';
    let model = "gpt-4o-mini";
    let temperature = 0.5;
    let maxTokens = 1000;

    switch (aiType) {
      case 'basic':
        systemPrompt = SYSTEM_PROMPTS.basic(subject);
        model = "gpt-4o-mini";
        temperature = 0.5;
        maxTokens = 1000;
        break;
      case 'agentic':
        systemPrompt = SYSTEM_PROMPTS.agentic(subject);
        model = "gpt-4o-mini";
        temperature = 0.7;
        maxTokens = 2000;
        break;
      case 'agent':
        systemPrompt = SYSTEM_PROMPTS.agent(subject, agentType);
        model = "gpt-4o-mini";
        temperature = 0.7;
        maxTokens = 2000;
        break;
      default:
        systemPrompt = SYSTEM_PROMPTS.basic(subject);
    }

    console.log("Model:", model);

    const completion = await azureOpenAI.chat.completions.create({
      model: model,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: prompt },
      ],
      temperature: temperature,
      max_tokens: maxTokens,
    });
    const response = completion.choices[0].message.content ?? '';
    const analysis = analyzeResponse(response, aiType);

    return NextResponse.json({ response, analysis, aiType });
  } catch (error: any) {
    console.error('Error:', error);
    console.error('Error Details:', error.response);
    return NextResponse.json(
      { error: error.message || 'Failed to process request', details: error.response },
      { status: 500 }
    );
  }
} 