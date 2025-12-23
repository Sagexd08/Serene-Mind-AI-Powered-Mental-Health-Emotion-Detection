FROM public.ecr.aws/lambda/python:3.10
RUN yum update -y && \
    yum install -y \
    libsndfile \
    mesa-libGL \
    git \
    gcc \
    gcc-c++ \
    make \
    cmake \
    unzip \
    tar \
    gzip \
    && yum clean all

# Upgrade pip
RUN pip install --upgrade pip

COPY requirements.txt ${LAMBDA_TASK_ROOT}

RUN pip install --no-cache-dir -r requirements.txt \
    --extra-index-url https://download.pytorch.org/whl/cpu
COPY . ${LAMBDA_TASK_ROOT}
CMD [ "main.handler" ]
