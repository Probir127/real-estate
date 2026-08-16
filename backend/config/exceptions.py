"""
Custom exception handler for Django REST Framework.

Returns consistent JSON error responses across all endpoints:
{
    "success": false,
    "message": "Human-readable summary",
    "errors": { "field": ["error detail"] }   ← only for validation errors
}
"""
from rest_framework.views import exception_handler
from rest_framework.response import Response
from rest_framework import status


def custom_exception_handler(exc, context):
    # Let DRF do its default processing first
    response = exception_handler(exc, context)

    if response is not None:
        data = response.data
        custom = {'success': False}

        # Field-level validation errors (ValidationError from serializers)
        if isinstance(data, dict):
            if 'detail' in data:
                # Single detail message (e.g., authentication failure)
                custom['message'] = str(data['detail'])
            elif 'non_field_errors' in data:
                custom['message'] = data['non_field_errors'][0] if data['non_field_errors'] else 'Validation error.'
                custom['errors'] = data
            else:
                # Multiple field errors
                first_field = next(iter(data), None)
                if first_field:
                    val = data[first_field]
                    custom['message'] = (val[0] if isinstance(val, list) else str(val))
                else:
                    custom['message'] = 'An error occurred.'
                custom['errors'] = data
        elif isinstance(data, list):
            custom['message'] = data[0] if data else 'An error occurred.'
        else:
            custom['message'] = str(data)

        response.data = custom

    return response
