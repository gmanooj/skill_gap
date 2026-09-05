import jwt
from django.conf import settings
from django.http import JsonResponse
from functools import wraps

JWT_SECRET = getattr(settings, 'JWT_SECRET', 'skill_gap_analyzer_jwt_super_secure_secret_2026_key')

class JWTUser:
    def __init__(self, student_id, email, name, role):
        self.student_id = student_id
        self.id = student_id
        self.email = email
        self.name = name
        self.role = role
        self.is_authenticated = True

    @property
    def is_admin(self):
        return self.role == 'admin'

    def __str__(self):
        return f"{self.name} ({self.email}) [{self.role}]"

def extract_jwt_user(request):
    auth_header = request.headers.get('Authorization', '')
    if not auth_header or not auth_header.startswith('Bearer '):
        return None

    token = auth_header.split(' ')[1].strip()
    if not token:
        return None

    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=['HS256'])
        return JWTUser(
            student_id=payload.get('student_id'),
            email=payload.get('email'),
            name=payload.get('name'),
            role=payload.get('role', 'student')
        )
    except (jwt.ExpiredSignatureError, jwt.InvalidTokenError):
        return None

class JWTAuthenticationMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        jwt_user = extract_jwt_user(request)
        if jwt_user:
            request.jwt_user = jwt_user
            request.user = jwt_user
        return self.get_response(request)

def jwt_required(view_func):
    @wraps(view_func)
    def wrapper(request, *args, **kwargs):
        jwt_user = extract_jwt_user(request)
        if not jwt_user:
            return JsonResponse({
                'success': False,
                'message': 'Valid authorization bearer token is required.'
            }, status=401)
        request.user = jwt_user
        return view_func(request, *args, **kwargs)
    return wrapper

def admin_required(view_func):
    @wraps(view_func)
    def wrapper(request, *args, **kwargs):
        jwt_user = extract_jwt_user(request)
        if not jwt_user or jwt_user.role != 'admin':
            return JsonResponse({
                'success': False,
                'message': 'Access denied: Administrator privileges required.'
            }, status=403)
        request.user = jwt_user
        return view_func(request, *args, **kwargs)
    return wrapper
