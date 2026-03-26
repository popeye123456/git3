import React, { useEffect, useRef, useState } from 'react';

export default function PitchHeatmap({ newPitchCoordinate }) {
  const canvasRef = useRef(null);
  const [pitchmarks, setPitchmarks] = useState([]);

  // Load existing pitchmarks from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('pitchmarksData');
    if (saved) {
      try {
        setPitchmarks(JSON.parse(saved));
      } catch (e) {
        console.error('Failed to parse saved pitchmarks:', e);
      }
    }
  }, []);

  // Update localStorage and state when a new pitchmark arrives
  useEffect(() => {
    if (newPitchCoordinate && Array.isArray(newPitchCoordinate) && newPitchCoordinate.length === 2) {
      const updatedMarks = [...pitchmarks, newPitchCoordinate];
      setPitchmarks(updatedMarks);
      localStorage.setItem('pitchmarksData', JSON.stringify(updatedMarks));
    }
  }, [newPitchCoordinate]);

  // Draw the heatmap
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw pitch background (Green)
    ctx.fillStyle = '#4CAF50';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Draw creases (White)
    ctx.strokeStyle = '#FFFFFF';
    ctx.lineWidth = 3;
    
    // Popping crease
    ctx.beginPath();
    ctx.moveTo(0, 40);
    ctx.lineTo(canvas.width, 40);
    ctx.stroke();
    
    ctx.beginPath();
    ctx.moveTo(0, canvas.height - 40);
    ctx.lineTo(canvas.width, canvas.height - 40);
    ctx.stroke();
    
    // Batting crease limits (side creases)
    ctx.beginPath();
    ctx.moveTo(30, 0);
    ctx.lineTo(30, canvas.height);
    ctx.stroke();
    
    ctx.beginPath();
    ctx.moveTo(canvas.width - 30, 0);
    ctx.lineTo(canvas.width - 30, canvas.height);
    ctx.stroke();

    // Draw Heatmap Pitchmarks
    pitchmarks.forEach((mark) => {
      // Map coordinate (Assuming mark is [x, y] in video frame resolution ~640x480)
      // Scale it down to canvas size
      const scaleX = canvas.width / 640;
      const scaleY = canvas.height / 480;
      const cx = mark[0] * scaleX;
      const cy = mark[1] * scaleY;

      ctx.beginPath();
      ctx.arc(cx, cy, 8, 0, 2 * Math.PI, false);
      ctx.fillStyle = 'rgba(255, 69, 0, 0.8)'; // Red/Orange glowing effect
      ctx.fill();
      ctx.lineWidth = 2;
      ctx.strokeStyle = '#FFFFFF';
      ctx.stroke();
      
      // Glow effect overlay
      ctx.beginPath();
      ctx.arc(cx, cy, 14, 0, 2 * Math.PI, false);
      ctx.fillStyle = 'rgba(255, 140, 0, 0.4)';
      ctx.fill();
    });
  }, [pitchmarks]);

  return (
    <div style={styles.container}>
      <h3 style={styles.title}>Pitch Heatmap (Over)</h3>
      <canvas 
        ref={canvasRef} 
        width={300} 
        height={400} 
        style={styles.canvas} 
      />
      <button 
        style={styles.clearBtn} 
        onClick={() => {
          setPitchmarks([]);
          localStorage.removeItem('pitchmarksData');
        }}
      >
        Clear Over
      </button>
    </div>
  );
}

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    backgroundColor: 'var(--surface-white, #FFFFFF)',
    padding: '1rem',
    borderRadius: '12px',
    boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
    marginTop: '1rem'
  },
  title: {
    margin: '0 0 1rem 0',
    color: 'var(--text-main, #333)',
  },
  canvas: {
    border: '2px solid #333',
    borderRadius: '4px'
  },
  clearBtn: {
    marginTop: '1rem',
    padding: '0.5rem 1rem',
    backgroundColor: '#333',
    color: '#FFF',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer'
  }
};
