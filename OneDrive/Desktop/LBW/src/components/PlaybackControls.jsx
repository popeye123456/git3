import React from 'react';
import { Play, Pause } from 'lucide-react';

export default function PlaybackControls({ isPlaying, onTogglePlay, progress, onSeek, playbackRate, onSetRate }) {
  return (
    <div style={styles.container}>
      <input 
        type="range" 
        min="0" 
        max="100" 
        value={progress} 
        onChange={(e) => onSeek(Number(e.target.value))}
        style={styles.slider}
      />
      <div style={styles.controls}>
        <button onClick={onTogglePlay} style={styles.iconBtn}>
          {isPlaying ? <Pause size={24} /> : <Play size={24} />}
        </button>
        <div style={styles.speeds}>
          {[0.25, 0.5, 1].map(rate => (
            <button 
              key={rate} 
              onClick={() => onSetRate(rate)}
              style={{
                ...styles.speedBtn, 
                backgroundColor: playbackRate === rate ? 'var(--text-muted)' : 'var(--border-subtle)',
                color: playbackRate === rate ? 'var(--surface-white)' : 'var(--text-main)'
              }}
            >
              {rate}x
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: {
    padding: '1rem',
    backgroundColor: 'var(--surface-white)',
    border: '1px solid var(--border-subtle)',
    borderRadius: '8px',
    marginTop: '1rem',
    width: '100%',
    maxWidth: '800px',
  },
  slider: {
    width: '100%',
    marginBottom: '1rem',
    cursor: 'pointer',
  },
  controls: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  iconBtn: {
    background: 'var(--text-main)',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    color: 'var(--surface-white)',
    display: 'flex',
    alignItems: 'center',
    padding: '0.5rem',
  },
  speeds: {
    display: 'flex',
    gap: '0.5rem',
  },
  speedBtn: {
    border: 'none',
    borderRadius: '4px',
    padding: '0.4rem 0.8rem',
    cursor: 'pointer',
    fontWeight: 'bold',
  }
};
