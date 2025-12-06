# InterviewAI - AI-Powered Mock Interview Platform

Transform your interview preparation with real-time AI voice conversations and intelligent feedback.

## Overview

InterviewAI is a modern web application that helps job seekers practice interviews through realistic AI-powered voice conversations. Get instant feedback, track your progress, and improve your interview skills with personalized coaching.

## Features

### 🎙️ Real-Time Voice Interviews
- Natural voice conversations with an AI interviewer
- Real-time speech recognition and response
- Customizable interview scenarios by role and experience level

### 📊 Smart Feedback & Scoring
- Comprehensive performance scoring (0-100)
- Detailed strength analysis
- Actionable improvement suggestions
- Full interview transcripts

### 📄 Resume Analysis
- AI-powered resume review
- Job description matching
- Optimization recommendations
- PDF resume parsing

### 📁 Interview History
- Organized interview cards with filtering
- Sort by date, job category, experience level, or company
- Easy access to past sessions and transcripts

## Tech Stack

- **Frontend**: React 18, TypeScript, Vite
- **Styling**: Tailwind CSS, shadcn/ui
- **Backend**: Supabase Edge Functions
- **AI**: OpenAI Realtime Voice API, GPT-4
- **State Management**: TanStack Query

## Getting Started

### Prerequisites
- Node.js 18+ 
- npm or bun

### Installation

```bash
# Clone the repository
git clone <YOUR_GIT_URL>

# Navigate to project directory
cd <YOUR_PROJECT_NAME>

# Install dependencies
npm install

# Start development server
npm run dev
```

### Environment Variables

The project uses Lovable Cloud for backend services. Environment variables are automatically configured.

## Project Structure

```
src/
├── components/     # Reusable UI components
├── pages/          # Route pages
├── hooks/          # Custom React hooks
├── utils/          # Utility functions
├── types/          # TypeScript type definitions
└── integrations/   # External service integrations

supabase/
└── functions/      # Edge functions for AI processing
```

## Deployment

Deploy instantly through Lovable:

1. Open your [Lovable Project](https://lovable.dev/projects/REPLACE_WITH_PROJECT_ID)
2. Click **Share → Publish**
3. Your app is live!

### Custom Domain

Connect your own domain in **Project → Settings → Domains**.

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is proprietary software. All rights reserved.

---

Built with [Lovable](https://lovable.dev) ✨
