"use client";

import { useState } from "react";

type Quiz = { question: string; options: string[]; correctIndex: number }[];
type Lesson = {
  id: string;
  title: string;
  description: string;
  videoUrl: string | null;
  documentUrl: string | null;
  hasQuiz: boolean;
  quiz: Quiz | null;
  completed: boolean;
};

export default function LessonPlayer({ lessons: initialLessons }: { lessons: Lesson[] }) {
  const [lessons, setLessons] = useState(initialLessons);
  const [activeId, setActiveId] = useState(initialLessons[0]?.id || "");
  const [answers, setAnswers] = useState<number[]>([]);
  const [result, setResult] = useState<{ score: number; total: number; passed: boolean } | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const active = lessons.find((l) => l.id === activeId);
  const completedCount = lessons.filter((l) => l.completed).length;
  const percent = lessons.length > 0 ? Math.round((completedCount / lessons.length) * 100) : 0;

  function openLesson(id: string) {
    setActiveId(id);
    setAnswers([]);
    setResult(null);
  }

  async function markComplete() {
    if (!active) return;
    setSubmitting(true);
    await fetch("/api/progress", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ lessonId: active.id }),
    });
    setLessons(lessons.map((l) => (l.id === active.id ? { ...l, completed: true } : l)));
    setSubmitting(false);
  }

  async function submitQuiz() {
    if (!active) return;
    setSubmitting(true);
    const res = await fetch("/api/progress", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ lessonId: active.id, quizAnswers: answers }),
    });
    const data = await res.json();
    setResult(data);
    if (data.passed) {
      setLessons(lessons.map((l) => (l.id === active.id ? { ...l, completed: true } : l)));
    }
    setSubmitting(false);
  }

  function selectAnswer(qIndex: number, oIndex: number) {
    const next = [...answers];
    next[qIndex] = oIndex;
    setAnswers(next);
  }

  return (
    <div className="mt-6">
      <div className="card-surface rounded-xl p-5 mb-6">
        <div className="flex items-center justify-between text-sm font-semibold text-navy-700">
          <span>Your Progress</span>
          <span>{completedCount} / {lessons.length} lessons ({percent}%)</span>
        </div>
        <div className="mt-2 h-2 rounded-full bg-navy-100 overflow-hidden">
          <div className="h-full bg-rust-500" style={{ width: `${percent}%` }} />
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
        <div className="space-y-2">
          {lessons.map((l) => (
            <button
              key={l.id}
              onClick={() => openLesson(l.id)}
              className={`w-full text-left rounded-lg px-4 py-3 text-sm font-semibold transition-colors ${
                l.id === activeId ? "bg-navy-800 text-white" : "card-surface text-navy-800 hover:border-rust-400"
              }`}
            >
              <span className="flex items-center justify-between">
                {l.title}
                {l.completed && <span className="text-emerald-400">✓</span>}
              </span>
            </button>
          ))}
          {lessons.length === 0 && <p className="text-sm text-navy-500">No lessons published yet.</p>}
        </div>

        <div className="card-surface rounded-xl p-6">
          {!active ? (
            <p className="text-navy-500">Select a lesson to begin.</p>
          ) : (
            <div>
              <h2 className="font-display text-xl font-extrabold text-navy-900">{active.title}</h2>
              <p className="mt-2 text-sm text-navy-600">{active.description}</p>

              {active.videoUrl && (
                <div className="mt-4 aspect-video w-full rounded-lg overflow-hidden bg-navy-900">
                  <iframe
                    src={toEmbedUrl(active.videoUrl)}
                    className="w-full h-full"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </div>
              )}

              {active.documentUrl && (
                <a href={active.documentUrl} target="_blank" className="mt-4 inline-block text-sm font-semibold text-rust-500 hover:text-rust-600">
                  Download Notes →
                </a>
              )}

              {active.hasQuiz && active.quiz ? (
                <div className="mt-6 border-t border-navy-900/10 pt-6 space-y-5">
                  <h3 className="font-display font-bold text-navy-900">Quiz</h3>
                  {active.quiz.map((q, qIndex) => (
                    <div key={qIndex}>
                      <p className="text-sm font-semibold text-navy-800">{qIndex + 1}. {q.question}</p>
                      <div className="mt-2 space-y-1">
                        {q.options.map((opt, oIndex) => (
                          <label key={oIndex} className="flex items-center gap-2 text-sm text-navy-700">
                            <input
                              type="radio"
                              name={`q-${qIndex}`}
                              checked={answers[qIndex] === oIndex}
                              onChange={() => selectAnswer(qIndex, oIndex)}
                            />
                            {opt}
                          </label>
                        ))}
                      </div>
                    </div>
                  ))}

                  {result && (
                    <div className={`rounded-md p-4 text-sm font-semibold ${result.passed ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700"}`}>
                      You scored {result.score} / {result.total}. {result.passed ? "Passed! Lesson marked complete." : "You need 70% to pass — you can try again."}
                    </div>
                  )}

                  <button
                    onClick={submitQuiz}
                    disabled={submitting || answers.length < active.quiz.length}
                    className="rounded-md bg-rust-500 text-white px-5 py-2.5 text-sm font-semibold hover:bg-rust-400 disabled:opacity-50"
                  >
                    {submitting ? "Submitting..." : "Submit Quiz"}
                  </button>
                </div>
              ) : (
                <button
                  onClick={markComplete}
                  disabled={submitting || active.completed}
                  className="mt-6 rounded-md bg-rust-500 text-white px-5 py-2.5 text-sm font-semibold hover:bg-rust-400 disabled:opacity-50"
                >
                  {active.completed ? "Completed ✓" : submitting ? "Saving..." : "Mark as Complete"}
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Converts common YouTube/Vimeo watch links into embeddable player URLs.
function toEmbedUrl(url: string) {
  const yt = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([\w-]+)/);
  if (yt) return `https://www.youtube.com/embed/${yt[1]}`;
  const vimeo = url.match(/vimeo\.com\/(\d+)/);
  if (vimeo) return `https://player.vimeo.com/video/${vimeo[1]}`;
  return url;
}