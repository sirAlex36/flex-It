# Flex-It - Event Management Platform

A modern event discovery and management platform built with Next.js.

## Project Structure

```
src/
├── app/
│   ├── layout.js              # Root layout with metadata
│   ├── page.js                # Home page
│   ├── globals.css            # Global styles with Tailwind
│   ├── event/
│   │   └── page.js            # Events listing page
│   ├── login/
│   │   └── page.js            # Login page
│   ├── sign-up/
│   │   └── page.js            # Sign up page
│   ├── contact/
│   │   └── page.js            # Contact page
│   └── components/
│       └── Card.jsx           # Event card component
└── components/
    ├── Header.jsx             # Navigation header
    └── Footer.jsx             # Site footer
```

## Prerequisites

- Node.js 18+ 
- npm or yarn

## Installation

1. Install dependencies:
```bash
npm install
```

2. Create a `.env.local` file with your API configuration:
```bash
NEXT_PUBLIC_API_URL=http://localhost:3002
```

## Running the Project

### Development Mode
```bash
npm run dev
```
The app will run at [http://localhost:3000](http://localhost:3000)

### Production Build
```bash
npm run build
npm start
```

## Features

- ✅ Homepage with featured events
- ✅ Browse upcoming events
- ✅ User authentication (Login/Sign Up)
- ✅ Contact form
- ✅ Responsive design with Tailwind CSS
- ✅ Modern Next.js App Router

## Technology Stack

- **Frontend**: Next.js 16, React 19
- **Styling**: Tailwind CSS
- **Backend API**: Connects to `http://localhost:3002`

## Configuration Files

- `next.config.mjs` - Next.js configuration
- `tailwind.config.js` - Tailwind CSS configuration
- `postcss.config.js` - PostCSS configuration
- `jsconfig.json` - JavaScript configuration with path aliases
- `.env.local` - Environment variables

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint

## API Endpoints Expected

The application expects the following API endpoints at `http://localhost:3002`:

- `GET /events` - Get all events
- `POST /login` - User login
- `POST /signup` - User registration
- `POST /contact` - Submit contact form

## Notes

- Make sure your backend API is running on port 3002
- The app uses the Next.js App Router (not Pages Router)
- All components support client-side rendering with `"use client"`

## License

MIT
