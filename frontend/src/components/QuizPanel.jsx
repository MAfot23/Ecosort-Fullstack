import { useEffect, useState } from 'react';
import api from '../api';

const QUIZ = [
  { q: 'Which bin does a banana peel go in?', opts: ['Organic', 'Recyclable', 'Residual'], a: 0, ex: 'Food scraps break down naturally, so they belong in organic waste, not recycling.' },
  { q: 'Where should a clean, empty plastic bottle go?', opts: ['Residual', 'Organic', 'Recyclable'], a: 2, ex: 'Rinsed plastic bottles are one of the most commonly recycled items.' },
  { q: 'A used battery is best handled by...', opts: ['The recyclable bin', 'A dedicated battery/e-waste drop-off', 'The organic bin'], a: 1, ex: 'Batteries contain hazardous materials and need special collection, not a regular bin.' },
  { q: 'A greasy pizza box is usually...', opts: ['Compostable with food scraps', 'Fine in clean paper recycling', 'Always hazardous waste'], a: 0, ex: 'Grease contaminates paper recycling, so oily cardboard is better composted or binned as residual.' },
  { q: 'A broken ceramic mug should go in...', opts: ['Recyclable (it’s glass-like)', 'Residual waste', 'Organic waste'], a: 1, ex: 'Ceramics melt at different temperatures than glass and contaminate glass recycling — residual bin.' },
  { q: 'Old newspaper belongs in...', opts: ['Recyclable', 'Organic', 'Residual'], a: 0, ex: 'Clean, dry paper is a standard recyclable material.' },
  { q: 'Coffee grounds are best sorted as...', opts: ['Recyclable', 'Organic', 'Residual'], a: 1, ex: 'Coffee grounds are food waste and make excellent compost.' },
  { q: 'A worn-out toothbrush should go in...', opts: ['Organic', 'Recyclable', 'Residual'], a: 2, ex: 'Mixed plastics and bristles usually can’t be separated for recycling.' },
];

export default function QuizPanel() {
  const [bestQuiz, setBestQuiz] = useState(null);
  const [phase, setPhase] = useState('intro'); // intro | playing | end
  const [i, setI] = useState(0);
  const [score, setScore] = useState(0);
  const [picked, setPicked] = useState(null);

  useEffect(() => {
    api.get('/scores/best').then((res) => setBestQuiz(res.data.best_quiz_score)).catch(() => {});
  }, []);

  function start() {
    setI(0);
    setScore(0);
    setPicked(null);
    setPhase('playing');
  }

  function answer(idx) {
    if (picked !== null) return;
    setPicked(idx);
    if (idx === QUIZ[i].a) setScore((s) => s + 1);
  }

  async function next() {
    if (i + 1 >= QUIZ.length) {
      const finalScore = score;
      setPhase('end');
      try {
        const res = await api.post('/scores/quiz', { score: finalScore, total_questions: QUIZ.length });
        setBestQuiz(res.data.best);
      } catch {
        // not logged in or request failed
      }
    } else {
      setI(i + 1);
      setPicked(null);
    }
  }

  const q = QUIZ[i];
  const remark = (s) => (s === QUIZ.length ? 'Perfect score — you know your bins.' : s >= QUIZ.length - 2 ? 'Great job — just a couple to brush up on.' : 'Worth another look at the Sort tab’s guide.');

  return (
    <div className="card">
      {phase === 'intro' && (
        <div>
          <h2 className="section-title">Waste Sorting Quiz</h2>
          <p>8 quick questions on what goes where and why it matters.</p>
          {bestQuiz !== null && <div className="game-stat" style={{ marginBottom: 14 }}>Best score: {bestQuiz}/8</div>}
          <button className="btn btn-primary" onClick={start}>Start quiz</button>
        </div>
      )}

      {phase === 'playing' && (
        <div>
          <div className="quiz-progress">Question {i + 1} of {QUIZ.length}</div>
          <div className="quiz-q">{q.q}</div>
          <div className="quiz-opts">
            {q.opts.map((opt, idx) => {
              let cls = 'quiz-opt';
              if (picked !== null) {
                if (idx === q.a) cls += ' correct';
                else if (idx === picked) cls += ' wrong';
              }
              return (
                <button key={idx} className={cls} disabled={picked !== null} onClick={() => answer(idx)}>
                  {opt}
                </button>
              );
            })}
          </div>
          {picked !== null && <div className="quiz-explain show">{q.ex}</div>}
          <div className="quiz-foot">
            <button className="btn btn-primary" onClick={next} disabled={picked === null}>Next</button>
          </div>
        </div>
      )}

      {phase === 'end' && (
        <div className="quiz-end">
          <h2 className="section-title">Quiz complete</h2>
          <div className="score-big" style={{ fontFamily: "'Fraunces',serif", fontSize: '2.4rem', margin: '10px 0' }}>{score}/{QUIZ.length}</div>
          <p>{remark(score)}</p>
          <button className="btn btn-primary" onClick={start}>Try again</button>
        </div>
      )}
    </div>
  );
}
