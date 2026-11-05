import React, { useEffect, useState } from "react";
export const STAGES = {
  queued: "Queued", validating: "Checking inputs", tracking: "Tracking target",
  face_swap: "Swapping the selected face", audio: "Preparing speech audio",
  lip_sync: "Generating lip movements", encoding: "Encoding the video",
  verifying: "Verifying the output", completed: "Ready to download",
  failed: "Render failed", cancelled: "Render cancelled",
};
export function duration(seconds) {
  if (!Number.isFinite(seconds) || seconds < 0) return "—";
  const rounded = Math.round(seconds);
  return rounded < 60 ? `${rounded}s` : `${Math.floor(rounded / 60)}m ${rounded % 60}s`;
}
export function stageEstimate(job) {
  if (!(job.stageFps > 0)) return null;
  const total = job.stage === "lip_sync" ? job.lipSyncTotal : job.framesTotal;
  const done = job.stage === "lip_sync" ? job.lipSyncProcessed : job.framesProcessed;
  if (!["tracking", "face_swap", "lip_sync"].includes(job.stage) || !(done >= 5) || !(total > done)) return null;
  return (total - done) / job.stageFps;
}
export default function ProcessingPanel({job, onCancel, onPreview, busy}) {
  const [now, setNow] = useState(Date.now());
  const active = ["queued", "processing"].includes(job.status);
  useEffect(() => {
    if (!active) return;
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, [active]);
  const stages = job.mode === "face_lipsync"
    ? ["validating", "face_swap", "audio", "lip_sync", "encoding", "verifying", "completed"]
    : ["validating", job.mode === "face" ? "face_swap" : "tracking", "encoding", "verifying", "completed"];
  const estimate = stageEstimate(job);
  const title = STAGES[job.status === "processing" ? job.stage : job.status] || "Processing";
  const elapsed = ((job.finished || now) - (job.started || job.created)) / 1000;
  const percent = Math.max(0, Math.min(100, Number(job.progress) || 0));
  return <div className={`processing-panel ${job.status}`}>
    <div className="processing-heading">
      <div><span className="eyebrow">RENDER MONITOR · {job.mode === "face_lipsync" ? "CPU FACE + AUDIO" : "LOCAL PROCESSING"}</span>
        <h3 aria-live="polite">{title}</h3></div><strong>{percent}%</strong>
    </div>
    <progress aria-label="Overall render progress" value={percent} max="100" />
    <p className="processing-detail">{job.cancelRequested && active ? "Cancellation requested. The current inference batch or encoding step will finish before stopping." : job.detail || (job.status === "queued" ? "Waiting for the current render to finish." : "")}</p>
    <div className="render-metrics">
      <div><small>{job.started ? "Render time" : "Waiting time"}</small><b>{duration(Math.max(0, elapsed))}</b></div>
      <div><small>Faces / regions replaced</small><b>{job.framesReplaced ?? 0}<span> / {job.framesTotal ?? "—"}</span></b></div>
      <div><small>Frames left unchanged</small><b>{job.framesSkipped ?? 0}</b></div>
      {job.mode === "face_lipsync" && <div><small>Lip-sync frames</small><b>{job.lipSyncFrames ?? 0}<span> / {job.lipSyncTotal ?? job.framesTotal ?? "—"}</span></b></div>}
    </div>
    {estimate !== null && active && <p className="muted">Estimated time remaining in this stage: {duration(estimate)} · measured {job.stageFps.toFixed(2)} frames/s. Later stages take additional time.</p>}
    <ol className="stage-list" aria-label="Render stages">
      {stages.map((stage, index) => {
        const entered = job.history?.find(event => event.stage === stage);
        const current = job.status === "processing" && job.stage === stage;
        return <li key={stage} className={current ? "current" : entered ? "done" : "pending"}>
          <span>{entered && !current ? "✓" : String(index + 1).padStart(2, "0")}</span>
          <div><b>{STAGES[stage]}</b><small>{current ? job.detail : entered?.detail || ""}</small></div>
          <em>{current ? "Running" : entered ? "Reached" : "Pending"}</em>
        </li>;
      })}
    </ol>
    {job.warnings?.map(warning => <p className="warning" key={warning}>{warning}</p>)}
    {job.error && <div className="render-error" role="alert"><b>{job.status === "cancelled" ? "Stopped" : "What needs attention"}</b><p>{job.error}</p>{job.status === "failed" && <small>Correct the input or configuration, then render again. Your prepared media and selection remain available.</small>}</div>}
    {active && <button className="secondary" disabled={busy || job.cancelRequested} onClick={onCancel}>{job.cancelRequested ? "Stopping…" : "Cancel render"}</button>}
    {job.status === "completed" && <button className="primary" disabled={busy} onClick={onPreview}>Preview & download result →</button>}
  </div>;
}
