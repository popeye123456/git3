# Use AWS standard Python 3.11 Lambda remote base image
FROM public.ecr.aws/lambda/python:3.11

# Provide system dependencies for OpenCV and GLIB execution
RUN yum update -y && \
    yum install -y \
    mesa-libGL \
    glib2 && \
    yum clean all

# Migrate and install Python OS bindings
COPY requirements.txt ${LAMBDA_TASK_ROOT}
RUN pip install --no-cache-dir -r requirements.txt

# Migrate proprietary application tracking pipeline 
COPY app.py ${LAMBDA_TASK_ROOT}
COPY lbw_tracker.py ${LAMBDA_TASK_ROOT}
COPY trajectory_math.py ${LAMBDA_TASK_ROOT}

# Pre-fetch and cache YOLOv11 Pose Model bounds 
# To enforce warm-started container efficiency 
RUN python -c "from ultralytics import YOLO; YOLO('yolo11n-pose.pt')"

# Bind Handler endpoint hook
CMD [ "app.lambda_handler" ]
