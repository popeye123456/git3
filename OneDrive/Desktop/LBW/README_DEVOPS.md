# LBW Assistant DevOps Guide

This document tracks the manual configurations required to securely connect the GitHub CI/CD automations to the AWS environment.

## 1. AWS IAM Requirements

Create a programmatic IAM User (or IAM Role for Identity Provider) for GitHub Actions with the following scope constraints:

- `AmazonS3FullAccess` (Restricted via ARNs to `arn:aws:s3:::lbw-video-uploads` and the frontend hosting bucket)
- `AmazonEC2ContainerRegistryPowerUser` (To allow Docker push/pull layer interactions with Amazon ECR)
- `CloudFrontInvalidationPolicy` (A custom inline policy allowing `cloudfront:CreateInvalidation` on the frontend distribution ID)
- `AWSLambda_FullAccess` (Or strictly scoped to `lambda:UpdateFunctionCode` targeting the specific backend LBW function)

## 2. GitHub Secrets Checklist

Navigate to your GitHub Repository -> **Settings** -> **Secrets and variables** -> **Actions**. Add the following repository secrets:

- [ ] `AWS_ACCESS_KEY_ID`: Your IAM user's access key ID.
- [ ] `AWS_SECRET_ACCESS_KEY`: Your IAM user's secret access key credential.
- [ ] `AWS_REGION`: The deployment region (e.g., `us-east-1`).
- [ ] `S3_FRONTEND_BUCKET`: The name of the S3 bucket hosting the React static PWA artifacts.
- [ ] `CLOUDFRONT_DISTRIBUTION_ID`: The UUID of the CloudFront distribution actively caching the frontend bucket.
- [ ] `ECR_REPOSITORY_NAME`: The name of your backend Docker container registry (e.g., `lbw-backend`).
- [ ] `LAMBDA_FUNCTION_NAME`: The exact generated IAM/Console name of the core Lambda function running the logic.
