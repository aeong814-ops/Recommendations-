import { useState } from 'react';
import { Heart, ExternalLink, Play, MessageCircle } from 'lucide-react';
import CommentsPanel from './comments-panel.jsx';
export default function SongCard({ song, liked, onLike, user, onRequireAuth, compact=false }) {
 const [commentsOpen,setCommentsOpen]=useState(false);
 return <article className={`song-card ${compact?'compact':''}`}>
  <div className="cover-wrap"><img src={song.cover || 'https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=700'} alt=""/><a className="play-overlay" href={song.url} target="_blank" rel="noreferrer" aria-label={`${song.title} 듣기`}><Play size={20} fill="currentColor"/></a><button className={`like-btn ${liked?'liked':''}`} onClick={()=>onLike(song)} aria-label="좋아요"><Heart size={17} fill={liked?'currentColor':'none'}/></button></div>
  <div className="song-info"><div className="song-title-row"><h3>{song.title}</h3><span className="like-count">♡ {song.likes||0}</span></div><p className="artist">{song.artist}</p>{!compact&&<p className="song-note">{song.note||'이 노래를 추천해요.'}</p>}<div className="song-meta"><span>#{song.mood||'추천곡'}</span><span>by {song.user||'listener'}</span><a href={song.url} target="_blank" rel="noreferrer"><ExternalLink size={13}/></a><button className="comment-toggle" onClick={()=>setCommentsOpen(v=>!v)}><MessageCircle size={13}/> 댓글</button></div></div>
  {commentsOpen&&<CommentsPanel song={song} user={user} onRequireAuth={onRequireAuth}/>}
 </article>;
}