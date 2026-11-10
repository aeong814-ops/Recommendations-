import { supabase, isCloudEnabled } from './supabase.js';

const KEY = 'hearthisong-songs-v1';

export const seedSongs = [
  { id:'s1', title:'밤하늘의 별을', artist:'경서', note:'괜히 밤 산책하고 싶어지는 노래.', mood:'새벽 감성', cover:'https://images.unsplash.com/photo-1475274047050-1d0c0975c63e?w=700&q=85', url:'https://www.youtube.com/results?search_query=경서+밤하늘의+별을', likes:18, user:'mood.zip', created_at:'2026-11-09' },
  { id:'s2', title:'너와 나', artist:'여자친구', note:'어떤 계절에 들어도 좋은 노래.', mood:'추억', cover:'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=700&q=85', url:'https://www.youtube.com/results?search_query=여자친구+너와+나', likes:12, user:'september', created_at:'2026-11-08' },
  { id:'s3', title:'그 여름, 우리', artist:'백예린', note:'여름이 끝나기 전에 꼭 들어줘.', mood:'청량', cover:'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=700&q=85', url:'https://www.youtube.com/results?search_query=백예린+그+여름+우리', likes:9, user:'bluehour', created_at:'2026-11-07' },
  { id:'s4', title:'Dancing In The Moonlight', artist:'Toploader', note:'기분 전환이 필요할 때!', mood:'기분 전환', cover:'https://images.unsplash.com/photo-1519608487953-e999c86e7455?w=700&q=85', url:'https://www.youtube.com/results?search_query=Toploader+Dancing+In+The+Moonlight', likes:25, user:'mood.zip', created_at:'2026-11-06' },
  { id:'s5', title:'사랑은 늘 도망가', artist:'임영웅', note:'가사가 오래 마음에 남아.', mood:'잔잔한', cover:'https://images.unsplash.com/photo-1470252649378-9c29740c9fa8?w=700&q=85', url:'https://www.youtube.com/results?search_query=임영웅+사랑은+늘+도망가', likes:7, user:'daylight', created_at:'2026-11-05' },
  { id:'s6', title:'밤편지', artist:'아이유', note:'오늘 하루의 마지막 곡으로 추천.', mood:'새벽 감성', cover:'https://images.unsplash.com/photo-1518837695005-2083093ee35b?w=700&q=85', url:'https://www.youtube.com/results?search_query=아이유+밤편지', likes:31, user:'september', created_at:'2026-11-04' }
];

function localRead() {
  try { return JSON.parse(localStorage.getItem(KEY)) || seedSongs; }
  catch { return seedSongs; }
}
function localWrite(songs) { localStorage.setItem(KEY, JSON.stringify(songs)); }

export async function getSongs() {
  if (isCloudEnabled) {
    const { data, error } = await supabase.from('songs').select('*, song_likes(count)').order('created_at', { ascending:false });
    if (!error) return (data || []).map(row => ({ ...row, likes: row.song_likes?.[0]?.count ?? row.likes ?? 0 }));
    console.warn('Cloud read failed; using local demo data.', error.message);
  }
  return localRead();
}

export async function getMyLikedSongIds() {
  if (!isCloudEnabled) return null;
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) return [];
  const { data, error } = await supabase.from('song_likes').select('song_id').eq('user_id', user.id);
  if (error) throw error;
  return (data || []).map(row => row.song_id);
}

export async function addSong(song) {
  if (isCloudEnabled) {
    const { data, error } = await supabase.from('songs').insert(song).select().single();
    if (!error) return data;
    throw error;
  }
  const songs = [{ ...song, id: crypto.randomUUID(), likes:0, user:'you', created_at:new Date().toISOString() }, ...localRead()];
  localWrite(songs);
  return songs[0];
}

export async function toggleLike(song, liked) {
  if (isCloudEnabled) {
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) throw new Error('로그인이 필요해.');
    if (liked) {
      const { error } = await supabase.from('song_likes').delete().eq('song_id', song.id).eq('user_id', user.id);
      if (error) throw error;
    } else {
      const { error } = await supabase.from('song_likes').insert({ song_id:song.id, user_id:user.id });
      if (error) throw error;
    }
    return { ...song, likes:Math.max(0, (song.likes || 0) + (liked ? -1 : 1)) };
  }
  const songs = localRead().map(s => s.id === song.id ? { ...s, likes:Math.max(0, (s.likes || 0) + (liked ? -1 : 1)) } : s);
  localWrite(songs);
  return songs.find(s => s.id === song.id);
}