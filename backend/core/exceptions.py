from rest_framework.views import exception_handler
from rest_framework.response import Response
from rest_framework import status


def custom_exception_handler(exc, context):
    """
    Custom DRF exception handler — wraps all error responses in a consistent
    { "error": ..., "detail": ... } envelope.
    """
    response = exception_handler(exc, context)

    if response is not None:
        error_data = {
            "error": True,
            "status_code": response.status_code,
            "detail": response.data,
        }
        response.data = error_data

    return response
