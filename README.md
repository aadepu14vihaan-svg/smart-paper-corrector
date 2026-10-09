# Smart Paper Corrector

AI-assisted evaluation of handwritten answer sheets from mobile photos. Teachers provide an answer key and marking rubric; a vision-capable AI suggests question-wise marks and feedback. Teacher review is required before results are finalized.

## Phase 1 features

- Mobile camera capture and multi-photo upload (up to 8 images per request)
- JPG, PNG, and WebP validation
- Teacher-provided answer key, rubric, and paper maximum
- Server-side OpenAI vision grading endpoint
- Question-wise suggested scores and feedback
- Flags uncertain answers for teacher review
- No database or persistent student-paper storage yet

## Requirements

- Node.js 20 or newer
- An OpenAI API key with API access and available billing/credits

## Run locally

1. Install dependencies:

   ```bash
   npm install
   ```

2. Copy `.env.example` to `.env.local` and add your key:

   ```env
   OPENAI_API_KEY=your_secret_key
   OPENAI_MODEL=gpt-4.1-mini
   ```

   Keep `.env.local` private. Never put the key in a `NEXT_PUBLIC_*` variable or commit it to Git.

3. Start the development server:

   ```bash
   npm run dev
   ```

4. Open http://localhost:3000.

## Deploy

Deploy as a Node.js Next.js app and configure `OPENAI_API_KEY` and optionally `OPENAI_MODEL` in the host's server-side environment variables. Never expose the API key to the browser.

## Supabase (planned)

Supabase will be added in the next phase for authentication, private image storage, exam records, teacher-approved scores, and audit history. Until then, this prototype does not persist uploaded papers or results. Do not use identifiable student data in production until access control, retention, and privacy protections are implemented.

## Important limitations

- AI marks are suggestions and must be reviewed by a teacher.
- Question-wise maximum marks should be included in the rubric.
- Handwriting recognition can fail with blur, shadows, skew, or small writing.
- This prototype does not yet implement teacher accounts, permanent mark edits, PDF export, or database storage.
