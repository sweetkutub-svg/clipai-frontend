import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { supabase, signInWithGoogle, signOut } from "./supabase";

const API = (process.env.REACT_APP_API_URL || "http://localhost:8000").replace(/\/$/, "");
const FREE_LIMIT = 6;
const THEME_KEY = "clipai-theme";

/* ------------------------------------------------------------------ */
/* Styles                                                              */
/* ------------------------------------------------------------------ */
const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Instrument+Sans:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;600&display=swap');

.cx{
  --bg:#f2efe9;--panel:#faf8f4;--panel2:#ebe7df;--line:#d9d4c9;
  --ink:#1a1916;--mut:#6b665b;--on-ink:#faf8f4;
  --acc:#c2410c;--on-acc:#ffffff;--accsoft:rgba(194,65,12,.10);
  --ok:#2f6f3e;--bad:#b3261e;
  --overlay:rgba(26,25,22,.5);
  min-height:100vh;background:var(--bg);color:var(--ink);
  font-family:'Instrument Sans',system-ui,sans-serif;font-size:15px;line-height:1.5;
  -webkit-font-smoothing:antialiased;
}
.cx[data-theme="dark"]{
  --bg:#141311;--panel:#1c1b18;--panel2:#262420;--line:#34312b;
  --ink:#f1eee6;--mut:#9a9486;--on-ink:#141311;
  --acc:#f08a4b;--on-acc:#1a0e05;--accsoft:rgba(240,138,75,.14);
  --ok:#7cc48c;--bad:#f2877e;
  --overlay:rgba(0,0,0,.65);
}
.cx *{box-sizing:border-box}
.cx button,.cx input,.cx textarea{font-family:inherit;font-size:inherit}
.cx h1,.cx h2,.cx h3,.cx p{margin:0}
.cx :focus-visible{outline:2px solid var(--acc);outline-offset:2px}
.mono{font-family:'JetBrains Mono',ui-monospace,monospace}
.eyebrow{font-family:'JetBrains Mono',ui-monospace,monospace;font-size:11px;font-weight:500;letter-spacing:.08em;text-transform:uppercase;color:var(--mut)}

/* Buttons */
.btn{display:inline-flex;align-items:center;justify-content:center;gap:8px;height:40px;padding:0 16px;border-radius:8px;border:1px solid var(--line);background:transparent;color:var(--ink);font-weight:600;cursor:pointer;text-decoration:none;white-space:nowrap;transition:background .12s,border-color .12s}
.btn:hover:not(:disabled){background:var(--panel2);border-color:var(--mut)}
.btn:disabled{opacity:.45;cursor:not-allowed}
.btn.pri{background:var(--acc);border-color:var(--acc);color:var(--on-acc)}
.btn.pri:hover:not(:disabled){background:var(--acc);filter:brightness(.93)}
.btn.dark{background:var(--ink);border-color:var(--ink);color:var(--on-ink)}
.btn.dark:hover:not(:disabled){background:var(--ink);filter:brightness(1.15)}
.btn.del{color:var(--bad)}
.btn.sm{height:32px;padding:0 12px;font-size:13px}
.btn.full{width:100%}
.btn.sq{width:40px;padding:0}
.btn svg{width:18px;height:18px;flex:none}

/* Header */
.top{position:sticky;top:0;z-index:50;background:var(--bg);border-bottom:1px solid var(--line)}
.top-in{max-width:960px;margin:0 auto;height:58px;padding:0 24px;display:flex;align-items:center;justify-content:space-between;gap:12px}
.logo{display:flex;align-items:center;gap:10px;font-weight:700;font-size:18px;letter-spacing:-.02em}
.mark{width:20px;height:20px;border-radius:5px;background:linear-gradient(135deg,var(--ink) 50%,var(--acc) 50%)}
.top-r{display:flex;align-items:center;gap:8px;position:relative}
.meter{display:flex;align-items:center;gap:10px;padding:0 6px 0 4px;margin-right:4px}
.meter .bar{width:56px;height:4px;background:var(--panel2);border-radius:2px;overflow:hidden}
.meter .bar i{display:block;height:100%;background:var(--ink)}
.meter .bar i.full{background:var(--bad)}
.dots{display:inline-flex;gap:3px}
.dots i{width:7px;height:7px;border-radius:50%;background:var(--line)}
.dots i.on{background:var(--ok)}
.avatar{width:30px;height:30px;border-radius:50%;object-fit:cover;background:var(--panel2);border:1px solid var(--line);flex:none}
.who{display:flex;align-items:center;gap:8px;padding-left:4px}
.who span.em{font-size:13px;color:var(--mut);max-width:150px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}

