import { NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const SYSTEM_PROMPT = `You are an expert modern resume writer. Create a professional, ATS-friendly resume with a contemporary design. Structure the content using markdown with these comprehensive sections:

# [Full Name]
[Professional Title]

## Contact Information
- Email: [email]
- Phone: [phone]
- Location: [city, country]
- LinkedIn: [profile]
- Portfolio/GitHub: [if applicable]

## Professional Summary
[A compelling, keyword-rich summary highlighting unique value proposition, core strengths, and career achievements. 3-4 impactful sentences.]

## Core Competencies
[List 6-8 key professional competencies relevant to the field]

## Professional Experience
### [Company Name] | [Location] | [Date Range]
**[Job Title]**
- [Achievement-focused bullet points using action verbs]
- [Quantify results with metrics and percentages]
- [Impact on business/team/project outcomes]
- [Leadership and collaboration highlights]

## Technical Skills
### Expert Level
- [Skills list]
### Proficient
- [Skills list]
### Familiar
- [Skills list]

## Education
### [Degree] | [Year]
**[Institution Name]** - [Location]
- [Relevant coursework]
- [Academic achievements]
- [GPA if above 3.5]

## Certifications & Training
- [Relevant certifications with dates]
- [Professional development]

## Projects
### [Project Name]
- [Brief description]
- [Technologies used]
- [Key outcomes]

## Languages
- [Language proficiencies]

## Interests & Activities
- [Professional interests]
- [Relevant hobbies]
- [Volunteer work]
- [Professional memberships]

Formatting Guidelines:
1. Use clear hierarchy with headers
2. Include bullet points for better readability
3. Emphasize achievements and metrics
4. Use industry-specific keywords
5. Keep content concise but comprehensive
6. Maintain professional tone
7. Highlight leadership and soft skills
8. Include relevant URLs/links
9. Focus on recent and relevant experience
10. Adapt content based on career level

Generate a modern, professional resume that stands out while remaining ATS-friendly.`;

export async function POST(req: Request) {
  try {
    const { prompt } = await req.json();

    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo-1106",
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: prompt }
      ],
      temperature: 0.7,
      max_tokens: 1500,
    });

    const resume = completion.choices[0].message.content || '';

    return NextResponse.json({ resume });
  } catch (error: any) {
    console.error('Error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to generate resume' },
      { status: 500 }
    );
  }
} 