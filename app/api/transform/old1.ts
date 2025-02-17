import { NextRequest, NextResponse } from 'next/server';

interface SurveyRow {
  Flag: string;
  PrimaryKey: string;
  Questions: string;
  Answers?: any[];
  [key: string]: any;
}

interface StructuredQuestion extends SurveyRow {
  Answers: SurveyRow[];
}

interface DictionaryOutput {
  [key: string]: {
    question_text: string;
    ResponseCount: number;
    ResponsePercent: number;
    BlockID: string;
    BlockName: string;
    responses: {
      [key: string]: {
        ResponseCount: number;
        ResponsePercent: number;
        SampleSize: number;
        Level: string;
        question_key: string;
      };
    };
  };
}

async function transformToStructured(input: SurveyRow[]): Promise<StructuredQuestion[]> {
    const output: StructuredQuestion[] = [];
    let currentQuestion: StructuredQuestion | null = null;

    input.forEach(row => {
        if (row.Flag === "QuestionText") {
            currentQuestion = { ...row, Answers: [] };
            output.push(currentQuestion);
        } else if ((row.Flag === "AnswerValue" || row.Flag === "ChoiceOption") && currentQuestion) {
            const answer = { ...row, QuestionKey: currentQuestion.PrimaryKey };
            currentQuestion.Answers.push(answer);
        }
    });
    return output;
}

async function transformToDictionary(structuredInput: StructuredQuestion[]): Promise<DictionaryOutput> {
    const output: DictionaryOutput = {};
    structuredInput.forEach(question => {
        const primaryKey = question.PrimaryKey;
        output[primaryKey] = {
            question_text: question.Questions,
            ResponseCount: question.ResponseCount,
            ResponsePercent: question.ResponsePercent,
            BlockID: question.BlockID,
            BlockName: question.BlockName,
            responses: {}
        };
        question.Answers.forEach(answer => {
            output[primaryKey].responses[answer.Questions] = {
                ResponseCount: answer.ResponseCount,
                ResponsePercent: answer.ResponsePercent,
                SampleSize: answer.SampleSize,  
                Level: answer.Level,
                question_key: answer.QuestionKey
            };
        });
    });
    return output;
}

export async function POST(req: NextRequest) {
    try {
        // Check if request has a body
        if (!req.body) {
            return NextResponse.json(
                { error: 'Request body is required' },
                { status: 400 }
            );
        }

        let oldJsonData: SurveyRow[];
        try {
            oldJsonData = await req.json();
        } catch (parseError) {
            return NextResponse.json(
                { error: 'Invalid JSON in request body' },
                { status: 400 }
            );
        }

        // Validate the input is an array
        if (!Array.isArray(oldJsonData)) {
            return NextResponse.json(
                { error: 'Request body must be an array' },
                { status: 400 }
            );
        }

        // Validate array is not empty
        if (oldJsonData.length === 0) {
            return NextResponse.json(
                { error: 'Array cannot be empty' },
                { status: 400 }
            );
        }

        // Convert the old JSON to the new structured format
        const structuredData = await transformToStructured(oldJsonData);

        // Transform the structured data to the final dictionary format
        const finalDictionary = await transformToDictionary(structuredData);

        // Return the final transformed JSON
        return NextResponse.json(finalDictionary);
    } catch (error) {
        console.error("Error processing JSON:", error);
        return NextResponse.json({ error: 'Failed to process JSON' }, { status: 500 });
    }
}