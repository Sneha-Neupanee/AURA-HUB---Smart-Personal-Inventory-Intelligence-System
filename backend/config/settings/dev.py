from .base import *  # noqa

DEBUG = True

ALLOWED_HOSTS = ["*"]

# Use same PostgreSQL in dev via Docker, but allow SQLite override
DATABASES = {
    "default": {
        "ENGINE": "django.db.backends.postgresql",
        "NAME": config("DB_NAME", default="aura_hub"),
        "USER": config("DB_USER", default="postgres"),
        "PASSWORD": config("DB_PASSWORD", default="postgres"),
        "HOST": config("DB_HOST", default="localhost"),
        "PORT": config("DB_PORT", default="5432"),
    }
}

from decouple import config  # noqa
