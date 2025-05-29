"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { saveQuizResult } from "../utils/progressStorage";

export default function QuizGenerator() {
  const [topic, setTopic] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [questions, setQuestions] = useState([]);
  const [userAnswers, setUserAnswers] = useState({});
  const [showResults, setShowResults] = useState(false);
  const [error, setError] = useState("");
  const [score, setScore] = useState(0);
  const [isBackupSource, setIsBackupSource] = useState(false);
  const [startTime, setStartTime] = useState(null);
  const [timeTaken, setTimeTaken] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!topic.trim()) {
      setError("Please enter a quiz topic");
      return;
    }

    setIsLoading(true);
    setError("");
    setQuestions([]);
    setUserAnswers({});
    setShowResults(false);
    setScore(0);
    setIsBackupSource(false);
    setStartTime(null);
    setTimeTaken(null);

    try {
      const response = await fetch("/api/generate-quiz", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic }),
      });

      if (!response.ok) throw new Error("Failed to generate quiz");
      const data = await response.json();

      setQuestions(data.questions);
      setStartTime(Date.now()); // Start timing the quiz

      // Check if we're using backup questions
      if (data.source === "backup") {
        setIsBackupSource(true);
      }
    } catch (err) {
      setError("Failed to generate quiz. Please try again.");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAnswerSelect = (questionId, optionIndex) => {
    setUserAnswers({
      ...userAnswers,
      [questionId]: optionIndex,
    });
  };

  const handleQuizSubmit = () => {
    if (Object.keys(userAnswers).length < questions.length) {
      setError("Please answer all questions before submitting");
      return;
    }

    let correctCount = 0;
    questions.forEach((question) => {
      if (userAnswers[question.id] === question.correctAnswer) {
        correctCount++;
      }
    });

    const endTime = Date.now();
    const quizTimeTaken = startTime
      ? Math.round((endTime - startTime) / 1000)
      : null;

    setScore(correctCount);
    setTimeTaken(quizTimeTaken);
    setShowResults(true);
    setError("");

    // Save the quiz result to localStorage
    try {
      saveQuizResult({
        topic,
        score: correctCount,
        totalQuestions: questions.length,
        timeTaken: quizTimeTaken,
        isBackupSource,
        questions,
        userAnswers,
      });
    } catch (error) {
      console.error("Failed to save quiz result:", error);
    }
  };

  const resetQuiz = () => {
    setShowResults(false);
    setUserAnswers({});
    setQuestions([]);
    setTopic("");
    setScore(0);
    setIsBackupSource(false);
    setStartTime(null);
    setTimeTaken(null);
  };

  const formatTime = (seconds) => {
    if (!seconds) return null;
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return minutes > 0
      ? `${minutes}m ${remainingSeconds}s`
      : `${remainingSeconds}s`;
  };

  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-4xl font-bold mb-8 text-center bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-purple-600">
        Generate Your Quiz
      </h1>

      {!questions.length > 0 && (
        <div className="card bg-base-100 shadow-xl mb-8">
          <div className="card-body">
            <form onSubmit={handleSubmit}>
              <div className="form-control mb-4">
                <label className="label">
                  <span className="label-text text-lg">
                    What would you like to be quizzed on?
                  </span>
                </label>
                <input
                  type="text"
                  className="input input-bordered w-full"
                  placeholder="Enter a topic (e.g., 'Quantum Physics', 'French History')"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                />
                {error && <p className="text-error mt-2">{error}</p>}
              </div>

              <button
                type="submit"
                className={`btn btn-primary w-full ${
                  isLoading ? "loading" : ""
                }`}
                disabled={isLoading}
              >
                {isLoading ? "Generating Quiz..." : "Generate Quiz"}
              </button>
            </form>
          </div>
        </div>
      )}

      {questions.length > 0 && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold">Your Quiz on {topic}</h2>
            {!showResults && (
              <button onClick={resetQuiz} className="btn btn-primary btn-sm">
                Start Over
              </button>
            )}
          </div>

          {isBackupSource && (
            <div className="alert alert-warning">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="stroke-current shrink-0 h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
              <span>
                Using backup questions. The AI service couldn't generate
                questions for this topic.
              </span>
            </div>
          )}

          {questions.map((q, index) => (
            <div key={q.id} className="card bg-base-100 shadow-xl">
              <div className="card-body">
                <h3 className="text-xl font-medium">
                  {index + 1}. {q.question}
                </h3>
                <div className="space-y-2 mt-4">
                  {q.options.map((option, i) => (
                    <div
                      key={i}
                      className={`flex items-center p-3 rounded-lg ${
                        showResults
                          ? i === q.correctAnswer
                            ? "bg-success bg-opacity-20"
                            : userAnswers[q.id] === i &&
                              userAnswers[q.id] !== q.correctAnswer
                            ? "bg-error bg-opacity-20"
                            : "hover:bg-base-200"
                          : userAnswers[q.id] === i
                          ? "bg-primary/7 hover:bg-primary/10"
                          : "hover:bg-base-200"
                      }`}
                    >
                      <input
                        type="radio"
                        name={`question-${q.id}`}
                        id={`q${q.id}-option${i}`}
                        className="radio radio-primary mr-3"
                        checked={userAnswers[q.id] === i}
                        onChange={() => handleAnswerSelect(q.id, i)}
                        disabled={showResults}
                      />
                      <label
                        htmlFor={`q${q.id}-option${i}`}
                        className="cursor-pointer flex-1"
                      >
                        {option}
                      </label>
                      {showResults && i === q.correctAnswer && (
                        <div className="badge badge-success ml-2">
                          Correct Answer
                        </div>
                      )}
                    </div>
                  ))}
                </div>
                {showResults && (
                  <div className="mt-4 p-3 rounded-lg bg-base-200">
                    {userAnswers[q.id] === q.correctAnswer ? (
                      <div>
                        <p className="text-success font-medium">
                          ✓ You answered correctly!
                        </p>
                        {q.explanation && (
                          <p className="text-sm text-base-content/70 mt-2">
                            {q.explanation}
                          </p>
                        )}
                      </div>
                    ) : (
                      <div>
                        <p className="text-error font-medium">
                          ✗ You selected "{q.options[userAnswers[q.id]]}".
                          <br />
                          The correct answer is: "{q.options[q.correctAnswer]}"
                        </p>
                        {q.explanation && (
                          <p className="text-sm text-base-content/70 mt-3 p-2 bg-info/10 rounded">
                            <span className="font-medium">Explanation:</span>{" "}
                            {q.explanation}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}

          {!showResults ? (
            <button
              className="btn btn-success w-full mt-8"
              onClick={handleQuizSubmit}
              disabled={Object.keys(userAnswers).length !== questions.length}
            >
              {Object.keys(userAnswers).length === questions.length
                ? "Submit Answers"
                : `Answer all questions (${Object.keys(userAnswers).length}/${
                    questions.length
                  })`}
            </button>
          ) : (
            <div className="card bg-base-100 shadow-xl mt-8">
              <div className="card-body text-center">
                <h2 className="card-title text-2xl justify-center">
                  Your Score: {score} out of {questions.length}
                </h2>
                {timeTaken && (
                  <p className="text-lg text-base-content/70">
                    Completed in {formatTime(timeTaken)}
                  </p>
                )}
                <p className="text-xl mt-2">
                  {score === questions.length
                    ? "Perfect! You aced it! 🎉"
                    : score >= questions.length * 0.8
                    ? "Excellent job! You know this topic well! 🌟"
                    : score >= questions.length * 0.6
                    ? "Good work! You have solid knowledge on this topic. 👍"
                    : score >= questions.length * 0.4
                    ? "Not bad! Keep learning about this topic. 📚"
                    : "This topic seems challenging. Keep studying! 💪"}
                </p>
                <progress
                  className={`progress w-full mt-2 ${
                    score >= questions.length * 0.6
                      ? "progress-success"
                      : "progress-warning"
                  }`}
                  value={score}
                  max={questions.length}
                ></progress>
                <div className="card-actions justify-center mt-6 gap-4">
                  <button className="btn btn-primary" onClick={resetQuiz}>
                    Try Another Topic
                  </button>
                  <Link href="/progress" className="btn btn-outline">
                    View Progress
                  </Link>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
