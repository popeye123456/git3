# LBW Umpire Assistant - Project Development Phases Report

This document outlines the detailed progress and implementation phases of the LBW Umpire Assistant application. It serves as a comprehensive history of the project's evolution from its inception to its current state.

## Phase 1: Core Mechanics and Foundation
**Objective:** Establish the foundational mechanics of the cricket LBW assistant application.
- **Custom Video Player:** Developed a tailored video player with granular frame-by-frame controls essential for precise LBW analysis.
- **AR Calibration:** Implemented an initial AR overlay system for pitch calibration to ensure accurate spatial mapping.
- **Interactive Canvas:** Built the core interactive canvas allowing users to plot crucial delivery points (Pitch and Impact).
- **DRS Logic:** Integrated the base Decision Review System (DRS) logic, including review limits and retention rules (e.g., retaining reviews on "Umpire's Call").
- **Outdoor UX:** Designed a high-contrast light theme to maximize visibility and usability outdoors on mobile devices.

## Phase 2: Broadcast-Quality UI & Automation
**Objective:** Elevate the application's interface to match professional IPL broadcast standards and introduce smart automations.
- **Split-Screen Analysis UI:** Transitioned the analysis interface to a professional split-screen layout with enhanced real-time status displays.
- **3-Point Tracking System:** Upgraded the tracking system to include Bowler's Hand, Pitch, and Impact points for a much more realistic trajectory calculation paradigm.
- **Ultra-Edge (Snickometer):** Developed and integrated the dynamic Ultra-Edge waveform feature to simulate audio edge detection visually.
- **Automated Workflows:** Added automated capabilities such as bowler detection simulation and automatic video state cleanup after the over concludes.

## Phase 3: Mobile Access & Network Configuration
**Objective:** Configure the local development environment to allow seamless access from mobile devices for real-world field testing.
- **Vite Configuration:** Validated and configured the Vite development server for local network capability.
- **Public Tunnels (Localtunnel):** Implemented Localtunnel to generate secure public URLs, bypassing strict local network and firewall restrictions.
- **Camera Optimization:** Verified and enforced optimal mobile camera settings on the user end, including EIS (Electronic Image Stabilization) and 60fps recording—critical for capturing high-speed cricket action without blur.

## Phase 4: Refinement & Advanced Analysis UI
**Objective:** Fine-tune the analytical tools and improve the visual accuracy of calibrations.
- **Persistent Calibration System:** Upgraded to a robust calibration system allowing for fine-tuned, manual adjustments that persist across user sessions.
- **Visual Effects:** Added advanced visual elements like the Ball Tracer effect to simulate the ball's movement clearly on-screen.
- **Hit Zone Magnifier:** Introduced a visual magnifier to assist umpires in accurately pinpointing the exact frame and location of ball impact.

## Phase 5: AR Trajectory Engine & Computer Vision Calibration
**Objective:** Solidify the underlying mathematical models and build robust local computer vision tools for AWS ball-tracking.
- **Trajectory Math Engine (`trajectoryMath.js`):** Built the core utility for calculating the Homography Matrix and dynamically determining the final DRS verdict based on the spatial positions.
- **Sequential 4-Point Plotting (`PlottingCanvas.jsx`):** Refined the plotting logic to support the plotting of 4 sequential points (Release, Pitch, Impact, Projected Stumps).
- **Animated Tracer Engine (`animateTracer`):** Programmed smooth, LERP-based animated rendering (using `requestAnimationFrame`) to draw the ball's calculated path dynamically upon full evaluation.
- **HSV Tracking Tuner (`hsv_tuner.py`):** Developed a standalone Python/OpenCV desktop calibration tool equipped with a GUI and interactive trackbars. This utility allows developers to load local video files, live-tune HSV color ranges, and output the optimal binary masks necessary for reliable computer-vision-based ball-tracking.

## Phase 6: Pro Version Upgrades & Cloud Deployment
**Objective:** Upgrade the MVP to professional broadcast standard and establish a robust, automated CI/CD pipeline to deploy the application's frontend and microservice backend to a scalable AWS environment.

### Pro Version Features:
- **Speed Tracking:** Implemented an average speed calculation engine using dynamic frame deltas and the 20.12-meter pitch length constraint to provide real-world km/h metrics alongside tracking.
- **Pitch Heatmap:** Built a resilient HTML5 Canvas `<PitchHeatmap />` component designed to aggregate and save multi-ball over bounce coordinates using browser local storage.
- **Broadcast Overlay:** Designed an isolated, chroma-key ready component (green background) optimized exclusively for native injection as an OBS Studio Browser Source.

### Cloud Deployment:
- **Frontend Hosting (AWS S3 & CloudFront):** Configured automated GitHub Actions (`deploy-frontend.yml`) to build the Vite React PWA and sync build artifacts to an S3 bucket, followed by a CloudFront cache invalidation.
- **Backend Containerization (Docker):** Created a `Dockerfile` for the Python/OpenCV analysis environment to package the trajectory logic and dependencies into a consistent, reproducible image.
- **Serverless Compute (AWS ECR & Lambda):** Defined a backend deployment workflow (`deploy-backend.yml`) to push the Docker image to Amazon Elastic Container Registry (ECR) and subsequently update the core AWS Lambda function code to execute the computer-vision tasks serverlessly.
- **Security & IAM Management:** Documented the strict AWS IAM policies (e.g., `AmazonS3FullAccess`, `AmazonEC2ContainerRegistryPowerUser`) and GitHub repository secrets required in `README_DEVOPS.md` to ensure secure, restricted deployment automation.

