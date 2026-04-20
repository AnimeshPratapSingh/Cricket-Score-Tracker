import React from 'react';

const Controls = ({ addRun, addWicket }) => (
  <div>
    <button onClick={() => addRun(1)}>+1 Run</button>
    <button onClick={() => addRun(2)}>+2 Runs</button>
    <button onClick={() => addRun(4)}>Four</button>
    <button onClick={() => addRun(6)}>Six</button>
    <button onClick={addWicket}>Wicket</button>
  </div>
);

export default Controls;
