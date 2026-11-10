import { useState } from 'react';
import { X, LogIn, UserPlus } from 'lucide-react';
import { supabase } from './supabase.js';

export default function AuthModal({ onClose, onAuth }) {
  const [mode,setMode]=useState('login');
  const [email,setEmail]=useState(''); const [password,setPassword]=useState(''); const [name,setName]=useState('');
  const [error,setError]=useState(''); const [busy,setBusy]=useState(false); const [message,setMessage]=useState('');
  async function submit(e){
    e.preventDefault(); setError(''); setMessage(''); setBusy(true);
    try {
      if(!supabase) throw new Error('계정을 사용하려면 먼저 Supabase 설정이 필요해. README의 설정 방법을 확인해줘.');
      if(mode==='signup'){
        const {data,error}=await supabase.auth.signUp({email,password,options:{data:{display_name:name.trim()||email.split('@')[0]}}});
        if(error) throw error;
        if(data.session){await supabase.from('profiles').upsert({id:data.session.user.id,display_name:name.trim()||email.split('@')[0]});onAuth(data.session.user);}
        else setMessage('가입 확인 메일을 보냈어. 이메일을 확인한 뒤 로그인해줘.');
      } else {
        const {data,error}=await supabase.auth.signInWithPassword({email,password});
        if(error) throw error; await supabase.from('profiles').upsert({id:data.user.id,display_name:data.user.user_metadata?.display_name||email.split('@')[0]}); onAuth(data.user);
      }
    } catch(err){setError(err.message||'요청을 완료하지 못했어.');} finally{setBusy(false);}
  }
  return <div className="modal-backdrop" onMouseDown={e=>e.target===e.currentTarget&&onClose()}><form className="modal auth-modal" onSubmit={submit}>
    <div className="modal-head"><div><span className="eyebrow">WELCOME TO YOUR MUSIC SPACE</span><h2>{mode==='login'?'다시 만나서 반가워.':'새로운 계정 만들기'}</h2></div><button type="button" className="icon-button" onClick={onClose}><X/></button></div>
    {mode==='signup'&&<label>닉네임<input value={name} onChange={e=>setName(e.target.value)} placeholder="친구들에게 보여줄 이름" maxLength={24}/></label>}
    <label>이메일<input type="email" required value={email} onChange={e=>setEmail(e.target.value)} placeholder="hello@example.com"/></label>
    <label>비밀번호<input type="password" required minLength={6} value={password} onChange={e=>setPassword(e.target.value)} placeholder="6자 이상"/></label>
    {error&&<p className="form-error">{error}</p>}{message&&<p className="form-success">{message}</p>}
    <button className="primary-button full" disabled={busy}>{mode==='login'?<LogIn size={16}/>:<UserPlus size={16}/>} {busy?'잠시만...':mode==='login'?'로그인':'가입하기'}</button>
    <button type="button" className="switch-auth" onClick={()=>{setMode(mode==='login'?'signup':'login');setError('');setMessage('');}}>{mode==='login'?'아직 계정이 없나요? 회원가입':'이미 계정이 있나요? 로그인'}</button>
  </form></div>;
}