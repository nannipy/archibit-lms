# Archibit LMS

![Version](https://img.shields.io/badge/version-1.3.0-blue.svg) ![Next.js](https://img.shields.io/badge/Next.js-15.0-black) ![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue) ![License](https://img.shields.io/badge/license-MIT-green)

**Archibit LMS** is a specialized, enterprise-grade Learning Management System designed for the continuous professional development of Architects and Engineers. It provides a secure platform for certified training, issuing **Professional Training Credits (CFP)** and **Autodesk Certifications**.

Built with performance, scalability, and security in mind, it features advanced video tracking, anti-cheat mechanisms, and seamless integration for authorized training centers (ATC).

---

## 📋 Table of Contents

- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Getting Started](#-getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Environment Variables](#environment-variables)
- [Database Schema](#-database-schema)
- [Development](#-development)
- [Contributing](#-contributing)
- [License](#-license)

---

## ✨ Features

### 🏛 Domain Specific
- **Accredited Training**: specialized workflow for managing CFP (Crediti Formativi Professionali).
- **Certification Center**: Support for generating official certificates for Autodesk, Certiport, and CNAPPC.

### 🎓 Student Experience
- **Interactive Course Player**: Distraction-free learning environment with side navigation for lessons.
- **Secure Video Playback**: advanced video player preventing skipping and enforcing 1.0x playback speed.
- **Progress Tracking**: Real-time heartbeat mechanism tracking video visibility and focus.
- **Quizzes & Assessments**: Interactive checkpoints integrated directly into the video timeline or as standalone modules.
- **Automated Certification**: Instant PDF certificate generation upon successful course completion (95% watch time required).

### 🛡️ Admin & Security
- **Comprehensive Dashboard**: Overview of platform metrics, user registrations, and course performance.
- **Course Management**: Intuitive CMS for creating courses, chapters, and uploading video lessons.
- **User Management**: Role-based access control (RBAC) separating Admin and Student privileges.
- **Anti-Cheat System**: 
  - **No Forward Seeking**: Enforces sequential viewing.
  - **Tab Visibility Tracking**: Pauses playback when the browser tab is not active.
  - **Playback Rate Lock**: Prevents speeding through content.

---

## 🛠 Tech Stack

This project leverages a modern, full-stack JavaScript architecture:

- **Frontend**: 
  - [Next.js 16 (RC/Canary)](https://nextjs.org/) (App Router, Server Actions)
  - [React 19](https://react.dev/)
  - [Tailwind CSS](https://tailwindcss.com/) & [Radix UI](https://www.radix-ui.com/) for styling and accessible primitives.
  - [Lucide React](https://lucide.dev/) for iconography.
  
- **Backend**:
  - **Server Actions**: Secure server-side logic directly within usage components.
  - [Prisma ORM](https://www.prisma.io/): Type-safe database access.
  - [Supabase](https://supabase.com/): Authentication & Object Storage (Videos/PDFs).
  
- **Database**:
  - [PostgreSQL](https://www.postgresql.org/) (via Neon or Supabase).

- **Utilities**:
  - `jspdf`: Client-side PDF generation.
  - `zod`: Schema validation.
  - `sonner`: Toast notifications.

---

## 📂 Project Structure

A high-level overview of the monorepo structure:

```bash
archibit-lms/
├── prisma/                 # Database schema and migrations
│   └── schema.prisma
├── public/                 # Static assets (images, fonts)
├── src/
│   ├── app/                # Next.js App Router root
│   │   ├── (admin)/        # Admin dashboard routes
│   │   ├── (auth)/         # Authentication routes (login/signup)
│   │   ├── (student)/      # Student-facing learning routes
│   │   └── api/            # API Endpoints (webhooks, etc.)
│   ├── components/         # Reusable UI components
│   │   ├── ui/             # Shadcn/Radix primitives
│   │   └── video/          # Video player specific components
│   ├── lib/                # Utility libraries and configurations
│   │   ├── prisma.ts       # Database client instance
│   │   └── supabase/       # SMB middleware & client
│   └── hooks/              # Custom React hooks
├── .env.example            # Environment variables template
└── package.json            # Dependencies and scripts
```

---

## 🚀 Getting Started

Follow these steps to set up the project locally.

### Prerequisites

- **Node.js** v18+ (or [Bun](https://bun.sh/))
- **PostgreSQL** database (Local or Cloud)
- **Supabase** project for Auth and Storage

### Installation

1.  **Clone the repository**:
    ```bash
    git clone https://github.com/your-org/archibit-lms.git
    cd archibit-lms
    ```

2.  **Install dependencies**:
    ```bash
    npm install
    # or
    bun install
    ```

### Environment Variables

Create a `.env` file in the root directory by copying the example:

```bash
cp .env.example .env
```

Ensure the following variables are configured:

```env
# Database (Prisma)
DATABASE_URL="postgresql://user:password@host:port/db?schema=public"
DIRECT_URL="postgresql://user:password@host:port/db" # For direct connection if using pooling

# Supabase (Auth & Storage)
NEXT_PUBLIC_SUPABASE_URL="https://your-project-id.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your-anon-key"
SUPABASE_SERVICE_ROLE_KEY="your-service-role-key"

# App Configuration
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

### Database Setup

Run the Prisma migrations to create the database schema:

```bash
npx prisma migrate dev --name init
npx prisma generate
```

### Running the App

Start the development server:

```bash
npm run dev
# or
bun run dev
```

Visit `http://localhost:3000` to view the application.

---

## 🗄 Database Schema

We use a relational model designed for flexibility. Key models include:

- **User**: Stores profile, role (ADMIN/STUDENT), and auth data.
- **Course**: The top-level educational unit, containing metadata and pricing.
- **Lesson**: Individual content units (Video + Quiz) belonging to a Course.
- **Enrollment**: Links Users to Courses, tracking overall progress.
- **ViewingLog**: Granular tracking of video consumption for security/analytics.

(See `prisma/schema.prisma` for the full definition)

---

## 💻 Development

### Commands

| Command | Description |
| :--- | :--- |
| `npm run dev` | Starts the development server |
| `npm run build` | Builds the application for production |
| `npm run start` | Starts the production build |
| `npm run lint` | Runs ESLint to check for code quality issues |

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1.  Fork the repository.
2.  Create a feature branch (`git checkout -b feature/amazing-feature`).
3.  Commit your changes (`git commit -m 'Add amazing feature'`).
4.  Push to the branch (`git push origin feature/amazing-feature`).
5.  Open a Pull Request.

---

## 📝 License

Distributed under the MIT License. See `LICENSE` for more information.
