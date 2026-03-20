import React from 'react';

const ScoreGauge = ({ score }) => {
  let color = 'var(--success)';
  if (score < 60) color = 'var(--danger)';
  else if (score < 85) color = 'var(--warning)';

  const radius = 60;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  return (
    <div style={{ position: 'relative', width: '150px', height: '150px', margin: '0 auto' }}>
      <svg width="150" height="150" viewBox="0 0 150 150" style={{ transform: 'rotate(-90deg)' }}>
        <circle
          cx="75"
          cy="75"
          r={radius}
          stroke="var(--border)"
          strokeWidth="12"
          fill="none"
        />
        <circle
          cx="75"
          cy="75"
          r={radius}
          stroke={color}
          strokeWidth="12"
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          style={{ transition: 'stroke-dashoffset 1s ease-out' }}
        />
      </svg>
      <div style={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        fontSize: '2rem',
        fontWeight: 'bold',
        color: color
      }}>
        {Math.round(score)}
      </div>
    </div>
  );
};

export default ScoreGauge;
