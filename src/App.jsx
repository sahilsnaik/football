import { AnimatePresence, motion } from 'framer-motion';
import React, { Component, useEffect, useMemo, useRef, useState } from 'react';
import { Howl } from 'howler';
import QuestionCard from './QuestionCard.jsx';
import ResultScreen from './ResultScreen.jsx';
import Scene3D from './Scene3D.jsx';
import Scoreboard from './Scoreboard.jsx';
import { useQuizStore } from './store.js';

function toneDataUri({ frequency = 440, duration = 0.18, type = 'sine', volume = 0.4 }) {
  const sampleRate = 22050;
  const samples = Math.floor(sampleRate * duration);
  const buffer = new ArrayBuffer(44 + samples * 2);
  const view = new DataView(buffer);
  const writeString = (offset, value) => [...value].forEach((char, index) => view.setUint8(offset + index, char.charCodeAt(0)));

  writeString(0, 'RIFF');
  view.setUint32(4, 36 + samples * 2, true);
  writeString(8, 'WAVEfmt ');
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, 1, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * 2, true);
  view.setUint16(32, 2, true);
  view.setUint16(34, 16, true);
  writeString(36, 'data');
  view.setUint32(40, samples * 2, true);

  for (let i = 0; i < samples; i += 1) {
    const t = i / sampleRate;
    const envelope = Math.sin((Math.PI * i) / samples);
    const wave = type === 'square' ? Math.sign(Math.sin(2 * Math.PI * frequency * t)) : Math.sin(2 * Math.PI * frequency * t);
    view.setInt16(44 + i * 2, wave * envelope * volume * 32767, true);
  }

  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.length; i += 1) binary += String.fromCharCode(bytes[i]);
  return `data:audio/wav;base64,${btoa(binary)}`;
}

function createSounds() {
  return {
    cheer: new Howl({ src: [toneDataUri({ frequency: 660, duration: 0.16 }), toneDataUri({ frequency: 880, duration: 0.18 })], volume: 0.55 }),
    buzzer: new Howl({ src: [toneDataUri({ frequency: 130, duration: 0.32, type: 'square', volume: 0.28 })], volume: 0.45 }),
    whistle: new Howl({ src: [toneDataUri({ frequency: 1500, duration: 0.15, volume: 0.45 })], volume: 0.42 }),
    crowd: new Howl({ src: [toneDataUri({ frequency: 95, duration: 0.9, type: 'square', volume: 0.07 })], loop: true, volume: 0.08 })
  };
}

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  render() {
    if (!this.state.error) return this.props.children;

    return (
      <main className="grid min-h-dvh place-items-center bg-[#020807] px-4 text-white">
        <section className="max-w-xl border border-rose-300/30 bg-slate-950/90 p-5">
          <p className="text-sm font-black uppercase text-rose-200">App error</p>
          <h1 className="mt-2 text-2xl font-black">Football IQ could not render.</h1>
          <p className="mt-3 text-sm text-slate-200">{this.state.error.message}</p>
        </section>
      </main>
    );
  }
}

function getSounds(soundsRef) {
  if (!soundsRef.current) soundsRef.current = createSounds();
  return soundsRef.current;
}

