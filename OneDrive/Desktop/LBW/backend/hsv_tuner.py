import cv2
import numpy as np
import sys

def nothing(x):
    """Placeholder callback function for OpenCV trackbars."""
    pass

def run_tuner(video_path):
    """
    Opens the target .mp4 video and spawns an interactive desktop GUI.
    Grants the user precise tuning control over 6 different HSV color bounds.
    Allows frame-by-frame scrubbing using the spacebar to isolate specific environments.
    """
    cap = cv2.VideoCapture(video_path)
    if not cap.isOpened():
        print(f"Error: Could not open video stream or file at '{video_path}'")
        sys.exit(1)

    # Initialize the primary static frame
    ret, frame = cap.read()
    if not ret:
        print("Error: Target video is either completely empty or entirely corrupted.")
        sys.exit(1)

    # Instantiate our primary Visual tuning window layout
    window_name = 'LBW Tracker - Automatic HSV Calibrator'
    cv2.namedWindow(window_name, cv2.WINDOW_NORMAL)
    cv2.resizeWindow(window_name, 1280, 720)

    # Generate OpenCV active diagnostic trackbars natively injected into the UI
    # OpenCV's default hue channel strictly caps at 179 (180 total).
    cv2.createTrackbar('H-Min', window_name, 0, 179, nothing)
    cv2.createTrackbar('S-Min', window_name, 100, 255, nothing)
    cv2.createTrackbar('V-Min', window_name, 100, 255, nothing)
    
    cv2.createTrackbar('H-Max', window_name, 10, 179, nothing)
    cv2.createTrackbar('S-Max', window_name, 255, 255, nothing)
    cv2.createTrackbar('V-Max', window_name, 255, 255, nothing)

    print("\n===============================")
    print("   LBW ASSISTANT: HSV TUNER     ")
    print("===============================")
    print(" -> Press [SPACE] to advance exactly ONE frame forward.")
    print(" -> Tune the 6 sliders to visually isolate the rigid cricket ball.")
    print(" -> Press 'q' to shut down gracefully and dump the HSV configuration.")
    print("===============================\n")

    while True:
        # Programmatically retrieve updated dynamic bounds
        h_min = cv2.getTrackbarPos('H-Min', window_name)
        s_min = cv2.getTrackbarPos('S-Min', window_name)
        v_min = cv2.getTrackbarPos('V-Min', window_name)
        h_max = cv2.getTrackbarPos('H-Max', window_name)
        s_max = cv2.getTrackbarPos('S-Max', window_name)
        v_max = cv2.getTrackbarPos('V-Max', window_name)

        # Color-shift geometry processing map
        hsv_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2HSV)
        
        # Instantiate logical arrays
        lower_bound = np.array([h_min, s_min, v_min])
        upper_bound = np.array([h_max, s_max, v_max])

        # Impose OpenCV geometric boundary mask
        binary_mask = cv2.inRange(hsv_frame, lower_bound, upper_bound)

        # Elevate physical representation from a 1-channel scalar into full 3-channels
        # so it accurately matches dimension requirements for numpy horizontal scaling
        mask_expanded_3ch = cv2.cvtColor(binary_mask, cv2.COLOR_GRAY2BGR)

        # Stack frames side-by-side creating diagnostic split-view layout
        diagnostic_viewport = np.hstack((frame, mask_expanded_3ch))

        # Surface GUI canvas to endpoint screen output
        cv2.imshow(window_name, diagnostic_viewport)

        # Constantly wait 30 milliseconds verifying system input blocks
        key = cv2.waitKey(30) & 0xFF
        
        if key == ord('q'):
            # Close application securely, dump payload properties array configuration
            print("\n==================================")
            print("======= FINAL CONFIGURATION ======")
            print("==================================")
            print("COPY AND PASTE THIS DIRECTLY INTO YOUR AWS lbw_tracker.py CORE:")
            print()
            print(f"lower_red = np.array([{h_min}, {s_min}, {v_min}])")
            print(f"upper_red = np.array([{h_max}, {s_max}, {v_max}])")
            print()
            print("==================================\n")
            break
            
        elif key == ord(' '):
            # Advance video precisely a single exact frame length
            ret, next_frame = cap.read()
            if not ret:
                print(">>> WARNING: End of the local testing pipeline reached. Restart program for a new file.")
            else:
                frame = next_frame

    # Perform mandatory safe-cleanup 
    cap.release()
    cv2.destroyAllWindows()

if __name__ == "__main__":
    import argparse
    parser = argparse.ArgumentParser(description="Interactive LBW Assistant Video Tuner")
    parser.add_argument("--video", type=str, default="test_video.mp4", help="Absolute or relative path to .mp4 target testing geometry payload")
    args = parser.parse_args()
    
    run_tuner(args.video)
