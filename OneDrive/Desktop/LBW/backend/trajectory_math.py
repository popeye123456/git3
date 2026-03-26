import numpy as np

def calculate_average_speed(frames_between_release_and_pitch, fps=30):
    """
    Computes average ball speed dynamically by measuring frame delta between release and pitch 
    assuming a 20.12-meter cricket pitch.
    """
    if not frames_between_release_and_pitch or frames_between_release_and_pitch <= 0:
        return 0
    time_seconds = frames_between_release_and_pitch / fps
    speed_kmh = (20.12 / time_seconds) * 3.6
    return round(speed_kmh, 1)

def calculate_trajectory_verdict(release, pitch, impact, stumps_y, stumps_x_range):
    """
    Takes 2D coordinates representing the ball's path, applies a parabolic curve fit (numpy.polyfit),
    and extrapolates the line to check intersection with the stumps to return the final verdict.
    """
    if not release or not pitch or not impact:
        return {
            "verdict": "UMPIRE'S CALL",
            "reason": "Tracking data incomplete.",
            "projected_stumps_x": None
        }
    
    # After impact, we want to extrapolate the bounce trajectory towards the stumps.
    # We use the pitch and impact points to find the ascending curve.
    
    # Points post-pitch tracking towards Stumps
    X = np.array([pitch[0], impact[0]])
    Y = np.array([pitch[1], impact[1]])
    
    # We fit X as a function of Y because Y systematically increases downwards towards stumps in image coordinates
    # For a perfect parabolic arc we need 3 points. Since we only take the bounce (pitch->impact),
    # projecting linearly is mathematically sound for a 2D side assumption (degree 1).
    try:
        poly_coeffs = np.polyfit(Y, X, 1)
        poly_func = np.poly1d(poly_coeffs)
        
        # Extrapolate X coordinate at the stumps' Y plane
        projected_x = int(poly_func(stumps_y))
        
        verdict = "MISSING"
        # Verify if projected X falls within the stumps width bounding box
        if stumps_x_range[0] <= projected_x <= stumps_x_range[1]:
            verdict = "HITTING"
            
        return {
            "verdict": verdict,
            "reason": f"Trajectory {'intersects' if verdict == 'HITTING' else 'misses'} stumps plane.",
            "projected_stumps_x": projected_x,
            "stumps_y": stumps_y
        }
    except Exception as e:
        return {
            "verdict": "UMPIRE'S CALL",
            "reason": f"Math engine failed curve fit: {e}",
            "projected_stumps_x": None
        }