function FootballIQApp() {
  const { deck, currentIndex, score, lastAnswer, finished, answerQuestion, nextQuestion, playAgain } = useQuizStore();
  const question = deck[currentIndex];
  const [gameStarted, setGameStarted] = useState(false);
  const [paused, setPaused] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(null);
  const [answered, setAnswered] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [spatialPick, setSpatialPick] = useState(null);
  const [pitchProgress, setPitchProgress] = useState(0);
  const sounds = useRef(null);
  const isPenaltyQuestion = question?.type === 'penalty';

  useEffect(() => () => {
    Object.values(sounds.current || {}).flat().forEach((sound) => sound.unload());
  }, []);

  useEffect(() => {
    setSelectedIndex(null);
    setAnswered(false);
    setIsCorrect(false);
    setSpatialPick(null);
  }, [question?.id]);

  useEffect(() => {
    const crowd = sounds.current?.crowd;
    if (!crowd) return;
    if (gameStarted && !finished) {
      crowd.volume(0.08);
      if (!crowd.playing()) crowd.play();
    } else {
      crowd.fade(crowd.volume(), 0, 300);
    }
  }, [gameStarted, finished]);

  const sceneProgress = useMemo(() => {
    if (!deck.length) return 0;
    return Math.max(pitchProgress, currentIndex / deck.length);
  }, [currentIndex, deck.length, pitchProgress]);

  const handleAnswer = (index) => {
    if (answered || paused) return;
    const correct = index === question.correctIndex;
    setSelectedIndex(index);
    submitAnswer(correct);
  };

  const handleSpatialPick = (correct, zone) => {
    if (answered || paused || !['spatial', 'penalty'].includes(question.type)) return;
    setSpatialPick(zone);
    if (question.type === 'penalty') {
      const targetIndex = question.penalty.targets.findIndex((target) => target.id === zone);
      setSelectedIndex(targetIndex);
    }
    submitAnswer(correct);
  };

  const submitAnswer = (correct) => {
    setAnswered(true);
    setIsCorrect(correct);
    answerQuestion(correct);
    setPitchProgress((value) => (correct ? Math.min(1, value + 0.065) : Math.max(0, value - 0.045)));
    const cue = correct ? getSounds(sounds).cheer : getSounds(sounds).buzzer;
    cue?.play();
  };

  const handleContinue = () => {
    if (paused) return;
    getSounds(sounds).whistle.play();
    nextQuestion();
  };

  const handlePlayAgain = () => {
    setPitchProgress(0);
    setGameStarted(false);
    setPaused(false);
    sounds.current?.crowd.stop();
    playAgain();
  };

  if (!question && !finished) return null;

  return (
    <main className="relative min-h-dvh overflow-hidden bg-[#020807] font-display text-white">
      <div className="absolute inset-0">
        <Scene3D
          progress={finished ? 1 : sceneProgress}
          question={question}
          onSpatialPick={handleSpatialPick}
          spatialDisabled={answered || finished || paused}
          lastAnswer={lastAnswer}
          finished={finished}
        />
      </div>
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_42%,rgba(34,211,238,0.08),transparent_34%),linear-gradient(to_bottom,rgba(0,0,0,0.1),rgba(1,7,10,0.72))]" />
      <div className="pointer-events-none absolute inset-0 opacity-[0.08] [background-image:linear-gradient(rgba(255,255,255,0.5)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.5)_1px,transparent_1px)] [background-size:42px_42px]" />

      {!gameStarted && !finished && (
        <div className="relative z-30 grid min-h-dvh place-items-center px-4">
          <motion.section
            initial={{ opacity: 0, y: 28, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ type: 'spring', stiffness: 190, damping: 20 }}
            className="relative w-full max-w-xl overflow-hidden rounded-lg border border-cyan-100/18 bg-[#061014]/82 p-4 text-center shadow-[0_28px_100px_rgba(0,0,0,0.58),inset_0_1px_0_rgba(255,255,255,0.12)] backdrop-blur-xl sm:p-6"
          >
            <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-cyan-200/80 to-transparent" />
            <div className="pointer-events-none absolute -left-24 -top-24 h-56 w-56 rounded-full bg-fuchsia-400/10 blur-3xl" />
            <div className="pointer-events-none absolute -right-24 bottom-0 h-56 w-56 rounded-full bg-cyan-300/10 blur-3xl" />

            <p className="text-xs font-black uppercase tracking-[0.28em] text-cyan-100">Football IQ Challenge</p>
            <h1 className="mt-3 text-3xl font-black leading-none text-white sm:text-5xl">Arpita Naik</h1>
            <p className="mx-auto mt-3 max-w-lg text-balance text-lg font-black leading-tight text-slate-100 sm:text-xl">
              do you want to be better than a bot at football, or should the bot explain offside slowly?
            </p>
            <div className="mx-auto mt-4 grid max-w-md gap-2 text-left text-xs font-bold text-cyan-50/90 sm:grid-cols-3">
              <div className="rounded-md border border-white/12 bg-white/8 p-2.5">Bot confidence: annoying</div>
              <div className="rounded-md border border-white/12 bg-white/8 p-2.5">Arpita skill: loading</div>
              <div className="rounded-md border border-white/12 bg-white/8 p-2.5">Football IQ: prove it</div>
            </div>
            <button
              type="button"
              onClick={() => setGameStarted(true)}
              className="mt-5 w-full rounded-md bg-cyan-300 px-5 py-3.5 text-xs font-black uppercase tracking-[0.18em] text-slate-950 shadow-[0_0_34px_rgba(34,211,238,0.34)] transition hover:bg-white sm:w-auto"
            >
              Start and humble the bot
            </button>
            <p className="mt-3 text-[0.65rem] font-semibold uppercase tracking-[0.18em] text-slate-300/70">
              Warning: wrong answers may cause dramatic referee behavior.
            </p>
          </motion.section>
        </div>
      )}

      <AnimatePresence>
        {lastAnswer === 'correct' && (
          <motion.div
            key="green-flash"
            initial={{ opacity: 0.32 }}
            animate={{ opacity: 0 }}
            exit={{ opacity: 0 }}
            className="pointer-events-none absolute inset-0 z-10 bg-emerald-300"
            transition={{ duration: 0.45 }}
          />
        )}
        {lastAnswer === 'wrong' && (
          <motion.div key="card-flash" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="pointer-events-none absolute inset-0 z-10 bg-rose-950/24">
            <motion.div
              initial={{ opacity: 0, x: 40, rotate: 8, scale: 0.9 }}
              animate={{ opacity: 1, x: 0, rotate: [-5, 5, -2, 0], scale: 1 }}
              exit={{ opacity: 0, x: 40, scale: 0.9 }}
              className="absolute right-4 top-28 flex items-center gap-3 rounded-lg border border-amber-100/40 bg-[#100b02]/82 p-3 shadow-[0_18px_60px_rgba(0,0,0,0.45)] backdrop-blur-md sm:right-8 sm:top-32"
            >
              <div className="h-16 w-11 rounded bg-amber-300 shadow-[0_0_36px_rgba(252,211,77,0.55)]" />
              <div className="text-left">
                <p className="text-xs font-black uppercase tracking-[0.2em] text-amber-100">Yellow card</p>
                <p className="mt-1 text-xs font-bold text-slate-100/80">Ref says try again.</p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {gameStarted && !finished && (
        <div className="relative z-20 flex min-h-dvh flex-col">
          <Scoreboard
            current={currentIndex + 1}
            total={deck.length}
            score={score}
            question={question}
            onPause={() => setPaused(true)}
            onRestart={handlePlayAgain}
          />
          <div className="pointer-events-none flex flex-1 items-end justify-center px-3 pb-3 pt-28 sm:items-end sm:pb-5 sm:pt-24">
            <div className="pointer-events-auto w-full">
              {isPenaltyQuestion ? (
                <motion.section
                  key={question.id}
                  initial={{ opacity: 0, y: 24, scale: 0.97 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  className="relative mx-auto w-full max-w-xl overflow-hidden rounded-lg border border-cyan-100/18 bg-[#061014]/78 p-4 shadow-[0_22px_80px_rgba(0,0,0,0.48),inset_0_1px_0_rgba(255,255,255,0.12)] backdrop-blur-xl sm:p-5"
                >
                  <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-fuchsia-200/80 to-transparent" />
                  <div className="mb-2 flex items-center justify-between gap-3">
                    <span className="rounded-md border border-rose-300/40 bg-rose-400/15 px-3 py-1 text-xs font-black uppercase tracking-[0.18em] text-rose-100">
                      Final shootout
                    </span>
                    <span className="text-xs font-bold uppercase tracking-[0.16em] text-cyan-100/80">Pick in the 3D goal</span>
                  </div>
                  <h1 className="text-balance text-xl font-black leading-tight text-white sm:text-2xl">{question.question}</h1>
                  {!answered && (
                    <>
                      <p className="mt-2 text-sm font-medium text-cyan-100/85">
                        Click a glowing target in the goal, or use one of these shot buttons.
                      </p>
                      <div className="mt-4 grid gap-2 sm:grid-cols-2">
                        {question.penalty.targets.map((target, index) => (
                          <button
                            key={target.id}
                            type="button"
                            onClick={() => {
                              setSelectedIndex(index);
                              handleSpatialPick(target.id === question.penalty.correctTarget, target.id);
                            }}
                            className="rounded-md border border-cyan-200/35 bg-cyan-200/12 px-3 py-3 text-left text-sm font-black uppercase tracking-[0.12em] text-cyan-50 transition hover:border-cyan-100 hover:bg-cyan-200/24 hover:shadow-[0_0_22px_rgba(34,211,238,0.24)]"
                          >
                            Shoot {target.label}
                          </button>
                        ))}
                      </div>
                    </>
                  )}
                  {answered && (
                    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="mt-4 rounded-md border border-white/12 bg-black/34 p-3">
                      <p className={`text-sm font-black uppercase ${isCorrect ? 'text-emerald-200' : 'text-rose-200'}`}>
                        {isCorrect ? 'Goal. The finish is ice cold.' : 'Saved. Card shown.'}
                      </p>
                      <p className="mt-1 text-sm leading-relaxed text-slate-100/88">{question.explanation}</p>
                      <button
                        type="button"
                        onClick={handleContinue}
                        className="mt-3 w-full rounded-md bg-cyan-300 px-4 py-3 text-sm font-black uppercase tracking-[0.16em] text-slate-950 shadow-[0_0_28px_rgba(34,211,238,0.28)] transition hover:bg-white sm:w-auto"
                      >
                        See result
                      </button>
                    </motion.div>
                  )}
                </motion.section>
              ) : (
                <QuestionCard
                  question={question}
                  selectedIndex={selectedIndex}
                  answered={answered}
                  isCorrect={isCorrect}
                  onAnswer={handleAnswer}
                  onContinue={handleContinue}
                  spatialPick={spatialPick}
                />
              )}
            </div>
          </div>
        </div>
      )}
      <AnimatePresence>
        {paused && !finished && (
          <motion.div
            key="pause"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-40 grid place-items-center bg-[#01080b]/72 px-4 backdrop-blur-md"
          >
            <motion.section
              initial={{ y: 20, scale: 0.96 }}
              animate={{ y: 0, scale: 1 }}
              exit={{ y: 20, scale: 0.96 }}
              className="w-full max-w-sm rounded-lg border border-cyan-100/18 bg-[#061014]/88 p-5 text-center shadow-[0_22px_90px_rgba(0,0,0,0.55)]"
            >
              <p className="text-xs font-black uppercase tracking-[0.24em] text-cyan-100">Paused</p>
              <h2 className="mt-2 text-3xl font-black text-white">Team Talk</h2>
              <div className="mt-5 grid gap-2">
                <button
                  type="button"
                  onClick={() => setPaused(false)}
                  className="rounded-md bg-cyan-300 px-4 py-3 text-sm font-black uppercase tracking-[0.16em] text-slate-950 transition hover:bg-white"
                >
                  Resume
                </button>
                <button
                  type="button"
                  onClick={handlePlayAgain}
                  className="rounded-md border border-rose-200/28 bg-rose-300/12 px-4 py-3 text-sm font-black uppercase tracking-[0.16em] text-rose-100 transition hover:bg-rose-300/20"
                >
                  Restart Match
                </button>
              </div>
            </motion.section>
          </motion.div>
        )}
      </AnimatePresence>
      {finished && <ResultScreen score={score} onPlayAgain={handlePlayAgain} />}
    </main>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <FootballIQApp />
    </ErrorBoundary>
  );
}
