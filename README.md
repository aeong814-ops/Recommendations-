# hearthisong.

A song that reminds me of you. — React + Vite music recommendation app.

## Included
- Responsive desktop/mobile layout (A + C visual direction, serif + sans-serif mix)
- Search by song / artist / recommender
- Mood filters
- Recommend a song (title, artist, note, mood, link, cover URL)
- Like / unlike songs
- Saved songs collection
- Popular songs list
- Email/password sign-up and login (Supabase Auth)
- Song comments with realtime updates
- Realtime shared song feed
- Follow other listeners and view their recommended songs
- Create personal playlists and add recommended songs
- Upload a profile photo to Supabase Storage or use an image URL
- Music taste statistics and random song picker
- Deep charcoal / graphite dark theme (no purple accent)
- Local demo mode with browser storage
- Optional Supabase data connection

## Run locally

```bash
npm install
npm run dev
```

Open the local URL printed by Vite.

## Build

```bash
npm run build
npm run preview
```

## Supabase setup (shared data)

1. Create a Supabase project.
2. Open **SQL Editor** and run `schema.sql`.
3. Copy `.env.example` to `.env`.
4. Fill in `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY (or the legacy VITE_SUPABASE_ANON_KEY)` from Project Settings → API.
5. Restart the dev server.

Without those two values, the app runs in local demo mode. Songs and likes are stored in that browser only; they are not shared with other people. With Supabase configured, sign-up/login, song posts, comments, follows, playlists, profile photos, and realtime feed updates use the shared database. The SQL also creates an `avatars` Storage bucket with per-user folder permissions. Sign-up may require email confirmation depending on your Supabase Auth settings.

> Security note: the included SQL is a public demo policy so anyone can read, add, and update song rows. The schema uses authenticated ownership checks for song writes and authenticated-only comments. Likes are stored in a separate user/song table with a unique key, so each signed-in user can like a song only once. The app creates/updates a public profile row after signup or login. Friend discovery lists registered profiles. Follow and playlist data are private to the signed-in owner for writes; public profile and playlist reads are enabled. Never put a Supabase service-role key in frontend environment variables.

## Deploy with GitHub + Vercel

1. Create a GitHub repository named `hearthisong`.
2. Upload/push the contents of this folder to the repository root.
3. In Vercel, choose **Add New → Project**, import the GitHub repository.
4. Keep the framework preset as **Vite**. Build command: `npm run build`; output directory: `dist`.
5. If using Supabase, add `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY (or the legacy VITE_SUPABASE_ANON_KEY)` in Vercel Project Settings → Environment Variables, then redeploy.

## Project structure

```text
hearthisong/
├── public/
├── src/
│   ├── components/
│   │   ├── AddSongModal.jsx
│   │   ├── AuthModal.jsx
│   │   ├── CommentsPanel.jsx
│   │   ├── CommunityPanel.jsx
│   │   ├── Sidebar.jsx
│   │   └── SongCard.jsx
│   ├── lib/
│   │   ├── storage.js
│   │   └── supabase.js
│   ├── App.jsx
│   ├── index.css
│   └── main.jsx
├── schema.sql
├── .env.example
├── index.html
└── package.json
```

## Notes
- Demo songs are sample content; replace them with songs you have permission to share.
- The play button opens the supplied music link (or a YouTube search link). It does not stream audio inside the app.


## GitHub에 파일 올리기 (폴더 없이)
이 버전은 모든 프로젝트 파일이 최상위(root)에 평평하게 배치되어 있습니다. GitHub 저장소의 Add file → Upload files에서 이 폴더 안의 파일을 모두 선택해 업로드하세요. ZIP 파일 자체를 업로드하지 말고, 압축을 푼 뒤 파일들을 선택해야 합니다.
