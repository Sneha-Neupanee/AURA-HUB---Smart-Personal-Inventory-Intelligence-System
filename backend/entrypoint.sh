#!/bin/sh
# ============================================================
# AURA HUB — Docker Entrypoint Script
# Waits for PostgreSQL, runs migrations, starts Gunicorn
# ============================================================
set -e

echo "⏳ Waiting for PostgreSQL to be ready..."
while ! nc -z "$DB_HOST" "$DB_PORT"; do
  sleep 0.5
done
echo "✅ PostgreSQL is ready."

# If no arguments passed, run standard server startup
if [ $# -eq 0 ]; then
  echo "📦 Running database migrations..."
  python manage.py migrate --noinput

  echo "📁 Collecting static files..."
  python manage.py collectstatic --noinput

  echo "🚀 Starting Gunicorn server..."
  exec gunicorn config.wsgi:application \
    --bind 0.0.0.0:8000 \
    --workers 3 \
    --timeout 120 \
    --log-level info \
    --access-logfile - \
    --error-logfile -
else
  # Otherwise, execute the passed command
  exec "$@"
fi
