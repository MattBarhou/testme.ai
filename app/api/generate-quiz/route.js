export async function POST(request) {
    try {
        const { topic } = await request.json();

        if (!topic) {
            return Response.json({ error: "Topic is required" }, { status: 400 });
        }

        try {
            // Use HuggingFace's API to generate quiz questions
            const questions = await generateQuestionsWithHuggingFace(topic);
            return Response.json({ questions });
        } catch (apiError) {
            console.error('AI API error:', apiError);
            // Fallback to our backup generator if the API fails
            const backupQuestions = generateBackupQuestions(topic);
            return Response.json({
                questions: backupQuestions,
                source: "backup"
            });
        }
    } catch (error) {
        console.error('Quiz generation error:', error);
        return Response.json({ error: "Failed to generate quiz" }, { status: 500 });
    }
}

async function generateQuestionsWithHuggingFace(topic) {

    const prompt = `Create 10 high-quality multiple-choice quiz questions about "${topic}". Follow these rules EXACTLY:

1. Use POSITIVE questions - avoid "NOT", "EXCEPT", or negative phrasing 
2. Each question should have exactly 4 answer options
3. Only ONE option should be clearly correct
4. Include a brief explanation for why the correct answer is right
5. Make questions factually accurate and educational
6. Use present-day knowledge and avoid controversial topics

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

    const model = "mistralai/Mixtral-8x7B-Instruct-v0.1";

    try {
        // Check for API key
        if (!process.env.HUGGINGFACE_API_KEY) {
            throw new Error("HUGGINGFACE_API_KEY is not configured");
        }

        // Make the API call to HuggingFace
        const response = await fetch(
            `https://api-inference.huggingface.co/models/${model}`,
            {
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${process.env.HUGGINGFACE_API_KEY}`
                },
                method: "POST",
                body: JSON.stringify({
                    inputs: prompt,
                    parameters: {
                        max_new_tokens: 2000,
                        temperature: 0.7,
                        return_full_text: false
                    }
                }),
            }
        );

        if (!response.ok) {
            const errorText = await response.text();
            console.error(`API request failed with status ${response.status}`);
            console.error(`Response: ${errorText}`);

            // Check for specific errors
            if (response.status === 404) {
                throw new Error(`Model ${model} not found or not available`);
            } else if (response.status === 401 || response.status === 403) {
                throw new Error("API key is invalid or you don't have access to this model");
            } else if (response.status === 503) {
                throw new Error("Model is currently loading or unavailable. Please try again later.");
            }

            throw new Error(`API request failed with status ${response.status}: ${errorText}`);
        }

        const result = await response.json();
        console.log("API response:", result);

        // The response format varies by model, extract the text
        let responseText;
        if (typeof result === 'string') {
            responseText = result;
        } else if (Array.isArray(result) && result.length > 0) {
            // Handle different response formats
            responseText = result[0]?.generated_text || result[0]?.text || JSON.stringify(result);
        } else if (result.generated_text) {
            responseText = result.generated_text;
        } else {
            responseText = JSON.stringify(result);
        }

        console.log("Raw response text:", responseText);

        // Clean up the response text and extract JSON
        // Remove markdown code blocks
        let cleanedText = responseText.replace(/```json\n?/g, '').replace(/```\n?/g, '');

        // Try to find all JSON arrays in the response
        const jsonArrayMatches = cleanedText.match(/\[\s*\{[\s\S]*?\}\s*\]/g);

        if (!jsonArrayMatches || jsonArrayMatches.length === 0) {
            console.error("No JSON arrays found in response:", cleanedText);
            throw new Error("No valid JSON found in response");
        }

        // Find the largest JSON array (likely the complete questions list)
        let largestJson = '';
        let maxLength = 0;

        for (const jsonStr of jsonArrayMatches) {
            if (jsonStr.length > maxLength) {
                maxLength = jsonStr.length;
                largestJson = jsonStr;
            }
        }

        console.log("Selected JSON:", largestJson);

        // Parse and validate the JSON
        let parsedQuestions;
        try {
            parsedQuestions = JSON.parse(largestJson);
        } catch (parseError) {
            console.error("JSON parse error:", parseError);
            console.error("Attempted to parse:", largestJson);
            throw new Error("Failed to parse JSON response");
        }

        console.log("Parsed questions:", parsedQuestions);

        if (!Array.isArray(parsedQuestions) || parsedQuestions.length === 0) {
            throw new Error("Invalid questions format");
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
    } catch (error) {
        console.error("Error generating questions with HuggingFace:", error);
        throw error;
    }
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