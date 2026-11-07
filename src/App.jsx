import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { supabase, signInWithGoogle, signOut, getSession } from "./supabase";

const API = (process.env.REACT_APP_API_URL || "http://localhost:8000").replace(/\/$/, "");

const S = {
  page: { minHeight:"100vh",background:"#eceff3",color:"#0e1116",fontFamily:"'Hanken Grotesk',sans-serif",paddingBottom:"80px" },
  nav: { position:"sticky",top:0,zIndex:100,background:"rgba(236,239,243,0.92)",backdropFilter:"blur(20px)",borderBottom:"1px solid #cfd5df",padding:"0 5%" },
  navInner: { maxWidth:900,margin:"0 auto",height:60,display:"flex",alignItems:"center",justifyContent:"space-between",gap:12 },
  logo: { fontFamily:"'Bricolage Grotesque',sans-serif",fontWeight:800,fontSize:"1.2rem",display:"flex",alignItems:"center",gap:8 },
  logoIcon: { width:30,height:30,borderRadius:7,background:"linear-gradient(135deg,#2b3cff,#2b3cff)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:14 },
  navRight: { display:"flex",alignItems:"center",gap:8,flexWrap:"wrap" },
  userAvatar: { width:28,height:28,borderRadius:"50%",border:"2px solid #2b3cff" },
  userEmail: { fontSize:11,color:"#4a5262",maxWidth:120,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap" },
  signOutBtn: { fontSize:11,padding:"5px 12px",borderRadius:100,border:"1px solid #cfd5df",background:"transparent",color:"#4a5262",cursor:"pointer",fontFamily:"'Hanken Grotesk',sans-serif" },
  ytBtn: (c) => ({ fontSize:11,fontWeight:600,padding:"5px 12px",borderRadius:100,cursor:"pointer",
    background:c?"rgba(10,125,59,0.12)":"rgba(43,60,255,0.1)",color:c?"#0a7d3b":"#2b3cff",
    border:c?"1px solid rgba(10,125,59,0.3)":"1px solid rgba(43,60,255,0.25)",transition:"all .2s" }),
  ytChannel: { display:"flex",alignItems:"center",gap:6,background:"#e4e8ee",border:"1px solid #cfd5df",borderRadius:100,padding:"3px 10px 3px 4px" },
  ytChannelImg: { width:20,height:20,borderRadius:"50%" },
  ytChannelName: { fontSize:11,color:"#4a5262",maxWidth:100,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap" },
  hero: { textAlign:"center",padding:"60px 5% 40px",maxWidth:760,margin:"0 auto" },
  h1: { fontFamily:"'Bricolage Grotesque',sans-serif",fontWeight:800,fontSize:"clamp(2rem,6vw,3.5rem)",letterSpacing:"-0.03em",lineHeight:1.05,marginBottom:"1rem" },
  gradText: { background:"linear-gradient(90deg,#2b3cff,#2b3cff)",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",backgroundClip:"text" },
  heroSub: { fontSize:16,color:"#4a5262",lineHeight:1.75,marginBottom:"2.5rem" },
  card: { background:"#ffffff",border:"1px solid #cfd5df",borderRadius:16,padding:"2rem",maxWidth:720,margin:"0 auto" },
  label: { fontSize:12,letterSpacing:"0.1em",fontWeight:600,color:"#4a5262",textTransform:"uppercase",display:"block",marginBottom:8 },
  input: { width:"100%",background:"#f6f7f9",border:"1px solid #cfd5df",borderRadius:10,color:"#0e1116",fontSize:14,padding:"13px 16px",outline:"none",fontFamily:"'Hanken Grotesk',sans-serif",transition:"border-color .2s",boxSizing:"border-box" },
  selectRow: { display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginTop:20 },
  select: { width:"100%",background:"#f6f7f9",border:"1px solid #cfd5df",borderRadius:10,color:"#0e1116",fontSize:14,padding:"13px 16px",outline:"none",fontFamily:"'Hanken Grotesk',sans-serif",cursor:"pointer",appearance:"none" },
  btnPrimary: { display:"block",width:"100%",marginTop:24,background:"linear-gradient(135deg,#2b3cff,#2b3cff)",border:"none",borderRadius:10,color:"#fff",fontFamily:"'Bricolage Grotesque',sans-serif",fontWeight:700,fontSize:15,padding:"15px",cursor:"pointer",letterSpacing:"0.02em",transition:"opacity .2s" },
  btnDisabled: { opacity:0.5,cursor:"not-allowed" },
  clipLimitBar: { maxWidth:720,margin:"1rem auto 0",padding:"0.75rem 1.25rem",background:"rgba(43,60,255,0.06)",border:"1px solid rgba(43,60,255,0.15)",borderRadius:10,display:"flex",alignItems:"center",justifyContent:"space-between" },
  progressWrap: { maxWidth:720,margin:"2rem auto",padding:"2rem",background:"#ffffff",border:"1px solid #cfd5df",borderRadius:16 },
  progressBar: { height:4,background:"#cfd5df",borderRadius:100,margin:"1rem 0",overflow:"hidden" },
  progressFill: { height:"100%",borderRadius:100,background:"linear-gradient(90deg,#2b3cff,#2b3cff)",transition:"width .4s ease" },
  clipsSection: { maxWidth:720,margin:"2rem auto" },
  clipsTitle: { fontFamily:"'Bricolage Grotesque',sans-serif",fontWeight:800,fontSize:"1.4rem",marginBottom:"1.25rem",display:"flex",alignItems:"center",gap:10 },
  clipsGrid: { display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(200px,1fr))",gap:14 },
  clipCard: { background:"#ffffff",border:"1px solid #cfd5df",borderRadius:12,overflow:"hidden" },
  clipVideo: { width:"100%",display:"block",background:"#000" },
  clipInfo: { padding:"0.75rem 1rem" },
  clipNum: { fontSize:11,color:"#2b3cff",fontWeight:700,letterSpacing:"0.08em",marginBottom:4 },
  clipCaption: { fontSize:12,color:"#4a5262",lineHeight:1.5,marginBottom:8 },
  clipBtnRow: { display:"flex",gap:6 },
  clipBtn: { flex:1,textAlign:"center",background:"transparent",border:"1px solid #cfd5df",borderRadius:7,color:"#4a5262",fontSize:11,padding:"7px 4px",cursor:"pointer",textDecoration:"none",fontFamily:"'Hanken Grotesk',sans-serif",transition:"all .2s" },
  clipUploadBtn: { flex:1,textAlign:"center",background:"rgba(43,60,255,0.07)",border:"1px solid rgba(43,60,255,0.25)",borderRadius:7,color:"#2b3cff",fontSize:11,padding:"7px 4px",cursor:"pointer",fontFamily:"'Hanken Grotesk',sans-serif" },
  clipDeleteBtn: { background:"transparent",border:"1px solid #cfd5df",borderRadius:7,color:"#4a5262",fontSize:11,padding:"7px 8px",cursor:"pointer" },
  errorBox: { maxWidth:720,margin:"2rem auto",background:"rgba(180,35,24,0.08)",border:"1px solid rgba(180,35,24,0.3)",borderRadius:12,padding:"1.25rem 1.5rem",color:"#b42318",fontSize:14,lineHeight:1.7 },
  resetBtn: { display:"block",margin:"1rem auto 0",background:"transparent",border:"1px solid #cfd5df",borderRadius:8,color:"#4a5262",fontSize:13,padding:"10px 24px",cursor:"pointer",fontFamily:"'Hanken Grotesk',sans-serif" },
  loginOverlay: { position:"fixed",inset:0,background:"rgba(0,0,0,0.85)",backdropFilter:"blur(8px)",zIndex:300,display:"flex",alignItems:"center",justifyContent:"center",padding:"1rem" },
  loginCard: { background:"#ffffff",border:"1px solid #cfd5df",borderRadius:20,padding:"2.5rem",maxWidth:400,width:"100%",textAlign:"center" },
  loginTitle: { fontFamily:"'Bricolage Grotesque',sans-serif",fontWeight:800,fontSize:"1.5rem",marginBottom:"0.5rem" },
  loginSub: { fontSize:14,color:"#4a5262",marginBottom:"2rem",lineHeight:1.6 },
  googleBtn: { display:"flex",alignItems:"center",justifyContent:"center",gap:10,width:"100%",padding:"14px",background:"#fff",border:"none",borderRadius:10,cursor:"pointer",fontFamily:"'Hanken Grotesk',sans-serif",fontWeight:600,fontSize:14,color:"#1a1a1a" },
  overlay: { position:"fixed",inset:0,background:"rgba(0,0,0,0.75)",backdropFilter:"blur(6px)",zIndex:200,display:"flex",alignItems:"center",justifyContent:"center",padding:"1rem" },
  modal: { background:"#ffffff",border:"1px solid #cfd5df",borderRadius:16,padding:"2rem",width:"100%",maxWidth:480 },
  modalTitle: { fontFamily:"'Bricolage Grotesque',sans-serif",fontWeight:800,fontSize:"1.15rem",marginBottom:"1.25rem",display:"flex",alignItems:"center",gap:8 },
  modalLabel: { fontSize:11,letterSpacing:"0.1em",fontWeight:600,color:"#4a5262",textTransform:"uppercase",display:"block",marginBottom:6,marginTop:14 },
  modalInput: { width:"100%",background:"#f6f7f9",border:"1px solid #cfd5df",borderRadius:8,color:"#0e1116",fontSize:13,padding:"10px 14px",outline:"none",fontFamily:"'Hanken Grotesk',sans-serif",boxSizing:"border-box",resize:"vertical" },
  modalBtnRow: { display:"flex",gap:8,marginTop:20 },
  modalCancelBtn: { flex:1,padding:"11px",borderRadius:8,cursor:"pointer",background:"transparent",border:"1px solid #cfd5df",color:"#4a5262",fontSize:13,fontFamily:"'Hanken Grotesk',sans-serif" },
  modalUploadBtn: { flex:2,padding:"11px",borderRadius:8,cursor:"pointer",background:"linear-gradient(135deg,#2b3cff,#2b3cff)",border:"none",color:"#fff",fontSize:13,fontWeight:700,fontFamily:"'Bricolage Grotesque',sans-serif" },
  successMsg: { marginTop:12,padding:"10px 14px",borderRadius:8,background:"rgba(10,125,59,0.1)",border:"1px solid rgba(10,125,59,0.3)",color:"#0a7d3b",fontSize:12,lineHeight:1.6 },
};

function LoginPopup({ onClose }) {
  const [loading, setLoading] = useState(false);
  async function handleGoogleLogin() {
    setLoading(true);
    try { await signInWithGoogle(); } catch (e) { console.error(e); setLoading(false); }
  }
  return (
    <div style={S.loginOverlay}>
      <div style={S.loginCard}>
        <div style={{...S.logoIcon,margin:"0 auto 1.5rem",width:50,height:50,borderRadius:12,fontSize:22}}>✂</div>
        <div style={S.loginTitle}>ClipAI mein Welcome!</div>
        <div style={S.loginSub}>Viral clips banane ke liye Google se login karo.<br/><span style={{color:"#2b3cff"}}>Free mein 6 clips</span> store kar sakte ho!</div>
        <button style={{...S.googleBtn,opacity:loading?0.7:1}} onClick={handleGoogleLogin} disabled={loading}>
          <svg width="18" height="18" viewBox="0 0 48 48">
            <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
            <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
            <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
            <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.18 1.48-4.97 2.31-8.16 2.31-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
          </svg>
          {loading?"Loading...":"Google se Login Karo"}
        </button>
        <button style={{...S.resetBtn,marginTop:"1rem"}} onClick={onClose}>Baad mein</button>
      </div>
    </div>
  );
}

function UploadModal({ clip, clipIndex, jobId, ytConnected, fbConnected, onClose, session, onDone, onMark, meta, onMeta }) {
  const _left = [ytConnected && !(clip.uploaded || []).includes("youtube") && "youtube", fbConnected && !(clip.uploaded || []).includes("facebook") && "facebook"].filter(Boolean);
  const [platform, setPlatform] = useState(_left.length > 1 ? "all" : (_left[0] || "all"));
  const [results, setResults] = useState(null);
  const [doneP, setDoneP] = useState(clip.uploaded || []);
  const [title, setTitle]           = useState(meta?.title ?? clip.title ?? clip.caption ?? "");
  const [desc, setDesc]             = useState(meta?.desc ?? clip.description ?? "#shorts #viral #trending");
  const [loading, setLoading]       = useState(false);
  const [generating, setGenerating] = useState(false);
  const [success, setSuccess]       = useState(null);
  const [error, setError]           = useState(null);

  useEffect(() => { if (onMeta) onMeta(clip.db_id, { title, desc }); }, [title, desc]);
  const canUp = platform === "all" ? ((ytConnected && !doneP.includes("youtube")) || (fbConnected && !doneP.includes("facebook"))) : platform === "youtube" ? (ytConnected && !doneP.includes("youtube")) : (fbConnected && !doneP.includes("facebook"));

  function getToken() { return session?.access_token || null; }

  async function generateTitle() {
    setGenerating(true);
    try {
      const token = getToken();
      if (!token) return;
      let res;
      if (jobId) {
        res = await axios.post(`${API}/generate-title`,
          { job_id: jobId, clip_index: clipIndex },
          { headers: { Authorization: `Bearer ${token}` } }
        );
      } else {
        res = await axios.post(`${API}/generate-title-from-caption`,
          { caption: clip.caption || "", reason: clip.reason || "" },
          { headers: { Authorization: `Bearer ${token}` } }
        );
      }
      setTitle(res.data.title || "");
      setDesc(res.data.description || "");
    } catch {
      setTitle("Check out this viral moment! 🔥");
      setDesc("#shorts #viral #trending");
    } finally { setGenerating(false); }
  }

  async function handleUpload() {
    if (!title.trim()) return;
    const token = getToken();
    if (!token) return;
    setLoading(true); setError(null);
    try {
      const body = { b2_key: clip.b2_key, clip_db_id: clip.db_id,
        title: title.trim(), description: desc.trim(), tags: ["shorts","viral","trending"] };
      const hdr = { headers: { Authorization: `Bearer ${token}` } };
      if (platform === "all") {
        const todo = [ytConnected && "youtube", fbConnected && "facebook"].filter(Boolean).filter(p => !doneP.includes(p));
        if (!todo.length) { setError("Sab connected platform par upload ho chuka hai."); return; }
        const res = await axios.post(`${API}/upload/all`, { ...body, platforms: todo }, hdr);
        const okP = Object.entries(res.data.results).filter(([, r]) => r.success).map(([k]) => k);
        setResults(prev => ({ ...(prev || {}), ...res.data.results }));
        setDoneP(prev => [...new Set([...prev, ...okP])]);
        if (res.data.deleted) { if (onDone) onDone(clip.db_id); }
        else if (okP.length && onMark) onMark(clip.db_id, okP);
        if (res.data.success) {
          setSuccess("all");
        } else setError("Kuch platform par upload fail hua. Neeche dekho, phir dobara dabao (jo ho chuka wo dobara nahi jayega).");
      } else {
        const res = await axios.post(`${API}/upload/${platform}`, body, hdr);
        setSuccess(res.data.url);
        setDoneP(prev => [...new Set([...prev, platform])]);
        if (res.data.deleted) { if (onDone) onDone(clip.db_id); }
        else if (onMark) onMark(clip.db_id, [platform]);
      }
    } catch (e) { setError(e?.response?.data?.detail || e.message); }
    finally { setLoading(false); }
  }

  return (
    <div style={S.overlay} onClick={(e)=>e.target===e.currentTarget&&onClose()}>
      <div style={S.modal}>
        <div style={S.modalTitle}><span>🚀</span> Upload Clip {clipIndex+1}</div>
        <div style={{fontSize:11,color:"#4a5262",textTransform:"uppercase",letterSpacing:"0.1em",fontWeight:600,marginBottom:6}}>Platform</div>
        <div style={{display:"flex",gap:8,marginBottom:16}}>
          {[["all","All",ytConnected||fbConnected],["youtube","YouTube",ytConnected&&!doneP.includes("youtube")],["facebook","Facebook",fbConnected&&!doneP.includes("facebook")]].map(([k,n,ok]) => (
            <button key={k} onClick={() => setPlatform(k)} style={{flex:1,padding:"11px 6px",borderRadius:8,cursor:"pointer",fontSize:13,fontWeight:700,textAlign:"center",
              border:platform===k?"2px solid #2b3cff":"1px solid #cfd5df",background:platform===k?"rgba(43,60,255,0.08)":"#fff",color:platform===k?"#2b3cff":"#0e1116"}}>
              {n}{!ok&&<><br/><span style={{fontSize:10,fontWeight:500}}>{doneP.includes(k)?"✓ ho gaya":"Connect nahi hai"}</span></>}
            </button>))}
        </div>
        <div style={{display:"none"}}>
          <button style={{flex:1,padding:"10px 6px",borderRadius:8,cursor:ytConnected?"pointer":"not-allowed",border:"1px solid #2b3cff",background:"rgba(43,60,255,0.1)",color:"#2b3cff",fontSize:11,fontWeight:600,textAlign:"center"}}>
            ▶ YouTube{!ytConnected&&<><br/><span style={{fontSize:9,opacity:0.6}}>Connect karo</span></>}
          </button>
          <button style={{flex:1,padding:"10px 6px",borderRadius:8,cursor:"not-allowed",border:"1px solid #cfd5df",background:"transparent",color:"#4a5262",fontSize:11,fontWeight:600,textAlign:"center",opacity:0.5}}>
            📸 Instagram<br/><span style={{fontSize:9}}>Coming Soon</span>
          </button>
          <button style={{flex:1,padding:"10px 6px",borderRadius:8,cursor:"not-allowed",border:"1px solid #cfd5df",background:"transparent",color:"#4a5262",fontSize:11,fontWeight:600,textAlign:"center",opacity:0.5}}>
            👍 Facebook<br/><span style={{fontSize:9}}>Coming Soon</span>
          </button>
        </div>
        <label style={S.modalLabel}>Title {generating&&<span style={{color:"#2b3cff",fontSize:10}}>AI generate kar raha hai...</span>}</label>
        <input style={S.modalInput} value={title} onChange={e=>setTitle(e.target.value)} maxLength={100} placeholder="Title likho"/>
        <div style={{fontSize:10,color:"#4a5262",marginTop:3}}>{title.length}/100</div>
        <label style={S.modalLabel}>Description</label>
        <textarea style={{...S.modalInput,minHeight:70}} value={desc} onChange={e=>setDesc(e.target.value)} maxLength={500} placeholder="#shorts #viral"/>
        <button onClick={generateTitle} disabled={generating} style={{...S.modalCancelBtn,marginTop:6,width:"100%",fontSize:12,opacity:generating?0.5:1}}>
          {generating?"Generating...":"✨ AI se naya title banao (optional)"}
        </button>
        {error&&<div style={{...S.successMsg,background:"rgba(180,35,24,0.1)",border:"1px solid rgba(180,35,24,0.3)",color:"#b42318"}}>❌ {error}</div>}
        {results&&Object.entries(results).map(([k,r]) => (
          <div key={k} style={{...S.successMsg,...(r.success?{}:{background:"rgba(180,35,24,0.1)",border:"1px solid rgba(180,35,24,0.3)",color:"#b42318"})}}>
            {r.success?"✅":"❌"} {k==="youtube"?"YouTube":"Facebook"}: {r.success?<a href={r.url} target="_blank" rel="noreferrer" style={{color:"#0a7d3b"}}>Link kholo →</a>:r.error}
          </div>))}
        {success&&success!=="all"&&<div style={S.successMsg}>✅ Upload ho gaya! <a href={success} target="_blank" rel="noreferrer" style={{color:"#0a7d3b"}}>Link kholo →</a></div>}
        {!success&&(
          <div style={S.modalBtnRow}>
            <button style={S.modalCancelBtn} onClick={onClose}>Cancel</button>
            <button style={{...S.modalUploadBtn,opacity:loading||!title.trim()||!canUp?0.5:1}}
              onClick={handleUpload} disabled={loading||!title.trim()||!canUp}>
              {loading?"Uploading...":(platform==="all"?"🚀 Upload sab jagah":platform==="youtube"?"🚀 Upload to YouTube":"🚀 Upload to Facebook")}
            </button>
          </div>
        )}
        {success&&<button style={{...S.resetBtn,marginTop:12}} onClick={onClose}>Close</button>}
      </div>
    </div>
  );
}

export default function App() {
  const [url, setUrl]           = useState("");
  const [language, setLanguage] = useState("hindi");
  const [length, setLength]     = useState("30-60");
  const [jobId, setJobId]       = useState(null);
  const [job, setJob]           = useState(null);
  const [loading, setLoading]   = useState(false);
  const [ytConnected, setYtConnected] = useState(false);
  const [ytChannel, setYtChannel]     = useState(null);
  const [uploadModal, setUploadModal] = useState(null);
  const [clipMeta, setClipMeta] = useState({});
  const [session, setSession]   = useState(null);
  const [fb, setFb] = useState({connected:false,name:null,logo:null});
  const [showLogin, setShowLogin] = useState(false);
  const [clipCount, setClipCount] = useState(0);
  const [storedClips, setStoredClips] = useState([]);
  const pollRef = useRef(null);

  function getToken(s) {
    const sess = s || session;
    return sess?.access_token || null;
  }

  // ✅ Logout pe saare clips delete karo
  async function handleLogout() {
    const token = getToken();
    if (token) {
      try {
        await axios.delete(`${API}/my-clips/all`, {
          headers: { Authorization: `Bearer ${token}` }
        });
      } catch(e) {
        console.error("[Cleanup] Clips delete failed:", e.message);
      }
    }
    await signOut();
  }

  // ✅ YouTube connect — backend se auth URL fetch karo phir redirect karo
async function connectYoutube() {
  const token = getToken();
  if (!token) { setShowLogin(true); return; }
  try {
    const res = await axios.get(`${API}/auth/youtube/url`, { headers: { Authorization: `Bearer ${token}` } });
    window.location.href = res.data.url;
  } catch (e) {
    alert("YouTube connect failed: " + (e?.response?.data?.detail || e.message));
  }
}

  // ✅ YouTube disconnect
  async function disconnectYoutube() {
    const token = getToken();
    try {
      await axios.delete(`${API}/auth/youtube/disconnect`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setYtConnected(false);
      setYtChannel(null);
    } catch(e) {
      alert("Disconnect failed: " + e.message);
    }
  }

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session: s } }) => {
      if (s) { setSession(s); checkYtStatus(s); checkFbStatus(s); fetchClipCount(s); }
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, sess) => {
      console.log("[Auth]", event, sess?.user?.email);
      if (sess) {
        setSession(sess); setShowLogin(false); checkYtStatus(sess); checkFbStatus(sess); fetchClipCount(sess);
      } else {
        setSession(null); setYtChannel(null); setYtConnected(false); setStoredClips([]); setClipCount(0);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("yt_connected")) {
      // ✅ Session se fresh status check karo
      supabase.auth.getSession().then(({ data: { session: s } }) => {
        if (s) checkYtStatus(s);
      });
      window.history.replaceState({}, "", "/");
    }
    if (params.get("fb_connected")) {
      supabase.auth.getSession().then(({ data: { session: s } }) => { if (s) checkFbStatus(s); });
      window.history.replaceState({}, "", "/");
    }
    if (params.get("fb_error")) {
      alert("Facebook connect nahi hua: " + params.get("fb_error"));
      window.history.replaceState({}, "", "/");
    }
    if (params.get("yt_error")) {
      console.error("[YouTube Auth Error]", params.get("yt_error"));
      alert("YouTube connect nahi hua: " + params.get("yt_error"));
      window.history.replaceState({}, "", "/");
    }
  }, []);

  async function checkFbStatus(s) {
    try {
      const token = getToken(s); if (!token) return;
      const res = await axios.get(`${API}/auth/facebook/status`, { headers: { Authorization: `Bearer ${token}` } });
      setFb(res.data);
    } catch {}
  }
  async function connectFacebook() {
    const token = getToken();
    if (!token) { setShowLogin(true); return; }
    try {
      const res = await axios.get(`${API}/auth/facebook/url`, { headers: { Authorization: `Bearer ${token}` } });
      window.location.href = res.data.url;
    } catch (e) { alert("Facebook connect failed: " + (e?.response?.data?.detail || e.message)); }
  }
  async function disconnectFacebook() {
    try {
      await axios.delete(`${API}/auth/facebook/disconnect`, { headers: { Authorization: `Bearer ${getToken()}` } });
      setFb({ connected:false, name:null, logo:null });
    } catch (e) { alert("Disconnect failed: " + e.message); }
  }
  async function checkYtStatus(s) {
    try {
      const token = getToken(s);
      if (!token) return;
      const res = await axios.get(`${API}/auth/youtube/status`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setYtConnected(res.data.connected);
      if (res.data.connected) fetchYtChannel(s);
    } catch {}
  }

  async function fetchYtChannel(s) {
    try {
      const token = getToken(s);
      if (!token) return;
      const res = await axios.get(`${API}/auth/youtube/channel`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data?.name) setYtChannel(res.data);
      else setYtChannel(null);
    } catch { setYtChannel(null); }
  }

  async function fetchClipCount(s) {
    try {
      const token = s?.access_token;
      if (!token) return;
      const res = await axios.get(`${API}/my-clips`, { headers: { Authorization: `Bearer ${token}` } });
      setClipCount(res.data.count || 0);
      const clips = (res.data.clips || []).map(c => ({
        url: c.url, b2_key: c.b2_key, db_id: c.id,
        caption: c.caption, reason: c.reason, uploaded: c.uploaded_to || [],
      }));
      setStoredClips(clips);
      setJob(prev => (prev && prev.clips) ? { ...prev, clips: prev.clips.filter(c => clips.some(x => x.db_id === c.db_id)).map(c => ({ ...c, uploaded: (clips.find(x => x.db_id === c.db_id) || {}).uploaded || c.uploaded || [] })) } : prev);
    } catch {}
  }

  useEffect(() => {
    if (!jobId || !session) return;
    const token = session.access_token;
    pollRef.current = setInterval(async () => {
      try {
        if (!token) return;
        const res = await axios.get(`${API}/status/${jobId}`, { headers: { Authorization: `Bearer ${token}` } });
        setJob(res.data);
        if (res.data.status === "done" || res.data.status === "error") {
          clearInterval(pollRef.current);
          setLoading(false);
          if (res.data.status === "done") fetchClipCount(session);
        }
      } catch(e) { console.error("[Poll error]", e?.message); }
    }, 1500);
    return () => clearInterval(pollRef.current);
  }, [jobId, session]);

  async function handleSubmit() {
    if (!url) return;
    if (!session) { setShowLogin(true); return; }
    const token = getToken();
    if (!token) { setShowLogin(true); return; }
    setLoading(true); setJob(null); setJobId(null);
    try {
      const res = await axios.post(`${API}/create-clips`,
        { youtube_url: url, language, clip_length: length },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setJobId(res.data.job_id);
      setJob({ status:"queued", step:"Starting pipeline...", clips:[], progress:0 });
    } catch(e) {
      setLoading(false);
      setJob({ status:"error", step:"", error: e?.response?.data?.detail || e.message });
    }
  }

  function markUploaded(id, plats) {
    const add = c => c.db_id === id ? { ...c, uploaded: [...new Set([...(c.uploaded || []), ...plats])] } : c;
    setJob(prev => prev ? ({ ...prev, clips: (prev.clips || []).map(add) }) : prev);
    setStoredClips(prev => prev.map(add));
  }
  function clipGone(id) {
    setJob(prev => prev ? ({ ...prev, clips: (prev.clips || []).filter(c => c.db_id !== id) }) : prev);
    setStoredClips(prev => prev.filter(c => c.db_id !== id));
    setClipCount(prev => Math.max(0, prev - 1));
    setTimeout(() => fetchClipCount(session), 800);
  }
  async function handleDeleteClip(clipDbId) {
    try {
      const token = getToken();
      if (!token) return;
      await axios.delete(`${API}/clip/${clipDbId}`, { headers: { Authorization: `Bearer ${token}` } });
      setJob(prev => prev ? ({ ...prev, clips: prev.clips.filter(c => c.db_id !== clipDbId) }) : prev);
      setStoredClips(prev => prev.filter(c => c.db_id !== clipDbId));
      setClipCount(prev => Math.max(0, prev - 1));
    } catch(e) { alert("Delete failed: " + e.message); }
  }

  function reset() {
    clearInterval(pollRef.current);
    setUrl(""); setJobId(null); setJob(null); setLoading(false);
    fetchClipCount(session);
  }

  const isDone    = job?.status === "done";
  const isError   = job?.status === "error";
  const isRunning = loading && !isDone && !isError;
  const progress  = job?.progress ?? 0;

  const LANGS = [["hindi","Hindi"],["hinglish","Hinglish"],["bengali","Bengali"],["english","English"]];
  const LENS  = [["30-60","30–60 sec"],["60-90","60–90 sec"],["90-150","90–150 sec"]];
  const avatar = session?.user?.user_metadata?.avatar_url;

  const clipCard = (clip, i, fromJob) => (
    <div className="card" key={clip.db_id || i}>
      <video className="vid" controls preload="metadata" src={clip.url}/>
      <div className="cbody">
        <b>Clip {i+1}</b>
        {clip.caption && <p>{clip.caption}</p>}
        {fromJob && clip.reason && <p className="why">{clip.reason}</p>}
        {(clip.uploaded || []).length > 0 && <p className="why">✓ Upload ho chuka: {clip.uploaded.join(", ")}</p>}
        <div className="acts">
          <button className="btn pri full" onClick={() => setUploadModal({clip, clipIndex:i, fromJob})}>Upload</button>
          <a className="btn out" href={clip.url} download={`clipai_clip_${i+1}.mp4`}>Download</a>
          <button className="btn del" onClick={() => handleDeleteClip(clip.db_id)}>Delete</button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="cx">
      <style>{`
        .cx{--ink:#0e1116;--mut:#4a5262;--line:#cfd5df;--acc:#2b3cff;--bad:#b42318;--ok:#0a7d3b;display:grid;grid-template-columns:320px minmax(0,1fr);min-height:100vh;background:#eceff3;color:var(--ink);font-family:'Hanken Grotesk',sans-serif}
        .cx *{box-sizing:border-box}
        .side{position:sticky;top:0;height:100vh;overflow:auto;padding:28px 22px;background:#fff;border-right:1px solid var(--line);display:flex;flex-direction:column;gap:26px}
        .logo{display:flex;align-items:center;gap:10px;font:800 26px 'Bricolage Grotesque',sans-serif;letter-spacing:-.02em}
        .mark{width:30px;height:30px;border-radius:8px;background:linear-gradient(135deg,var(--ink) 50%,var(--acc) 50%)}
        .sec h4{font:700 14px 'Hanken Grotesk',sans-serif;color:var(--mut);margin-bottom:10px}
        .me{display:flex;align-items:center;gap:12px;margin-bottom:12px}
        .me img,.me i{width:42px;height:42px;border-radius:50%;background:var(--line);flex:none}
        .me span{font-size:14px;font-weight:600;word-break:break-all;line-height:1.3}
        .row{display:flex;align-items:center;gap:12px;padding:14px;border:1px solid var(--line);border-radius:12px;margin-bottom:10px}
        .row b{display:block;font-size:16px}.row small{font-size:13px;color:var(--mut)}
        .ico{width:44px;height:44px;border-radius:11px;display:grid;place-items:center;color:#fff;font-weight:800;font-size:15px;flex:none;object-fit:cover}
        .soon{opacity:.6}
        .btn{display:inline-flex;align-items:center;justify-content:center;height:44px;padding:0 16px;border-radius:10px;border:1px solid var(--line);background:#fff;color:var(--ink);font:700 15px 'Hanken Grotesk',sans-serif;cursor:pointer;text-decoration:none}
        .btn.pri{background:var(--acc);border-color:var(--acc);color:#fff}
        .btn.del{background:#fef3f2;border-color:#f1a9a1;color:var(--bad)}
        .btn.full{width:100%}.btn:disabled{opacity:.45;cursor:not-allowed}
        .btn:hover:not(:disabled){filter:brightness(.95)}
        .cx button:focus-visible,.cx a:focus-visible,.url:focus-visible{outline:3px solid var(--acc);outline-offset:2px}
        .bar{height:10px;background:#e4e8ee;border-radius:6px;overflow:hidden;border:1px solid var(--line)}
        .bar i{display:block;height:100%;background:var(--acc)}
        .main{padding:48px 5vw 80px;max-width:1000px;width:100%}
        .main h1{font:800 clamp(2.1rem,4.6vw,3.5rem)/1.02 'Bricolage Grotesque',sans-serif;letter-spacing:-.035em;max-width:680px}
        .sub{font-size:18px;line-height:1.6;color:var(--mut);max-width:560px;margin:16px 0 32px}
        .panel{background:#fff;border:1px solid var(--line);border-radius:16px;padding:28px;margin-bottom:24px}
        .panel label{display:block;font-weight:700;font-size:15px;margin:22px 0 10px}.panel label:first-child{margin-top:0}
        .url{width:100%;height:60px;font:500 17px 'Hanken Grotesk',sans-serif;color:var(--ink);border:2px solid var(--ink);border-radius:12px;padding:0 18px;background:#fff}
        .seg{display:flex;flex-wrap:wrap;gap:8px}
        .seg button{height:44px;padding:0 18px;border:1px solid var(--line);background:#fff;border-radius:10px;font:600 15px 'Hanken Grotesk',sans-serif;color:var(--ink);cursor:pointer}
        .seg button.on{background:var(--ink);border-color:var(--ink);color:#fff}
        .go{height:56px;margin-top:28px;font-size:17px}
        .pct{font:800 64px/1 'Bricolage Grotesque',sans-serif;letter-spacing:-.04em}
        .tl{height:18px;margin:18px 0 12px;border:1px solid var(--line);border-radius:4px;overflow:hidden;background:repeating-linear-gradient(90deg,var(--line) 0 1px,transparent 1px 14px),#e4e8ee}
        .tl i{display:block;height:100%;background:var(--acc);transition:width .4s}
        .err{background:#fef3f2;border:1px solid #f1a9a1;color:var(--bad);border-radius:14px;padding:22px;line-height:1.6;margin-bottom:24px}
        .head{display:flex;align-items:center;justify-content:space-between;gap:12px;margin:8px 0 18px}
        .head h2{font:800 28px 'Bricolage Grotesque',sans-serif;letter-spacing:-.02em}
        .grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(230px,1fr));gap:20px;margin-bottom:28px}
        .card{background:#fff;border:1px solid var(--line);border-radius:14px;overflow:hidden}
        .vid{width:100%;aspect-ratio:9/16;object-fit:cover;background:#000;display:block}
        .cbody{padding:14px}.cbody b{font-size:16px}
        .cbody p{font-size:14px;line-height:1.5;margin:6px 0 0}.cbody .why{color:var(--mut);font-size:13px}
        .acts{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:14px}.acts .full{grid-column:1/-1}
        @media(max-width:860px){.cx{grid-template-columns:1fr}.side{position:static;height:auto;border-right:0;border-bottom:1px solid var(--line)}.main{padding-top:28px}}
      `}</style>

      {showLogin && <LoginPopup onClose={() => setShowLogin(false)} />}
      {uploadModal && (
        <UploadModal clip={uploadModal.clip} clipIndex={uploadModal.clipIndex}
          jobId={uploadModal.fromJob ? jobId : null} ytConnected={ytConnected} fbConnected={fb.connected}
          session={session} onDone={clipGone} onMark={markUploaded} meta={clipMeta[uploadModal.clip.db_id]}
          onMeta={(id, m) => setClipMeta(p => ({ ...p, [id]: m }))} onClose={() => setUploadModal(null)} />
      )}

      <aside className="side">
        <div className="logo"><span className="mark"/>ClipAI</div>

        <div className="sec">
          <h4>Account</h4>
          {session ? (<>
            <div className="me">{avatar ? <img src={avatar} alt=""/> : <i/>}<span>{session.user.email}</span></div>
            <button className="btn full" onClick={handleLogout}>Log out</button>
          </>) : (<>
            <p style={{fontSize:14,color:"var(--mut)",lineHeight:1.5,marginBottom:12}}>Login karo, phir 6 clips tak free me save kar sakte ho.</p>
            <button className="btn pri full" onClick={() => setShowLogin(true)}>Log in with Google</button>
          </>)}
        </div>

        <div className="sec">
          <h4>Connections</h4>
          <div className="row">
            {ytChannel?.logo ? <img className="ico" src={ytChannel.logo} alt=""/> : <span className="ico" style={{background:"#d92d20"}}>YT</span>}
            <div style={{minWidth:0}}>
              <b>YouTube</b>
              <small>{ytConnected ? (ytChannel?.name || "Connected") : "Not connected"}</small>
            </div>
          </div>
          {session && (
            <button className={"btn full " + (ytConnected ? "out" : "pri")}
              onClick={() => ytConnected ? disconnectYoutube() : connectYoutube()}>
              {ytConnected ? "Disconnect YouTube" : "Connect YouTube"}
            </button>
          )}
          <div className="row soon" style={{marginTop:10}}><span className="ico" style={{background:"#8a3ffc"}}>IG</span><div><b>Instagram</b><small>Coming soon</small></div></div>
          <div className="row" style={{marginTop:10}}>
            {fb.logo ? <img className="ico" src={fb.logo} alt=""/> : <span className="ico" style={{background:"#1570ef"}}>FB</span>}
            <div style={{minWidth:0}}><b>Facebook</b><small>{fb.connected ? (fb.name || "Connected") : "Not connected"}</small></div>
          </div>
          {session && <button className={"btn full " + (fb.connected ? "out" : "pri")} onClick={() => fb.connected ? disconnectFacebook() : connectFacebook()}>{fb.connected ? "Disconnect Facebook" : "Connect Facebook"}</button>}
        </div>

        {session && (
          <div className="sec">
            <h4 style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>Saved clips
              <button className="btn" style={{height:32,padding:"0 12px",fontSize:13}} onClick={() => fetchClipCount(session)}>Refresh</button>
            </h4>
            <div style={{display:"flex",justifyContent:"space-between",fontWeight:700,fontSize:15,marginBottom:8}}>
              <span>{clipCount} of 6 used</span><span style={{color:clipCount>=6?"var(--bad)":"var(--mut)"}}>{6-clipCount} free</span>
            </div>
            <div className="bar"><i style={{width:`${Math.min(100,clipCount/6*100)}%`}}/></div>
          </div>
        )}
      </aside>

      <main className="main">
        <h1>Turn one long video into Shorts that are ready to post.</h1>
        <p className="sub">Paste a YouTube link. ClipAI picks the best moments, cuts them to 9:16, adds synced captions and uploads to your channel.</p>

        {!isRunning && !isDone && !isError && (
          <div className="panel">
            <label htmlFor="u">YouTube video link</label>
            <input id="u" className="url" placeholder="https://youtube.com/watch?v=..." value={url} onChange={e => setUrl(e.target.value)}/>
            <label>Caption language</label>
            <div className="seg">{LANGS.map(([v,t]) => <button key={v} className={language===v?"on":""} onClick={() => setLanguage(v)}>{t}</button>)}</div>
            <label>Clip length</label>
            <div className="seg">{LENS.map(([v,t]) => <button key={v} className={length===v?"on":""} onClick={() => setLength(v)}>{t}</button>)}</div>
            <button className="btn pri full go" onClick={handleSubmit} disabled={!url}>Generate clips</button>
          </div>
        )}

        {isRunning && job && (
          <div className="panel">
            <div className="pct">{progress}%</div>
            <div className="tl"><i style={{width:`${progress}%`}}/></div>
            <p style={{fontSize:17,fontWeight:600}}>{job.step}</p>
            <p style={{fontSize:14,color:"var(--mut)",marginTop:6}}>Isme 2–5 minute lag sakte hain. Page band mat karna.</p>
          </div>
        )}

        {isError && (
          <div className="err">
            <b>Kuch gadbad ho gayi.</b><br/>{job?.error}<br/>
            <small>Check karo: YouTube link sahi hai? ffmpeg installed hai? Backend chal raha hai?</small><br/><br/>
            <button className="btn" onClick={reset}>Try again</button>
          </div>
        )}

        {isDone && job?.clips?.length > 0 && (<>
          <div className="head"><h2>{job.clips.length} clips ready</h2><button className="btn" onClick={reset}>New video</button></div>
          <div className="grid">{job.clips.map((c, i) => clipCard(c, i, true))}</div>
        </>)}

        {!isRunning && !isDone && session && storedClips.length > 0 && (<>
          <div className="head"><h2>Your saved clips ({storedClips.length}/6)</h2><button className="btn" onClick={() => fetchClipCount(session)}>Refresh</button></div>
          <div className="grid">{storedClips.map((c, i) => clipCard(c, i, false))}</div>
        </>)}
      </main>
    </div>
  );
}