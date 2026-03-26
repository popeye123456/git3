import React, { useEffect, useRef } from 'react';

let audioContext = null;

export default function UltraEdgeWaveform({ videoRef }) {
  const canvasRef = useRef(null);
  const analyserRef = useRef(null);
  const sourceNodeRef = useRef(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const initAudio = () => {
      if (!audioContext) {
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
      }
      if (audioContext.state === 'suspended') {
        audioContext.resume();
      }

      if (!analyserRef.current) {
        try {
          const analyser = audioContext.createAnalyser();
          analyser.fftSize = 2048;
          
          if (!sourceNodeRef.current) {
            const source = audioContext.createMediaElementSource(video);
            source.connect(analyser);
            analyser.connect(audioContext.destination);
            sourceNodeRef.current = source;
          }
          analyserRef.current = analyser;
        } catch (e) {
          console.warn("Audio routing already connected or failed:", e);
        }
      }
    };

    video.addEventListener('play', initAudio);

    let animationId;
    const draw = () => {
      animationId = requestAnimationFrame(draw);
      
      const canvas = canvasRef.current;
      const analyser = analyserRef.current;
      if (!canvas || !analyser) return;

      const bufferLength = analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);
      analyser.getByteTimeDomainData(dataArray);

      const ctx = canvas.getContext('2d');
      // bg-cream
      ctx.fillStyle = '#F9F7F1'; 
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.lineWidth = 2;
      // text-main
      ctx.strokeStyle = '#2C3539'; 

      ctx.beginPath();
      const sliceWidth = canvas.width * 1.0 / bufferLength;
      let x = 0;

      for (let i = 0; i < bufferLength; i++) {
        const v = dataArray[i] / 128.0;
        const y = v * (canvas.height / 2);

        if (i === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
        x += sliceWidth;
      }
      ctx.lineTo(canvas.width, canvas.height / 2);
      ctx.stroke();
    };

    draw();

    return () => {
      cancelAnimationFrame(animationId);
      video.removeEventListener('play', initAudio);
    };
  }, [videoRef]);

  return (
    <div style={styles.container}>
      <h3 style={styles.title}>Ultra-Edge Sensor</h3>
      <canvas ref={canvasRef} width={800} height={80} style={styles.canvas} />
    </div>
  );
}

const styles = {
  container: {
    width: '100%',
    maxWidth: '800px',
    marginTop: '1rem',
    backgroundColor: 'var(--surface-white)',
    border: '1px solid var(--border-subtle)',
    borderRadius: '8px',
    padding: '1rem',
  },
  title: {
    margin: '0 0 0.5rem 0',
    fontSize: '0.9rem',
    color: 'var(--text-muted)',
    textTransform: 'uppercase',
    letterSpacing: '1px',
    fontWeight: 'bold',
  },
  canvas: {
    width: '100%',
    height: '80px',
    backgroundColor: 'var(--bg-cream)',
    borderRadius: '4px',
    border: '1px inset var(--border-subtle)',
  }
};
