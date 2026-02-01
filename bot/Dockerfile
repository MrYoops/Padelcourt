# Build from project root: docker build -f bot/Dockerfile .
FROM python:3.11-slim

WORKDIR /app
COPY bot/requirements.txt ./bot/
RUN pip install --no-cache-dir -r bot/requirements.txt
COPY bot/ ./bot/
ENV PYTHONPATH=/app
EXPOSE 8080
CMD ["python", "-m", "bot.main"]
