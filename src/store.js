import { create } from 'zustand';
import { pointValues, quizData } from './quizData';

const tierOrder = ['easy', 'medium', 'hard'];

const shuffle = (items) => [...items].sort(() => Math.random() - 0.5);

const buildDeck = () =>
  tierOrder.flatMap((tier) => {
    const questions = quizData.filter((question) => question.difficulty === tier);
    if (tier !== 'hard') return shuffle(questions);
    const finale = questions.find((question) => question.type === 'penalty');
    return [...shuffle(questions.filter((question) => question !== finale)), finale].filter(Boolean);
  });

export const useQuizStore = create((set, get) => ({
  deck: buildDeck(),
  currentIndex: 0,
  score: 0,
  lastAnswer: null,
  finished: false,
  answerQuestion: (isCorrect) => {
    const state = get();
    const question = state.deck[state.currentIndex];
    const nextScore = isCorrect ? state.score + pointValues[question.difficulty] : state.score;
    set({ score: nextScore, lastAnswer: isCorrect ? 'correct' : 'wrong' });
  },
  nextQuestion: () => {
    const nextIndex = get().currentIndex + 1;
    if (nextIndex >= get().deck.length) {
      set({ finished: true, lastAnswer: null });
      return;
    }
    set({ currentIndex: nextIndex, lastAnswer: null });
  },
  playAgain: () => set({ deck: buildDeck(), currentIndex: 0, score: 0, lastAnswer: null, finished: false })
}));
