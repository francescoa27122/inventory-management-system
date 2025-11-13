import React from 'react';
import './SimpleChart.css';

export const LineChart = ({ data, title, color = '#3b82f6', height = 200 }) => {
  if (!data || data.length === 0) {
    return <div className="chart-empty">No data available</div>;
  }

  const maxValue = Math.max(...data.map(d => d.value));
  const minValue = Math.min(...data.map(d => d.value));
  const range = maxValue - minValue || 1;
  
  const points = data.map((d, i) => {
    const x = (i / (data.length - 1)) * 100;
    const y = 100 - ((d.value - minValue) / range) * 80 - 10;
    return `${x},${y}`;
  }).join(' ');

  return (
    <div className="chart-container">
      {title && <h3 className="chart-title">{title}</h3>}
      <svg className="line-chart" viewBox="0 0 100 100" preserveAspectRatio="none" style={{ height }}>
        <polyline
          points={points}
          fill="none"
          stroke={color}
          strokeWidth="2"
          vectorEffect="non-scaling-stroke"
        />
        {data.map((d, i) => {
          const x = (i / (data.length - 1)) * 100;
          const y = 100 - ((d.value - minValue) / range) * 80 - 10;
          return (
            <circle
              key={i}
              cx={x}
              cy={y}
              r="3"
              fill={color}
              vectorEffect="non-scaling-stroke"
            />
          );
        })}
      </svg>
      <div className="chart-labels">
        {data.map((d, i) => (
          <span key={i} className="chart-label">
            {d.label}
          </span>
        ))}
      </div>
    </div>
  );
};

export const BarChart = ({ data, title, color = '#10b981', height = 200 }) => {
  if (!data || data.length === 0) {
    return <div className="chart-empty">No data available</div>;
  }

  const maxValue = Math.max(...data.map(d => d.value));
  
  return (
    <div className="chart-container">
      {title && <h3 className="chart-title">{title}</h3>}
      <div className="bar-chart" style={{ height }}>
        {data.map((d, i) => {
          const percentage = (d.value / maxValue) * 100;
          return (
            <div key={i} className="bar-item">
              <div className="bar-label">{d.label}</div>
              <div className="bar-wrapper">
                <div
                  className="bar"
                  style={{
                    width: `${percentage}%`,
                    backgroundColor: color
                  }}
                >
                  <span className="bar-value">{d.value}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export const DonutChart = ({ data, title, size = 200 }) => {
  if (!data || data.length === 0) {
    return <div className="chart-empty">No data available</div>;
  }

  const total = data.reduce((sum, d) => sum + d.value, 0);
  let cumulativePercent = 0;

  const colors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

  return (
    <div className="chart-container">
      {title && <h3 className="chart-title">{title}</h3>}
      <div className="donut-chart-wrapper">
        <svg className="donut-chart" viewBox="0 0 100 100" style={{ width: size, height: size }}>
          <circle cx="50" cy="50" r="40" fill="none" stroke="var(--bg-tertiary)" strokeWidth="20" />
          {data.map((d, i) => {
            const percent = (d.value / total) * 100;
            const startAngle = (cumulativePercent / 100) * 360 - 90;
            const endAngle = ((cumulativePercent + percent) / 100) * 360 - 90;
            
            const startX = 50 + 40 * Math.cos((startAngle * Math.PI) / 180);
            const startY = 50 + 40 * Math.sin((startAngle * Math.PI) / 180);
            const endX = 50 + 40 * Math.cos((endAngle * Math.PI) / 180);
            const endY = 50 + 40 * Math.sin((endAngle * Math.PI) / 180);
            
            const largeArcFlag = percent > 50 ? 1 : 0;
            
            const path = `M 50 50 L ${startX} ${startY} A 40 40 0 ${largeArcFlag} 1 ${endX} ${endY} Z`;
            
            cumulativePercent += percent;
            
            return (
              <path
                key={i}
                d={path}
                fill={colors[i % colors.length]}
                opacity="0.8"
              />
            );
          })}
          <circle cx="50" cy="50" r="25" fill="var(--bg-primary)" />
        </svg>
        <div className="donut-legend">
          {data.map((d, i) => (
            <div key={i} className="legend-item">
              <span
                className="legend-color"
                style={{ backgroundColor: colors[i % colors.length] }}
              />
              <span className="legend-label">{d.label}</span>
              <span className="legend-value">{d.value}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
