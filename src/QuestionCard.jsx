import { AnimatePresence, motion } from 'framer-motion';
import React from 'react';
import { pointValues } from './quizData';

const badgeStyles = {
  easy: 'border-emerald-300/45 bg-emerald-300/14 text-emerald-100',
  medium: 'border-amber-300/45 bg-amber-300/14 text-amber-100',
  hard: 'border-rose-300/45 bg-rose-300/14 text-rose-100'
};

const badgeLabel = {
  easy: 'Easy',
  medium: 'Medium',
  hard: 'Hard'
};

function zoneClass({ answered, selected, correct }) {
  if (answered && correct) return 'border-emerald-200 bg-emerald-300/45 text-white shadow-[0_0_24px_rgba(52,211,153,0.42)]';
  if (answered && selected && !correct) return 'border-rose-200 bg-rose-500/40 text-white shadow-[0_0_24px_rgba(244,63,94,0.34)]';
  return 'border-cyan-100/60 bg-cyan-200/18 text-cyan-50 hover:bg-cyan-200/32 hover:shadow-[0_0_24px_rgba(34,211,238,0.34)]';
}

function SpatialMiniGame({ question, selectedIndex, answered, onAnswer }) {
  const zoneProps = (index, extra = '') => {
    const selected = selectedIndex === index;
    const correct = question.correctIndex === index;

    return {
      type: 'button',
      disabled: answered,
      onClick: () => onAnswer(index),
      className: `absolute rounded-md border px-2 py-1 text-xs font-black transition ${zoneClass({ answered, selected, correct })} ${extra}`
    };
  };

  if (question.spatial.validZone === 'touchline') {
    return (
      <div className="relative mt-3 aspect-[16/8] max-h-[35dvh] overflow-hidden rounded-md border border-white/15 bg-[#0a5d36] shadow-inner">
        <div className="absolute inset-[10%] border-2 border-white/70" />
        <div className="absolute left-[48%] top-[10%] h-[80%] w-0.5 bg-white/70" />
        <div className="absolute left-[42%] top-[36%] h-[28%] w-[16%] rounded-full border-2 border-white/65" />
        <button {...zoneProps(0, 'left-[12%] right-[12%] top-[3%] h-[13%] animate-pulse')}>Sideline / touchline</button>
        <button {...zoneProps(0, 'bottom-[3%] left-[12%] right-[12%] h-[13%] animate-pulse')}>Sideline / touchline</button>
        <button {...zoneProps(1, 'left-[73%] top-[42%]')}>Penalty spot</button>
        <button {...zoneProps(2, 'left-[43%] top-[45%]')}>Center circle</button>
        <button {...zoneProps(3, 'right-[3%] top-[38%]')}>Goal mouth</button>
      </div>
    );
  }

  if (question.spatial.validZone === 'onside') {
    return (
      <div className="relative mt-3 aspect-[16/8] max-h-[35dvh] overflow-hidden rounded-md border border-white/15 bg-[#0a5d36] shadow-inner">
        <div className="absolute inset-[10%] border-2 border-white/70" />
        <div className="absolute left-[62%] top-[10%] h-[80%] w-1 bg-amber-100 shadow-neon" />
        <div className="absolute left-[8%] top-[10%] h-[80%] w-[54%] bg-emerald-300/20" />
        <div className="absolute left-[62%] top-[10%] h-[80%] w-[30%] bg-rose-500/12" />
        <span className="absolute left-[60%] top-[4%] text-xs font-black text-amber-100">Defender line</span>
        <button {...zoneProps(0, 'left-[16%] top-[39%] h-[22%] w-[35%] animate-pulse')}>Level / behind defender</button>
        <button {...zoneProps(1, 'right-[11%] top-[40%]')}>Past defender</button>
        <button {...zoneProps(2, 'right-[2%] top-[8%]')}>Behind goal</button>
        <button {...zoneProps(3, 'left-[3%] top-[8%]')}>In the stand</button>
      </div>
    );
  }

  return (
    <div className="relative mt-3 aspect-[16/8] max-h-[35dvh] overflow-hidden rounded-md border border-white/15 bg-[#0a5d36] shadow-inner">
      <div className="absolute inset-[10%] border-2 border-white/70" />
      <div className="absolute right-[10%] top-[24%] h-[52%] w-[28%] border-2 border-white/70 bg-emerald-300/18" />
      <div className="absolute right-[10%] top-[36%] h-[28%] w-[12%] border-2 border-white/70" />
      <button {...zoneProps(0, 'right-[19%] top-[37%] h-[26%] w-[18%] animate-pulse')}>Indirect free kick spot</button>
      <button {...zoneProps(1, 'right-[34%] top-[45%]')}>Penalty spot</button>
      <button {...zoneProps(2, 'left-[44%] top-[45%]')}>Center spot</button>
      <button {...zoneProps(3, 'right-[8%] bottom-[9%]')}>Corner arc</button>
    </div>
  );
}

