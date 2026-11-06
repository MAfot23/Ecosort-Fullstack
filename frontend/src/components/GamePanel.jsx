import { useEffect, useRef, useState } from 'react';
import api from '../api';

const BIN_META = {
  organic: { label: 'Organic', icon: '🍃' },
  recyclable: { label: 'Recyclable', icon: '♻️' },
  residual: { label: 'Residual', icon: '🗑️' },
};

const TOTAL_ROUNDS = 10;
const ROUND_MS = 5000;

function shuffled(arr, n) {
  const pool = [...arr];
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }
  return pool.slice(0, n);
}

export default function GamePanel() {
  const [items, setItems] = useState([]);
  const [bestScore, setBestScore] = useState(null);
  const [phase, setPhase] = useState('intro'); // intro | playing | end
  const [sequence, setSequence] = useState([]);
  const [round, setRound] = useState(0);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [current, setCurrent] = useState(null);
  const [feedback, setFeedback] = useState({ text: '', kind: '' });
  const [fillWidth, setFillWidth] = useState('100%');
  const timerRef = useRef(null);
  const answeredRef = useRef(false);

  useEffect(() => {
    api.get('/waste-items').then((res) => setItems(res.data)).catch(() => {});
    api.get('/scores/best').then((res) => setBestScore(res.data.best_game_score)).catch(() => {});
  }, []);

  function startGame() {
    const seq = shuffled(items, TOTAL_ROUNDS);
    setSequence(seq);
    setRound(0);
    setScore(0);
    setStreak(0);
    setPhase('playing');
    nextRound(seq, 0, 0, 0);
  }

  function nextRound(seq, r, s, st) {
    clearTimeout(timerRef.current);
    if (r >= TOTAL_ROUNDS) {
      endGame(s);
      return;
    }
    answeredRef.current = false;
    const item = seq[r];
    setCurrent(item);
    setRound(r + 1);
    setScore(s);
    setStreak(st);
    setFeedback({ text: '', kind: '' });

    setFillWidth('100%');
    requestAnimationFrame(() => requestAnimationFrame(() => setFillWidth('0%')));

    timerRef.current = setTimeout(() => {
      if (!answeredRef.current) handleAnswer(null, item, seq, r, s, st);
    }, ROUND_MS);
  }

  function handleAnswer(chosenBin, item, seq, r, s, st) {
    if (answeredRef.current) return;
    answeredRef.current = true;
    clearTimeout(timerRef.current);

    let newScore = s;
    let newStreak = st;

    if (chosenBin === item.bin) {
      newScore++;
      newStreak++;
      setFeedback({ text: `Correct — ${item.name} is ${BIN_META[item.bin].label.toLowerCase()}.`, kind: 'good' });
    } else if (chosenBin === null) {
      newStreak = 0;
      setFeedback({ text: `Time’s up — ${item.name} belongs in ${BIN_META[item.bin].label.toLowerCase()}.`, kind: 'bad' });
    } else {
      newStreak = 0;
      setFeedback({ text: `Not quite — ${item.name} belongs in ${BIN_META[item.bin].label.toLowerCase()}.`, kind: 'bad' });
    }

    setScore(newScore);
    setStreak(newStreak);
    setTimeout(() => nextRound(seq, r + 1, newScore, newStreak), 900);
  }

  async function endGame(finalScore) {
    setPhase('end');
    setScore(finalScore);
    try {
      const res = await api.post('/scores/game', { score: finalScore, total_rounds: TOTAL_ROUNDS });
      setBestScore(res.data.best);
    } catch {
      // not logged in or request failed — score simply isn't saved
    }
  }

  const remark = (s) => (s >= 9 ? 'Sharp sorting instincts.' : s >= 6 ? 'Solid work — a little more practice and you’ll ace it.' : 'Good start — check the Sort tab for a refresher.');

  return (
    <div className="card">
      {phase === 'intro' && (
        <div>
          <h2 className="section-title">Sorting Sprint</h2>
          <p>An item appears — sort it into the right bin before time runs out. 10 rounds. Ready?</p>
          {bestScore !== null && <div className="game-stat" style={{ marginBottom: 14 }}>Best score: {bestScore}/10</div>}
          <button className="btn btn-primary" onClick={startGame} disabled={!items.length}>Start game</button>
        </div>
      )}

      {phase === 'playing' && current && (
        <div>
          <div className="game-top">
            <span className="game-stat">Round <b>{round}</b>/10</span>
            <span className="game-stat">Score <b>{score}</b></span>
            <span className="game-stat">Streak <b>{streak}</b></span>
          </div>
          <div className="timer-track"><div className="timer-fill" style={{ width: fillWidth, transition: `width ${ROUND_MS}ms linear` }} /></div>
          <div className="item-stage">
            <div className="item-emoji">{current.icon}</div>
            <div className="item-name">{current.name}</div>
          </div>
          <div className="bin-btns">
            {['organic', 'recyclable', 'residual'].map((bin) => (
              <button key={bin} className={`bin-btn ${bin}`} onClick={() => handleAnswer(bin, current, sequence, round - 1, score, streak)}>
                <span className="ic">{BIN_META[bin].icon}</span>{BIN_META[bin].label}
              </button>
            ))}
          </div>
          <div className={`feedback-flash ${feedback.kind}`}>{feedback.text}</div>
        </div>
      )}

      {phase === 'end' && (
        <div className="game-end">
          <h2 className="section-title">Round complete</h2>
          <div className="score-big">{score}/{TOTAL_ROUNDS}</div>
          <p>{remark(score)}</p>
          <button className="btn btn-primary" onClick={startGame}>Play again</button>
        </div>
      )}
    </div>
  );
}
