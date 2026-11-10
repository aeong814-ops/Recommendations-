import { useEffect, useState } from 'react';
import { MessageCircle, Send } from 'lucide-react';
import { supabase } from './supabase.js';
const keyFor=id=>`hearthisong-comments-${id}`;
export default function CommentsPanel({song,user,onRequireAuth}){
 const [comments,setComments]=useState([]); const [body,setBody]=useState(''); const [busy,setBusy]=useState(false);
 useEffect(()=>{
  let active=true;
  async function load(){
   if(supabase){const {data,error}=await supabase.from('comments').select('*').eq('song_id',song.id).order('created_at',{ascending:true}); if(!error&&active)setComments(data||[]);}
   else {try{setComments(JSON.parse(localStorage.getItem(keyFor(song.id))||'[]'));}catch{setComments([]);}}
  }
  load();
  if(!supabase)return ()=>{active=false;};
  const channel=supabase.channel(`comments-${song.id}`).on('postgres_changes',{event:'INSERT',schema:'public',table:'comments',filter:`song_id=eq.${song.id}`},payload=>setComments(prev=>prev.some(c=>c.id===payload.new.id)?prev:[...prev,payload.new])).subscribe();
  return ()=>{active=false;supabase.removeChannel(channel);};
 },[song.id]);
 async function send(e){e.preventDefault();if(!body.trim())return;if(!user){onRequireAuth();return;}setBusy(true);
  const comment={song_id:song.id,user_id:user.id,display_name:user.user_metadata?.display_name||user.email?.split('@')[0]||'listener',body:body.trim()};
  try{if(supabase){const {error}=await supabase.from('comments').insert(comment);if(error)throw error;}else{const next=[...comments,{...comment,id:crypto.randomUUID(),created_at:new Date().toISOString()}];localStorage.setItem(keyFor(song.id),JSON.stringify(next));setComments(next);}setBody('');}catch(err){alert(err.message||'댓글을 저장하지 못했어.');}finally{setBusy(false);}
 }
 return <section className="comments-panel"><div className="comments-title"><MessageCircle size={15}/> 댓글 <span>{comments.length}</span></div><div className="comment-list">{comments.length?comments.map(c=><div className="comment" key={c.id}><span className="comment-avatar">{(c.display_name||'L').slice(0,1).toUpperCase()}</span><div><b>{c.display_name||'listener'}</b><p>{c.body}</p></div></div>):<p className="no-comments">첫 번째 감상평을 남겨줘.</p>}</div><form className="comment-form" onSubmit={send}><input value={body} onChange={e=>setBody(e.target.value)} placeholder={user?'이 노래에 대한 감상을 남겨봐':'로그인하고 댓글 남기기'} maxLength={500}/><button disabled={busy||!body.trim()} aria-label="댓글 보내기"><Send size={15}/></button></form></section>;
}