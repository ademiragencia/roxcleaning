"use client";

import { useState, useTransition } from "react";
import type { ChecklistItem } from "@/lib/types";
import { updateChecklist } from "@/app/(dashboard)/schedule/actions";

export function JobChecklist({ jobId, initial }: { jobId: string; initial: ChecklistItem[] | null }) {
  const [items, setItems] = useState<ChecklistItem[]>(initial ?? []);
  const [text, setText] = useState("");
  const [, start] = useTransition();

  function persist(next: ChecklistItem[]) {
    setItems(next);
    start(async () => {
      await updateChecklist(jobId, next);
    });
  }

  const done = items.filter((i) => i.done).length;

  return (
    <div>
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-sm font-bold uppercase tracking-wide text-graphite/50">Task checklist</h2>
        {items.length > 0 && (
          <span className="text-xs font-semibold text-graphite/50">
            {done}/{items.length} done
          </span>
        )}
      </div>

      {items.length > 0 && (
        <div className="mb-3 h-2 w-full overflow-hidden rounded-full bg-mist">
          <div
            className="h-full rounded-full bg-emerald-500 transition-all"
            style={{ width: `${items.length ? (done / items.length) * 100 : 0}%` }}
          />
        </div>
      )}

      <ul className="space-y-1.5">
        {items.map((item, i) => (
          <li key={i} className="flex items-center gap-2 rounded-lg px-1 py-1 hover:bg-mist/50">
            <button
              type="button"
              onClick={() => persist(items.map((it, idx) => (idx === i ? { ...it, done: !it.done } : it)))}
              className={`flex h-5 w-5 shrink-0 items-center justify-center rounded border ${
                item.done ? "border-emerald-500 bg-emerald-500 text-white" : "border-black/20 bg-white"
              }`}
              aria-label={item.done ? "Mark not done" : "Mark done"}
            >
              {item.done && (
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 6 9 17l-5-5" />
                </svg>
              )}
            </button>
            <span className={`flex-1 text-sm ${item.done ? "text-graphite/40 line-through" : "text-graphite"}`}>
              {item.text}
            </span>
            <button
              type="button"
              onClick={() => persist(items.filter((_, idx) => idx !== i))}
              className="text-graphite/30 hover:text-rose-600"
              aria-label="Remove"
            >
              ✕
            </button>
          </li>
        ))}
      </ul>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          const t = text.trim();
          if (!t) return;
          persist([...items, { text: t, done: false }]);
          setText("");
        }}
        className="mt-3 flex gap-2"
      >
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Add a task (e.g. Clean oven)…"
          className="flex-1 rounded-lg border border-black/10 bg-white px-3 py-2 text-sm outline-none focus:border-magenta focus:ring-2 focus:ring-magenta/20"
        />
        <button type="submit" className="rounded-lg bg-teal px-3 py-2 text-sm font-semibold text-white hover:bg-teal-dark">
          Add
        </button>
      </form>
    </div>
  );
}
