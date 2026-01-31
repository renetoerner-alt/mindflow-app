# MindFlow - Smart Task Management

## Setup

### 1. Supabase Schema
- Öffne Supabase Dashboard → SQL Editor
- Kopiere `supabase/schema.sql` → Run

### 2. GitHub
- github.com → + → New repository → "mindflow-app"
- "uploading an existing file" → Alle Dateien reinziehen → Commit

### 3. Vercel
- vercel.com → Add New Project → Repo auswählen
- Environment Variables:
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- Deploy

## Lokale Entwicklung
```bash
npm install
cp .env.local.example .env.local
npm run dev
```
