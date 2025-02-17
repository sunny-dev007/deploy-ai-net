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
  SubQuestions?: { [key: string]: StructuredQuestion }; // To store sub-questions
}

interface ResponseData {
  ResponseCount: number;
  ResponsePercent: number;
  SampleSize: number;
  Level: string;
  question_key: string;
  [key: string]: any; // Allow additional dynamic properties
}

interface BrandCategory {
  ResponseCount: string;
  ResponsePercent: string;
  SampleSize: string;
  [key: string]: ResponseData | string | any; // Allow both ResponseData and additional properties
}

interface DictionaryOutput {
  [key: string]: {
    question_text: string;
    responses: {
      [key: string]: ResponseData | BrandCategory;
    };
    [key: string]: any; // Allow additional dynamic properties
  };
}

async function transformToStructured(input: SurveyRow[]): Promise<StructuredQuestion[]> {
    const output: StructuredQuestion[] = [];
    let currentQuestion: StructuredQuestion | null = null;

    input.forEach(row => {
        if (row.Flag === "QuestionText") {
            currentQuestion = { ...row, Answers: [], SubQuestions: {} };
            output.push(currentQuestion);
        } else if (row.Flag === "ChoiceOption" && currentQuestion) {
            if (!currentQuestion.SubQuestions) currentQuestion.SubQuestions = {};
            currentQuestion.SubQuestions[row.Questions] = { ...row, Answers: [] };
        } else if (row.Flag === "AnswerValue" && currentQuestion) {
            if (currentQuestion.SubQuestions && Object.keys(currentQuestion.SubQuestions).length > 0) {
                const lastSubQuestionKey = Object.keys(currentQuestion.SubQuestions).pop() || "";
                currentQuestion.SubQuestions[lastSubQuestionKey].Answers.push({ ...row, QuestionKey: currentQuestion.PrimaryKey });
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
        
        output[primaryKey] = {
            question_text: question.Questions,
            responses: {},
            ...Object.entries(question)
                .filter(([key]) => !['Questions', 'Answers', 'SubQuestions', 'Flag', 'PrimaryKey'].includes(key))
                .reduce((acc, [key, value]) => ({ ...acc, [key]: value }), {})
        };

        // Handle regular answers (non-subquestions)
        if (question.Answers?.length > 0) {
            question.Answers.forEach(answer => {
                output[primaryKey].responses[answer.Questions] = {
                    ResponseCount: answer.ResponseCount || 0,
                    ResponsePercent: parseFloat((answer.ResponsePercent || 0).toString()) * 100,
                    SampleSize: parseInt((answer.SampleSize || 0).toString()),
                    Level: answer.Level || '',
                    question_key: answer.QuestionKey || primaryKey,
                    ...Object.entries(answer)
                        .filter(([key]) => !['Questions', 'ResponseCount', 'ResponsePercent', 'SampleSize', 
                            'Level', 'QuestionKey', 'Flag', 'BlockID', 'BlockName'].includes(key))
                        .reduce((acc, [key, value]) => ({ ...acc, [key]: value }), {})
                };
            });
        }

        // Handle SubQuestions (ChoiceOption case)
        if (question.SubQuestions) {
            Object.entries(question.SubQuestions).forEach(([subQuestionText, subQuestion]) => {
                const totalResponses = subQuestion.Answers?.reduce((sum, answer) => sum + (answer.ResponseCount || 0), 0) || 0;
                
                output[primaryKey].responses[subQuestionText] = {
                    ResponseCount: `n=${totalResponses}`,
                    ResponsePercent: '',
                    SampleSize: '',
                    ...Object.entries(subQuestion)
                        .filter(([key]) => !['Questions', 'Answers', 'Flag', 'BlockID', 'BlockName'].includes(key))
                        .reduce((acc, [key, value]) => ({ ...acc, [key]: value }), {})
                } as BrandCategory;

                subQuestion.Answers?.forEach(answer => {
                    const sentiment = answer.Questions;
                    (output[primaryKey].responses[subQuestionText] as BrandCategory)[sentiment] = {
                        ResponseCount: answer.ResponseCount || 0,
                        ResponsePercent: parseFloat((answer.ResponsePercent || 0).toString()) * 100,
                        SampleSize: parseInt((answer.SampleSize || 0).toString()),
                        Level: answer.Level || '',
                        question_key: answer.QuestionKey || primaryKey,
                        ...Object.entries(answer)
                            .filter(([key]) => !['Questions', 'ResponseCount', 'ResponsePercent', 'SampleSize',
                                'Level', 'QuestionKey', 'Flag', 'BlockID', 'BlockName'].includes(key))
                            .reduce((acc, [key, value]) => ({ ...acc, [key]: value }), {})
                    };
                });
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