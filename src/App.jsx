import { useEffect, useRef, useState, useCallback } from "react";

const FONT_LINK = `@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,500;0,600;0,700;1,400;1,500;1,600;1,700&family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;1,300;1,400&display=swap');`;

const CLOUDINARY_CLOUD  = "dd0bbp5rl";
const CLOUDINARY_PRESET = "kairos_strips";

async function uploadStrip(dataUrl) {
  try {
    const blob = await (await fetch(dataUrl)).blob();
    const form = new FormData();
    form.append("file", blob);
    form.append("upload_preset", CLOUDINARY_PRESET);
    const res  = await fetch(`https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD}/image/upload`, { method: "POST", body: form });
    const data = await res.json();
    return data.secure_url || null;
  } catch {
    return null;
  }
}

const C = {
  pageBg:      "#1E0608",
  pageGrad:    "#2E0910",
  card:        "#2C0A10",
  inputBg:     "#3A0F18",
  inputBorder: "#5C1A28",
  goldBright:  "#F2D9A0",
  goldMid:     "#F2E5C6",
  goldSoft:    "#C9A97A",
  goldDim:     "#7A5A3A",
  divider:     "#4A1220",
  shadow:      "rgba(8,1,1,0.5)",
  shadowDeep:  "rgba(8,1,1,0.7)",
};

const SERIF     = "'Playfair Display', Georgia, serif";
const LIGHT     = "'Cormorant Garamond', Georgia, serif";
const GOLD_GRAD = "linear-gradient(135deg,#F2D9A0 0%,#F2E5C6 50%,#E8C870 100%)";

const S = {
  page: {
    minHeight: "100vh",
    background: `linear-gradient(160deg,${C.pageBg} 0%,${C.pageGrad} 100%)`,
    display: "flex", alignItems: "center", justifyContent: "center",
    padding: "32px 20px", boxSizing: "border-box",
  },
  card: {
    background: C.card, borderRadius: 20, padding: 32,
    boxShadow: `0 8px 48px ${C.shadow}`, border: `1px solid ${C.divider}`,
  },
  label: {
    fontSize: 10, color: C.goldSoft, letterSpacing: "2.5px",
    textTransform: "uppercase", fontFamily: SERIF, display: "block", marginBottom: 8,
  },
  input: {
    width: "100%", background: C.inputBg, border: `1.5px solid ${C.inputBorder}`,
    borderRadius: 10, padding: "13px 16px", fontSize: 15, color: C.goldBright,
    fontFamily: SERIF, outline: "none", boxSizing: "border-box",
  },
  btnPrimary: {
    width: "100%", background: GOLD_GRAD, color: "#1E0608",
    border: "none", borderRadius: 12, padding: "14px 0", fontSize: 12,
    fontFamily: SERIF, cursor: "pointer", letterSpacing: "2px",
    textTransform: "uppercase", fontWeight: 700, boxShadow: `0 4px 20px ${C.shadowDeep}`,
  },
  btnSecondary: {
    width: "100%", background: "transparent", color: C.goldBright,
    border: `1.5px solid ${C.inputBorder}`, borderRadius: 12, padding: "13px 0",
    fontSize: 12, fontFamily: SERIF, cursor: "pointer",
    letterSpacing: "2px", textTransform: "uppercase",
  },
};

const FILTERS = [
  { id: "none",    label: "None",    css: "none" },
  { id: "vintage", label: "Vintage", css: "sepia(0.55) contrast(1.08) brightness(0.96) saturate(0.75)" },
  { id: "bw",      label: "B & W",   css: "grayscale(1) contrast(1.12)" },
  { id: "warm",    label: "Warm",    css: "sepia(0.28) saturate(1.35) brightness(1.04)" },
  { id: "cool",    label: "Cool",    css: "hue-rotate(18deg) saturate(0.88) brightness(1.05)" },
  { id: "glow",    label: "Glow",    css: "brightness(1.08) contrast(0.92) saturate(1.15) blur(0.3px)" },
];

