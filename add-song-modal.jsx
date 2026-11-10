import { useState } from 'react';
import { X, Music2, Link2 } from 'lucide-react';

export default function AddSongModal({ onClose, onAdd }) {
  const [form, setForm] = useState({ title:'', artist:'', note:'', mood:'새벽 감성', cover:'', url:'' });
  const [error, setError] = useState('');
  const update = (key, value) => setForm(f => ({ ...f, [key]:value }));
  async function submit(e) {
    e.preventDefault();
    if (!form.title.trim() || !form.artist.trim()) return setError('노래 제목과 아티스트를 입력해줘.');
    try { await onAdd(form); onClose(); }
    catch { setError('노래를 저장하지 못했어. 잠시 후 다시 시도해줘.'); }
  }
  return <div className="modal-backdrop" onMouseDown={e => e.target===e.currentTarget && onClose()}>
    <form className="modal" onSubmit={submit}>
      <div className="modal-head"><div><span className="eyebrow">SHARE YOUR SOUND</span><h2>오늘의 노래 추천</h2></div><button type="button" className="icon-button" onClick={onClose}><X/></button></div>
      <label>노래 제목<input value={form.title} onChange={e=>update('title',e.target.value)} placeholder="어떤 노래인가요?" autoFocus/></label>
      <label>아티스트<input value={form.artist} onChange={e=>update('artist',e.target.value)} placeholder="가수 또는 밴드"/></label>
      <label>이 노래를 추천하는 이유<textarea value={form.note} onChange={e=>update('note',e.target.value)} placeholder="친구에게 들려주고 싶은 한마디" rows="3"/></label>
      <label>오늘의 무드<select value={form.mood} onChange={e=>update('mood',e.target.value)}>{['새벽 감성','청량','추억','기분 전환','잔잔한','설렘','집중'].map(m=><option key={m}>{m}</option>)}</select></label>
      <label><span className="label-icon"><Link2 size={14}/> 음악 링크 (선택)</span><input value={form.url} onChange={e=>update('url',e.target.value)} placeholder="YouTube 또는 Spotify 링크"/></label>
      <label><span className="label-icon"><Music2 size={14}/> 앨범 이미지 URL (선택)</span><input value={form.cover} onChange={e=>update('cover',e.target.value)} placeholder="이미지 주소"/></label>
      {error && <p className="form-error">{error}</p>}
      <button className="primary-button full" type="submit">이 노래 추천하기 <span>↗</span></button>
    </form>
  </div>;
}