export default function QuestionCard({ question, selectedIndex, answered, isCorrect, onAnswer, onContinue, spatialPick }) {
  const isSpatial = question.type === 'spatial';

  return (
    <AnimatePresence mode="wait">
      <motion.section
        key={question.id}
        initial={{ opacity: 0, y: 28, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -20, scale: 0.98 }}
        transition={{ type: 'spring', stiffness: 220, damping: 24 }}
        className="relative mx-auto max-h-[calc(100dvh-8.5rem)] w-full max-w-2xl overflow-y-auto rounded-lg border border-cyan-100/18 bg-[#061014]/78 p-4 shadow-[0_22px_80px_rgba(0,0,0,0.48),inset_0_1px_0_rgba(255,255,255,0.12)] backdrop-blur-xl sm:max-h-[calc(100dvh-8.75rem)]"
      >
        <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-cyan-200/80 to-transparent" />
        <div className="pointer-events-none absolute -right-20 -top-24 h-44 w-44 rounded-full bg-cyan-300/10 blur-3xl" />
        <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
          <span className={`rounded-md border px-3 py-1 text-xs font-black uppercase tracking-[0.18em] ${badgeStyles[question.difficulty]}`}>
            {badgeLabel[question.difficulty]} · {pointValues[question.difficulty]} pts
          </span>
          {isSpatial && <span className="rounded-md border border-cyan-300/30 bg-cyan-300/12 px-3 py-1 text-xs font-bold uppercase tracking-[0.16em] text-cyan-100">3D decision</span>}
        </div>
        <h1 className="text-balance text-xl font-black leading-tight text-white sm:text-2xl">{question.question}</h1>
        {isSpatial && <p className="mt-1.5 text-sm font-medium text-cyan-100/85">{question.spatial.prompt}</p>}

        {isSpatial && (
          <SpatialMiniGame question={question} selectedIndex={selectedIndex} answered={answered} onAnswer={onAnswer} />
        )}

        <div className="mt-3 grid gap-2 sm:grid-cols-2">
          {question.options.map((option, index) => {
            const chosen = selectedIndex === index;
            const correct = answered && index === question.correctIndex;
            const wrong = answered && chosen && !correct;
            return (
              <button
                key={option}
                type="button"
                disabled={answered}
                onClick={() => onAnswer(index)}
                className={`min-h-14 rounded-md border px-3 py-3 text-left text-sm font-bold transition sm:text-base ${
                  correct
                    ? 'border-emerald-300 bg-emerald-400/25 text-white shadow-[0_0_28px_rgba(52,211,153,0.32)]'
                    : wrong
                      ? 'border-rose-300 bg-rose-500/25 text-white shadow-[0_0_28px_rgba(244,63,94,0.26)]'
                      : 'border-white/12 bg-white/8 text-slate-100 hover:border-cyan-200/60 hover:bg-cyan-200/12 hover:shadow-[0_0_22px_rgba(34,211,238,0.18)]'
                }`}
              >
                {option}
              </button>
            );
          })}
        </div>

        {isSpatial && !answered && (
          <div className="mt-3 rounded-md border border-cyan-200/25 bg-cyan-300/10 p-3 text-sm font-semibold text-cyan-50">
            Click a labeled zone on the tactical board, or use the answer buttons below.
          </div>
        )}
        {answered && (
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="mt-4 rounded-md border border-white/12 bg-black/34 p-3">
            <p className={`text-sm font-black uppercase ${isCorrect ? 'text-emerald-200' : 'text-rose-200'}`}>
              {isCorrect ? 'Correct. The attack moves!' : spatialPick ? 'Wrong spot. Card shown.' : 'Wrong answer. Card shown.'}
            </p>
            <p className="mt-1 text-sm leading-relaxed text-slate-100/88">{question.explanation}</p>
            <button
              type="button"
              onClick={onContinue}
              className="mt-3 w-full rounded-md bg-cyan-300 px-4 py-3 text-sm font-black uppercase tracking-[0.16em] text-slate-950 shadow-[0_0_28px_rgba(34,211,238,0.28)] transition hover:bg-white sm:w-auto"
            >
              {isCorrect ? 'Next attack' : 'Recover shape'}
            </button>
          </motion.div>
        )}
      </motion.section>
    </AnimatePresence>
  );
}
