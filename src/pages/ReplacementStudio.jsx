import React, { useCallback, useEffect, useRef, useState } from "react";
import ProcessingPanel from "../components/ProcessingPanel";
const BASE = (process.env.REACT_APP_API_BASE || "/api").replace(/\/$/, "");
export default function ReplacementStudio() {
  const [video, setVideo] = useState(null),
    [image, setImage] = useState(null),
    [audio, setAudio] = useState(null),
    [faceQuality, setFaceQuality] = useState("original"),
    [originalVideo, setOriginalVideo] = useState(null),
    [upload, setUpload] = useState(null),
    [box, setBox] = useState(null),
    [mode, setMode] = useState("object");
  const [health, setHealth] = useState(null),
    [job, setJob] = useState(null),
    [error, setError] = useState(""),
    [busy, setBusy] = useState(false),
    [key, setKey] = useState(""),
    [assets, setAssets] = useState({}),
    [result, setResult] = useState(null);
  const preview = useRef(null),
    anchor = useRef(null),
    canvas = useRef(null),
    revision = useRef(0);
  const active = busy || (job && ["queued", "processing"].includes(job.status));
  const api = useCallback(
    async (url, options = {}) => {
      let res;
      try {res = await fetch(url, {
        ...options,
        headers: {
          ...(options.body instanceof FormData
            ? {}
            : { "Content-Type": "application/json" }),
          ...(key ? { "x-api-key": key } : {}),
          ...options.headers,
        },
      });} catch {throw new Error("Cannot reach the backend. Keep the backend terminal running on port 5000, then try again.");}
      if (!res.ok) {
        const body = await res
          .json()
          .catch(() => ({ error: `Server returned ${res.status}` }));
        throw new Error(body.error);
      }
      return res;
    },
    [key],
  );
  useEffect(() => {
    let live = true;
    const check = () =>
      fetch(`${BASE}/health`)
        .then((r) => r.json())
        .then((h) => {
          if (live) setHealth(h);
        })
        .catch(() => {
          if (live) setHealth({ ready: false });
        });
    check();
    const timer = setInterval(check, 5000);
    return () => {
      live = false;
      clearInterval(timer);
    };
  }, []);
  useEffect(() => {
    if (!video) {setOriginalVideo(null); return;}
    const url = URL.createObjectURL(video);
    setOriginalVideo(url);
    return () => URL.revokeObjectURL(url);
  }, [video]);
  const jobId = job?.id,
    jobStatus = job?.status;
  useEffect(() => {
    if (!jobId || !["queued", "processing"].includes(jobStatus)) return;
    let live = true, timer;
    const poll = async () => {
      try {
        const res = await api(`${BASE}/jobs/${jobId}`);
        const update = await res.json();
        if (live) {setJob(update); setError("");}
      } catch (e) {if (live) setError(e.message);}
      if (live) timer = setTimeout(poll, 1500);
    };
    timer = setTimeout(poll, 500);
    return () => {live = false; clearTimeout(timer);};
  }, [jobId, jobStatus, api]);
  useEffect(
    () => () => {
      Object.values(assets).forEach(URL.revokeObjectURL);
    },
    [assets],
  );
  useEffect(
    () => () => {
      if (result) URL.revokeObjectURL(result);
    },
    [result],
  );
  useEffect(() => {
    const c = canvas.current,
      img = preview.current;
    if (!c || !img) return;
    const draw = () => {
      c.width = img.naturalWidth;
      c.height = img.naturalHeight;
      const ctx = c.getContext("2d");
      ctx.clearRect(0, 0, c.width, c.height);
      if (box) {
        ctx.fillStyle = "rgba(70,222,177,.18)";
        ctx.strokeStyle = "#46deb1";
        ctx.lineWidth = Math.max(2, c.width / 300);
        ctx.fillRect(
          box.x * c.width,
          box.y * c.height,
          box.w * c.width,
          box.h * c.height,
        );
        ctx.strokeRect(
          box.x * c.width,
          box.y * c.height,
          box.w * c.width,
          box.h * c.height,
        );
      }
    };
    draw();
    img.addEventListener("load", draw);
    return () => img.removeEventListener("load", draw);
  }, [box, assets]);
  function reset() {
    revision.current++;
    setUpload(null);
    setAssets({});
    setBox(null);
    setJob(null);
    setResult(null);
    setError("");
  }
  function choose(file, type) {
    reset();
    if (type === "video") setVideo(file);
    else if (type === "audio") setAudio(file);
    else setImage(file);
  }
  function point(e) {
    const r = canvas.current.getBoundingClientRect();
    return {
      x: Math.max(0, Math.min(1, (e.clientX - r.left) / r.width)),
      y: Math.max(0, Math.min(1, (e.clientY - r.top) / r.height)),
    };
  }
  function select(e) {
    if (active) return;
    anchor.current = point(e);
    e.currentTarget.setPointerCapture(e.pointerId);
    setBox(null);
  }
  function drag(e) {
    if (!anchor.current) return;
    const p = point(e),
      a = anchor.current;
    setBox({
      x: Math.min(p.x, a.x),
      y: Math.min(p.y, a.y),
      w: Math.abs(p.x - a.x),
      h: Math.abs(p.y - a.y),
    });
  }
  async function prepare() {
    setError("");
    setBusy(true);
    const version = revision.current;
    let urls = [];
    try {
      const fd = new FormData();
      fd.append("video", video);
      fd.append("image", image);
      if (audio) fd.append("audio", audio);
      const res = await api(`${BASE}/uploads`, { method: "POST", body: fd });
      const data = await res.json();
      const origin = BASE.slice(0, -4); // BASE must end in /api; supports an absolute deployment URL.
      const p = await api(origin + data.preview),
        s = await api(origin + data.source);
      urls = [
        URL.createObjectURL(await p.blob()),
        URL.createObjectURL(await s.blob()),
      ];
      if (revision.current === version) {
        setAssets({ preview: urls[0], source: urls[1] });
        setUpload(data);
        setBox(null);
        setJob(null);
        setResult(null);
      } else urls.forEach(URL.revokeObjectURL);
    } catch (e) {
      urls.forEach(URL.revokeObjectURL);
      setError(e.message);
    } finally {
      setBusy(false);
    }
  }
  async function process() {
    setError("");
    setBusy(true);
    setResult(null);
    try {
      const res = await api(`${BASE}/jobs`, {
        method: "POST",
        body: JSON.stringify({ uploadId: upload.id, mode, selection: box, faceQuality }),
      });
      setJob(await res.json());
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  }
  async function viewResult() {
    setBusy(true);
    setError("");
    try {
      const res = await api(`${BASE}/jobs/${job.id}/download`);
      setResult(URL.createObjectURL(await res.blob()));
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  }
  async function cancel() {
    setError(""); setBusy(true);
    try {const res = await api(`${BASE}/jobs/${job.id}/cancel`, {method: "POST"}); setJob(await res.json());}
    catch (e) {setError(e.message);} finally {setBusy(false);}
  }
  const validBox = box && box.w >= 0.02 && box.h >= 0.02 && box.x >= 0 && box.y >= 0 && box.x + box.w <= 1.000001 && box.y + box.h <= 1.000001;
  const modeReady = mode === "face" ? health?.capabilities?.face : mode === "face_lipsync" ? health?.capabilities?.face_lipsync : true;
  const keyMissing = health?.authRequired && !key.trim();
  const lipInputInvalid = mode === "face_lipsync" && upload && (!upload.audio || upload.duration > (health?.limits?.lipSyncSeconds || 15) || upload.width * upload.height > (health?.limits?.lipSyncPixels || 921600) || upload.fps > 30.01);
  return (
    <div className="studio">
      <header>
        <a className="brand" href="/">
          V<span>✦</span> VividFlow
        </a>
        <span className={`connection ${health?.ready ? "online" : ""}`}>
          {health?.ready ? "Engine connected" : "Engine unavailable"}
        </span>
      </header>
      <main>
        <div className="intro">
          <span className="eyebrow">VIDEO REPLACEMENT STUDIO</span>
          <h1>
            A new look.
            <br />
            <em>The same scene.</em>
          </h1>
          <p>
            Upload your video and a replacement picture. Select one target,
            choose a mode, and render your edit.
          </p>
        </div>
        <div className="layout">
          <section className="panel inputs">
            {!health?.ready && <div className="readiness" role="status"><b>Waiting for the Python engine</b><p>{health?.engineError || "Start the backend in its own terminal: corepack yarn start. Check that FFmpeg and Python dependencies are installed."}</p></div>}
            <h2>
              <span>01</span> Your media
            </h2>
            <label className="file">
              Original video{" "}
              <small>
                MP4, MOV, WebM · up to 120 seconds / 1080p by default
              </small>
              <input
                disabled={active}
                type="file"
                accept="video/mp4,video/quicktime,video/webm"
                onChange={(e) => choose(e.target.files?.[0] || null, "video")}
              />
              <b>{video?.name || "Choose video"}</b>
            </label>
            <label className="file">
              Replacement picture{" "}
              <small>
                PNG or JPEG · transparent PNG works best for objects
              </small>
              <input
                disabled={active}
                type="file"
                accept="image/png,image/jpeg"
                onChange={(e) => choose(e.target.files?.[0] || null, "image")}
              />
              <b>{image?.name || "Choose picture"}</b>
            </label>
            {mode === "face_lipsync" && <label className="file">Speech audio <small>WAV, MP3 or M4A · up to 50 MB · spoken voice works best</small>
              <input disabled={active} type="file" accept=".wav,.mp3,.m4a,audio/wav,audio/mpeg,audio/mp4" onChange={e => choose(e.target.files?.[0] || null, "audio")} />
              <b>{audio?.name || "Choose speech audio"}</b>
            </label>}
            <details open={Boolean(health?.authRequired)}>
              <summary>Server access key{health?.authRequired ? " · required by this server" : " · optional"}</summary>
              <label>
                API key{" "}
                <input
                  type="password"
                  value={key}
                  onChange={(e) => setKey(e.target.value)}
                  autoComplete="off"
                  placeholder={health?.authRequired ? "Enter API_KEY from backend/.env" : "Local server does not require a key"}
                  disabled={active}
                />
              </label>
            </details>
            <button
              className="primary"
              disabled={!video || !image || active || !health?.ready || keyMissing || (mode === "face_lipsync" && !audio)}
              onClick={prepare}
            >
              {busy && !upload
                ? "Preparing media…"
                : "Upload & prepare selection"}
            </button>
            {keyMissing && <p className="warning">This backend requires its access key. Use the API_KEY value from backend/.env.</p>}
            {assets.source && (
              <div className="source">
                <img src={assets.source} alt="Replacement source" />
                <div>
                  <b>Replacement source</b>
                  <small>
                    {upload?.hasAlpha
                      ? "Transparent image"
                      : "Opaque image: background is included"}
                  </small>
                </div>
              </div>
            )}
            <h2 className="mode-title">
              <span>02</span> Replacement mode
            </h2>
            {[
              [
                "object",
                "Object image replacement",
                "Tracks the box and composites your picture.",
              ],
              [
                "person",
                "Person image replacement",
                "Tracks a person-sized box; inserts the picture as an image.",
              ],
              [
                "face",
                "AI face swap",
                "Replaces one selected facial identity; body and clothing stay the same.",
              ],
              [
                "face_lipsync",
                "AI face swap + audio lip sync",
                "Swaps the selected face, then generates mouth movements from your uploaded speech. CPU processing is slower.",
              ],
            ].map(([value, title, description]) => (
              <label
                className={`mode ${mode === value ? "selected" : ""}`}
                key={value}
              >
                <input
                  type="radio"
                  name="mode"
                  checked={mode === value}
                  onChange={() => {
                    setMode(value);
                    setJob(null);
                    setResult(null);
                  }}
                  disabled={
                    active || (["face", "face_lipsync"].includes(value) && !health?.capabilities?.[value])
                  }
                />
                <div>
                  <b>{title}</b>
                  <small>
                    {description}
                    {value === "face" && !health?.capabilities?.face ? ` ${health?.capabilities?.faceError || "Face models not configured."}` : ""}
                    {value === "face_lipsync" && !health?.capabilities?.face_lipsync ? ` ${health?.capabilities?.lipSyncError || "Install optional lip-sync dependencies and configure its model. See SETUP-WINDOWS.md."}` : ""}
                  </small>
                </div>
              </label>
            ))}
            {["face", "face_lipsync"].includes(mode) && <label className="blend-option">Face blending profile
              <select value={faceQuality} disabled={active} onChange={e => setFaceQuality(e.target.value)}>
                <option value="original">Original model blend · preserves existing behaviour</option>
                <option value="natural">Natural blend · subtle colour correction</option>
              </select><small>Both profiles use stricter identity and movement checks. Natural blending is optional; compare results on your clip.</small>
            </label>}
            {mode === "face_lipsync" && <div className="readiness"><b>CPU lip-sync checklist</b><p>Start with 5–10 seconds at 480p. Default limit: {health?.limits?.lipSyncSeconds || 15}s, 720p, 30 FPS. Keep the selected face clear and visible.</p><p>Your speech replaces the original audio. Output ends with whichever is shorter: video or uploaded audio. The video is never looped.</p></div>}
          </section>
          <section className="panel stage">
            <h2>
              <span>03</span> Select your target
            </h2>
            <p className="muted">
              Draw a box on the first frame. For a face swap, include exactly
              one clear face.
            </p>
            <div className="frame">
              {assets.preview ? (
                <>
                  <img
                    ref={preview}
                    src={assets.preview}
                    alt="First frame of uploaded video"
                  />
                  <canvas
                    ref={canvas}
                    aria-label="Draw target box on video frame"
                    onPointerDown={select}
                    onPointerMove={drag}
                    onPointerUp={() => {
                      anchor.current = null;
                    }}
                    onPointerCancel={() => {
                      anchor.current = null;
                    }}
                  />
                </>
              ) : (
                <div className="empty">
                  <span>↗</span>
                  <b>Your scene starts here</b>
                  <p>Prepare both files to see the first video frame.</p>
                </div>
              )}
            </div>
            {upload && (
              <div className="meta">
                {upload.width} × {upload.height} · {upload.duration.toFixed(1)}s
                · {upload.fps.toFixed(2)} FPS
              </div>
            )}
            {upload && (
              <fieldset disabled={active} className="coordinates">
                <legend>
                  Target coordinates{" "}
                  <small>(percent; also supports keyboard selection)</small>
                </legend>
                {["x", "y", "w", "h"].map((k) => (
                  <label key={k}>
                    {{ x: "Left", y: "Top", w: "Width", h: "Height" }[k]}
                    <input
                      type="number"
                      min="0"
                      max="100"
                      step="0.1"
                      value={box ? Math.round(box[k] * 1000) / 10 : ""}
                      onChange={(e) =>
                        setBox({
                          ...box,
                          x: box?.x || 0,
                          y: box?.y || 0,
                          w: box?.w || 0.2,
                          h: box?.h || 0.2,
                          [k]: Number(e.target.value) / 100,
                        })
                      }
                    />
                  </label>
                ))}
              </fieldset>
            )}
            <div className="render">
              <button
                className="primary"
                disabled={
                  !upload ||
                  !validBox ||
                  active ||
                  !health?.ready ||
                  (!modeReady || keyMissing || lipInputInvalid)
                }
                onClick={process}
              >
                {active && job ? "Rendering…" : "Render replacement →"}
              </button>
              <button
                className="secondary"
                disabled={active || !box}
                onClick={() => setBox(null)}
              >
                Clear selection
              </button>
            </div>
            {lipInputInvalid && <p className="warning">Prepare a video of up to {health?.limits?.lipSyncSeconds || 15} seconds, 720p and 30 FPS with speech audio. If you just added audio, click Upload & prepare selection again.</p>}
            <p className="note">
              Object and person modes use tracked image compositing, not
              generative reconstruction. Occlusion and fast movement can reduce
              quality. Tracking stops after detected target loss or a scene cut.
            </p>
            {job && <ProcessingPanel job={job} busy={busy} onCancel={cancel} onPreview={viewResult} />}
            {result && (
              <div className="result">
                <div className="comparison">
                  {originalVideo && <figure><figcaption>Original video</figcaption><video controls src={originalVideo} /></figure>}
                  <figure><figcaption>Edited result{job?.outputDuration ? ` · ${job.outputDuration.toFixed(1)}s` : ""}</figcaption><video controls src={result} /></figure>
                </div>
                <a
                  className="primary download"
                  href={result}
                  download="vividflow-replacement.mp4"
                >
                  Download edited video
                </a>
              </div>
            )}
          </section>
        </div>
        {error && (
          <div className="error" role="alert">
            {error}
          </div>
        )}
        <footer>
          Files stay on your processing server and expire after 24 hours by
          default. Review the rendered video before sharing.
        </footer>
      </main>
    </div>
  );
}
