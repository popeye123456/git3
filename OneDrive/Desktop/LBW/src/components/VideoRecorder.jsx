import React, { useState, useEffect, useRef } from 'react';
import UltraEdgeWaveform from './UltraEdgeWaveform';

export default function VideoRecorder() {
  const [stream, setStream] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const [recordedBlob, setRecordedBlob] = useState(null);
  const [isUploading, setIsUploading] = useState(false);

  const liveVideoRef = useRef(null);
  const playbackVideoRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);

  useEffect(() => {
    async function setupCamera() {
      try {
        const mediaStream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "environment" },
          audio: true
        });
        setStream(mediaStream);
        if (liveVideoRef.current) {
          liveVideoRef.current.srcObject = mediaStream;
        }
      } catch (err) {
        console.warn("Error accessing camera (expected if no camera exists or permissions denied):", err);
      }
    }
    setupCamera();

    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const handleStartRecording = () => {
    if (!stream) return;
    chunksRef.current = [];
    
    // Check supported types; default to mp4 as requested via constraints/Blob, 
    // though browsers might only support webm natively in MediaRecorder.
    const mimeType = MediaRecorder.isTypeSupported('video/mp4') 
      ? 'video/mp4' 
      : (MediaRecorder.isTypeSupported('video/webm') ? 'video/webm' : '');
      
    const mediaRecorder = new MediaRecorder(stream, mimeType ? { mimeType } : undefined);
    
    mediaRecorder.ondataavailable = (event) => {
      if (event.data && event.data.size > 0) {
        chunksRef.current.push(event.data);
      }
    };

    mediaRecorder.onstop = () => {
      const blob = new Blob(chunksRef.current, { type: 'video/mp4' });
      setRecordedBlob(blob);
      const url = URL.createObjectURL(blob);
      if (playbackVideoRef.current) {
        playbackVideoRef.current.src = url;
      }
      handleUploadAndAnalyze(blob);
    };

    mediaRecorder.start(100); // collect 100ms chunks to ensure data availability on stop
    setIsRecording(true);
    mediaRecorderRef.current = mediaRecorder;
  };

  const handleStopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  /**
   * uploadToAWSS3(videoBlob)
   * This is a placeholder function for our future AWS cloud-based AI architecture.
   * Steps it will perform:
   * 1. Fetch a Pre-Signed URL from our AWS API Gateway.
   * 2. Receive temporary STS credentials and a restricted PUT URL.
   * 3. Execute a securely authenticated PUT request to upload `videoBlob` directly to our S3 bucket.
   * 4. Trigger backend Lambda processing for AI Ball Tracking physical models.
   */
  const uploadToAWSS3 = async (videoBlob) => {
    console.log("Mock AWS S3 Upload started. Blob size:", videoBlob.size);
    return new Promise((resolve) => setTimeout(resolve, 5000)); // Simulate 5s AWS upload/analyze time
  };

  const handleUploadAndAnalyze = async (blob) => {
    setIsUploading(true);
    await uploadToAWSS3(blob);
    setIsUploading(false);
    console.log("Upload and S3 analysis complete.");
  };

  const resetState = () => {
    setRecordedBlob(null);
    setIsUploading(false);
  };

  return (
    <div style={styles.container}>
      {!recordedBlob ? (
        <div style={styles.cameraContainer}>
          <video 
            ref={liveVideoRef} 
            style={styles.video} 
            autoPlay 
            playsInline 
            muted 
          />
          <button 
            style={styles.recordButton}
            onClick={isRecording ? handleStopRecording : handleStartRecording}
          >
            {isRecording ? "⬛ Stop & Analyze" : "🔴 Record Delivery"}
          </button>
        </div>
      ) : (
        <div style={styles.playbackContainer}>
          <video 
            ref={playbackVideoRef} 
            style={styles.video} 
            autoPlay 
            playsInline 
            loop 
          />
          
          <div style={styles.loadingOverlay}>
            <h3 style={styles.statusText}>
              {isUploading ? "Uploading & Analyzing via AWS AI Architecture..." : "Analysis Complete - Ball Tracked."}
            </h3>
            
            {/* Acts as our "Loading Screen" audio spike analyzer */}
            <UltraEdgeWaveform videoRef={playbackVideoRef} />
            
          </div>
          
          {!isUploading && (
            <button style={{...styles.recordButton, marginTop: '1rem'}} onClick={resetState}>
              Record Another Delivery
            </button>
          )}
        </div>
      )}
    </div>
  );
}

const styles = {
  container: {
    width: '100%',
    maxWidth: '800px',
    backgroundColor: 'var(--surface-white)',
    borderRadius: '12px',
    border: '1px solid var(--border-subtle)',
    boxShadow: '0 4px 6px rgba(0,0,0,0.05)',
    padding: '1rem',
    marginBottom: '1rem'
  },
  cameraContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '1rem'
  },
  playbackContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '1rem'
  },
  video: {
    width: '100%',
    borderRadius: '8px',
    border: '2px solid var(--border-strong)',
    backgroundColor: 'var(--bg-cream)',
    maxHeight: '400px',
    objectFit: 'cover'
  },
  recordButton: {
    backgroundColor: 'var(--text-main)',
    color: 'var(--surface-white)',
    border: 'none',
    padding: '1rem 2rem',
    fontSize: '1.2rem',
    borderRadius: '8px',
    cursor: 'pointer',
    fontWeight: 'bold',
    boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
    transition: 'transform 0.1s',
  },
  loadingOverlay: {
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '1rem',
    marginTop: '1rem'
  },
  statusText: {
    color: 'var(--text-main)',
    margin: 0,
    fontSize: '1.2rem',
    textAlign: 'center'
  }
};
