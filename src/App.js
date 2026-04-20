import './App.css';
import React, { useState, useEffect } from 'react';
import ScoreBoard from './ScoreBoard';
import Controls from './Controls';

function App() {
  const [fadeBowler, setFadeBowler] = useState(false);
const [bowlerEnd, setBowlerEnd] = useState('End A');
  const [runs, setRuns] = useState(0);
  const [wickets, setWickets] = useState(0);
  const [balls, setBalls] = useState(0);
  const [darkMode, setDarkMode] = useState(true);
  const [eventLog, setEventLog] = useState([]);
  const [fallOfWickets, setFallOfWickets] = useState([]);
  const [totalOvers, setTotalOvers] = useState(20); // Dynamic total overs

  const [strikerStats, setStrikerStats] = useState({ name: '', runs: 0, balls: 0 });
  const [nonStrikerStats, setNonStrikerStats] = useState({ name: '', runs: 0, balls: 0 });
  const [strikerInput, setStrikerInput] = useState('');
  const [nonStrikerInput, setNonStrikerInput] = useState('');
  const [battingStats, setBattingStats] = useState([]);
  const [bowlerStats, setBowlerStats] = useState({});
  const [bowlerName, setBowlerName] = useState('');
  const [bowlerQueue, setBowlerQueue] = useState([]);
  const [currentBowlerIndex, setCurrentBowlerIndex] = useState(0);
  const [previousBowlerIndex, setPreviousBowlerIndex] = useState(-1);
  const [bowlerHistory, setBowlerHistory] = useState([]);
  const [showBowlerChange, setShowBowlerChange] = useState(false);

  const cheerAudio = new Audio('/cheer.mp3');
const wicketAudio = new Audio('/wicket.mp3');

 useEffect(() => {
  document.body.className = darkMode ? '' : 'light-mode';

  // Optional: update app title to reflect theme
  document.title = darkMode ? '🏏 Night Mode – Cricket Score Tracker' : '☀️ Day Mode – Cricket Score Tracker';
}, [darkMode]);

const toggleTheme = () => setDarkMode((prev) => !prev);

// 🧢 Enhanced Strike Rotation
const rotateStrike = () => {
  // Optional delay to simulate movement or visual transitions
  setTimeout(() => {
    const temp = strikerStats;
    setStrikerStats(nonStrikerStats);
    setNonStrikerStats(temp);
  }, 200); // 200ms gives a soft feel — tweak as needed
};

  const updateBatterStats = (name, run) => {
    setBattingStats(prev => {
      const stats = [...prev];
      const index = stats.findIndex(p => p.name === name);
      if (index !== -1) {
        stats[index].runs += run;
        stats[index].balls += 1;
      } else {
        stats.push({ name, runs: run, balls: 1 });
      }
      return stats;
    });
  };

  const rotateBowler = () => {
    if (bowlerQueue.length < 2) return; // Need at least 2 bowlers for rotation

    setPreviousBowlerIndex(currentBowlerIndex);
    setShowBowlerChange(true);

    // Find next eligible bowler (not the same as previous over)
    let nextIndex;
    if (bowlerQueue.length > 2) {
      do {
        nextIndex = Math.floor(Math.random() * bowlerQueue.length);
      } while (nextIndex === currentBowlerIndex || nextIndex === previousBowlerIndex);
    } else {
      nextIndex = currentBowlerIndex === 0 ? 1 : 0;
    }

    setBowlerHistory(prev => [...prev, {
      bowler: bowlerQueue[currentBowlerIndex],
      over: Math.floor(balls / 6)
    }]);

    setCurrentBowlerIndex(nextIndex);
    setBowlerName(bowlerQueue[nextIndex]);
    setBowlerEnd(prev => prev === 'End A' ? 'End B' : 'End A');

    setTimeout(() => setShowBowlerChange(false), 2000);
  };

  const logDelivery = (outcome) => {
    const bowler = bowlerName.trim() || 'Unknown';
    setBowlerStats(prev => {
      const current = prev[bowler] || { balls: 0, runs: 0, wickets: 0 };
      const isWicket = outcome === 'WICKET';
      const runsScored = isWicket ? 0 : parseInt(outcome) || 0;
      return {
        ...prev,
        [bowler]: {
          balls: current.balls + 1,
          runs: current.runs + runsScored,
          wickets: current.wickets + (isWicket ? 1 : 0)
        }
      };
    });

    // Check for over completion and rotate bowler if needed
    if ((balls + 1) % 6 === 0) {
      rotateBowler();
    }
  };

 const addRun = (run) => {
  setRuns(runs + run);
  setBalls(balls + 1);
  cheerAudio.play();

  const updatedStriker = {
    ...strikerStats,
    runs: strikerStats.runs + run,
    balls: strikerStats.balls + 1
  };
  setStrikerStats(updatedStriker);

  updateBatterStats(updatedStriker.name, run);
  logDelivery(`${run}`);

  const entry = `🏏 ${updatedStriker.name || 'Striker'} scores ${run} run${run > 1 ? 's' : ''}`;
  setEventLog([{ text: entry, timestamp: Date.now() }, ...eventLog]);

  if (run % 2 !== 0) rotateStrike();

  // 🌀 Bowler auto-rotation every 6 balls
  if ((balls + 1) % 6 === 0 && bowlerQueue.length > 0) {
    setFadeBowler(true);
    setTimeout(() => {
      setCurrentBowlerIndex((prev) => (prev + 1) % bowlerQueue.length);
      setBowlerEnd((prev) => (prev === 'End A' ? 'End B' : 'End A'));
      setFadeBowler(false);
    }, 400);
  }
};

  const addWicket = () => {
  setWickets(wickets + 1);
  setBalls(balls + 1);
  wicketAudio.play();

  updateBatterStats(strikerStats.name, 0);
  logDelivery('WICKET');

  const entry = `❌ ${strikerStats.name || 'Striker'} is OUT!`;
  setEventLog([{ text: entry, timestamp: Date.now() }, ...eventLog]);

  setFallOfWickets(prev => [
    ...prev,
    {
      batter: strikerStats.name,
      over: formatOvers(),
      reason: 'WICKET'
    }
  ]);

  setStrikerStats({ name: '', runs: 0, balls: 0 });

  // 🌀 Bowler auto-rotation every 6 balls
  if ((balls + 1) % 6 === 0 && bowlerQueue.length > 0) {
    setFadeBowler(true);
    setTimeout(() => {
      setCurrentBowlerIndex((prev) => (prev + 1) % bowlerQueue.length);
      setBowlerEnd((prev) => (prev === 'End A' ? 'End B' : 'End A'));
      setFadeBowler(false);
    }, 400);
  }
};

  const resetScore = () => {
    setRuns(0);
    setWickets(0);
    setBalls(0);
    setStrikerStats({ name: '', runs: 0, balls: 0 });
    setNonStrikerStats({ name: '', runs: 0, balls: 0 });
    setStrikerInput('');
    setNonStrikerInput('');
    setBowlerName('');
    setEventLog([]);
    setBattingStats([]);
    setBowlerStats({});
    setFallOfWickets([]);
  };

  const handleSetBatsmen = () => {
    if (strikerInput.trim()) {
      setStrikerStats({ name: strikerInput.trim(), runs: 0, balls: 0 });
      setStrikerInput('');
    }
    if (nonStrikerInput.trim()) {
      setNonStrikerStats({ name: nonStrikerInput.trim(), runs: 0, balls: 0 });
      setNonStrikerInput('');
    }
  };

  const formatOvers = () => `${Math.floor(balls / 6)}.${balls % 6}`;

  // 📊 Match Stats Calculation
  const totalBalls = totalOvers * 6;
  const ballsLeft = Math.max(totalBalls - balls, 0);
  const runRate = balls ? (runs / (balls / 6)).toFixed(2) : '0.00';
  const projectedScore = balls ? Math.round((runs / balls) * totalBalls) : 0;
  const extras = 0; // placeholder
  const requiredRR = '—'; // placeholder (chase mode)

  return (
    <div className="container">
      {showBowlerChange && bowlerQueue[currentBowlerIndex] && (
        <div className="bowler-change-alert">
          🔄 New Bowler: {bowlerQueue[currentBowlerIndex]} from {bowlerEnd}
        </div>
      )}

      <div id="live-strip">🔥 Live Match – Cricket Score Tracker</div>

      <button onClick={toggleTheme} style={{ float: 'right', marginBottom: '10px' }}>
        {darkMode ? '🌞 Light Mode' : '🌙 Dark Mode'}
      </button>

      <h1>🏏 Cricket Score Tracker</h1>
      
      {/* bowler rotation  */}
      <div className="bowler-input" style={{ marginTop: '10px' }}>

  <input
    type="text"
    placeholder="Enter bowler's name"
    value={bowlerName}
    onChange={(e) => setBowlerName(e.target.value)}
    style={{ width: '300px', padding: '8px' }}
    />
   </div>

   {/* Bowler Summary Block */}
<div style={{ marginBottom: '10px' }}>
  <h3>🎯 Bowler Summary</h3>
  {bowlerName && bowlerStats[bowlerName] && (
    <div style={{
      background: 'rgba(255,255,255,0.05)',
      borderRadius: '8px',
      padding: '10px',
      backdropFilter: 'blur(6px)'
    }}>
      <p><strong>Name:</strong> {bowlerName}</p>
      <p><strong>Overs:</strong> {Math.floor(bowlerStats[bowlerName].balls / 6)}.{bowlerStats[bowlerName].balls % 6}</p>
      <p><strong>Runs:</strong> {bowlerStats[bowlerName].runs}</p>
      <p><strong>Wickets:</strong> {bowlerStats[bowlerName].wickets}</p>
    </div>
  )}
</div>

    <div style={{ marginTop: '10px' }}>
      <input
        type="text"
        placeholder="Add bowler to rotation"
        onKeyDown={(e) => {
          if (e.key === 'Enter' && e.target.value.trim()) {
            const newBowler = e.target.value.trim();
            setBowlerQueue(prevQueue => {
              if (prevQueue.length === 0) {
                setBowlerName(newBowler);
              }
              return [...prevQueue, newBowler];
            });
            e.target.value = '';
          }
        }}
        style={{ width: '300px', padding: '8px' }}
      />
      <p style={{ fontSize: '0.85rem' }}>Press Enter to add multiple bowlers</p>
      
      {bowlerQueue.length > 0 && (
        <div style={{ 
          marginTop: '10px',
          padding: '10px',
          background: 'rgba(255,255,255,0.05)',
          borderRadius: '8px'
        }}>
          <h4 style={{ margin: '0 0 8px 0' }}>🎯 Bowling Rotation</h4>
          {bowlerQueue.map((bowler, index) => (
            <span key={index} style={{
              display: 'inline-block',
              margin: '4px',
              padding: '4px 8px',
              background: index === currentBowlerIndex ? '#dc2626' : 'rgba(255,255,255,0.1)',
              borderRadius: '4px',
              fontSize: '14px'
            }}>
              {bowler} {index === currentBowlerIndex && '(current)'}
            </span>
          ))}
        </div>
      )}
    </div>

      {/* Total Overs Input */}
      <div className="overs-input" style={{ marginBottom: '10px' }}>
        <input
          type="number"
          placeholder="Enter total overs"
          value={totalOvers}
          onChange={(e) => setTotalOvers(Number(e.target.value))}
          style={{ width: '180px' }}
        />
      </div>

      {/* 📊 Live Stats Sidebar */}
      <div className="match-sidebar">
        <h3>📊 Live Match Stats</h3>
        <p>Run Rate: <strong>{runRate}</strong></p>
        <p>Balls Left: <strong>{ballsLeft}</strong></p>
        <p>Projected Score: <strong>{projectedScore}</strong></p>
        <p>Extras: <strong>{extras}</strong></p>
        <p>Required RR: <strong>{requiredRR}</strong></p>
      </div>

      <div className="batsman-input">
        <input
          type="text"
          placeholder="Striker's name"
          value={strikerInput}
          onChange={(e) => setStrikerInput(e.target.value)}
        />
        <input
          type="text"
          placeholder="Non-striker's name"
          value={nonStrikerInput}
          onChange={(e) => setNonStrikerInput(e.target.value)}
          style={{ marginLeft: '8px' }}
        />
        <button onClick={handleSetBatsmen} style={{ marginLeft: '8px' }}>
          Set Batsmen
        </button>
      </div>

      <div className="bowler-input" style={{ marginTop: '10px' }}>
        <input
          type="text"
          placeholder="Enter bowler's name"
          value={bowlerName}
          onChange={(e) => setBowlerName(e.target.value)}
          style={{ width: '300px', padding: '8px' }}
        />
      </div>

      <ScoreBoard
        runs={runs}
        wickets={wickets}
        overs={formatOvers()}
        striker={strikerStats}
        nonStriker={nonStrikerStats}
        battingStats={battingStats}
        bowlerStats={bowlerStats}
        eventLog={eventLog}
        fallOfWickets={fallOfWickets}
      />

      <Controls addRun={addRun} addWicket={addWicket} />

      <button className="reset-btn" onClick={resetScore}>
        🔄 Reset Match
      </button>
    </div>
  );
}

export default App;