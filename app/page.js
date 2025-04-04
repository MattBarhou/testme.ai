import Link from "next/link";

export default function Home() {
  return (
    <div className="container mx-auto px-4 py-12">
      {/* Hero Section */}
      <div className="hero min-h-[80vh] rounded-2xl overflow-hidden">
        <div className="hero-content text-center">
          <div className="max-w-3xl">
            <h1 className="text-5xl font-bold mb-8 bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-purple-600">
              AI-Powered Quiz Experience
            </h1>
            <p className="text-xl mb-10 leading-relaxed">
              Challenge yourself with our intelligent quiz platform that adapts to your knowledge level.
              Our AI generates personalized questions across various topics to help you learn and grow.
            </p>

            <div className="flex flex-col gap-6 items-center">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-3xl">
                <div className="card bg-base-100 shadow-xl">
                  <div className="card-body items-center text-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                    </svg>
                    <h2 className="card-title">Smart Questions</h2>
                    <p>AI-generated questions that adapt to your skill level</p>
                  </div>
                </div>

                <div className="card bg-base-100 shadow-xl">
                  <div className="card-body items-center text-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                    <h2 className="card-title">Learn Faster</h2>
                    <p>Improve your knowledge with targeted questions</p>
                  </div>
                </div>

                <div className="card bg-base-100 shadow-xl">
                  <div className="card-body items-center text-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-pink-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                    <h2 className="card-title">Track Progress</h2>
                    <p>See your improvement over time with detailed analytics</p>
                  </div>
                </div>
              </div>

              <Link href="/quiz" className="btn btn-primary btn-lg mt-8 px-10 animate-pulse hover:animate-none transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-xl">
                Test My Knowledge!
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
