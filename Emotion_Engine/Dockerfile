# Dockerfile
FROM nvcr.io/nvidia/pytorch:24.11-py3

ENV PYTHONUNBUFFERED=1 \
    LC_ALL=C.UTF-8 \
    LANG=C.UTF-8 \
    GRPC_PORT=50051 \
    HTTP_PORT=8080 \
    MAX_BATCH=8 \
    MAX_WAIT_MS=50 \
    MODE=production

WORKDIR /app

COPY . /app

RUN python -m pip install --upgrade pip setuptools wheel \
 && pip install --no-cache-dir -r requirements.txt \
 && python -m grpc_tools.protoc -I. --python_out=. --grpc_python_out=. proto/interface.proto

EXPOSE ${GRPC_PORT} ${HTTP_PORT}

RUN groupadd -r app && useradd -r -g app -d /app -s /sbin/nologin app \
 && chown -R app:app /app
USER app

# Entrypoint
ENV PYTHONPATH=/app
CMD ["python", "worker/service.py"]
