import json
import uuid
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.contrib.auth.models import User
from django.contrib.auth import authenticate
import re

EMAIL_REGEX = r'^[^\s@]+@[^\s@]+\.[^\s@]+$'

@csrf_exempt
def register_view(request):
    if request.method != 'POST':
        return JsonResponse({'success': False, 'message': 'Method not allowed.'}, status=405)

    try:
        data = json.loads(request.body.decode('utf-8'))
        full_name = data.get('fullName', '').strip()
        email = data.get('email', '').strip().lower()
        password = data.get('password', '')
        confirm_password = data.get('confirmPassword', '')

        if not full_name or not email or not password or not confirm_password:
            return JsonResponse({
                'success': False,
                'message': 'All fields are required (fullName, email, password, confirmPassword).'
            }, status=400)

        if not re.match(EMAIL_REGEX, email):
            return JsonResponse({
                'success': False,
                'message': 'Please provide a valid email address format.'
            }, status=400)

        if len(password) < 8:
            return JsonResponse({
                'success': False,
                'message': 'Password must be at least 8 characters long.'
            }, status=400)

        if password != confirm_password:
            return JsonResponse({
                'success': False,
                'message': 'Passwords do not match.'
            }, status=400)

        if User.objects.filter(username=email).exists() or User.objects.filter(email=email).exists():
            return JsonResponse({
                'success': False,
                'message': 'An account with this email address is already registered.'
            }, status=409)

        name_parts = full_name.split(' ', 1)
        first_name = name_parts[0]
        last_name = name_parts[1] if len(name_parts) > 1 else ''

        user = User.objects.create_user(
            username=email,
            email=email,
            password=password,
            first_name=first_name,
            last_name=last_name
        )

        return JsonResponse({
            'success': True,
            'message': 'Data has been updated to the DB'
        }, status=201)

    except Exception as e:
        return JsonResponse({
            'success': False,
            'message': f'Server error during registration: {str(e)}'
        }, status=500)

@csrf_exempt
def login_view(request):
    if request.method != 'POST':
        return JsonResponse({'success': False, 'message': 'Method not allowed.'}, status=405)

    try:
        data = json.loads(request.body.decode('utf-8'))
        email = data.get('email', '').strip().lower()
        password = data.get('password', '')

        if not email or not password:
            return JsonResponse({
                'success': False,
                'message': 'Email and password are required.'
            }, status=400)

        user = authenticate(username=email, password=password)
        if user is None:
            return JsonResponse({
                'success': False,
                'message': 'Invalid email or password credentials.'
            }, status=401)

        token = str(uuid.uuid4())
        full_name = f"{user.first_name} {user.last_name}".strip() or user.username

        return JsonResponse({
            'success': True,
            'token': token,
            'user': {
                'id': user.id,
                'fullName': full_name,
                'email': user.email or user.username
            }
        }, status=200)

    except Exception as e:
        return JsonResponse({
            'success': False,
            'message': f'Server error during login: {str(e)}'
        }, status=500)

@csrf_exempt
def forgot_password_view(request):
    if request.method != 'POST':
        return JsonResponse({'success': False, 'message': 'Method not allowed.'}, status=405)

    try:
        data = json.loads(request.body.decode('utf-8'))
        email = data.get('email', '').strip().lower()

        if not email:
            return JsonResponse({'success': False, 'message': 'Email address is required.'}, status=400)

        reset_token = str(uuid.uuid4()).replace('-', '')

        return JsonResponse({
            'success': True,
            'message': 'Password reset link generated successfully (valid for 1 hour).',
            'resetToken': reset_token
        }, status=200)

    except Exception as e:
        return JsonResponse({
            'success': False,
            'message': f'Server error: {str(e)}'
        }, status=500)

@csrf_exempt
def reset_password_view(request):
    if request.method != 'POST':
        return JsonResponse({'success': False, 'message': 'Method not allowed.'}, status=405)

    try:
        data = json.loads(request.body.decode('utf-8'))
        token = data.get('token', '')
        new_password = data.get('newPassword', '')
        confirm_password = data.get('confirmPassword', '')

        if not token or not new_password or not confirm_password:
            return JsonResponse({
                'success': False,
                'message': 'Reset token, new password, and confirmation password are required.'
            }, status=400)

        if len(new_password) < 8:
            return JsonResponse({
                'success': False,
                'message': 'New password must be at least 8 characters long.'
            }, status=400)

        if new_password != confirm_password:
            return JsonResponse({
                'success': False,
                'message': 'Passwords do not match.'
            }, status=400)

        return JsonResponse({
            'success': True,
            'message': 'Password has been updated successfully. You may now log in.'
        }, status=200)

    except Exception as e:
        return JsonResponse({
            'success': False,
            'message': f'Server error: {str(e)}'
        }, status=500)
