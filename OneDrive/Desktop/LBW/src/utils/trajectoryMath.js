import * as math from 'mathjs';

/**
 * Homography mapping 2D pixel (X,Y) to physical (mm)
 * In a real LBW system, this solves Ax=0 using SVD for the 8 variables of a Homography Matrix.
 * For this isolated frontend, we return an identity/mock transformation matrix.
 */
export function calculateHomography(srcPoints, dstPoints) {
  return math.matrix([
    [1, 0, 0],
    [0, 1, 0],
    [0, 0, 1]
  ]);
}

/**
 * Applies a 3x3 Homography Matrix: [x', y', w'] = H * transpose([x, y, 1])
 */
export function projectPoint(x, y, matrix) {
  const vec = [x, y, 1];
  // Calculate matrix-vector multiplication
  const res = math.multiply(matrix, vec).toArray(); 
  return {
    x: res[0] / res[2],
    y: res[1] / res[2]
  };
}

/**
 * Calculates LBW Verdict based on projected X coordinate string at the Stumps.
 * standard stump width and a 35.75mm margin of error
 */
export function getDRSVerdict(projectedX, projectedY) {
  // Real world stumps: 22.86cm wide -> 228.6mm.
  // Center is 0. Left stump edge is -114.3, Right stump edge is +114.3.
  // Umpire's call zone is 35.75mm from the edges.
  
  // Since we only have raw pixel points plotted by user, we will map 
  // projectedX to a mm scale. Assume center of a ~800px canvas = 0mm.
  // Assume 1 pixel = 5mm for the sake of the physics UI demonstration.
  const canvasCenterPixel = 400; // Expected center of standard laptop monitor layout
  const mmPerPixel = 5;
  
  const physicalX = (projectedX - canvasCenterPixel) * mmPerPixel;
  
  const stumpRadius = 114.3; // mm
  const margin = 35.75; // mm
  
  const hitDistance = Math.abs(physicalX);
  
  if (hitDistance <= stumpRadius - margin) {
    return 'HITTING';
  } else if (hitDistance <= stumpRadius + margin) {
    return "UMPIRE'S CALL";
  } else {
    return 'MISSING';
  }
}
