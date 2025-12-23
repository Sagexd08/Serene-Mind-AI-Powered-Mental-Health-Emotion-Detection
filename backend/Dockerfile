FROM public.ecr.aws/lambda/python:3.11

# Install system dependencies (needed for librosa/soundfile/opencv)
# libgl1 is for opencv, libsndfile1 for audio
RUN yum install -y \
    libsndfile \
    mesa-libGL \
    git \
    && yum clean all

COPY requirements.txt ${LAMBDA_TASK_ROOT}

RUN pip install --no-cache-dir -r requirements.txt \
    --extra-index-url https://download.pytorch.org/whl/cpu
COPY . ${LAMBDA_TASK_ROOT}
CMD [ "main.handler" ]
