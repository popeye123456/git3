import React, { useRef, useState, useEffect } from 'react';
import { useMatchState } from '../hooks/useMatchState';
import { Target, Shield } from 'lucide-react';

import VideoRecorder from './VideoRecorder';
import PitchHeatmap from './PitchHeatmap';

export default function Dashboard() {
  const {
    battingTeam,
    bowlingTeam,
    overs,
    balls,
    reviews,
    recordLegalDelivery,
    burnReview
  } = useMatchState();

  // Mocked state for AWS JSON response reception
  const [awsResult, setAwsResult] = useState({
    verdict: null,
    speedKmh: null,
    pitchCoordinates: null
  });

  // Example hook to simulate receiving data from the VideoRecorder component
  // In reality, this would be updated via props or Context when uploadToAWSS3 finishes
  useEffect(() => {
    // For manual simulation rendering tests
    const simulateArrival = () => {
      setAwsResult({
        verdict: "UMPIRE'S CALL",
        speedKmh: 124.6,
        pitchCoordinates: [320, 240] // Centerish pitch
      });
      // also notify OBS
      localStorage.setItem('broadcastState', JSON.stringify({
        verdict: "UMPIRE'S CALL",
        speedKmh: 124.6,
        showLine: true
      }));
    };
    window.addEventListener('sim-aws-result', simulateArrival);
    return () => window.removeEventListener('sim-aws-result', simulateArrival);
  }, []);

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <div style={styles.scoreboard}>
          <div style={styles.teamInfo}>
            <div style={styles.teamName}>
              <Shield size={20} style={{marginRight: '8px'}} />
              {battingTeam} (Batting)
            </div>
            <div style={styles.reviews}>
              Reviews: {reviews.TeamA !== undefined ? reviews.TeamA : 2}
              <button style={styles.reviewBtn} onClick={() => burnReview(battingTeam)}>Burn</button>
            </div>
          </div>
          
          <div style={styles.scoreCenter}>
            <div style={styles.oversText}>Overs</div>
            <div style={styles.oversValue}>{overs}.{balls}</div>
          </div>

          <div style={styles.teamInfo}>
            <div style={styles.teamName}>
              <Target size={20} style={{marginRight: '8px'}} />
              {bowlingTeam} (Bowling)
            </div>
            <div style={styles.reviews}>
              Reviews: {reviews.TeamB !== undefined ? reviews.TeamB : 2}
              <button style={styles.reviewBtn} onClick={() => burnReview(bowlingTeam)}>Burn</button>
            </div>
          </div>
        </div>
      </header>

      <main style={styles.main}>
        <div style={styles.analysisContainer}>
          <VideoRecorder />
          
          {/* Phase 6 Pro Features UI integration */}
          {awsResult.verdict && (
            <div style={styles.verdictPanelRow}>
              <div style={styles.verdictBox}>
                VERDICT: <span style={{color: '#FF9500', marginLeft: '10px'}}>{awsResult.verdict}</span>
              </div>
              <div style={styles.speedBadge}>
                {awsResult.speedKmh} km/h
              </div>
            </div>
          )}
          
          <PitchHeatmap newPitchCoordinate={awsResult.pitchCoordinates} />
          
        </div>

        <div style={styles.testSection}>
          <button style={styles.primaryBtn} onClick={recordLegalDelivery}>
            +1 Ball (Legal Delivery)
          </button>
          
          {/* Temp Dev button to test Phase 6 features UI */}
          <button 
            style={{...styles.primaryBtn, marginLeft: '1rem', backgroundColor: '#666'}} 
            onClick={() => window.dispatchEvent(new Event('sim-aws-result'))}
          >
            Simulate AWS Response
          </button>
        </div>
      </main>
    </div>
  );
}

const styles = {
  container: {
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
  },
  header: {
    backgroundColor: 'var(--surface-white)',
    borderBottom: '2px solid var(--border-strong)',
    padding: '1rem',
  },
  scoreboard: {
    maxWidth: '800px',
    margin: '0 auto',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'var(--bg-cream)',
    padding: '1rem',
    borderRadius: '12px',
    border: '1px solid var(--border-subtle)',
    boxShadow: '0 4px 6px rgba(0,0,0,0.05)'
  },
  teamInfo: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '0.5rem',
  },
  teamName: {
    fontWeight: 'bold',
    fontSize: '1.2rem',
    display: 'flex',
    alignItems: 'center',
  },
  reviews: {
    fontSize: '0.9rem',
    color: 'var(--text-muted)',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
  },
  reviewBtn: {
    backgroundColor: 'var(--verdict-red)',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    padding: '0.2rem 0.5rem',
    cursor: 'pointer',
    fontSize: '0.8rem',
  },
  scoreCenter: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  oversText: {
    fontSize: '1rem',
    color: 'var(--text-muted)',
    textTransform: 'uppercase',
    letterSpacing: '1px',
  },
  oversValue: {
    fontSize: '2.5rem',
    fontWeight: 'bold',
    color: 'var(--verdict-green)',
  },
  main: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: '2rem',
  },
  analysisContainer: {
    width: '100%',
    maxWidth: '800px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '0.5rem',
  },
  verdictPanelRow: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    gap: '1rem',
    marginTop: '1rem',
    width: '100%',
  },
  verdictBox: {
    backgroundColor: '#FFF',
    border: '2px solid #EEE',
    borderRadius: '8px',
    padding: '1rem 2rem',
    fontSize: '1.8rem',
    fontWeight: '900',
    color: '#333',
    boxShadow: '0 4px 6px rgba(0,0,0,0.05)',
  },
  speedBadge: {
    backgroundColor: '#36454F', // Charcoal
    color: '#FFF',
    fontSize: '1.8rem',
    fontWeight: 'bold',
    padding: '1rem 1.5rem',
    borderRadius: '8px',
    boxShadow: '0 4px 6px rgba(0,0,0,0.2)',
  },
  testSection: {
    marginTop: '2rem',
  },
  primaryBtn: {
    backgroundColor: 'var(--text-main)',
    color: 'var(--surface-white)',
    border: 'none',
    padding: '1rem 2rem',
    fontSize: '1.2rem',
    borderRadius: '8px',
    cursor: 'pointer',
    boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
    transition: 'transform 0.1s',
  }
};
