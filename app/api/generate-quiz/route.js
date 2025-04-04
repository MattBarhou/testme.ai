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
    // Simplified prompt 
    const prompt = `
Create 10 multiple-choice quiz questions about "${topic}".
Return only JSON in this format, with no other text:
[
  {
    "id": 1,
    "question": "What is ${topic}?",
    "options": ["Answer 1", "Answer 2", "Answer 3", "Answer 4"],
    "correctAnswer": 2
  }
]
The correctAnswer should be a number 0-3 indicating which option is correct.
`;


    const model = "mistralai/Mistral-7B-Instruct-v0.2"; // Alternative to flan-t5-xxl

    try {
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
            console.error(`API request failed with status ${response.status}`);
            console.error(`Response: ${await response.text()}`);
            throw new Error(`API request failed with status ${response.status}`);
        }

        const result = await response.json();
        console.log("API response:", result);

        // The response format varies by model, extract the text
        const responseText = typeof result === 'string'
            ? result
            : Array.isArray(result) && result[0]?.generated_text
                ? result[0].generated_text
                : JSON.stringify(result);

        // Try to find JSON in the response
        const jsonMatch = responseText.match(/\[\s*\{[\s\S]*\}\s*\]/);
        if (!jsonMatch) {
            console.error("Failed to extract JSON from response:", responseText);
            throw new Error("Failed to extract JSON from response");
        }

        // Parse and validate the JSON
        const parsedQuestions = JSON.parse(jsonMatch[0]);
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
                : 0
        }));
    } catch (error) {
        console.error("Error generating questions with HuggingFace:", error);
        throw error;
    }
}

// Backup question generator in case the API fails
function generateBackupQuestions(topic, count = 10) {
    const questions = [];

    // Question templates
    const templates = [
        {
            question: `What is the main focus of ${topic}?`,
            options: [
                `Historical development`,
                `Theoretical foundations`,
                `Practical applications`,
                `Cultural impact`
            ],
        },
        {
            question: `Which field is most closely related to ${topic}?`,
            options: [
                `Mathematics`,
                `Philosophy`,
                `Engineering`,
                `Social sciences`
            ],
        },
        {
            question: `When did ${topic} emerge as a distinct field?`,
            options: [
                `Ancient times`,
                `17th-18th centuries`,
                `19th-20th centuries`,
                `21st century`
            ],
        },
        {
            question: `Which of these is a fundamental principle in ${topic}?`,
            options: [
                `Conservation of energy`,
                `Systematic organization`,
                `Empirical verification`,
                `Logical reasoning`
            ],
        },
        {
            question: `Who is often credited with major contributions to ${topic}?`,
            options: [
                `Ancient Greek philosophers`,
                `Renaissance thinkers`,
                `Enlightenment scientists`,
                `Modern researchers`
            ],
        },
        {
            question: `What is a common application of ${topic} today?`,
            options: [
                `Medical diagnosis`,
                `Environmental monitoring`,
                `Educational assessment`,
                `Business analytics`
            ],
        },
        {
            question: `Which statement best describes the methodology used in ${topic}?`,
            options: [
                `Qualitative analysis of subjective data`,
                `Quantitative measurement of objective phenomena`,
                `Theoretical modeling of complex systems`,
                `Experimental testing of hypotheses`
            ],
        },
        {
            question: `How has the understanding of ${topic} evolved over time?`,
            options: [
                `From practical to theoretical`,
                `From simple to complex`,
                `From specialized to interdisciplinary`,
                `From descriptive to analytical`
            ],
        },
        {
            question: `What challenges does contemporary ${topic} face?`,
            options: [
                `Integration with new technologies`,
                `Ethical considerations`,
                `Funding limitations`,
                `Public understanding`
            ],
        },
        {
            question: `What is the relationship between ${topic} and innovation?`,
            options: [
                `${topic} drives innovation through new discoveries`,
                `Innovation provides tools for advancing ${topic}`,
                `${topic} and innovation develop independently`,
                `${topic} evaluates the impacts of innovation`
            ],
        }
    ];

    // Generate the requested number of questions
    for (let i = 0; i < count; i++) {
        const template = templates[i % templates.length];
        questions.push({
            id: i + 1,
            question: template.question,
            options: template.options,
            correctAnswer: Math.floor(Math.random() * 4), // Random correct answer
        });
    }

    return questions;
} 