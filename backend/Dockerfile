# Use a stable Python base
FROM python:3.11-slim

# Set working directory
WORKDIR /app

# Prevents Python from writing pyc files to disk
ENV PYTHONDONTWRITEBYTECODE=1
# Buffer stdout and stderr (helps with logs)
ENV PYTHONUNBUFFERED=1

# Install OS deps (if any needed). Keep small.
RUN apt-get update && apt-get install -y --no-install-recommends \
  build-essential \
  && rm -rf /var/lib/apt/lists/*

# Copy requirements first (for caching)
COPY requirements.txt .

# Install pip dependencies
RUN pip install --upgrade pip
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY . .

# Expose port used by Flask/gunicorn
EXPOSE 5000

# Health check (optional)
HEALTHCHECK --interval=30s --timeout=5s --start-period=5s \
  CMD curl -f http://127.0.0.1:5000/running-check || exit 1

# Use gunicorn for production serving
# --bind 0.0.0.0:5000   -> listen on container port 5000
# --workers 3           -> small default, tweak as needed
CMD ["gunicorn", "app:app", "--bind", "0.0.0.0:5000", "--workers", "3", "--threads", "2"]
