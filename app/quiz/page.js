import QuizGenerator from "@/components/QuizGenerator";

export const metadata = {
    title: "AI Quiz Generator | AI Quiz App",
    description: "Generate personalized quizzes on any topic with AI. Test your knowledge and improve your learning with intelligent questions.",
};

export default function Quiz() {
    return (
        <div className="container mx-auto px-4 py-12">
            <QuizGenerator />
        </div>
    );
}