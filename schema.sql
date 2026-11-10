-- hearthisong v2 schema. Run in Supabase Dashboard > SQL Editor.
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null default 'listener',
  created_at timestamptz not null default now()
);

create table if not exists public.songs (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  artist text not null,
  note text default '',
  mood text default '새벽 감성',
  cover text,
  url text,
  likes integer not null default 0 check (likes >= 0),
  "user" text not null default 'listener',
  user_id uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now()
);


create table if not exists public.song_likes (
  song_id uuid not null references public.songs(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (song_id, user_id)
);

create table if not exists public.comments (
  id uuid primary key default gen_random_uuid(),
  song_id uuid not null references public.songs(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  display_name text not null default 'listener',
  body text not null check (char_length(body) between 1 and 500),
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;
alter table public.songs enable row level security;
alter table public.comments enable row level security;
alter table public.song_likes enable row level security;

-- Profiles: public read; users can create/update only their own profile.
drop policy if exists "Profiles are public" on public.profiles;
create policy "Profiles are public" on public.profiles for select to anon, authenticated using (true);
drop policy if exists "Users create own profile" on public.profiles;
create policy "Users create own profile" on public.profiles for insert to authenticated with check ((select auth.uid()) = id);
drop policy if exists "Users update own profile" on public.profiles;
create policy "Users update own profile" on public.profiles for update to authenticated using ((select auth.uid()) = id) with check ((select auth.uid()) = id);

-- Songs: anyone can read; signed-in users create their own; owners can edit/delete.
drop policy if exists "Songs are viewable by everyone" on public.songs;
create policy "Songs are viewable by everyone" on public.songs for select to anon, authenticated using (true);
drop policy if exists "Anyone can add a song" on public.songs;
create policy "Signed-in users add songs" on public.songs for insert to authenticated with check ((select auth.uid()) = user_id);
drop policy if exists "Anyone can update song likes" on public.songs;
create policy "Owners update songs" on public.songs for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
drop policy if exists "Owners delete songs" on public.songs;
create policy "Owners delete songs" on public.songs for delete to authenticated using ((select auth.uid()) = user_id);

-- Likes: aggregate counts are readable; each signed-in user can manage only their own like.
drop policy if exists "Song likes are readable" on public.song_likes;
create policy "Song likes are readable" on public.song_likes for select to anon, authenticated using (true);
drop policy if exists "Users add own likes" on public.song_likes;
create policy "Users add own likes" on public.song_likes for insert to authenticated with check ((select auth.uid()) = user_id);
drop policy if exists "Users remove own likes" on public.song_likes;
create policy "Users remove own likes" on public.song_likes for delete to authenticated using ((select auth.uid()) = user_id);

-- Comments: public read; authenticated users may add comments as themselves.
drop policy if exists "Comments are public" on public.comments;
create policy "Comments are public" on public.comments for select to anon, authenticated using (true);
drop policy if exists "Signed-in users add comments" on public.comments;
create policy "Signed-in users add comments" on public.comments for insert to authenticated with check ((select auth.uid()) = user_id);
drop policy if exists "Users delete own comments" on public.comments;
create policy "Users delete own comments" on public.comments for delete to authenticated using ((select auth.uid()) = user_id);

grant select on public.profiles, public.songs, public.comments, public.song_likes to anon, authenticated;
grant insert, delete on public.song_likes to authenticated;
grant insert, update on public.profiles to authenticated;
grant insert, update, delete on public.songs to authenticated;
grant insert, delete on public.comments to authenticated;

-- Enable realtime updates for shared feed and comment threads.
do $$ begin
  alter publication supabase_realtime add table public.songs;
exception when duplicate_object then null;
when undefined_object then null;
end $$;
do $$ begin
  alter publication supabase_realtime add table public.comments;
exception when duplicate_object then null;
when undefined_object then null;
end $$;

-- v3 social features: follows, playlists and profile image URL.
alter table public.profiles add column if not exists avatar_url text;

create table if not exists public.follows (
  follower_id uuid not null references auth.users(id) on delete cascade,
  following_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (follower_id, following_id),
  constraint no_self_follow check (follower_id <> following_id)
);

create table if not exists public.playlists (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null check (char_length(name) between 1 and 60),
  created_at timestamptz not null default now()
);

create table if not exists public.playlist_songs (
  playlist_id uuid not null references public.playlists(id) on delete cascade,
  song_id uuid not null references public.songs(id) on delete cascade,
  added_at timestamptz not null default now(),
  primary key (playlist_id, song_id)
);

alter table public.follows enable row level security;
alter table public.playlists enable row level security;
alter table public.playlist_songs enable row level security;

drop policy if exists "Follow graph is readable" on public.follows;
create policy "Follow graph is readable" on public.follows for select to authenticated using (true);
drop policy if exists "Users follow as themselves" on public.follows;
create policy "Users follow as themselves" on public.follows for insert to authenticated with check ((select auth.uid()) = follower_id);
drop policy if exists "Users unfollow as themselves" on public.follows;
create policy "Users unfollow as themselves" on public.follows for delete to authenticated using ((select auth.uid()) = follower_id);

drop policy if exists "Public playlists are readable" on public.playlists;
create policy "Public playlists are readable" on public.playlists for select to anon, authenticated using (true);
drop policy if exists "Users create own playlists" on public.playlists;
create policy "Users create own playlists" on public.playlists for insert to authenticated with check ((select auth.uid()) = user_id);
drop policy if exists "Users update own playlists" on public.playlists;
create policy "Users update own playlists" on public.playlists for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
drop policy if exists "Users delete own playlists" on public.playlists;
create policy "Users delete own playlists" on public.playlists for delete to authenticated using ((select auth.uid()) = user_id);

drop policy if exists "Playlist songs are readable" on public.playlist_songs;
create policy "Playlist songs are readable" on public.playlist_songs for select to anon, authenticated using (exists (select 1 from public.playlists p where p.id = playlist_id));
drop policy if exists "Playlist owners add songs" on public.playlist_songs;
create policy "Playlist owners add songs" on public.playlist_songs for insert to authenticated with check (exists (select 1 from public.playlists p where p.id = playlist_id and p.user_id = (select auth.uid())));
drop policy if exists "Playlist owners remove songs" on public.playlist_songs;
create policy "Playlist owners remove songs" on public.playlist_songs for delete to authenticated using (exists (select 1 from public.playlists p where p.id = playlist_id and p.user_id = (select auth.uid())));

grant select on public.follows, public.playlists, public.playlist_songs to authenticated;
grant insert, delete on public.follows to authenticated;
grant insert, update, delete on public.playlists to authenticated;
grant insert, delete on public.playlist_songs to authenticated;
grant select on public.profiles to anon, authenticated;
grant insert, update on public.profiles to authenticated;

-- Public avatar bucket; each signed-in user may write only inside their own folder.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('avatars', 'avatars', true, 5242880, array['image/png','image/jpeg','image/webp'])
on conflict (id) do update set public = true, file_size_limit = 5242880, allowed_mime_types = array['image/png','image/jpeg','image/webp'];

drop policy if exists "Avatar images are public" on storage.objects;
create policy "Avatar images are public" on storage.objects for select to anon, authenticated using (bucket_id = 'avatars');
drop policy if exists "Users upload own avatar files" on storage.objects;
create policy "Users upload own avatar files" on storage.objects for insert to authenticated with check (bucket_id = 'avatars' and (storage.foldername(name))[1] = (select auth.uid())::text);
drop policy if exists "Users update own avatar files" on storage.objects;
create policy "Users update own avatar files" on storage.objects for update to authenticated using (bucket_id = 'avatars' and (storage.foldername(name))[1] = (select auth.uid())::text) with check (bucket_id = 'avatars' and (storage.foldername(name))[1] = (select auth.uid())::text);
drop policy if exists "Users delete own avatar files" on storage.objects;
create policy "Users delete own avatar files" on storage.objects for delete to authenticated using (bucket_id = 'avatars' and (storage.foldername(name))[1] = (select auth.uid())::text);
