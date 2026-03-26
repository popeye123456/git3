import React, { useRef, useEffect, useState } from 'react';
import { getDRSVerdict } from '../utils/trajectoryMath';

export default function PlottingCanvas({ videoRef, src }) {
  const canvasRef = useRef(null);
  const [points, setPoints] = useState([]);
  const [verdict, setVerdict] = useState(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handlePause = () => {
      const canvas = canvasRef.current;
      if (canvas && video) {
        if (canvas.width !== video.videoWidth) {
          canvas.width = video.videoWidth || 1280;
          canvas.height = video.videoHeight || 720;
        }
        const ctx = canvas.getContext('2d');
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      }
    };

    const handlePlay = () => {
      const canvas = canvasRef.current;
      if (canvas) {
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
      setPoints([]);
      setVerdict(null);
    };

    video.addEventListener('pause', handlePause);
    video.addEventListener('seeked', handlePause);
    video.addEventListener('play', handlePlay);

    return () => {
      video.removeEventListener('pause', handlePause);
      video.removeEventListener('seeked', handlePause);
      video.removeEventListener('play', handlePlay);
    };
  }, [videoRef]);

  const animateTracer = (finalPoints) => {
    const canvas = canvasRef.current;
    const video = videoRef.current;
    if (!canvas || !video) return;
    const ctx = canvas.getContext('2d');
    
    let startTime = null;
    const duration = 1500; // 1.5s LERP animation

    const renderFrame = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      
      // Reset background under the animation
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

      // Draw original clicked points
      ctx.fillStyle = '#F9F7F1';
      ctx.strokeStyle = '#2C3539';
      ctx.lineWidth = 2;
      finalPoints.forEach((p) => {
         ctx.beginPath();
         ctx.arc(p.x, p.y, 6, 0, Math.PI * 2);
         ctx.fill();
         ctx.stroke();
      });

      // LERP Tracer Path
      ctx.strokeStyle = '#B22222';
      ctx.lineWidth = 4;
      ctx.lineCap = 'round';
      ctx.beginPath();

      if (finalPoints.length > 0) {
        ctx.moveTo(finalPoints[0].x, finalPoints[0].y);
        
        const totalSegments = finalPoints.length - 1;
        const currentSegmentProgress = progress * totalSegments;
        const activeSegmentIndex = Math.floor(currentSegmentProgress);
        const segmentT = currentSegmentProgress - activeSegmentIndex;

        for (let i = 0; i <= activeSegmentIndex && i < totalSegments; i++) {
           if (i === activeSegmentIndex && segmentT > 0) {
              const p1 = finalPoints[i];
              const p2 = finalPoints[i+1];
              const currentX = p1.x + (p2.x - p1.x) * segmentT;
              const currentY = p1.y + (p2.y - p1.y) * segmentT;
              ctx.lineTo(currentX, currentY);
           } else {
              ctx.lineTo(finalPoints[i+1].x, finalPoints[i+1].y);
           }
        }
      }
      ctx.stroke();

      if (progress < 1) {
        requestAnimationFrame(renderFrame);
      }
    };
    
    requestAnimationFrame(renderFrame);
  };

  const handleCanvasClick = (e) => {
    if (!canvasRef.current || !videoRef.current || videoRef.current.paused === false) return;
    if (points.length >= 4) return; // Prevent extra plots

    const rect = canvasRef.current.getBoundingClientRect();
    const scaleX = canvasRef.current.width / rect.width;
    const scaleY = canvasRef.current.height / rect.height;

    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top) * scaleY;
    
    const newPoints = [...points, { x, y }];
    setPoints(newPoints);

    // Initial dot rendering
    const ctx = canvasRef.current.getContext('2d');
    ctx.fillStyle = '#F9F7F1';
    ctx.strokeStyle = '#2C3539';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(x, y, 6, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    if (newPoints.length === 4) {
      // Index 3 is Stumps Projected Location
      const stumpsPoint = newPoints[3];
      const verdictResult = getDRSVerdict(stumpsPoint.x, stumpsPoint.y);
      setVerdict(verdictResult);
      animateTracer(newPoints);
    }
  };

  const clearPlotting = () => {
    setPoints([]);
    setVerdict(null);
    const canvas = canvasRef.current;
    const video = videoRef.current;
    if (canvas && video && video.paused) {
      const ctx = canvas.getContext('2d');
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.canvasWrapper}>
        <video
          ref={videoRef}
          src={src}
          style={styles.video}
          crossOrigin="anonymous"
          playsInline
        />
        <canvas
          ref={canvasRef}
          onClick={handleCanvasClick}
          style={styles.canvas}
        />

        {verdict && (
          <div style={styles.verdictOverlay}>
            <h2 style={{
              ...styles.verdictText,
              color: verdict === 'HITTING' ? 'var(--verdict-red)' : 
                     verdict === "UMPIRE'S CALL" ? 'var(--verdict-yellow)' : 'var(--verdict-green)'
            }}>
              LBW: {verdict}
            </h2>
            <button style={styles.resetBtn} onClick={clearPlotting}>Reset Tracker</button>
          </div>
        )}
      </div>

      <div style={styles.pointsStatus}>
        <span style={styles.statusBadge}>
          Plotted Points: {points.length}/4
          {points.length === 0 ? " (Pause video and click canvas)" : 
           points.length === 1 ? " (Pitch)" :
           points.length === 2 ? " (Impact)" :
           points.length === 3 ? " (Stumps)" : " (Complete)"}
        </span>
        {points.length > 0 && <button style={styles.clearBtn} onClick={clearPlotting}>Clear Points</button>}
      </div>
    </div>
  );
}

const styles = {
  container: {
    width: '100%',
    maxWidth: '800px',
    marginTop: '1rem',
  },
  canvasWrapper: {
    position: 'relative',
    width: '100%',
    aspectRatio: '16/9',
    backgroundColor: '#000',
    borderRadius: '8px',
    overflow: 'hidden',
  },
  video: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    objectFit: 'contain',
  },
  canvas: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    objectFit: 'contain',
    cursor: 'crosshair',
    pointerEvents: 'auto',
  },
  verdictOverlay: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    backgroundColor: 'rgba(249, 247, 241, 0.95)',
    border: '2px solid var(--border-strong)',
    borderRadius: '12px',
    padding: '2rem',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
    zIndex: 10,
  },
  verdictText: {
    margin: '0 0 1rem 0',
    fontSize: '3rem',
    fontWeight: '900',
    textTransform: 'uppercase',
    letterSpacing: '2px',
    textShadow: '1px 1px 0 #FFF, -1px -1px 0 #000',
  },
  resetBtn: {
    backgroundColor: 'var(--text-main)',
    color: 'var(--surface-white)',
    border: 'none',
    padding: '0.8rem 1.5rem',
    borderRadius: '4px',
    fontSize: '1rem',
    cursor: 'pointer',
    fontWeight: 'bold',
  },
  pointsStatus: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: '0.5rem',
    padding: '0.5rem',
    backgroundColor: 'var(--surface-white)',
    border: '1px solid var(--border-subtle)',
    borderRadius: '4px',
  },
  statusBadge: {
    fontSize: '0.9rem',
    color: 'var(--text-main)',
    fontWeight: '500',
  },
  clearBtn: {
    background: 'transparent',
    border: '1px solid var(--border-strong)',
    color: 'var(--text-muted)',
    borderRadius: '4px',
    padding: '0.2rem 0.6rem',
    cursor: 'pointer',
  }
};
