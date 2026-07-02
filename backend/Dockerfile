FROM python:3.12-slim

WORKDIR /app

ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1
ENV ENVIRONMENT=production
ENV DEBUG=false

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt gunicorn

COPY . .

EXPOSE 8000

CMD ["gunicorn", "app.main:app", "-k", "uvicorn.workers.UvicornWorker", "-b", "0.0.0.0:8000", "-w", "2"]
