# Internship Portal

A Vite + React + TypeScript web app for managing interns with a secure admin dashboard and a public directory.

## Overview
The app has two main experiences: a public intern directory and a protected admin dashboard. Admins can add, edit, delete, import, and export intern records, while visitors can browse the intern directory with filters and pagination.

## Features
- Admin authentication gate with session check
- Intern CRUD workflows with modal forms
- CSV import/export (projects and skills support comma, pipe, or semicolon separators)
- Search, filter, sort, and pagination controls
- Public directory with responsive table and card layouts
- Fallback intern images using local assets
- Vercel Serverless Functions for API routes

## Pages and Routes
- `/` and `/interns` - Public intern directory
- `/admin` - Protected admin dashboard
- `/api/session` - Session check
- `/api/login` - Admin login
- `/api/logout` - Admin logout
- `/api/seed` - Reset and seed sample data
- `/api/interns` - List or create interns
- `/api/interns/[id]` - Read, update, or delete an intern
- `/api/interns/bulk` - Bulk import interns from CSV

## Data Model
Each intern record includes:
- `id`, `name`, `role`, `email`, `phone`
- `imageUrl`, `projects`, `manager`, `startDate`
- `performance`, `skills`, `department`

## Images
- All images are served from `public` (for example `public/interns` and `public/logo.svg`).

## Local Development
1. Install dependencies:
   - `npm install`
2. Run the dev server:
   - `npm run dev`
3. Build for production:
   - `npm run build`
4. Preview production build:
   - `npm run preview`

## Environment Variables
Set these in `.env` or `.env.local` (and in Vercel project settings for deployment):
- `POSTGRES_URL`
- `SESSION_SECRET`
- `ADMIN_PASSWORD_HASH`

Generate a password hash locally:
- `node -e "console.log(require('bcryptjs').hashSync('your-password', 12))"`

## Project Structure
- `src/pages` - Route-level pages (`AdminPage`, `InternListPage`)
- `src/components` - UI building blocks and admin controls
- `src/lib` - CSV utilities and image helpers
- `api` - Vercel serverless functions
- `public` - Static assets and seeded intern photos

## Deployment
This project is designed for Vercel. Configure the environment variables in Vercel Project Settings and deploy normally.
