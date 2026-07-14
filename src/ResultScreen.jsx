import { motion } from 'framer-motion';
import { RotateCcw, Trophy } from 'lucide-react';
import React from 'react';

function titleForScore(score) {
  if (score >= 34) return "Ballon d'Or Level";
  if (score >= 22) return 'Solid Squad Player';
  return 'Needs Preseason Training';
}

function arpitaLine(score) {
  if (score >= 34) return 'Arpita cooked the bot. VAR checked it and still gave respect.';
  if (score >= 22) return 'Arpita survived the football audit. The bot is mildly nervous.';
  return 'Arpita needs preseason. The bot is preparing an offside PowerPoint.';
}

export default function ResultScreen({ score, onPlayAgain }) {
  return (
    <div className="absolute inset-0 z-20 grid place-items-center bg-[#01080b]/70 px-4 backdrop-blur-md">
      <motion.section
        initial={{ opacity: 0, scale: 0.94, y: 24 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="relative w-full max-w-xl overflow-hidden rounded-lg border border-cyan-100/18 bg-[#061014]/86 p-6 text-center shadow-[0_22px_90px_rgba(0,0,0,0.55),inset_0_1px_0_rgba(255,255,255,0.12)] sm:p-8"
      >
        <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-amber-200/80 to-transparent" />
        <div className="pointer-events-none absolute -right-20 -top-24 h-48 w-48 rounded-full bg-cyan-300/10 blur-3xl" />
        <div className="mx-auto grid h-16 w-16 place-items-center rounded-md border border-amber-200/40 bg-amber-300/18 shadow-[0_0_34px_rgba(251,191,36,0.18)]">
          <Trophy className="text-amber-100" size={34} />
        </div>
        <p className="mt-5 text-sm font-black uppercase tracking-[0.24em] text-cyan-100">Full time</p>
        <h1 className="mt-2 text-3xl font-black text-white sm:text-5xl">{titleForScore(score)}</h1>
        <p className="mt-4 text-lg font-bold text-slate-100">You scored {score} out of 40.</p>
        <p className="mx-auto mt-3 max-w-md text-sm font-bold leading-relaxed text-cyan-100/86">{arpitaLine(score)}</p>
        <button
          type="button"
          onClick={onPlayAgain}
          className="mt-6 inline-flex items-center justify-center gap-2 rounded-md bg-emerald-300 px-5 py-3 text-sm font-black uppercase tracking-[0.16em] text-slate-950 shadow-[0_0_30px_rgba(52,211,153,0.28)] transition hover:bg-white"
        >
          <RotateCcw size={18} /> Play Again
        </button>
      </motion.section>
    </div>
  );
}
