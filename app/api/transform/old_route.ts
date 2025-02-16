import { NextResponse } from 'next/server';
import path from 'path';
import fs from 'fs/promises';
import { fileURLToPath } from 'url';

async function callOpenAI(input: any[]) {
  const output: any[] = [];
  let currentQuestion: any = null;

  input.forEach(row => {
    if (row.Flag === "QuestionText") {
      // Start a new question object
      currentQuestion = { ...row, Answers: [] };
      output.push(currentQuestion);
    } else if (row.Flag === "AnswerValue" && currentQuestion) {
      // Add an answer to the current question
      const answer = { ...row, QuestionKey: currentQuestion.PrimaryKey };
      currentQuestion.Answers.push(answer);
    }
  });

  return output;
}

export async function GET() {
  try {
    // Get the directory of the current module
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);

    // Construct the absolute path to survey.json
    const surveyPath = path.join(__dirname, '../../../../survey.json');

    // Read the survey.json file
    const fileContent = await fs.readFile(surveyPath, 'utf-8');
    const jsonOld = JSON.parse(fileContent);

    // Transform the JSON
    const jsonRefactor = await callOpenAI(jsonOld);

    // Return the transformed JSON
    return NextResponse.json({ jsonOld, jsonRefactor });
  } catch (error) {
    console.error("Error processing JSON:", error);
    return NextResponse.json({ error: 'Failed to process JSON' }, { status: 500 });
  }
} 