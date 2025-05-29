// Progress Storage Utility
// Handles saving and retrieving quiz progress data

export const STORAGE_KEY = 'quiz_progress_data';

// Get all quiz history
export const getQuizHistory = () => {
    if (typeof window === 'undefined') return [];

    try {
        const data = localStorage.getItem(STORAGE_KEY);
        return data ? JSON.parse(data) : [];
    } catch (error) {
        console.error('Error retrieving quiz history:', error);
        return [];
    }
};

// Save a new quiz result
export const saveQuizResult = (quizData) => {
    if (typeof window === 'undefined') return;

    try {
        const history = getQuizHistory();
        const newEntry = {
            id: Date.now(), // Simple ID based on timestamp
            topic: quizData.topic,
            score: quizData.score,
            totalQuestions: quizData.totalQuestions,
            percentage: Math.round((quizData.score / quizData.totalQuestions) * 100),
            completedAt: new Date().toISOString(),
            timeTaken: quizData.timeTaken || null, // in seconds
            isBackupSource: quizData.isBackupSource || false,
            questions: quizData.questions || [], // Store questions for review
            userAnswers: quizData.userAnswers || {}
        };

        history.push(newEntry);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(history));

        return newEntry;
    } catch (error) {
        console.error('Error saving quiz result:', error);
    }
};

// Get progress statistics
export const getProgressStats = () => {
    const history = getQuizHistory();

    if (history.length === 0) {
        return {
            totalQuizzes: 0,
            averageScore: 0,
            bestScore: 0,
            totalTopics: 0,
            recentPerformance: [],
            topicPerformance: {},
            improvement: null
        };
    }

    const totalQuizzes = history.length;
    const averageScore = Math.round(
        history.reduce((sum, quiz) => sum + quiz.percentage, 0) / totalQuizzes
    );
    const bestScore = Math.max(...history.map(quiz => quiz.percentage));

    // Get unique topics
    const topics = [...new Set(history.map(quiz => quiz.topic.toLowerCase()))];
    const totalTopics = topics.length;

    // Recent performance (last 10 quizzes)
    const recentPerformance = history
        .slice(-10)
        .map(quiz => ({
            topic: quiz.topic,
            percentage: quiz.percentage,
            date: quiz.completedAt
        }));

    // Performance by topic
    const topicPerformance = {};
    history.forEach(quiz => {
        const topic = quiz.topic.toLowerCase();
        if (!topicPerformance[topic]) {
            topicPerformance[topic] = {
                topic: quiz.topic, // Keep original casing
                quizzes: [],
                averageScore: 0,
                bestScore: 0,
                totalQuizzes: 0
            };
        }
        topicPerformance[topic].quizzes.push(quiz);
        topicPerformance[topic].totalQuizzes++;
    });

    // Calculate averages for each topic
    Object.keys(topicPerformance).forEach(topic => {
        const quizzes = topicPerformance[topic].quizzes;
        topicPerformance[topic].averageScore = Math.round(
            quizzes.reduce((sum, quiz) => sum + quiz.percentage, 0) / quizzes.length
        );
        topicPerformance[topic].bestScore = Math.max(...quizzes.map(quiz => quiz.percentage));
    });

    // Calculate improvement trend (comparing first half vs second half)
    let improvement = null;
    if (totalQuizzes >= 4) {
        const halfPoint = Math.floor(totalQuizzes / 2);
        const firstHalf = history.slice(0, halfPoint);
        const secondHalf = history.slice(halfPoint);

        const firstHalfAvg = firstHalf.reduce((sum, quiz) => sum + quiz.percentage, 0) / firstHalf.length;
        const secondHalfAvg = secondHalf.reduce((sum, quiz) => sum + quiz.percentage, 0) / secondHalf.length;

        improvement = Math.round(secondHalfAvg - firstHalfAvg);
    }

    return {
        totalQuizzes,
        averageScore,
        bestScore,
        totalTopics,
        recentPerformance,
        topicPerformance,
        improvement
    };
};

// Clear all progress (for testing or reset)
export const clearProgress = () => {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(STORAGE_KEY);
};

// Get quiz by ID
export const getQuizById = (id) => {
    const history = getQuizHistory();
    return history.find(quiz => quiz.id === id);
}; 