/* Connections popover */
.scrim{position:fixed;inset:0;z-index:60}
.pop{position:absolute;right:0;top:48px;z-index:61;width:340px;background:var(--panel);border:1px solid var(--line);border-radius:12px;padding:6px}
.pop .eyebrow{padding:10px 10px 6px;display:block}
.pop .hint{padding:0 10px 10px;font-size:13px;color:var(--mut)}
.pop-row{display:flex;align-items:center;gap:12px;padding:10px;border-radius:8px}
.pop-row + .pop-row{border-top:1px solid var(--line);border-radius:0}
.pop-row .info{flex:1;min-width:0}
.pop-row b{display:block;font-size:14px}
.pop-row small{display:block;font-size:12.5px;color:var(--mut);overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.pop-row.soon{opacity:.55}
.ico{width:34px;height:34px;border-radius:8px;display:grid;place-items:center;color:#fff;font:600 11px 'JetBrains Mono',monospace;flex:none;object-fit:cover}

/* Layout */
.wrap{max-width:960px;margin:0 auto;padding:56px 24px 96px}
.intro .eyebrow{display:block;margin-bottom:14px}
.intro h1{font-size:clamp(2rem,5vw,3.4rem);line-height:1.02;letter-spacing:-.04em;font-weight:700;max-width:640px}
.intro h1 em{font-style:normal;color:var(--acc)}
.sub{color:var(--mut);max-width:520px;margin:16px 0 30px;font-size:16px}

/* Composer */
.cmd{display:flex;align-items:center;gap:8px;background:var(--panel);border:1.5px solid var(--ink);border-radius:12px;padding:6px}
.cmd input{flex:1;min-width:0;height:48px;border:0;background:transparent;color:var(--ink);padding:0 12px;outline:none}
.cmd input::placeholder{color:var(--mut)}
.cmd:focus-within{border-color:var(--acc)}
.cmd .btn{height:48px;padding:0 24px;border-radius:8px}
.opts{display:flex;flex-wrap:wrap;gap:24px 40px;margin-top:22px}
.opt .eyebrow{display:block;margin-bottom:8px}
.seg{display:inline-flex;border:1px solid var(--line);border-radius:8px;overflow:hidden;background:var(--panel)}
.seg button{height:36px;padding:0 14px;border:0;border-right:1px solid var(--line);background:transparent;color:var(--ink);font-weight:500;font-size:14px;cursor:pointer}
.seg button:last-child{border-right:0}
.seg button:hover{background:var(--panel2)}
.seg button.on{background:var(--ink);color:var(--on-ink)}

/* Progress */
.run{border:1px solid var(--line);background:var(--panel);border-radius:12px;padding:28px}
.pct{font:600 72px/1 'JetBrains Mono',monospace;letter-spacing:-.05em}
.pct small{font-size:28px;color:var(--mut);margin-left:4px}
.track{height:4px;margin:22px 0 16px;background:var(--panel2);border-radius:2px;overflow:hidden}
.track i{display:block;height:100%;background:var(--acc);transition:width .4s ease}
.step{font-weight:600}
.note{font-size:13px;color:var(--mut);margin-top:4px}

.err{border:1px solid var(--bad);border-left-width:4px;background:var(--panel);border-radius:10px;padding:20px 22px;line-height:1.6}
.err b{color:var(--bad)}
.err small{display:block;margin-top:8px;color:var(--mut);font-size:13px}
.err .btn{margin-top:16px}

/* Results */
.sec-head{display:flex;align-items:flex-end;justify-content:space-between;gap:12px;flex-wrap:wrap;margin:48px 0 4px;padding-bottom:14px;border-bottom:1.5px solid var(--ink)}
.sec-head h2{font-size:24px;letter-spacing:-.03em;font-weight:700}
.sec-head .eyebrow{display:block;margin-bottom:4px}
.sec-head .tools{display:flex;gap:8px}
.clip{display:grid;grid-template-columns:140px minmax(0,1fr);gap:22px;padding:22px 0;border-bottom:1px solid var(--line)}
.vid{width:140px;aspect-ratio:9/16;object-fit:cover;background:#000;border-radius:8px;display:block}
.clip-main{display:flex;flex-direction:column;gap:8px;min-width:0}
.clip-main p.cap{font-size:16px;font-weight:500;line-height:1.45}
.clip-main p.why{font-size:14px;color:var(--mut)}
.chips{display:flex;flex-wrap:wrap;gap:6px}
.chip{font:500 11px 'JetBrains Mono',monospace;letter-spacing:.04em;text-transform:uppercase;color:var(--ok);border:1px solid var(--ok);padding:3px 8px;border-radius:4px}
.acts{display:flex;flex-wrap:wrap;gap:8px;margin-top:auto;padding-top:10px}
.empty{padding:48px 0;color:var(--mut);border-bottom:1px solid var(--line)}

/* Modals */
.ov{position:fixed;inset:0;background:var(--overlay);z-index:200;display:flex;align-items:center;justify-content:center;padding:16px}
.ov.login{z-index:300}
.modal{background:var(--panel);border:1px solid var(--line);border-radius:14px;padding:26px;width:100%;max-width:480px;max-height:92vh;overflow:auto;color:var(--ink)}
.modal.center{text-align:center;max-width:380px;padding:32px 26px}
.modal h3{font-size:20px;letter-spacing:-.02em;font-weight:700}
.modal .lead{font-size:14px;color:var(--mut);margin:6px 0 0}
.modal.center .lead{margin:8px 0 24px}
.modal .lead b{color:var(--ink)}
.mlabel{display:flex;justify-content:space-between;align-items:baseline;margin:20px 0 8px}
.mlabel em{font-style:normal;font-size:12px;color:var(--acc)}
.minput{width:100%;background:var(--bg);border:1px solid var(--line);border-radius:8px;color:var(--ink);padding:10px 12px;resize:vertical}
.minput:focus{outline:none;border-color:var(--acc)}
.count{font:400 11px 'JetBrains Mono',monospace;color:var(--mut);margin-top:4px;text-align:right}
.plats{display:grid;grid-template-columns:repeat(3,1fr);border:1px solid var(--line);border-radius:8px;overflow:hidden}
.plat{padding:10px 6px;border:0;border-right:1px solid var(--line);background:transparent;color:var(--ink);font-weight:600;font-size:14px;cursor:pointer;line-height:1.3}
.plat:last-child{border-right:0}
.plat small{display:block;font-weight:400;font-size:11px;color:var(--mut)}
.plat.on{background:var(--ink);color:var(--on-ink)}
.plat.on small{color:var(--on-ink);opacity:.7}
.msg{margin-top:12px;padding:10px 12px;border-left:3px solid var(--ok);background:var(--bg);font-size:13.5px}
.msg.bad{border-left-color:var(--bad)}
.msg a{color:var(--ink);font-weight:600}
.mrow{display:flex;gap:8px;margin-top:22px}
.mrow .btn{height:44px}
.mrow .btn:first-child{flex:1}.mrow .btn:last-child{flex:2}
.gbtn{display:flex;align-items:center;justify-content:center;gap:10px;width:100%;height:46px;background:#fff;border:1px solid #d5d9e3;border-radius:8px;cursor:pointer;font-weight:600;color:#1a1a1a}
.gbtn:disabled{opacity:.7;cursor:wait}

@media(max-width:720px){
  .meter .lbl,.btn .lbl,.who span.em{display:none}
  .btn.conn{width:40px;padding:0}
  .pop{position:fixed;left:12px;right:12px;top:66px;width:auto}
}
@media(max-width:560px){
  .top-in{padding:0 14px;height:54px}
  .wrap{padding:32px 16px 72px}
  .sub{font-size:15px;margin-bottom:22px}
  .cmd{flex-direction:column;align-items:stretch;padding:8px}
  .cmd input{height:46px}
  .cmd .btn{width:100%}
  .opts{gap:18px}
  .seg{display:flex;width:100%}
  .seg button{flex:1;padding:0 6px}
  .run{padding:20px}
  .pct{font-size:56px}
  .clip{grid-template-columns:104px minmax(0,1fr);gap:14px}
  .vid{width:104px}
  .clip-main p.cap{font-size:15px}
  .sec-head{margin-top:36px}
  .ov{align-items:flex-end;padding:0}
  .modal{border-radius:14px 14px 0 0;max-width:none;padding:22px 18px 28px;max-height:94vh}
  .modal.center{max-width:none}
}
`;

/* ------------------------------------------------------------------ */
/* Icons                                                               */
/* ------------------------------------------------------------------ */
const SunIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true">
    <circle cx="12" cy="12" r="4" />
    <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
  </svg>
);
const MoonIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5z" />
  </svg>
);
const LinkIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1" />
    <path d="M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1" />
  </svg>
);
const GoogleIcon = () => (
  <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true">
    <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
    <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
    <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
    <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.18 1.48-4.97 2.31-8.16 2.31-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
  </svg>
);

/* ------------------------------------------------------------------ */
/* Login popup                                                         */
/* ------------------------------------------------------------------ */
function LoginPopup({ onClose }) {
  const [loading, setLoading] = useState(false);
  async function handleGoogleLogin() {
    setLoading(true);
    try { await signInWithGoogle(); } catch (e) { console.error(e); setLoading(false); }
  }
  return (
    <div className="ov login" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal center" role="dialog" aria-modal="true" aria-label="Sign in">
        <span className="mark" style={{ width: 36, height: 36, borderRadius: 9, display: "inline-block", marginBottom: 16 }} />
        <h3>Sign in to ClipAI</h3>
        <p className="lead">
          Use your Google account to create clips. You can store up to <b>{FREE_LIMIT} clips</b> for free.
        </p>
        <button className="gbtn" onClick={handleGoogleLogin} disabled={loading}>
          <GoogleIcon />
          {loading ? "Signing in..." : "Continue with Google"}
        </button>
        <button className="btn full" style={{ marginTop: 10 }} onClick={onClose}>Not now</button>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Upload modal                                                        */
/* ------------------------------------------------------------------ */
function UploadModal({ clip, clipIndex, jobId, ytConnected, fbConnected, onClose, session, onDone, onMark, meta, onMeta }) {
  const _left = [
    ytConnected && !(clip.uploaded || []).includes("youtube") && "youtube",
    fbConnected && !(clip.uploaded || []).includes("facebook") && "facebook",
  ].filter(Boolean);
  const [platform, setPlatform] = useState(_left.length > 1 ? "all" : (_left[0] || "all"));
  const [results, setResults] = useState(null);
  const [doneP, setDoneP] = useState(clip.uploaded || []);
  const [title, setTitle] = useState(meta?.title ?? clip.title ?? clip.caption ?? "");
  const [desc, setDesc] = useState(meta?.desc ?? clip.description ?? "#shorts #viral #trending");
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [success, setSuccess] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => { if (onMeta) onMeta(clip.db_id, { title, desc }); }, [title, desc]);

  const canUp =
    platform === "all"
      ? (ytConnected && !doneP.includes("youtube")) || (fbConnected && !doneP.includes("facebook"))
      : platform === "youtube"
        ? ytConnected && !doneP.includes("youtube")
        : fbConnected && !doneP.includes("facebook");

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
          { headers: { Authorization: `Bearer ${token}` } });
      } else {
        res = await axios.post(`${API}/generate-title-from-caption`,
          { caption: clip.caption || "", reason: clip.reason || "" },
          { headers: { Authorization: `Bearer ${token}` } });
      }
      setTitle(res.data.title || "");
      setDesc(res.data.description || "");
    } catch {
      setTitle("Check out this viral moment!");
      setDesc("#shorts #viral #trending");
    } finally { setGenerating(false); }
  }

  async function handleUpload() {
    if (!title.trim()) return;
    const token = getToken();
    if (!token) return;
    setLoading(true); setError(null);
    try {
      const body = {
        b2_key: clip.b2_key, clip_db_id: clip.db_id,
        title: title.trim(), description: desc.trim(), tags: ["shorts", "viral", "trending"],
      };
      const hdr = { headers: { Authorization: `Bearer ${token}` } };
      if (platform === "all") {
        const todo = [ytConnected && "youtube", fbConnected && "facebook"].filter(Boolean).filter((p) => !doneP.includes(p));
        if (!todo.length) { setError("This clip has already been uploaded to every connected platform."); return; }
        const res = await axios.post(`${API}/upload/all`, { ...body, platforms: todo }, hdr);
        const okP = Object.entries(res.data.results).filter(([, r]) => r.success).map(([k]) => k);
        setResults((prev) => ({ ...(prev || {}), ...res.data.results }));
        setDoneP((prev) => [...new Set([...prev, ...okP])]);
        if (res.data.deleted) { if (onDone) onDone(clip.db_id); }
        else if (okP.length && onMark) onMark(clip.db_id, okP);
        if (res.data.success) {
          setSuccess("all");
        } else {
          setError("Upload failed on one or more platforms. See details below, then try again. Platforms that already succeeded will not be uploaded twice.");
        }
      } else {
        const res = await axios.post(`${API}/upload/${platform}`, body, hdr);
        setSuccess(res.data.url);
        setDoneP((prev) => [...new Set([...prev, platform])]);
        if (res.data.deleted) { if (onDone) onDone(clip.db_id); }
        else if (onMark) onMark(clip.db_id, [platform]);
      }
    } catch (e) { setError(e?.response?.data?.detail || e.message); }
    finally { setLoading(false); }
  }

  const platOptions = [
    ["all", "All", ytConnected || fbConnected],
    ["youtube", "YouTube", ytConnected && !doneP.includes("youtube")],
    ["facebook", "Facebook", fbConnected && !doneP.includes("facebook")],
  ];

  return (
    <div className="ov" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal" role="dialog" aria-modal="true" aria-label={`Upload clip ${clipIndex + 1}`}>
        <span className="eyebrow">Publish</span>
        <h3>Upload clip {String(clipIndex + 1).padStart(2, "0")}</h3>
        <p className="lead">Choose where to publish and review the details.</p>

        <div className="mlabel"><span className="eyebrow">Platform</span></div>
        <div className="plats">
          {platOptions.map(([k, n, ok]) => (
            <button key={k} className={"plat" + (platform === k ? " on" : "")} onClick={() => setPlatform(k)}>
              {n}
              {!ok && <small>{doneP.includes(k) ? "Uploaded" : "Not connected"}</small>}
            </button>
          ))}
        </div>

        <div className="mlabel">
          <span className="eyebrow">Title</span>{generating && <em>Generating with AI...</em>}
        </div>
        <input className="minput" value={title} onChange={(e) => setTitle(e.target.value)} maxLength={100} placeholder="Enter a title" />
        <div className="count">{title.length}/100</div>

        <div className="mlabel"><span className="eyebrow">Description</span></div>
        <textarea className="minput" style={{ minHeight: 84 }} value={desc} onChange={(e) => setDesc(e.target.value)} maxLength={500} placeholder="#shorts #viral" />

        <button className="btn full sm" style={{ marginTop: 10, height: 38 }} onClick={generateTitle} disabled={generating}>
          {generating ? "Generating..." : "Generate a new title with AI (optional)"}
        </button>

        {error && <div className="msg bad">{error}</div>}
        {results && Object.entries(results).map(([k, r]) => (
          <div key={k} className={"msg" + (r.success ? "" : " bad")}>
            <b>{k === "youtube" ? "YouTube" : "Facebook"}:</b>{" "}
            {r.success ? <>Uploaded. <a href={r.url} target="_blank" rel="noreferrer">Open link</a></> : r.error}
          </div>
        ))}
        {success && success !== "all" && (
          <div className="msg">Uploaded successfully. <a href={success} target="_blank" rel="noreferrer">Open link</a></div>
        )}

        {!success && (
          <div className="mrow">
            <button className="btn" onClick={onClose}>Cancel</button>
            <button className="btn pri" onClick={handleUpload} disabled={loading || !title.trim() || !canUp}>
              {loading ? "Uploading..." : platform === "all" ? "Upload to all platforms" : platform === "youtube" ? "Upload to YouTube" : "Upload to Facebook"}
            </button>
          </div>
        )}
        {success && <button className="btn full" style={{ marginTop: 16 }} onClick={onClose}>Close</button>}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* App                                                                 */
/* ------------------------------------------------------------------ */
export default function App() {
  const [url, setUrl] = useState("");
  const [language, setLanguage] = useState("hindi");
  const [length, setLength] = useState("30-60");
  const [jobId, setJobId] = useState(null);
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(false);
  const [ytConnected, setYtConnected] = useState(false);
  const [ytChannel, setYtChannel] = useState(null);
  const [uploadModal, setUploadModal] = useState(null);
  const [clipMeta, setClipMeta] = useState({});
  const [session, setSession] = useState(null);
  const [fb, setFb] = useState({ connected: false, name: null, logo: null });
  const [showLogin, setShowLogin] = useState(false);
  const [showConn, setShowConn] = useState(false);
  const [clipCount, setClipCount] = useState(0);
  const [storedClips, setStoredClips] = useState([]);
  const pollRef = useRef(null);

  const [theme, setTheme] = useState(() => {
    try {
      const saved = localStorage.getItem(THEME_KEY);
      if (saved === "light" || saved === "dark") return saved;
    } catch { }
    return window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  });

  useEffect(() => {
    try { localStorage.setItem(THEME_KEY, theme); } catch { }
    document.body.style.background = theme === "dark" ? "#141311" : "#f2efe9";
  }, [theme]);

  function getToken(s) {
    const sess = s || session;
    return sess?.access_token || null;
  }

  // Delete all stored clips on logout
  async function handleLogout() {
    const token = getToken();
    if (token) {
      try {
        await axios.delete(`${API}/my-clips/all`, { headers: { Authorization: `Bearer ${token}` } });
      } catch (e) {
        console.error("[Cleanup] Clips delete failed:", e.message);
      }
    }
    await signOut();
  }

  // YouTube connect: fetch the auth URL from the backend, then redirect
  async function connectYoutube() {
    const token = getToken();
    if (!token) { setShowLogin(true); return; }
    try {
      const res = await axios.get(`${API}/auth/youtube/url`, { headers: { Authorization: `Bearer ${token}` } });
      window.location.href = res.data.url;
    } catch (e) {
      alert("YouTube connection failed: " + (e?.response?.data?.detail || e.message));
    }
  }

  async function disconnectYoutube() {
    const token = getToken();
    try {
      await axios.delete(`${API}/auth/youtube/disconnect`, { headers: { Authorization: `Bearer ${token}` } });
      setYtConnected(false);
      setYtChannel(null);
    } catch (e) {
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
        setShowConn(false);
      }
    });
    return () => { subscription.unsubscribe(); };
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("yt_connected")) {
      supabase.auth.getSession().then(({ data: { session: s } }) => { if (s) checkYtStatus(s); });
      window.history.replaceState({}, "", "/");
    }
    if (params.get("fb_connected")) {
      supabase.auth.getSession().then(({ data: { session: s } }) => { if (s) checkFbStatus(s); });
      window.history.replaceState({}, "", "/");
    }
    if (params.get("fb_error")) {
      alert("Facebook connection failed: " + params.get("fb_error"));
      window.history.replaceState({}, "", "/");
    }
    if (params.get("yt_error")) {
      console.error("[YouTube Auth Error]", params.get("yt_error"));
      alert("YouTube connection failed: " + params.get("yt_error"));
      window.history.replaceState({}, "", "/");
    }
  }, []);

  async function checkFbStatus(s) {
    try {
      const token = getToken(s); if (!token) return;
      const res = await axios.get(`${API}/auth/facebook/status`, { headers: { Authorization: `Bearer ${token}` } });
      setFb(res.data);
    } catch { }
  }
  async function connectFacebook() {
    const token = getToken();
    if (!token) { setShowLogin(true); return; }
    try {
      const res = await axios.get(`${API}/auth/facebook/url`, { headers: { Authorization: `Bearer ${token}` } });
      window.location.href = res.data.url;
    } catch (e) { alert("Facebook connection failed: " + (e?.response?.data?.detail || e.message)); }
  }
  async function disconnectFacebook() {
    try {
      await axios.delete(`${API}/auth/facebook/disconnect`, { headers: { Authorization: `Bearer ${getToken()}` } });
      setFb({ connected: false, name: null, logo: null });
    } catch (e) { alert("Disconnect failed: " + e.message); }
  }
  async function checkYtStatus(s) {
    try {
      const token = getToken(s);
      if (!token) return;
      const res = await axios.get(`${API}/auth/youtube/status`, { headers: { Authorization: `Bearer ${token}` } });
      setYtConnected(res.data.connected);
      if (res.data.connected) fetchYtChannel(s);
    } catch { }
  }

  async function fetchYtChannel(s) {
    try {
      const token = getToken(s);
      if (!token) return;
      const res = await axios.get(`${API}/auth/youtube/channel`, { headers: { Authorization: `Bearer ${token}` } });
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
      const clips = (res.data.clips || []).map((c) => ({
        url: c.url, b2_key: c.b2_key, db_id: c.id,
        caption: c.caption, reason: c.reason, uploaded: c.uploaded_to || [],
      }));
      setStoredClips(clips);
      setJob((prev) => (prev && prev.clips)
        ? { ...prev, clips: prev.clips.filter((c) => clips.some((x) => x.db_id === c.db_id)).map((c) => ({ ...c, uploaded: (clips.find((x) => x.db_id === c.db_id) || {}).uploaded || c.uploaded || [] })) }
        : prev);
    } catch { }
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
      } catch (e) { console.error("[Poll error]", e?.message); }
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
        { headers: { Authorization: `Bearer ${token}` } });
      setJobId(res.data.job_id);
      setJob({ status: "queued", step: "Starting pipeline...", clips: [], progress: 0 });
    } catch (e) {
      setLoading(false);
      setJob({ status: "error", step: "", error: e?.response?.data?.detail || e.message });
    }
  }

  function markUploaded(id, plats) {
    const add = (c) => c.db_id === id ? { ...c, uploaded: [...new Set([...(c.uploaded || []), ...plats])] } : c;
    setJob((prev) => prev ? ({ ...prev, clips: (prev.clips || []).map(add) }) : prev);
    setStoredClips((prev) => prev.map(add));
  }
  function clipGone(id) {
    setJob((prev) => prev ? ({ ...prev, clips: (prev.clips || []).filter((c) => c.db_id !== id) }) : prev);
    setStoredClips((prev) => prev.filter((c) => c.db_id !== id));
    setClipCount((prev) => Math.max(0, prev - 1));
    setTimeout(() => fetchClipCount(session), 800);
  }
  async function handleDeleteClip(clipDbId) {
    try {
      const token = getToken();
      if (!token) return;
      await axios.delete(`${API}/clip/${clipDbId}`, { headers: { Authorization: `Bearer ${token}` } });
      setJob((prev) => prev ? ({ ...prev, clips: prev.clips.filter((c) => c.db_id !== clipDbId) }) : prev);
      setStoredClips((prev) => prev.filter((c) => c.db_id !== clipDbId));
      setClipCount((prev) => Math.max(0, prev - 1));
    } catch (e) { alert("Delete failed: " + e.message); }
  }

  function reset() {
    clearInterval(pollRef.current);
    setUrl(""); setJobId(null); setJob(null); setLoading(false);
    fetchClipCount(session);
  }

  const isDone = job?.status === "done";
  const isError = job?.status === "error";
  const isRunning = loading && !isDone && !isError;
  const progress = job?.progress ?? 0;

  const LANGS = [["hindi", "Hindi"], ["hinglish", "Hinglish"], ["bengali", "Bengali"], ["english", "English"]];
  const LENS = [["30-60", "30–60 sec"], ["60-90", "60–90 sec"], ["90-150", "90–150 sec"]];
  const avatar = session?.user?.user_metadata?.avatar_url;
  const pad = (n) => String(n).padStart(2, "0");

  const clipRow = (clip, i, fromJob) => (
    <article className="clip" key={clip.db_id || i}>
      <video className="vid" controls preload="metadata" playsInline src={clip.url} />
      <div className="clip-main">
        <span className="eyebrow">Clip {pad(i + 1)}</span>
        {clip.caption && <p className="cap">{clip.caption}</p>}
        {fromJob && clip.reason && <p className="why">{clip.reason}</p>}
        {(clip.uploaded || []).length > 0 && (
          <div className="chips">
            {clip.uploaded.map((p) => <span className="chip" key={p}>Uploaded to {p}</span>)}
          </div>
        )}
        <div className="acts">
          <button className="btn pri sm" onClick={() => setUploadModal({ clip, clipIndex: i, fromJob })}>Upload</button>
          <a className="btn sm" href={clip.url} download={`clipai_clip_${i + 1}.mp4`}>Download</a>
          <button className="btn del sm" onClick={() => handleDeleteClip(clip.db_id)}>Delete</button>
        </div>
      </div>
    </article>
  );

  return (
    <div className="cx" data-theme={theme}>
      <style>{CSS}</style>

      {showLogin && <LoginPopup onClose={() => setShowLogin(false)} />}
      {uploadModal && (
        <UploadModal
          clip={uploadModal.clip} clipIndex={uploadModal.clipIndex}
          jobId={uploadModal.fromJob ? jobId : null} ytConnected={ytConnected} fbConnected={fb.connected}
          session={session} onDone={clipGone} onMark={markUploaded} meta={clipMeta[uploadModal.clip.db_id]}
          onMeta={(id, m) => setClipMeta((p) => ({ ...p, [id]: m }))} onClose={() => setUploadModal(null)}
        />
      )}

      <header className="top">
        <div className="top-in">
          <div className="logo"><span className="mark" />ClipAI</div>

          <div className="top-r">
            {session && (
              <div className="meter" title="Saved clips">
                <span className="eyebrow lbl">Saved</span>
                <span className="mono" style={{ fontSize: 13, fontWeight: 600, color: clipCount >= FREE_LIMIT ? "var(--bad)" : "var(--ink)" }}>{clipCount}/{FREE_LIMIT}</span>
                <span className="bar"><i className={clipCount >= FREE_LIMIT ? "full" : ""} style={{ width: `${Math.min(100, (clipCount / FREE_LIMIT) * 100)}%` }} /></span>
              </div>
            )}

            <button className="btn conn" onClick={() => setShowConn((v) => !v)} aria-expanded={showConn} aria-label="Connections">
              <LinkIcon />
              <span className="lbl">Connections</span>
              <span className="dots lbl"><i className={ytConnected ? "on" : ""} /><i className={fb.connected ? "on" : ""} /></span>
            </button>

            <button
              className="btn sq"
              onClick={() => setTheme((t) => (t === "dark" ? "light" : "dark"))}
              aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
              title={theme === "dark" ? "Light mode" : "Dark mode"}
            >
              {theme === "dark" ? <SunIcon /> : <MoonIcon />}
            </button>

            {session ? (
              <div className="who">
                {avatar ? <img className="avatar" src={avatar} alt="" /> : <span className="avatar" />}
                <span className="em">{session.user.email}</span>
                <button className="btn" onClick={handleLogout}>Log out</button>
              </div>
            ) : (
              <button className="btn dark" onClick={() => setShowLogin(true)}>Log in</button>
            )}

            {showConn && (
              <>
                <div className="scrim" onClick={() => setShowConn(false)} />
                <div className="pop" role="dialog" aria-label="Connections">
                  <span className="eyebrow">Connected accounts</span>
                  {!session && <p className="hint">Log in to connect your channels.</p>}

                  <div className="pop-row">
                    {ytChannel?.logo ? <img className="ico" src={ytChannel.logo} alt="" /> : <span className="ico" style={{ background: "#c4302b" }}>YT</span>}
                    <div className="info"><b>YouTube</b><small>{ytConnected ? (ytChannel?.name || "Connected") : "Not connected"}</small></div>
                    {session && (
                      <button className={"btn sm" + (ytConnected ? "" : " pri")} onClick={() => (ytConnected ? disconnectYoutube() : connectYoutube())}>
                        {ytConnected ? "Disconnect" : "Connect"}
                      </button>
                    )}
                  </div>

                  <div className="pop-row">
                    {fb.logo ? <img className="ico" src={fb.logo} alt="" /> : <span className="ico" style={{ background: "#1877f2" }}>FB</span>}
                    <div className="info"><b>Facebook</b><small>{fb.connected ? (fb.name || "Connected") : "Not connected"}</small></div>
                    {session && (
                      <button className={"btn sm" + (fb.connected ? "" : " pri")} onClick={() => (fb.connected ? disconnectFacebook() : connectFacebook())}>
                        {fb.connected ? "Disconnect" : "Connect"}
                      </button>
                    )}
                  </div>

                  <div className="pop-row soon">
                    <span className="ico" style={{ background: "#7a4bd6" }}>IG</span>
                    <div className="info"><b>Instagram</b><small>Coming soon</small></div>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </header>

      <div className="wrap">
        <section className="intro">
          <span className="eyebrow">Video to Shorts</span>
          <h1>Long video in. <em>Shorts</em> out.</h1>
          <p className="sub">
            Paste a YouTube link. ClipAI selects the strongest moments, crops them to 9:16, adds synced captions, and publishes to your channels.
          </p>
        </section>

        {!isRunning && !isDone && !isError && (
          <section>
            <div className="cmd">
              <input
                id="u" inputMode="url" aria-label="YouTube video link"
                placeholder="Paste a YouTube link, e.g. youtube.com/watch?v=..."
                value={url} onChange={(e) => setUrl(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
              />
              <button className="btn pri" onClick={handleSubmit} disabled={!url}>Generate clips</button>
            </div>
            <div className="opts">
              <div className="opt">
                <span className="eyebrow">Caption language</span>
                <div className="seg">
                  {LANGS.map(([v, t]) => <button key={v} className={language === v ? "on" : ""} onClick={() => setLanguage(v)}>{t}</button>)}
                </div>
              </div>
              <div className="opt">
                <span className="eyebrow">Clip length</span>
                <div className="seg">
                  {LENS.map(([v, t]) => <button key={v} className={length === v ? "on" : ""} onClick={() => setLength(v)}>{t}</button>)}
                </div>
              </div>
            </div>
          </section>
        )}

        {isRunning && job && (
          <section className="run">
            <span className="eyebrow">Processing</span>
            <div className="pct" style={{ marginTop: 10 }}>{progress}<small>%</small></div>
            <div className="track"><i style={{ width: `${progress}%` }} /></div>
            <p className="step">{job.step}</p>
            <p className="note">This can take 2–5 minutes. Please keep this page open.</p>
          </section>
        )}

        {isError && (
          <section className="err">
            <b>Something went wrong.</b><br />{job?.error}
            <small>Please check that the YouTube link is valid, ffmpeg is installed, and the backend is running.</small>
            <button className="btn" onClick={reset}>Try again</button>
          </section>
        )}

        {isDone && job?.clips?.length > 0 && (
          <section>
            <div className="sec-head">
              <div><span className="eyebrow">Result</span><h2>{job.clips.length} clips ready</h2></div>
              <div className="tools"><button className="btn" onClick={reset}>New video</button></div>
            </div>
            {job.clips.map((c, i) => clipRow(c, i, true))}
          </section>
        )}

        {!isRunning && !isDone && session && (
          <section>
            <div className="sec-head">
              <div><span className="eyebrow">Library</span><h2>Saved clips ({storedClips.length}/{FREE_LIMIT})</h2></div>
              <div className="tools"><button className="btn" onClick={() => fetchClipCount(session)}>Refresh</button></div>
            </div>
            {storedClips.length > 0
              ? storedClips.map((c, i) => clipRow(c, i, false))
              : <div className="empty">No saved clips yet. Paste a link above to create your first ones.</div>}
          </section>
        )}
      </div>
    </div>
  );
}