# LMS Platform - ARCHIBIT

A complete Learning Management System with advanced video tracking and quiz validation.

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Setup environment variables
cp .env.example .env
# Edit .env with your database credentials

# Run database migrations
npx prisma migrate dev --name init
npx prisma generate

# Start development server
npm run dev
```

Visit `http://localhost:3000/example-lesson` to see the video player in action.

## ✨ Features

### Core Functionality
- 🎥 **Secure Video Player** with anti-skip protection
- 📊 **Heartbeat Tracking** - Monitors viewing progress every 10s
- ❓ **Interactive Quizzes** - Temporal quiz markers in videos
- 📜 **Certificate Generation** - PDF certificates upon course completion
- 🔐 **Authentication** - NextAuth.js with role-based access

### Security Features
- ⏩ **No Forward Seeking** - Users can only rewind
- 🎬 **Playback Rate Lock** - Fixed at 1.0x speed
- 👁️ **Visibility Tracking** - Pauses when tab is hidden
- ⏸️ **Quiz Checkpoints** - Must answer correctly to proceed
- ✅ **Watch Time Validation** - Must watch 95% before certificate

## 📁 Project Structure

```
archibit-lms/
├── prisma/
│   └── schema.prisma           # Database schema
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── heartbeat/      # Video tracking endpoint
│   │   │   ├── quiz/           # Quiz validation
│   │   │   └── certificates/   # Certificate generation
│   │   └── example-lesson/     # Demo lesson page
│   ├── components/
│   │   ├── video/
│   │   │   └── SecureVideoPlayer.tsx
│   │   └── quiz/
│   │       └── QuizModal.tsx
│   ├── hooks/
│   │   └── useHeartbeat.ts     # Heartbeat tracking hook
│   └── lib/
│       ├── prisma.ts           # Database client
│       ├── auth.ts             # NextAuth config
│       └── pdf/
│           └── certificate-generator.ts
```

## 🛠️ Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Database**: PostgreSQL + Prisma ORM
- **Authentication**: NextAuth.js v5
- **Styling**: Tailwind CSS
- **PDF**: jsPDF
- **Video**: HTML5 Video (Mux/AWS ready)

## 📚 Documentation

See [Implementation Plan](/.gemini/antigravity/brain/31811bc2-b103-450a-a266-d0df766c290b/implementation_plan.md) for detailed architecture and design decisions.

## 🎯 Next Steps

- [ ] Create admin dashboard for course management
- [ ] Build student course catalog
- [ ] Implement payment integration
- [ ] Add analytics dashboard
- [ ] Deploy to production

## 📝 License

MIT
