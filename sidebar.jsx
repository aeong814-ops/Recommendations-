import { Headphones, House, Compass, Bookmark, UserRound, Plus, Users, ListMusic, BarChart3 } from 'lucide-react';

const items = [
  ['home', House, '홈'],
  ['explore', Compass, '탐색'],
  ['saved', Bookmark, '보관함'],
  ['friends', Users, '친구 피드'],
  ['playlists', ListMusic, '플레이리스트'],
  ['stats', BarChart3, '취향 통계']
];

export default function Sidebar({ page, setPage, onAdd }) {
  return <aside className="sidebar">
    <button className="brand" onClick={() => setPage('home')}><span className="brand-mark"><Headphones size={18}/></span>hearthisong<span className="brand-dot">.</span></button>
    <div className="side-label">MENU</div>
    <nav>{items.map(([id, Icon, label]) => <button key={id} className={`nav-item ${page===id?'active':''}`} onClick={() => setPage(id)}><Icon size={18}/>{label}</button>)}</nav>
    <div className="sidebar-bottom">
      <div className="side-note"><span className="tiny-dot"/> YOUR DAILY SOUND</div>
      <p>좋은 노래는<br/>함께 들을 때 더 좋아.</p>
      <button className="side-add" onClick={onAdd}><Plus size={16}/> 노래 추천하기</button>
      <div className="side-profile"><div className="avatar">H</div><div><b>hello, listener</b><small>music lover</small></div><UserRound size={17}/></div>
    </div>
  </aside>;
}