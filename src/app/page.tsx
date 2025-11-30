import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-gray-900 flex items-center justify-center">
      <div className="container mx-auto px-4 py-16 text-center">
        <h1 className="text-6xl font-bold text-white mb-6">
          ARCHIBIT LMS
        </h1>
        <p className="text-2xl text-gray-300 mb-8">
          Learning Management System with Advanced Video Tracking
        </p>
        
        <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto mb-12">
          <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6">
            <div className="text-4xl mb-4">🎥</div>
            <h3 className="text-xl font-bold text-white mb-2">Secure Video Player</h3>
            <p className="text-gray-300 text-sm">
              Anti-skip protection, playback rate lock, and heartbeat tracking
            </p>
          </div>
          
          <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6">
            <div className="text-4xl mb-4">❓</div>
            <h3 className="text-xl font-bold text-white mb-2">Interactive Quizzes</h3>
            <p className="text-gray-300 text-sm">
              Temporal quiz markers with automatic rewind on wrong answers
            </p>
          </div>
          
          <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6">
            <div className="text-4xl mb-4">📜</div>
            <h3 className="text-xl font-bold text-white mb-2">Certificates</h3>
            <p className="text-gray-300 text-sm">
              PDF certificates with watch time and quiz validation
            </p>
          </div>
        </div>

        <div className="flex gap-4 justify-center">
          <Link
            href="/example-lesson"
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-8 py-4 rounded-lg transition-all active:scale-95 shadow-lg"
          >
            View Example Lesson
          </Link>
          <a
            href="https://github.com"
            target="_blank"
            rel="noopener noreferrer"
            className="bg-gray-700 hover:bg-gray-600 text-white font-semibold px-8 py-4 rounded-lg transition-all active:scale-95 shadow-lg"
          >
            Documentation
          </a>
        </div>

        <div className="mt-12 text-gray-400 text-sm">
          <p>Built with Next.js 14, TypeScript, Prisma, and Tailwind CSS</p>
        </div>
      </div>
    </div>
  );
}