const FRAMES = [
  { id: "classic",  label: "Classic",  bg: "#ffffff", border: "#E5DDD0", text: "#888" },
  { id: "beige",    label: "Vintage",  bg: "#F5EDE0", border: "#C9A97A", text: "#7A5C3A" },
  { id: "polaroid", label: "Polaroid", bg: "#FAFAF8", border: "#DDD",    text: "#555", bottomPad: true },
  { id: "minimal",  label: "Minimal",  bg: "#ffffff", border: "#333",    text: "#333" },
  { id: "gradient", label: "Gradient", isGradient: true, border: "none", text: "#75162D" },
];

const TIMER_OPTIONS = [3, 5, 10];

const PAGE_BG = {
  minHeight: "100vh",
  background: `linear-gradient(160deg,${C.pageBg} 0%,${C.pageGrad} 100%)`,
  padding: "24px 24px 48px", boxSizing: "border-box",
};

const GLOBAL_CSS = `
  ${FONT_LINK}
  *,*::before,*::after{box-sizing:border-box;}
  body{margin:0;background:#1E0608;}
  input::placeholder{color:${C.goldDim};}
  button{transition:opacity 0.2s,transform 0.15s;}
  button:active{transform:scale(0.97);}
`;

// ── Shared UI ─────────────────────────────────────────────────────────────────
function Logo({ size = 26 }) {
  return (
    <span style={{
      fontFamily: SERIF, fontSize: size, fontWeight: 700, fontStyle: "italic",
      letterSpacing: "-0.5px", background: GOLD_GRAD,
      WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text",
    }}>kairos</span>
  );
}

function Avatar({ name, size = 32 }) {
  return (
    <div style={{
      width: size, height: size, borderRadius: "50%", background: GOLD_GRAD,
      display: "flex", alignItems: "center", justifyContent: "center",
      fontSize: Math.round(size * 0.38), fontWeight: 700, color: "#1E0608", fontFamily: SERIF,
    }}>
      {(name?.[0] || "?").toUpperCase()}
    </div>
  );
}

function QRBox({ url, size = 160 }) {
  if (!url) return null;
  const qr = `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodeURIComponent(url)}&bgcolor=2C0A10&color=F2D9A0&margin=8`;
  return (
    <img src={qr} alt="QR" width={size} height={size}
      style={{ borderRadius: 10, boxShadow: `0 2px 14px ${C.shadow}`, display: "block" }} />
  );
}

function Pill({ label, active, onClick }) {
  return (
    <button onClick={onClick} style={{
      flex: 1, padding: "8px 4px", borderRadius: 8, fontSize: 11,
      fontFamily: SERIF, cursor: "pointer", letterSpacing: "1px", textTransform: "uppercase",
      border: active ? "none" : `1.5px solid ${C.inputBorder}`,
      background: active ? GOLD_GRAD : C.inputBg,
      color: active ? "#1E0608" : C.goldSoft, fontWeight: active ? 700 : 400,
    }}>{label}</button>
  );
}

function SideBtn({ label, active, onClick }) {
  return (
    <button onClick={onClick} style={{
      width: "100%", padding: "9px 12px", borderRadius: 9, fontSize: 11,
      fontFamily: SERIF, cursor: "pointer", letterSpacing: "1px", textTransform: "uppercase",
      border: active ? "none" : `1.5px solid ${C.inputBorder}`,
      background: active ? GOLD_GRAD : C.inputBg,
      color: active ? "#1E0608" : C.goldSoft, fontWeight: active ? 700 : 400,
      textAlign: "left",
    }}>{label}</button>
  );
}

function Topbar({ name }) {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 28 }}>
      <Logo size={24} />
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <span style={{ fontFamily: LIGHT, fontStyle: "italic", fontSize: 13, color: C.goldSoft }}>{name}</span>
        <Avatar name={name} size={32} />
      </div>
    </div>
  );
}

