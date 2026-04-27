from .base import *  # noqa
from decouple import config, Csv  # noqa

DEBUG = False

ALLOWED_HOSTS = config("ALLOWED_HOSTS", default="localhost", cast=Csv())

# Security hardening
SECURE_BROWSER_XSS_FILTER = True
SECURE_CONTENT_TYPE_NOSNIFF = True
X_FRAME_OPTIONS = "DENY"
SESSION_COOKIE_SECURE = True
CSRF_COOKIE_SECURE = True
