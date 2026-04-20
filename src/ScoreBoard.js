import React from 'react';
import './ScoreBoard.css';

const ScoreBoard = ({
  runs,
  wickets,
  overs,
  striker,
  nonStriker,
  battingStats,
  bowlerStats,
  eventLog
}) => {
  const calculateEconomy = (runs, balls) => {
    const overs = balls / 6;
    return overs ? (runs / overs).toFixed(2) : '—';
  };

  const formatTime = (ts) => new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  return (
    <div className="scoreboard-container">
      <div className="main-score">
        <h2>
          <span className="score-update">{runs}/{wickets}</span>
        </h2>
        <div className="overs">Overs: {overs}</div>
      </div>

      <div className="batsmen-info">
        {striker.name && (
          <div className="batsman-card">
            <div className="batsman-name">
              {striker.name} *
            </div>
            <div className="batsman-stats">
              {striker.runs} runs ({striker.balls} balls)
            </div>
          </div>
        )}

        {nonStriker.name && (
          <div className="batsman-card">
            <div className="batsman-name">
              {nonStriker.name}
            </div>
            <div className="batsman-stats">
              {nonStriker.runs} runs ({nonStriker.balls} balls)
            </div>
          </div>
        )}
      </div>

      {battingStats?.length > 0 && (
        <>
          <h3 className="section-title">Batting Scorecard</h3>
          <table className="scorecard-table">
            <thead>
              <tr>
                <th>Batter</th>
                <th>Runs</th>
                <th>Balls</th>
                <th>SR</th>
              </tr>
            </thead>
            <tbody>
              {battingStats.map((player, idx) => (
                <tr key={idx}>
                  <td>{player.name}{player.name === striker.name ? ' *' : ''}</td>
                  <td>{player.runs}</td>
                  <td>{player.balls}</td>
                  <td>{player.balls > 0 ? ((player.runs / player.balls) * 100).toFixed(1) : '0.0'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}

      {bowlerStats && Object.keys(bowlerStats).length > 0 && (
        <>
          <h3 className="section-title">Bowling Summary</h3>
          <table className="scorecard-table">
            <thead>
              <tr>
                <th>Bowler</th>
                <th>Overs</th>
                <th>Runs</th>
                <th>Wickets</th>
                <th>Economy</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(bowlerStats).map(([name, stats], idx) => (
                <tr key={idx}>
                  <td>{name}</td>
                  <td>{Math.floor(stats.balls / 6)}.{stats.balls % 6}</td>
                  <td>{stats.runs}</td>
                  <td>{stats.wickets}</td>
                  <td>{calculateEconomy(stats.runs, stats.balls)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}

      {eventLog?.length > 0 && (
        <div className="commentary-section">
          <h3 className="section-title">Match Commentary</h3>
          <ul className="commentary-list">
            {eventLog.map((entry, index) => (
              <li key={index} className="commentary-item">
                <span className="commentary-time">{formatTime(entry.timestamp)}</span>
                {entry.text}
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="partnership-card">
        <h3>Current Partnership</h3>
        <div className="partnership-info">
          {striker.name && nonStriker.name
            ? `${striker.name} & ${nonStriker.name} – ${striker.runs + nonStriker.runs} runs`
            : 'Waiting for batsmen...'}
        </div>
      </div>
    </div>
  );
};

export default ScoreBoard;