"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  getProgressStats,
  getQuizHistory,
  clearProgress,
} from "../utils/progressStorage";

export default function ProgressTracker() {
  const [stats, setStats] = useState(null);
  const [history, setHistory] = useState([]);
  const [selectedView, setSelectedView] = useState("overview"); // overview, history, topics
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Load progress data
    const progressStats = getProgressStats();
    const quizHistory = getQuizHistory();

    setStats(progressStats);
    setHistory(quizHistory);
    setLoading(false);
  }, []);

  const handleClearProgress = () => {
    if (
      confirm(
        "Are you sure you want to clear all progress? This action cannot be undone."
      )
    ) {
      clearProgress();
      setStats(getProgressStats());
      setHistory([]);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatTime = (seconds) => {
    if (!seconds) return "N/A";
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return minutes > 0
      ? `${minutes}m ${remainingSeconds}s`
      : `${remainingSeconds}s`;
  };

  const getScoreColor = (percentage) => {
    if (percentage >= 80) return "text-success";
    if (percentage >= 60) return "text-warning";
    return "text-error";
  };

  const getScoreBadge = (percentage) => {
    if (percentage >= 80) return "badge-success";
    if (percentage >= 60) return "badge-warning";
    return "badge-error";
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="flex justify-center items-center min-h-[50vh]">
          <span className="loading loading-spinner loading-lg"></span>
        </div>
      </div>
    );
  }

  if (stats.totalQuizzes === 0) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-8 bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-purple-600">
            Track Your Progress
          </h1>
          <div className="card bg-base-100 shadow-xl max-w-2xl mx-auto">
            <div className="card-body text-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-24 w-24 mx-auto text-base-content/30 mb-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                />
              </svg>
              <h2 className="text-2xl font-bold mb-4">No Quiz Data Yet</h2>
              <p className="text-lg mb-6">
                Start taking quizzes to see your progress and analytics here!
              </p>
              <Link href="/quiz" className="btn btn-primary">
                Take Your First Quiz
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-purple-600">
          Your Progress
        </h1>
        <div className="flex gap-2">
          <Link href="/quiz" className="btn btn-primary">
            Take New Quiz
          </Link>
          <button
            onClick={handleClearProgress}
            className="btn btn-outline btn-error"
          >
            Clear Progress
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="tabs tabs-boxed mb-8">
        <button
          className={`tab ${selectedView === "overview" ? "tab-active" : ""}`}
          onClick={() => setSelectedView("overview")}
        >
          Overview
        </button>
        <button
          className={`tab ${selectedView === "history" ? "tab-active" : ""}`}
          onClick={() => setSelectedView("history")}
        >
          Quiz History
        </button>
        <button
          className={`tab ${selectedView === "topics" ? "tab-active" : ""}`}
          onClick={() => setSelectedView("topics")}
        >
          Topics
        </button>
      </div>

      {/* Overview Tab */}
      {selectedView === "overview" && (
        <div className="space-y-8">
          {/* Key Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="stat bg-base-100 shadow-xl rounded-lg">
              <div className="stat-figure text-primary">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-8 w-8"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <div className="stat-title">Total Quizzes</div>
              <div className="stat-value text-primary">
                {stats.totalQuizzes}
              </div>
            </div>

            <div className="stat bg-base-100 shadow-xl rounded-lg">
              <div className="stat-figure text-secondary">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-8 w-8"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
                  />
                </svg>
              </div>
              <div className="stat-title">Average Score</div>
              <div className="stat-value text-secondary">
                {stats.averageScore}%
              </div>
            </div>

            <div className="stat bg-base-100 shadow-xl rounded-lg">
              <div className="stat-figure text-accent">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-8 w-8"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"
                  />
                </svg>
              </div>
              <div className="stat-title">Best Score</div>
              <div className="stat-value text-accent">{stats.bestScore}%</div>
            </div>

            <div className="stat bg-base-100 shadow-xl rounded-lg">
              <div className="stat-figure text-info">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-8 w-8"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                  />
                </svg>
              </div>
              <div className="stat-title">Topics Studied</div>
              <div className="stat-value text-info">{stats.totalTopics}</div>
            </div>
          </div>

          {/* Improvement Indicator */}
          {stats.improvement !== null && (
            <div className="alert alert-info">
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
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                ></path>
              </svg>
              <span>
                {stats.improvement > 0
                  ? `🎉 You've improved by ${stats.improvement}% compared to your earlier quizzes!`
                  : stats.improvement < 0
                  ? `📚 Your recent scores are ${Math.abs(
                      stats.improvement
                    )}% lower. Keep practicing!`
                  : `📊 Your performance has been consistent across quizzes.`}
              </span>
            </div>
          )}

          {/* Recent Performance Chart */}
          <div className="card bg-base-100 shadow-xl">
            <div className="card-body">
              <h2 className="card-title">Recent Performance</h2>
              <div className="w-full h-80 flex items-end justify-center gap-4 overflow-x-auto px-4">
                {stats.recentPerformance.slice(-10).map((quiz, index) => (
                  <div
                    key={index}
                    className="flex flex-col items-center min-w-[80px] max-w-[80px]"
                  >
                    <div
                      className={`w-12 bg-primary rounded-t mx-auto ${
                        quiz.percentage >= 80
                          ? "bg-success"
                          : quiz.percentage >= 60
                          ? "bg-warning"
                          : "bg-error"
                      }`}
                      style={{
                        height: `${(quiz.percentage / 100) * 200}px`,
                        minHeight: "10px",
                      }}
                      title={`${quiz.topic}: ${quiz.percentage}%`}
                    ></div>
                    <div className="text-xs mt-3 text-center w-full px-1">
                      <div
                        className="text-center break-words leading-tight"
                        title={quiz.topic}
                      >
                        {quiz.topic.length > 20
                          ? `${quiz.topic.slice(0, 20)}...`
                          : quiz.topic}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="text-center text-sm text-base-content/70 mt-6">
                Last {Math.min(10, stats.recentPerformance.length)} quizzes
              </div>
            </div>
          </div>
        </div>
      )}

      {/* History Tab */}
      {selectedView === "history" && (
        <div className="space-y-4">
          <h2 className="text-2xl font-bold">Quiz History</h2>
          <div className="grid gap-4">
            {history
              .slice()
              .reverse()
              .map((quiz, index) => (
                <div key={quiz.id} className="card bg-base-100 shadow-xl">
                  <div className="card-body">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h3 className="card-title">{quiz.topic}</h3>
                        <p className="text-base-content/70">
                          {formatDate(quiz.completedAt)}
                        </p>
                      </div>
                      <div className="text-right">
                        <div
                          className={`text-2xl font-bold ${getScoreColor(
                            quiz.percentage
                          )}`}
                        >
                          {quiz.score}/{quiz.totalQuestions}
                        </div>
                        <div
                          className={`badge ${getScoreBadge(quiz.percentage)}`}
                        >
                          {quiz.percentage}%
                        </div>
                      </div>
                    </div>
                    <div className="flex justify-between items-center mt-4">
                      <div className="flex gap-4 text-sm text-base-content/70">
                        {quiz.timeTaken && (
                          <span>⏱️ {formatTime(quiz.timeTaken)}</span>
                        )}
                        {quiz.isBackupSource && (
                          <span className="badge badge-outline badge-sm">
                            Backup Questions
                          </span>
                        )}
                      </div>
                      <progress
                        className={`progress ${
                          quiz.percentage >= 80
                            ? "progress-success"
                            : quiz.percentage >= 60
                            ? "progress-warning"
                            : "progress-error"
                        } w-32`}
                        value={quiz.percentage}
                        max="100"
                      ></progress>
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* Topics Tab */}
      {selectedView === "topics" && (
        <div className="space-y-4">
          <h2 className="text-2xl font-bold">Performance by Topic</h2>
          <div className="grid gap-4">
            {Object.values(stats.topicPerformance).map((topic) => (
              <div key={topic.topic} className="card bg-base-100 shadow-xl">
                <div className="card-body">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h3 className="card-title">{topic.topic}</h3>
                      <p className="text-base-content/70">
                        {topic.totalQuizzes} quiz
                        {topic.totalQuizzes !== 1 ? "zes" : ""}
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold">
                        Average:{" "}
                        <span className={getScoreColor(topic.averageScore)}>
                          {topic.averageScore}%
                        </span>
                      </div>
                      <div className="text-sm text-base-content/70">
                        Best: {topic.bestScore}%
                      </div>
                    </div>
                  </div>
                  <div className="mt-4">
                    <progress
                      className={`progress ${
                        topic.averageScore >= 80
                          ? "progress-success"
                          : topic.averageScore >= 60
                          ? "progress-warning"
                          : "progress-error"
                      } w-full`}
                      value={topic.averageScore}
                      max="100"
                    ></progress>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {topic.quizzes.slice(-5).map((quiz) => (
                      <div
                        key={quiz.id}
                        className={`badge ${getScoreBadge(
                          quiz.percentage
                        )} badge-sm`}
                      >
                        {quiz.percentage}%
                      </div>
                    ))}
                    {topic.quizzes.length > 5 && (
                      <div className="badge badge-outline badge-sm">
                        +{topic.quizzes.length - 5} more
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
