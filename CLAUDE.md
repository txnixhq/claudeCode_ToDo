# Project: Todo Appgit /init


## What this is
A full-stack todo app with user authentication and real-time sync.
Goal: deploy a live working URL within 90 minutes.

## Tech stack
- Backend: Python + FastAPI
- Frontend: React + Vite
- Database: Supabase (auth + PostgreSQL)
- Deploy: Railway

## File structure
/backend     → FastAPI app (main.py, routes/, models/)
/frontend    → React + Vite app (src/components/, src/pages/)
/README.md
/CLAUDE.md
/plan.md

## Coding standards
- FastAPI routes use async/await
- All API responses return { data, error } shape
- React components in PascalCase, one per file
- Use Supabase client for all DB operations, no raw SQL
- Tailwind for styling (keep it simple)

## Do NOT
- Over-engineer. Keep it simple.
- Add packages not in the stack above without asking
- Skip error handling on API routes
- Write long components — break them up

## Auth
Use Supabase Auth (email + password). Protect all todo routes.