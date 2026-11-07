# ClipAI Frontend (React)

## Local run
```bash
npm install
npm start        # http://localhost:3000
```
Backend pehle chalu hona chahiye (`uvicorn main:app --reload --port 8000`, backend README dekh).

`.env` variables:
```
REACT_APP_API_URL=http://localhost:8000
REACT_APP_SUPABASE_URL=https://xxxx.supabase.co
REACT_APP_SUPABASE_ANON_KEY=<supabase anon key>
```
`.env` badalne ke baad `npm start` dobara chalana padta hai.

Deploy (Vercel) ke liye `DEPLOY.md` dekh.
