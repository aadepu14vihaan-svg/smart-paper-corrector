"use client";

import { ChangeEvent, useEffect, useRef, useState } from "react";

type QuestionResult = {
  question: string;
  answer_read: string;
  marks_awarded: number;
  max_marks: number;
  feedback: string;
  needs_review: boolean;
};
type GradeResult = {
  questions: QuestionResult[];
  total_marks: number;
  maximum_marks: number;
  overall_feedback: string;
  needs_teacher_review: boolean;
};

export default function Home() {
  const [images, setImages] = useState<File[]>([]);
  const [subject, setSubject] = useState("Science");
  const [answerKey, setAnswerKey] = useState("");
  const [rubric, setRubric] = useState("");
  const [maxMarks, setMaxMarks] = useState("25");
  const [result, setResult] = useState<GradeResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [approved, setApproved] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const previews = images.map((file) => ({ file, url: URL.createObjectURL(file) }));

  useEffect(() => {
    return () => previews.forEach((preview) => URL.revokeObjectURL(preview.url));
    // URLs are recreated for each render; revoke the current render's URLs on cleanup.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [images]);

  function addImages(event: ChangeEvent<HTMLInputElement>) {
    const selected = Array.from(event.target.files ?? []);
    event.target.value = "";
    if (!selected.length) return;
    const combined = [...images, ...selected];
    if (combined.length > 8) {
      setError("Upload a maximum of 8 photos per paper.");
      return;
    }
    const invalid = selected.find((file) => !["image/jpeg", "image/png", "image/webp"].includes(file.type));
    if (invalid) {
      setError("Use JPG, PNG, or WebP image files.");
      return;
    }
    const tooLarge = combined.find((file) => file.size > 8 * 1024 * 1024);
    if (tooLarge) {
      setError("Each photo must be smaller than 8 MB.");
      return;
    }
    setImages(combined);
    setResult(null);
    setApproved(false);
    setError("");
  }

  function removeImage(index: number) {
    setImages((current) => current.filter((_, i) => i !== index));
    setResult(null);
    setApproved(false);
  }

  async function gradePaper() {
    if (!images.length) return setError("Add at least one answer-sheet photo.");
    if (!answerKey.trim() || !rubric.trim()) return setError("Enter the teacher's answer key and marking rubric.");
    const maximum = Number(maxMarks);
    if (!Number.isFinite(maximum) || maximum <= 0) return setError("Enter a valid maximum mark.");

    setLoading(true);
    setError("");
    setResult(null);
    setApproved(false);
    const form = new FormData();
    form.append("subject", subject);
    form.append("answer_key", answerKey);
    form.append("rubric", rubric);
    form.append("max_marks", String(maximum));
    images.forEach((file) => form.append("images", file, file.name));

    try {
      const response = await fetch("/api/grade", { method: "POST", body: form });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Grading failed.");
      setResult(data as GradeResult);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not grade this paper. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="shell">
      <header className="topbar">
        <div className="brand"><div className="brand-mark">✓</div><span>Smart Paper Corrector</span></div>
        <span className="pill">PHASE 1 · PHOTO UPLOAD</span>
      </header>

      <section className="hero">
        <div className="eyebrow">AI-assisted assessment</div>
        <h1>Less time correcting.<br />More time teaching.</h1>
        <p className="subtitle">Upload handwritten answer sheets, add your marking scheme, and get question-wise AI suggestions. You stay in control of every final mark.</p>
      </section>

      <div className="layout">
        <section className="card">
          <h2>Evaluate an answer sheet</h2>
          <p className="card-intro">Use clear, well-lit photos in the correct page order. Avoid shadows and cropped answers.</p>

          <div className="field">
            <label htmlFor="subject">Subject</label>
            <select id="subject" value={subject} onChange={(e) => setSubject(e.target.value)}>
              {["Science", "Mathematics", "English", "Social Science", "Telugu", "Hindi", "Computer Science", "Other"].map((item) => <option key={item}>{item}</option>)}
            </select>
          </div>

          <div className="field">
            <span className="field-label">Answer-sheet photos</span>
            <label className="upload-zone" htmlFor="photos">
              <div className="upload-icon">↑</div>
              <strong>Take photos or choose files</strong>
              <span>JPG, PNG or WebP · Up to 8 photos · 8 MB each</span>
              <input ref={inputRef} id="photos" type="file" accept="image/jpeg,image/png,image/webp" capture="environment" multiple onChange={addImages} />
            </label>
            {images.length > 0 && <div className="preview-grid">
              {previews.map(({ file, url }, index) => (
                <div className="preview" key={`${file.name}-${index}-${file.lastModified}`}>
                  {/* Local object URL preview of the selected image. */}
                  <img src={url} alt={`Answer sheet page ${index + 1}`} />
                  <span className="preview-num">Page {index + 1}</span>
                  <button className="remove" type="button" onClick={() => removeImage(index)} aria-label={`Remove page ${index + 1}`}>×</button>
                </div>
              ))}
            </div>}
            <p className="note">Photos are processed for this request only. This starter version does not save papers or results to a database.</p>
          </div>

          <div className="field">
            <label htmlFor="answer-key">Teacher&apos;s answer key</label>
            <textarea id="answer-key" rows={5} value={answerKey} onChange={(e) => setAnswerKey(e.target.value)} placeholder={"Q1 (2 marks): Define force and give its SI unit.\nQ2 (3 marks): Explain..."} />
          </div>
          <div className="field">
            <label htmlFor="rubric">Marking rubric</label>
            <textarea id="rubric" rows={4} value={rubric} onChange={(e) => setRubric(e.target.value)} placeholder={"Q1: 1 mark for definition, 1 mark for SI unit.\nQ2: Award marks for..."} />
          </div>
          <div className="field">
            <label htmlFor="max-marks">Total maximum marks</label>
            <input id="max-marks" type="number" min="1" max="1000" value={maxMarks} onChange={(e) => setMaxMarks(e.target.value)} />
          </div>

          {error && <div className="alert error" role="alert">{error}</div>}
          <button className="primary" type="button" onClick={gradePaper} disabled={loading}>
            {loading ? "Reading and evaluating answers…" : "✦  Grade answer sheet"}
          </button>
          <p className="note">AI scores are suggestions, not official grades. Review every answer before using the results.</p>
        </section>

        <aside className="card">
          <h2>Evaluation results</h2>
          <p className="card-intro">Your question-wise feedback will appear here after grading.</p>
          {!result && !loading && <div className="empty"><div><div className="empty-icon">▤</div><strong>No paper evaluated yet</strong><p className="muted">Upload your photos and add a rubric to begin.</p></div></div>}
          {loading && <div className="empty"><div><div className="empty-icon">◌</div><strong>Evaluating your paper…</strong><p className="muted">Handwriting analysis can take a little while.</p></div></div>}
          {result && <>
            <div className="result-score"><strong>{result.total_marks}</strong><span>/ {result.maximum_marks} marks suggested</span></div>
            <div className="review-badge">⚠ TEACHER REVIEW REQUIRED</div>
            <p style={{ fontSize: 13, lineHeight: 1.6 }}>{result.overall_feedback}</p>
            {result.questions.map((q, index) => <article className="question" key={`${q.question}-${index}`}>
              <div className="question-head"><span>{q.question}</span><span className="score">{q.marks_awarded} / {q.max_marks}</span></div>
              <p><strong>Recognized answer:</strong> {q.answer_read || "No readable answer returned."}</p>
              <p>{q.feedback}</p>
              {q.needs_review && <div className="alert info">Check this answer manually; the AI flagged uncertainty.</div>}
            </article>)}
            <button className="primary" style={{ marginTop: 18 }} type="button" onClick={() => setApproved(true)} disabled={approved}>
              {approved ? "Marked as reviewed in this session" : "✓  Mark as teacher-reviewed"}
            </button>
            {approved && <p className="note">Review status is only in this browser session; permanent storage will be added with Supabase.</p>}
          </>}
        </aside>
      </div>
      <footer className="footer">Smart Paper Corrector · AI-assisted, teacher-controlled evaluation</footer>
    </main>
  );
}
