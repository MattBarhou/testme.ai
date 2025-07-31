export async function POST(request) {
    try {
        const { topic } = await request.json();

        if (!topic) {
            return Response.json({ error: "Topic is required" }, { status: 400 });
        }

        try {
            // Use Google Gemini to generate quiz questions
            const questions = await generateQuestionsWithAI(topic);
            return Response.json({ questions, source: "gemini" });
        } catch (apiError) {
            console.error('Gemini API error:', apiError);
            console.error('Error details:', {
                message: apiError.message,
                stack: apiError.stack,
                topic: topic
            });
            // Fallback to backup generator if Gemini API fails
            const backupQuestions = generateBackupQuestions(topic);
            return Response.json({
                questions: backupQuestions,
                source: "backup",
                error: apiError.message
            });
        }
    } catch (error) {
        console.error('Quiz generation error:', error);
        return Response.json({ error: "Failed to generate quiz" }, { status: 500 });
    }
}

async function generateQuestionsWithAI(topic) {
    console.log('Generating quiz questions with Google Gemini API...');
    return await generateWithGemini(topic);
}

async function generateWithGemini(topic) {
    // Check for Gemini API key
    if (!process.env.GEMINI_API_KEY) {
        throw new Error("GEMINI_API_KEY is not configured");
    }

    const prompt = `Create 10 high-quality multiple-choice quiz questions about "${topic}". Follow these rules EXACTLY:

1. Use POSITIVE questions - avoid "NOT", "EXCEPT", or negative phrasing 
2. Each question should have exactly 4 answer options
3. Only ONE option should be clearly correct
4. Include a brief explanation for why the correct answer is right
5. Make questions factually accurate and educational
6. Use present-day knowledge and ensure questions are not too easy

Return ONLY valid JSON in this exact format:
[
  {
    "id": 1,
    "question": "What is the capital city of France?",
    "options": ["London", "Paris", "Berlin", "Madrid"],
    "correctAnswer": 1,
    "explanation": "Paris is the capital and largest city of France, located in the north-central part of the country."
  }
]

The correctAnswer must be the index (0-3) of the correct option.
Make sure explanations are helpful and educational.`;

    const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
        {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                contents: [{
                    parts: [{ text: prompt }]
                }],
                generationConfig: {
                    temperature: 0.7,
                    maxOutputTokens: 2000,
                }
            })
        }
    );

    if (!response.ok) {
        const errorText = await response.text();
        console.error(`Gemini API failed with status ${response.status}:`, errorText);
        throw new Error(`Gemini API failed: ${response.status} ${errorText}`);
    }

    const result = await response.json();
    console.log("Gemini API response:", result);

    // Extract text from Gemini response
    const responseText = result.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!responseText) {
        throw new Error("No text content in Gemini response");
    }

    console.log("Gemini response text:", responseText);

    // Parse JSON from response
    let cleanedText = responseText.replace(/```json\n?/g, '').replace(/```\n?/g, '');

    // Try to find JSON array in the response
    const jsonArrayMatches = cleanedText.match(/\[\s*\{[\s\S]*?\}\s*\]/g);

    if (!jsonArrayMatches || jsonArrayMatches.length === 0) {
        console.error("No JSON arrays found in Gemini response:", cleanedText);
        throw new Error("No valid JSON found in Gemini response");
    }

    // Use the largest JSON array
    let largestJson = '';
    let maxLength = 0;

    for (const jsonStr of jsonArrayMatches) {
        if (jsonStr.length > maxLength) {
            maxLength = jsonStr.length;
            largestJson = jsonStr;
        }
    }

    console.log("Selected JSON from Gemini:", largestJson);

    let parsedQuestions;
    try {
        parsedQuestions = JSON.parse(largestJson);
    } catch (parseError) {
        console.error("JSON parse error from Gemini:", parseError);
        console.error("Attempted to parse:", largestJson);
        throw new Error("Failed to parse JSON from Gemini response");
    }

    if (!Array.isArray(parsedQuestions) || parsedQuestions.length === 0) {
        throw new Error("Invalid questions format from Gemini");
    }

    // Format and validate the questions
    return parsedQuestions.slice(0, 10).map((q, index) => ({
        id: index + 1,
        question: q.question || `Question about ${topic}`,
        options: Array.isArray(q.options) && q.options.length === 4
            ? q.options
            : [`Option A about ${topic}`, `Option B about ${topic}`, `Option C about ${topic}`, `Option D about ${topic}`],
        correctAnswer: typeof q.correctAnswer === 'number' && q.correctAnswer >= 0 && q.correctAnswer <= 3
            ? q.correctAnswer
            : 0,
        explanation: q.explanation || `This is the correct answer about ${topic}.`
    }));
}

