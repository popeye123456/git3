import React, { useEffect, useState } from 'react';

export default function BroadcastOverlay() {
  const [broadcastState, setBroadcastState] = useState({
    verdict: null, // "HITTING" | "MISSING" | "UMPIRE'S CALL"
    speedKmh: null,
    showLine: false
  });

  // Typically you would connect to a WebSocket or polling API to get real-time state for OBS.
  // For the MVP, we simulate a global state hook or standard interval checking LocalStorage for IPC.
  useEffect(() => {
    const handleStorageChange = () => {
      const stateRaw = localStorage.getItem('broadcastState');
      if (stateRaw) {
        setBroadcastState(JSON.parse(stateRaw));
      }
    };
    
    // Poll for changes since localStorage events don't reliably trigger in the same window
    // if using multiple windows, they do trigger, but polling gives guarantees for OBS.
    const interval = setInterval(handleStorageChange, 500);
    window.addEventListener('storage', handleStorageChange);
    
    return () => {
      clearInterval(interval);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  if (!broadcastState.verdict) {
    return (
      <div style={styles.chromaBg}>
        {/* Waiting for tracking event... OBS will display nothing as green is keyed out */}
      </div>
    );
  }

  const getVerdictStyle = () => {
    if (broadcastState.verdict === 'HITTING') return { color: '#FF3B30' }; // Red
    if (broadcastState.verdict === 'MISSING') return { color: '#34C759' }; // Green
    return { color: '#FF9500' }; // Orange
  };

  return (
    <div style={styles.chromaBg}>
      <div style={styles.overlayContainer}>
        {broadcastState.showLine && (
          <div style={styles.mockTrackingLine}>
            {/* Real implementation would overlay the plotted tracking path SVG here */}
          </div>
        )}
        
        <div style={styles.dataBadge}>
          <div style={styles.titleText}>AWS AI BALL TRACKING</div>
          <div style={styles.dataRow}>
            {broadcastState.speedKmh && (
              <div style={styles.speedBlock}>
                <span style={styles.speedValue}>{broadcastState.speedKmh}</span>
                <span style={styles.speedLabel}>KM/H</span>
              </div>
            )}
            
            <div style={styles.verdictBlock}>
              <span style={{ ...styles.verdictText, ...getVerdictStyle() }}>
                {broadcastState.verdict}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const styles = {
  chromaBg: {
    width: '100vw',
    height: '100vh',
    backgroundColor: '#00FF00', // Deep green chroma-key for OBS
    overflow: 'hidden',
    display: 'flex',
    alignItems: 'flex-end',
    justifyContent: 'center',
    paddingBottom: '5vh', // Float slightly above the bottom
  },
  overlayContainer: {
    width: '80%',
    maxWidth: '800px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  dataBadge: {
    backgroundColor: 'rgba(20, 20, 20, 0.95)',
    border: '2px solid #444',
    borderRadius: '12px',
    padding: '1rem 2rem',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
  },
  titleText: {
    color: '#FFF',
    fontSize: '1rem',
    fontWeight: '800',
    letterSpacing: '2px',
    opacity: 0.8,
    marginBottom: '0.8rem',
  },
  dataRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '3rem',
  },
  speedBlock: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    backgroundColor: '#333',
    padding: '0.5rem 1rem',
    borderRadius: '8px',
  },
  speedValue: {
    color: '#FFF',
    fontSize: '2.5rem',
    fontWeight: 'bold',
    lineHeight: '1.2',
  },
  speedLabel: {
    color: '#AAA',
    fontSize: '0.8rem',
    fontWeight: 'bold',
    letterSpacing: '1px',
  },
  verdictBlock: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '0.5rem 1rem',
  },
  verdictText: {
    fontSize: '3rem',
    fontWeight: '900',
    textTransform: 'uppercase',
    letterSpacing: '2px',
    textShadow: '0 2px 4px rgba(0,0,0,0.4)',
  },
  mockTrackingLine: {
    width: '100%',
    height: '200px',
    marginBottom: '2rem',
    // In actual implementation, Render SVG line here based on broadcastState.coordinates
  }
};
