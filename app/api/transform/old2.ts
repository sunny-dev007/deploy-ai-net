import { NextRequest, NextResponse } from 'next/server';

interface SurveyRow {
  Flag: string;
  PrimaryKey: string;
  Questions: string;
  Answers?: any[];
  BlockID: string;
  BlockName: string;
  [key: string]: any;
}

interface StructuredQuestion extends SurveyRow {
  Answers: SurveyRow[];
  sub_questions?: { [key: string]: StructuredQuestion };
}

interface DictionaryOutput {
  [key: string]: {
    question_text: string;
    ResponseCount: any;
    ResponsePercent: any;
    BlockID: string;
    BlockName: string;
    responses?: {
      [key: string]: {
        ResponseCount: number;
        ResponsePercent: number;
        SampleSize: number;
        Level: string;
        question_key: string;
      };
    };
    choice_responses?: any;
  };
}

async function transformToStructured(input: SurveyRow[]): Promise<StructuredQuestion[]> {
    const output: StructuredQuestion[] = [];
    let currentQuestion: StructuredQuestion | null = null;

    input.forEach(row => {
        if (row.Flag === "QuestionText") {
            currentQuestion = { ...row, Answers: [] };
            output.push(currentQuestion);
        } else if (row.Flag === "ChoiceOption" && currentQuestion) {
            if (!currentQuestion.sub_questions) currentQuestion.sub_questions = {};
            currentQuestion.sub_questions[row.Questions] = { ...row, Answers: [] };
        } else if (row.Flag === "AnswerValue" && currentQuestion) {
            if (currentQuestion.sub_questions && Object.keys(currentQuestion.sub_questions).length > 0) {
                const lastSubQuestionKey = Object.keys(currentQuestion.sub_questions).pop() || "";
                const subQuestion = currentQuestion.sub_questions[lastSubQuestionKey];
                subQuestion.Answers.push({ ...row, QuestionKey: currentQuestion.PrimaryKey });
            } else {
                currentQuestion.Answers.push({ ...row, QuestionKey: currentQuestion.PrimaryKey });
            }
        }
    });
    return output;
}

async function transformToDictionary(structuredInput: StructuredQuestion[]): Promise<DictionaryOutput> {
    const output: DictionaryOutput = {};
    structuredInput.forEach(question => {
        const primaryKey = question.PrimaryKey;
        const isMatrix = question.BlockName === "Matrix"; // Adjust based on your criteria for matrix
        output[primaryKey] = {
            question_text: question.Questions,
            ResponseCount: question.ResponseCount,
            ResponsePercent: question.ResponsePercent,
            BlockID: question.BlockID,
            BlockName: question.BlockName,
            responses: {},
            choice_responses: isMatrix ? {} : undefined
        };

        if (isMatrix) {
            Object.entries(question.sub_questions || {}).forEach(([subQuestionText, subQuestion]) => {
                (output[primaryKey].choice_responses!)[subQuestionText] = {
                    question_text: subQuestion.Questions,
                    responses: {}
                };
                subQuestion.Answers.forEach(answer => {
                    (output[primaryKey].choice_responses!)[subQuestionText].responses[answer.Questions] = {
                        ResponseCount: answer.ResponseCount,
                        ResponsePercent: answer.ResponsePercent,
                        SampleSize: answer.SampleSize,
                        Level: answer.Level,
                        question_key: answer.QuestionKey
                    };
                });
            });
        } else if (question.Answers) {
            question.Answers.forEach(answer => {
                if (!output[primaryKey].responses) {
                    output[primaryKey].responses = {};
                }
                output[primaryKey].responses[answer.Questions] = {
                    ResponseCount: answer.ResponseCount,
                    ResponsePercent: answer.ResponsePercent,
                    SampleSize: answer.SampleSize,
                    Level: answer.Level,
                    question_key: answer.QuestionKey
                };
            });
        }
    });
    return output;
}

export async function POST(req: NextRequest) {
    try {
        let oldJsonData: SurveyRow[];
        try {
            oldJsonData = await req.json();
        } catch (parseError) {
            return NextResponse.json({ error: 'Invalid JSON in request body' }, { status: 400 });
        }

        if (!Array.isArray(oldJsonData)) {
            return NextResponse.json({ error: 'Request body must be an array' }, { status: 400 });
        }

        const structuredData = await transformToStructured(oldJsonData);
        const finalDictionary = await transformToDictionary(structuredData);

        return NextResponse.json(finalDictionary);
    } catch (error) {
        console.error("Error processing JSON:", error);
        return NextResponse.json({ error: 'Failed to process JSON' }, { status: 500 });
    }
}