// ── Landing ───────────────────────────────────────────────────────────────────
function LandingPage({ onEnter }) {
  const [name, setName] = useState("");
  const ok = name.trim().length > 0;
  return (
    <div style={S.page}>
      <div style={{ width: "100%", maxWidth: 400 }}>
        <div style={{ textAlign: "center", marginBottom: 44 }}>
          <span style={{
            fontFamily: SERIF, fontSize: 68, fontWeight: 700, fontStyle: "italic",
            letterSpacing: "-2px", lineHeight: 1, background: GOLD_GRAD,
            WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text",
          }}>kairos</span>
          <div style={{ width: 40, height: 1.5, background: C.goldSoft, margin: "16px auto 0", opacity: 0.5 }} />
        </div>
        <div style={S.card}>
          <label style={S.label}>Your Name</label>
          <input
            value={name}
            onChange={e => setName(e.target.value)}
            onKeyDown={e => e.key === "Enter" && ok && onEnter(name.trim())}
            placeholder=""
            style={{ ...S.input, marginBottom: 24 }}
            autoFocus
          />
          <button
            onClick={() => ok && onEnter(name.trim())}
            disabled={!ok}
            style={{ ...S.btnPrimary, opacity: ok ? 1 : 0.35, cursor: ok ? "pointer" : "not-allowed" }}
          >
            Open the Booth
          </button>
        </div>
      </div>
      <style>{GLOBAL_CSS}</style>
    </div>
  );
}