// Backup question generator in case the API fails
function generateBackupQuestions(topic, count = 10) {
    const questions = [];

    // Question templates with proper correct answers
    const templates = [
        {
            question: `What is the main focus of studying ${topic}?`,
            options: [
                `Historical development`,
                `Understanding its principles and applications`, // Correct answer
                `Memorizing facts`,
                `Cultural impact`
            ],
            correctAnswer: 1,
            explanation: `The main focus of studying any subject is to understand its principles and applications, which enables practical use and deeper comprehension.`
        },
        {
            question: `Which approach is most effective when learning about ${topic}?`,
            options: [
                `Passive reading only`,
                `Active research and practice`, // Correct answer
                `Avoiding difficult concepts`,
                `Memorizing definitions only`
            ],
            correctAnswer: 1,
            explanation: `Active research and practice are the most effective learning approaches as they engage multiple cognitive processes and reinforce understanding.`
        },
        {
            question: `What characterizes modern understanding of ${topic}?`,
            options: [
                `It remains unchanged from historical views`,
                `It continues to evolve with new discoveries`, // Correct answer
                `It is completely theoretical`,
                `It has no practical applications`
            ],
            correctAnswer: 1,
            explanation: `Modern understanding of most subjects continues to evolve as new research, technology, and discoveries provide fresh insights and perspectives.`
        },
        {
            question: `Which statement best describes the importance of ${topic}?`,
            options: [
                `It has limited real-world applications`,
                `It provides valuable knowledge and insights`, // Correct answer
                `It is only useful for academic purposes`,
                `It is outdated and irrelevant`
            ],
            correctAnswer: 1,
            explanation: `The importance of any field of study lies in providing valuable knowledge and insights that can be applied to understand and improve various aspects of life.`
        },
        {
            question: `What is a key benefit of understanding ${topic}?`,
            options: [
                `It requires no effort to learn`,
                `It enhances problem-solving abilities`, // Correct answer
                `It guarantees immediate success`,
                `It eliminates all uncertainties`
            ],
            correctAnswer: 1,
            explanation: `Understanding any subject enhances problem-solving abilities by providing tools, frameworks, and knowledge that can be applied to tackle various challenges.`
        },
        {
            question: `How does ${topic} relate to other fields of study?`,
            options: [
                `It exists in complete isolation`,
                `It connects with and influences other areas`, // Correct answer
                `It contradicts all other knowledge`,
                `It is unrelated to practical applications`
            ],
            correctAnswer: 1,
            explanation: `Most fields of study are interconnected and influence each other, creating a web of knowledge that enhances understanding across disciplines.`
        },
        {
            question: `What is essential for mastering ${topic}?`,
            options: [
                `Avoiding challenging questions`,
                `Consistent study and practice`, // Correct answer
                `Relying only on basic concepts`,
                `Ignoring foundational principles`
            ],
            correctAnswer: 1,
            explanation: `Mastering any subject requires consistent study and practice, which builds understanding gradually and reinforces learning through repetition.`
        },
        {
            question: `Which factor contributes most to expertise in ${topic}?`,
            options: [
                `Natural talent alone`,
                `Dedication and continuous learning`, // Correct answer
                `Memorizing textbooks`,
                `Avoiding difficult problems`
            ],
            correctAnswer: 1,
            explanation: `Expertise in any field comes primarily from dedication and continuous learning, as knowledge and skills develop through sustained effort over time.`
        },
        {
            question: `What makes ${topic} valuable in today's world?`,
            options: [
                `It is purely theoretical`,
                `It offers practical solutions and insights`, // Correct answer
                `It requires no critical thinking`,
                `It has no modern applications`
            ],
            correctAnswer: 1,
            explanation: `The value of any field of study in today's world comes from its ability to offer practical solutions and insights that can address real-world challenges.`
        },
        {
            question: `How should one approach learning ${topic}?`,
            options: [
                `With a passive mindset`,
                `With curiosity and critical thinking`, // Correct answer
                `By avoiding complex concepts`,
                `By memorizing without understanding`
            ],
            correctAnswer: 1,
            explanation: `Effective learning requires curiosity and critical thinking, which encourage deeper engagement with the material and better retention of knowledge.`
        }
    ];

    // Generate the requested number of questions
    for (let i = 0; i < count; i++) {
        const template = templates[i % templates.length];
        questions.push({
            id: i + 1,
            question: template.question,
            options: template.options,
            correctAnswer: template.correctAnswer,
            explanation: template.explanation
        });
    }

    return questions;
}