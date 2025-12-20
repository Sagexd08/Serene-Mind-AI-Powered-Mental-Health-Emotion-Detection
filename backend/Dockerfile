# Use AWS Lambda Python base image
FROM public.ecr.aws/lambda/python:3.11

# Install system dependencies
RUN yum install -y gcc gcc-c++ make libgomp && yum clean all

# Copy requirements
COPY requirements-lambda.txt ${LAMBDA_TASK_ROOT}/
COPY requirements-ml.txt ${LAMBDA_TASK_ROOT}/

# Install Python dependencies
RUN pip install --no-cache-dir -r ${LAMBDA_TASK_ROOT}/requirements-lambda.txt
RUN pip install --no-cache-dir -r ${LAMBDA_TASK_ROOT}/requirements-ml.txt

# Copy application code
COPY main.py database.py risk_engine.py auth.py api_keys.py ${LAMBDA_TASK_ROOT}/

# Copy ML models (if pre-downloaded)
# COPY ml_models/ ${LAMBDA_TASK_ROOT}/ml_models/

# Set the CMD to your handler
CMD [ "main.handler" ]