// ── Capture ───────────────────────────────────────────────────────────────────
function CaptureScreen({ name, onDone }) {
  const videoRef  = useRef(null);
  const canvasRef = useRef(null);

  const [photos, setPhotos]                 = useState([]);
  const [countdown, setCountdown]           = useState(null);
  const [isCapturing, setIsCapturing]       = useState(false);
  const [selectedFilter, setSelectedFilter] = useState("none");
  const [selectedFrame, setSelectedFrame]   = useState("classic");
  const [timerDuration, setTimerDuration]   = useState(3);
  const [flash, setFlash]                   = useState(false);

  const filterCss  = FILTERS.find(f => f.id === selectedFilter)?.css || "none";
  const frame      = FRAMES.find(f => f.id === selectedFrame) || FRAMES[0];
  const frameBoxBg = frame.isGradient ? "linear-gradient(160deg,#F2E5C6,#F2D9A0)" : (frame.bg || "#fff");

  useEffect(() => {
    navigator.mediaDevices.getUserMedia({ video: true })
      .then(s => { if (videoRef.current) videoRef.current.srcObject = s; })
      .catch(console.error);
  }, []);

  const runCountdown = useCallback(() => new Promise(resolve => {
    let t = timerDuration;
    setCountdown(t);
    const iv = setInterval(() => {
      t--;
      if (t === 0) { clearInterval(iv); setCountdown(null); resolve(); }
      else setCountdown(t);
    }, 1000);
  }), [timerDuration]);

  const snap = useCallback(() => {
    const canvas = canvasRef.current, video = videoRef.current;
    if (!video || !video.videoWidth) return null;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext("2d");
    if (selectedFilter !== "none") ctx.filter = filterCss;
    ctx.drawImage(video, 0, 0);
    ctx.filter = "none";
    setFlash(true);
    setTimeout(() => setFlash(false), 260);
    return canvas.toDataURL("image/jpeg", 0.92);
  }, [selectedFilter, filterCss]);

  const start = async () => {
    setPhotos([]);
    setIsCapturing(true);
    const captured = [];
    for (let i = 0; i < 4; i++) {
      await runCountdown();
      await new Promise(r => setTimeout(r, 150));
      const img = snap();
      if (img) { captured.push(img); setPhotos(prev => [...prev, img]); }
    }
    setIsCapturing(false);
    onDone(captured, filterCss, frame, frameBoxBg);
  };

  return (
    <div style={PAGE_BG}>
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        <Topbar name={name} />
        <div style={{ display: "flex", gap: 20, alignItems: "flex-start", flexWrap: "wrap" }}>

          {/* Camera */}
          <div style={{ flex: "1 1 460px", minWidth: 300, ...S.card }}>
            <div style={{
              position: "relative", borderRadius: 14, overflow: "hidden",
              background: "#080202", marginBottom: 18,
              width: "100%", height: "min(420px, 56vw)",
            }}>
              <video ref={videoRef} autoPlay playsInline
                style={{ width: "100%", height: "100%", objectFit: "cover", display: "block", filter: filterCss }} />

              {flash && (
                <div style={{ position: "absolute", inset: 0, background: "rgba(242,217,160,0.2)", pointerEvents: "none" }} />
              )}

              {countdown !== null && (
                <div style={{
                  position: "absolute", bottom: 14, right: 14,
                  width: 50, height: 50, borderRadius: "50%",
                  background: "rgba(44,10,16,0.85)", backdropFilter: "blur(8px)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  border: `1px solid ${C.inputBorder}`,
                }}>
                  <span style={{
                    fontFamily: SERIF, fontSize: 20, fontWeight: 700, lineHeight: 1,
                    background: GOLD_GRAD, WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent", backgroundClip: "text",
                  }}>{countdown}</span>
                </div>
              )}

              {isCapturing && (
                <div style={{
                  position: "absolute", top: 12, left: 12,
                  background: "rgba(44,10,16,0.85)", backdropFilter: "blur(6px)",
                  padding: "5px 13px", borderRadius: 999,
                  fontSize: 11, fontFamily: SERIF, letterSpacing: "2px",
                  textTransform: "uppercase", color: C.goldBright,
                  border: `1px solid ${C.inputBorder}`,
                }}>
                  {photos.length + 1} / 4
                </div>
              )}

              {[["top:10px","left:10px","T","L"],["top:10px","right:10px","T","R"],
                ["bottom:10px","left:10px","B","L"],["bottom:10px","right:10px","B","R"]].map(([a,b,v,h],i) => {
                const [ak,av] = a.split(":");
                const [bk,bv] = b.split(":");
                return (
                  <div key={i} style={{
                    position: "absolute", [ak]: av, [bk]: bv, width: 16, height: 16,
                    borderTop:    v === "T" ? "2px solid #C9A97A" : "none",
                    borderBottom: v === "B" ? "2px solid #C9A97A" : "none",
                    borderLeft:   h === "L" ? "2px solid #C9A97A" : "none",
                    borderRight:  h === "R" ? "2px solid #C9A97A" : "none",
                  }} />
                );
              })}
            </div>

            <button onClick={start} disabled={isCapturing} style={{
              ...S.btnPrimary, fontSize: 12, padding: "16px 0",
              opacity: isCapturing ? 0.45 : 1,
              cursor: isCapturing ? "not-allowed" : "pointer",
            }}>
              {isCapturing ? `Capturing  ${photos.length} / 4` : "Start Photobooth"}
            </button>
          </div>

          {/* Controls */}
          <div style={{ flex: "0 0 210px", minWidth: 190, display: "flex", flexDirection: "column", gap: 14 }}>
            <div style={S.card}>
              <p style={S.label}>Timer</p>
              <div style={{ display: "flex", gap: 7 }}>
                {TIMER_OPTIONS.map(t => (
                  <Pill key={t} label={`${t}s`} active={timerDuration === t} onClick={() => setTimerDuration(t)} />
                ))}
              </div>
            </div>
            <div style={S.card}>
              <p style={S.label}>Filter</p>
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {FILTERS.map(f => (
                  <SideBtn key={f.id} label={f.label} active={selectedFilter === f.id} onClick={() => setSelectedFilter(f.id)} />
                ))}
              </div>
            </div>
            <div style={S.card}>
              <p style={S.label}>Frame</p>
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {FRAMES.map(fr => (
                  <SideBtn key={fr.id} label={fr.label} active={selectedFrame === fr.id} onClick={() => setSelectedFrame(fr.id)} />
                ))}
              </div>
            </div>
            {photos.length > 0 && (
              <div style={S.card}>
                <p style={S.label}>Preview</p>
                <div style={{
                  background: frameBoxBg, borderRadius: 10, padding: 7,
                  border: frame.border && frame.border !== "none" ? `1.5px solid ${frame.border}` : "none",
                  display: "flex", flexDirection: "column", gap: 5,
                }}>
                  {photos.map((p, i) => (
                    <img key={i} src={p} alt="" style={{ width: "100%", borderRadius: 5, display: "block", filter: filterCss }} />
                  ))}
                  {Array.from({ length: 4 - photos.length }).map((_, i) => (
                    <div key={i} style={{ width: "100%", aspectRatio: "4/3", background: C.inputBg, borderRadius: 5, opacity: 0.5 }} />
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      <canvas ref={canvasRef} style={{ display: "none" }} />
      <style>{GLOBAL_CSS}</style>
    </div>
  );
}

// ── Result ────────────────────────────────────────────────────────────────────
function ResultScreen({ name, photos, filterCss, frame, frameBoxBg, onRetake }) {
  const stripCanvasRef          = useRef(null);
  const [stripDataUrl, setStripDataUrl] = useState(null);
  const [shareUrl, setShareUrl]         = useState(null);
  const [uploading, setUploading]       = useState(false);

  const today = new Date().toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });

  // Build strip canvas then upload to Cloudinary
  useEffect(() => {
    const sc  = stripCanvasRef.current;
    const iw  = 480, ih = 320, pad = 20, footer = 56;
    sc.width  = iw + pad * 2;
    sc.height = pad + photos.length * (ih + pad) + footer;
    const ctx = sc.getContext("2d");

    if (frame.isGradient) {
      const g = ctx.createLinearGradient(0, 0, sc.width, sc.height);
      g.addColorStop(0, "#F2E5C6");
      g.addColorStop(1, "#F2D9A0");
      ctx.fillStyle = g;
    } else {
      ctx.fillStyle = frame.bg || "#fff";
    }
    ctx.fillRect(0, 0, sc.width, sc.height);

    if (frame.border && frame.border !== "none") {
      ctx.strokeStyle = frame.border;
      ctx.lineWidth   = 3;
      ctx.strokeRect(0, 0, sc.width, sc.height);
    }

    Promise.all(photos.map((src, i) => new Promise(res => {
      const img = new Image();
      img.onload = () => {
        if (filterCss !== "none") ctx.filter = filterCss;
        const y = pad + i * (ih + pad);
        ctx.drawImage(img, pad, y, iw, ih);
        ctx.filter = "none";
        if (frame.border && frame.border !== "none") {
          ctx.strokeStyle = frame.border;
          ctx.lineWidth   = 1;
          ctx.strokeRect(pad, y, iw, ih);
        }
        res();
      };
      img.src = src;
    }))).then(() => {
      ctx.fillStyle = frame.text || "#555";
      ctx.font      = "italic 15px 'Playfair Display', Georgia, serif";
      ctx.textAlign = "center";
      ctx.fillText(`kairos · ${name}`, sc.width / 2, sc.height - footer + 22);
      ctx.font         = "12px 'Cormorant Garamond', Georgia, serif";
      ctx.globalAlpha  = 0.65;
      ctx.fillText(today, sc.width / 2, sc.height - footer + 42);
      ctx.globalAlpha  = 1;

      const dataUrl = sc.toDataURL("image/jpeg", 0.95);
      setStripDataUrl(dataUrl);

      // Upload to Cloudinary
      setUploading(true);
      uploadStrip(dataUrl).then(url => {
        setShareUrl(url);
        setUploading(false);
      });
    });
  }, []); // eslint-disable-line

  const download = () => {
    if (!stripDataUrl) return;
    const a = document.createElement("a");
    a.href     = stripDataUrl;
    a.download = `kairos-${Date.now()}.jpg`;
    a.click();
  };

  const shareWhatsApp = () => {
    const link = shareUrl || "https://kairos-eta-vert.vercel.app";
    window.open(`https://wa.me/?text=${encodeURIComponent("📸 My kairos strip!\n" + link)}`, "_blank");
  };

  return (
    <div style={PAGE_BG}>
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        <Topbar name={name} />

        <div style={{ display: "flex", gap: 24, alignItems: "flex-start", flexWrap: "wrap" }}>

          {/* Strip */}
          <div style={{ flex: "0 0 340px", minWidth: 280, ...S.card }}>
            <p style={S.label}>Your Strip</p>
            <div style={{
              background: frameBoxBg,
              border: frame.border && frame.border !== "none" ? `1.5px solid ${frame.border}` : "none",
              borderRadius: 12, padding: 10,
              display: "flex", flexDirection: "column", gap: 7, marginBottom: 16,
            }}>
              {photos.map((p, i) => (
                <img key={i} src={p} alt="" style={{ width: "100%", borderRadius: 7, display: "block", filter: filterCss }} />
              ))}
              <div style={{ textAlign: "center", paddingTop: 4 }}>
                <p style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 11, color: frame.text, margin: 0 }}>
                  kairos · {name}
                </p>
                <p style={{ fontFamily: LIGHT, fontSize: 10, color: frame.text, margin: "2px 0 0", opacity: 0.65 }}>
                  {today}
                </p>
              </div>
            </div>

            <div style={{ display: "flex", gap: 10, marginBottom: 10 }}>
              <button onClick={download} disabled={!stripDataUrl} style={{
                ...S.btnPrimary, flex: 1, padding: "13px 0",
                opacity: stripDataUrl ? 1 : 0.5, cursor: stripDataUrl ? "pointer" : "not-allowed",
              }}>
                {stripDataUrl ? "Download" : "Building…"}
              </button>
              <button onClick={onRetake} style={{ ...S.btnSecondary, flex: 1, padding: "12px 0" }}>
                Retake
              </button>
            </div>

            <button onClick={shareWhatsApp} style={{
              width: "100%", background: "#25D366", color: "#fff", border: "none",
              borderRadius: 12, padding: "13px 0", fontSize: 12, fontFamily: SERIF,
              cursor: "pointer", letterSpacing: "1.5px", textTransform: "uppercase", fontWeight: 600,
              display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
              boxShadow: "0 4px 16px rgba(37,211,102,0.22)",
            }}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="white">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
              </svg>
              Share on WhatsApp
            </button>
          </div>

          {/* QR + Memory */}
          <div style={{ flex: "1 1 300px", minWidth: 260, display: "flex", flexDirection: "column", gap: 16 }}>

            <div style={S.card}>
              <p style={S.label}>Share Your Strip</p>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 16 }}>

                {shareUrl ? (
                  <QRBox url={shareUrl} size={160} />
                ) : (
                  <div style={{
                    width: 160, height: 160, borderRadius: 10,
                    background: C.inputBg, border: `1px solid ${C.inputBorder}`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                  }}>
                    <p style={{ color: C.goldSoft, fontFamily: LIGHT, fontStyle: "italic", fontSize: 12, textAlign: "center", margin: 0, padding: "0 12px" }}>
                      {uploading ? "Uploading strip…" : "Preparing…"}
                    </p>
                  </div>
                )}

                <p style={{ fontSize: 12, color: C.goldSoft, fontFamily: LIGHT, fontStyle: "italic", textAlign: "center", margin: 0 }}>
                  {shareUrl ? "Scan to download your strip" : uploading ? "Generating your link…" : ""}
                </p>

                <div style={{
                  background: C.inputBg, border: `1.5px dashed ${C.inputBorder}`,
                  borderRadius: 8, padding: "10px 14px", width: "100%", boxSizing: "border-box", textAlign: "center",
                }}>
                  <p style={{ fontSize: 10, color: C.goldDim, wordBreak: "break-all", fontFamily: LIGHT, margin: 0 }}>
                    {shareUrl || (uploading ? "Uploading…" : "—")}
                  </p>
                </div>
              </div>
            </div>

            <div style={S.card}>
              <p style={S.label}>Memory Card</p>
              <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                <Avatar name={name} size={44} />
                <div>
                  <p style={{
                    fontFamily: SERIF, fontSize: 15, fontWeight: 600, fontStyle: "italic", margin: "0 0 4px",
                    background: GOLD_GRAD, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text",
                  }}>{name}</p>
                  <p style={{ fontSize: 12, color: C.goldSoft, fontFamily: LIGHT, fontStyle: "italic", margin: "0 0 3px" }}>
                    {today}
                  </p>
                  <p style={{ fontSize: 11, color: C.goldDim, fontFamily: LIGHT, margin: 0, letterSpacing: "1px" }}>
                    kairos photobooth
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <canvas ref={stripCanvasRef} style={{ display: "none" }} />
      <style>{GLOBAL_CSS}</style>
    </div>
  );
}

// ── Root ──────────────────────────────────────────────────────────────────────
export default function App() {
  const [name, setName]     = useState(null);
  const [result, setResult] = useState(null);

  if (!name) {
    return <LandingPage onEnter={setName} />;
  }

  if (result) {
    return (
      <ResultScreen
        name={name}
        photos={result.photos}
        filterCss={result.filterCss}
        frame={result.frame}
        frameBoxBg={result.frameBoxBg}
        onRetake={() => setResult(null)}
      />
    );
  }

  return (
    <CaptureScreen
      name={name}
      onDone={(photos, filterCss, frame, frameBoxBg) => {
        setResult({ photos, filterCss, frame, frameBoxBg });
      }}
    />
  );
}