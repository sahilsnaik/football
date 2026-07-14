import { Gauge, Pause, RotateCcw, Trophy } from 'lucide-react';
import React from 'react';
import { pointValues } from './quizData';

const tierAccent = {
  easy: 'border-emerald-300/45 bg-emerald-300/12 text-emerald-100 shadow-[0_0_24px_rgba(52,211,153,0.18)]',
  medium: 'border-amber-300/45 bg-amber-300/12 text-amber-100 shadow-[0_0_24px_rgba(251,191,36,0.16)]',
  hard: 'border-rose-300/45 bg-rose-300/12 text-rose-100 shadow-[0_0_24px_rgba(251,113,133,0.16)]'
};

export default function Scoreboard({ current, total, score, question, onPause, onRestart }) {
  const pct = (current / total) * 100;

  return (
    <header className="w-full px-3 py-3 sm:px-5">
      <div className="mx-auto flex max-w-6xl items-center gap-3 rounded-lg border border-cyan-100/18 bg-[#061014]/72 p-2 shadow-[0_18px_60px_rgba(0,0,0,0.42),inset_0_1px_0_rgba(255,255,255,0.12)] backdrop-blur-xl">
        <div className="grid h-12 w-12 shrink-0 place-items-center rounded-md border border-cyan-200/20 bg-cyan-300/10 text-cyan-100">
          <Gauge size={22} />
        </div>
        <div className="min-w-0 flex-1 px-1">
          <div className="flex items-center justify-between gap-3 text-[0.68rem] font-black uppercase tracking-[0.18em] text-slate-100">
            <span>Q {current}/{total}</span>
            <span className={`rounded-md border px-2 py-1 ${tierAccent[question.difficulty]}`}>
              {question.difficulty} · +{pointValues[question.difficulty]}
            </span>
          </div>
          <div className="mt-2 h-3 overflow-hidden rounded-full border border-white/10 bg-black/40 shadow-inner">
            <div
              className="h-full rounded-full bg-gradient-to-r from-lime-300 via-cyan-300 to-fuchsia-400 shadow-[0_0_24px_rgba(34,211,238,0.55)] transition-all duration-500"
              style={{ width: `${pct}%` }}
            />
          </div>
        </div>
        <div className="flex h-12 items-center gap-2 rounded-md border border-amber-200/25 bg-amber-300/12 px-3 text-sm font-black text-white shadow-[0_0_28px_rgba(251,191,36,0.12)]">
          <Trophy size={17} className="text-amber-200" />
          {score}/40
        </div>
        <button
          type="button"
          onClick={onPause}
          title="Pause"
          className="grid h-12 w-12 place-items-center rounded-md border border-cyan-200/20 bg-white/8 text-cyan-100 transition hover:bg-cyan-200/18"
        >
          <Pause size={18} />
        </button>
        <button
          type="button"
          onClick={onRestart}
          title="Restart"
          className="grid h-12 w-12 place-items-center rounded-md border border-rose-200/20 bg-white/8 text-rose-100 transition hover:bg-rose-200/18"
        >
          <RotateCcw size={18} />
        </button>
      </div>
    </header>
  );
}
