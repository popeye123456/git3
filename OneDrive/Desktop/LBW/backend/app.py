import os
import json
import boto3
import urllib.parse
from lbw_tracker import analyze_video
from trajectory_math import calculate_trajectory_verdict, calculate_average_speed

s3_client = boto3.client('s3')

def lambda_handler(event, context):
    """
    AWS Lambda entry point. Triggered by S3 ObjectCreated events.
    Downloads the video, processes the tracking, mathematically verifies LBW,
    and returns a JSON verdict payload.
    """
    try:
        # Extract S3 bucket and object key from the event payload
        record = event['Records'][0]
        bucket = record['s3']['bucket']['name']
        key = urllib.parse.unquote_plus(record['s3']['object']['key'], encoding='utf-8')
        
        download_path = f'/tmp/{os.path.basename(key)}'
        
        print(f"Downloading tracking target s3://{bucket}/{key} to {download_path}")
        s3_client.download_file(bucket, key, download_path)
        
        # 1. Computer Vision Pipeline Execution
        print("Starting Automated Video Tracking Analysis...")
        tracking_data = analyze_video(download_path)
        
        # 2. Physics & Mathematics Pipeline Execution
        print("Processing LBW 2D Parabolic Intersection physics...")
        verdict_data = calculate_trajectory_verdict(
            tracking_data["release_point"],
            tracking_data["pitch_point"],
            tracking_data["impact_point"],
            tracking_data["stumps_y"],
            tracking_data["stumps_x_range"]
        )
        
        # Subject Matter: Speed Tracking
        speed_kmh = calculate_average_speed(tracking_data.get("frames_between_release_and_pitch", 0))
        
        # Cleanup
        if os.path.exists(download_path):
            os.remove(download_path)
            
        response_payload = {
            "statusCode": 200,
            "body": json.dumps({
                "video_file": key,
                "tracking_coordinates": tracking_data,
                "drs_verdict": verdict_data,
                "speed_kmh": speed_kmh,
                "pitch_coordinates_xy": tracking_data.get("pitch_coordinates_xy")
            })
        }
        
        print(f"Final AWS Backend Verdict Resolved: {verdict_data['verdict']}")
        return response_payload

    except Exception as e:
        print(f"AWS Processing Error: {str(e)}")
        return {
            "statusCode": 500,
            "body": json.dumps({"error": str(e)})
        }
