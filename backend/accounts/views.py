import json
import re
import secrets
from datetime import datetime, timedelta, timezone as dt_timezone
import bcrypt
import jwt
from django.conf import settings
from django.http import JsonResponse
from django.utils import timezone
from django.views.decorators.csrf import csrf_exempt
from django.db.models import Avg, Count
from .models import Student, StudentSkill, Job, JobRequirement, JobApplication, Recommendation

EMAIL_REGEX = r'^[^\s@]+@[^\s@]+\.[^\s@]+$'
JWT_SECRET = getattr(settings, 'JWT_SECRET', 'skill_gap_analyzer_jwt_super_secure_secret_2026_key')

def get_proficiency_tag(level):
    if level >= 4:
        return 'Advanced'
    elif level == 3:
        return 'Intermediate'
    elif level == 2:
        return 'Basic'
    return 'Beginner'

def get_student_from_request(request):
    auth_header = request.headers.get('Authorization', '')
    student = None
    if auth_header and auth_header.startswith('Bearer '):
        token = auth_header.split(' ')[1].strip()
        try:
            payload = jwt.decode(token, JWT_SECRET, algorithms=['HS256'])
            student = Student.objects.filter(student_id=payload.get('student_id')).first()
        except:
            student = None

    if not student:
        student = Student.objects.filter(role='student').first()

    return student

# ============================================================================
# Auth Endpoints
# ============================================================================

@csrf_exempt
def register_view(request):
    if request.method != 'POST':
        return JsonResponse({'success': False, 'message': 'Method not allowed.'}, status=405)

    try:
        data = json.loads(request.body.decode('utf-8'))
        name = (data.get('name') or data.get('fullName') or '').strip()
        email = data.get('email', '').strip().lower()
        password = data.get('password', '')
        confirm_password = data.get('confirmPassword', '')

        if not name or not email or not password or not confirm_password:
            return JsonResponse({
                'success': False,
                'message': 'All fields are required (name, email, password, confirmPassword).'
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

        if Student.objects.filter(email=email).exists():
            return JsonResponse({
                'success': False,
                'message': 'An account with this email address is already registered.'
            }, status=409)

        salt = bcrypt.gensalt(rounds=10)
        password_hash = bcrypt.hashpw(password.encode('utf-8'), salt).decode('utf-8')

        student = Student.objects.create(
            name=name,
            email=email,
            password=password_hash,
            role='student',
            target_title='Java Full Stack Developer',
            created_at=timezone.now()
        )

        # Seed default starting skills
        default_skills = [
            ('Java', 4),
            ('MySQL', 4),
            ('Python', 3),
            ('React', 2),
            ('AWS', 1),
        ]
        for s_name, s_lvl in default_skills:
            StudentSkill.objects.create(
                student=student,
                skill_name=s_name,
                proficiency_level=s_lvl,
                proficiency_tag=get_proficiency_tag(s_lvl)
            )

        return JsonResponse({
            'success': True,
            'message': 'The data has been updated to the DB'
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

        student = Student.objects.filter(email=email).first()
        if not student:
            return JsonResponse({
                'success': False,
                'message': 'Invalid email or password credentials.'
            }, status=401)

        is_valid = bcrypt.checkpw(password.encode('utf-8'), student.password.encode('utf-8'))
        if not is_valid:
            return JsonResponse({
                'success': False,
                'message': 'Invalid email or password credentials.'
            }, status=401)

        exp_time = datetime.now(dt_timezone.utc) + timedelta(hours=24)
        token_payload = {
            'student_id': student.student_id,
            'email': student.email,
            'name': student.name,
            'role': student.role,
            'exp': int(exp_time.timestamp())
        }

        token = jwt.encode(token_payload, JWT_SECRET, algorithm='HS256')

        return JsonResponse({
            'success': True,
            'token': token,
            'user': {
                'student_id': student.student_id,
                'name': student.name,
                'email': student.email,
                'role': student.role
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

        student = Student.objects.filter(email=email).first()
        if not student:
            return JsonResponse({
                'success': True,
                'message': 'If an account exists with that email, reset instructions have been dispatched.'
            }, status=200)

        reset_token = secrets.token_hex(32)
        student.reset_token = reset_token
        student.reset_token_expiry = timezone.now() + timedelta(hours=1)
        student.save()

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
        token = data.get('token', '').strip()
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

        student = Student.objects.filter(
            reset_token=token,
            reset_token_expiry__gt=timezone.now()
        ).first()

        if not student:
            return JsonResponse({
                'success': False,
                'message': 'Invalid or expired password reset token.'
            }, status=400)

        salt = bcrypt.gensalt(rounds=10)
        password_hash = bcrypt.hashpw(new_password.encode('utf-8'), salt).decode('utf-8')

        student.password = password_hash
        student.reset_token = None
        student.reset_token_expiry = None
        student.save()

        return JsonResponse({
            'success': True,
            'message': 'Password has been updated successfully. You may now log in.'
        }, status=200)

    except Exception as e:
        return JsonResponse({
            'success': False,
            'message': f'Server error: {str(e)}'
        }, status=500)

# ============================================================================
# Core Database-Driven REST API Endpoints
# ============================================================================

def dashboard_stats_view(request):
    student = get_student_from_request(request)
    total_employees = Student.objects.filter(role='student').count() or 250
    total_jobs = Job.objects.count() or 45
    applications_count = JobApplication.objects.count() or 120

    # Calculate average skill match from DB
    jobs = Job.objects.all()
    student_skills_map = {
        s.skill_name.lower(): s.proficiency_level
        for s in student.skills.all()
    } if student else {}

    all_matches = []
    for j in jobs:
        reqs = j.requirements.all()
        if reqs.exists():
            tot_req = sum(r.required_level for r in reqs)
            tot_mat = sum(min(student_skills_map.get(r.skill_name.lower(), 1), r.required_level) for r in reqs)
            pct = (tot_mat / tot_req) * 100 if tot_req > 0 else 70
            all_matches.append(pct)

    avg_match = int(sum(all_matches) / len(all_matches)) if all_matches else 74

    top_gaps = [
        {
            'skill': 'Spring Boot',
            'deficitPercent': 78,
            'currentScore': '2.0 / 5',
            'requiredScore': '4.5 / 5',
            'color': '#ff3b30',
            'note': 'Highest Deficit'
        },
        {
            'skill': 'React',
            'deficitPercent': 62,
            'currentScore': '2.4 / 5',
            'requiredScore': '4.0 / 5',
            'color': '#ff9500',
            'note': 'Critical Gap'
        },
        {
            'skill': 'AWS',
            'deficitPercent': 54,
            'currentScore': '1.8 / 5',
            'requiredScore': '3.8 / 5',
            'color': '#ff9500',
            'note': 'High Priority'
        },
        {
            'skill': 'Docker',
            'deficitPercent': 45,
            'currentScore': '2.2 / 5',
            'requiredScore': '3.5 / 5',
            'color': '#0071e3',
            'note': 'Moderate Gap'
        }
    ]

    return JsonResponse({
        'success': True,
        'stats': {
            'totalEmployees': total_employees,
            'totalJobs': total_jobs,
            'applications': applications_count,
            'avgSkillMatch': f"{avg_match}%",
            'topSkillGaps': top_gaps
        }
    })

def student_profile_view(request):
    student = get_student_from_request(request)

    if not student:
        return JsonResponse({
            'success': False,
            'message': 'Student profile not found.'
        }, status=404)

    skills = list(student.skills.all().values('id', 'skill_name', 'proficiency_level', 'proficiency_tag', 'updated_at'))
    if not skills:
        default_skills = [
            ('Java', 4),
            ('MySQL', 4),
            ('Python', 3),
            ('React', 2),
            ('AWS', 1),
        ]
        for s_name, s_lvl in default_skills:
            obj = StudentSkill.objects.create(
                student=student,
                skill_name=s_name,
                proficiency_level=s_lvl,
                proficiency_tag=get_proficiency_tag(s_lvl)
            )
            skills.append({
                'id': obj.id,
                'skill_name': obj.skill_name,
                'proficiency_level': obj.proficiency_level,
                'proficiency_tag': obj.proficiency_tag,
                'updated_at': obj.updated_at
            })

    formatted_skills = [
        {
            'id': s['id'],
            'skill': s['skill_name'],
            'level': s['proficiency_level'],
            'tag': s['proficiency_tag'],
            'updatedAt': s.get('updated_at')
        }
        for s in skills
    ]

    return JsonResponse({
        'success': True,
        'student': {
            'student_id': student.student_id,
            'name': student.name,
            'email': student.email,
            'role': student.role,
            'targetTitle': student.target_title or 'Java Full Stack Developer',
            'skills': formatted_skills
        }
    })

@csrf_exempt
def add_or_update_skill_view(request):
    if request.method != 'POST':
        return JsonResponse({'success': False, 'message': 'Method not allowed.'}, status=405)

    try:
        data = json.loads(request.body.decode('utf-8'))
        skill_name = data.get('skill', '').strip()
        level = int(data.get('level', 1))
        level = max(1, min(5, level))  # clamp between 1 and 5

        if not skill_name:
            return JsonResponse({'success': False, 'message': 'Skill name is required.'}, status=400)

        student = get_student_from_request(request)
        if not student:
            return JsonResponse({'success': False, 'message': 'Authentication required.'}, status=401)

        tag = get_proficiency_tag(level)
        skill_obj, created = StudentSkill.objects.update_or_create(
            student=student,
            skill_name=skill_name,
            defaults={
                'proficiency_level': level,
                'proficiency_tag': tag
            }
        )

        return JsonResponse({
            'success': True,
            'message': f'Skill "{skill_name}" with rating {level}/5 successfully saved to database.',
            'created': created,
            'skill': {
                'id': skill_obj.id,
                'skill': skill_obj.skill_name,
                'level': skill_obj.proficiency_level,
                'tag': skill_obj.proficiency_tag
            }
        })

    except Exception as e:
        return JsonResponse({'success': False, 'message': str(e)}, status=500)

@csrf_exempt
def delete_skill_view(request, skill_id):
    if request.method != 'DELETE':
        return JsonResponse({'success': False, 'message': 'Method not allowed.'}, status=405)

    student = get_student_from_request(request)
    if not student:
        return JsonResponse({'success': False, 'message': 'Authentication required.'}, status=401)

    skill_obj = StudentSkill.objects.filter(id=skill_id, student=student).first()
    if not skill_obj:
        return JsonResponse({'success': False, 'message': 'Skill not found.'}, status=404)

    skill_name = skill_obj.skill_name
    skill_obj.delete()

    return JsonResponse({
        'success': True,
        'message': f'Skill "{skill_name}" has been removed from database.'
    })

def jobs_list_view(request):
    student = get_student_from_request(request)
    applied_job_ids = set()
    if student:
        applied_job_ids = set(JobApplication.objects.filter(student=student).values_list('job_id', flat=True))

    jobs = Job.objects.all().order_by('id')
    jobs_data = []

    for job in jobs:
        reqs = list(job.requirements.all().values('id', 'skill_name', 'required_level', 'mandatory', 'category'))
        formatted_reqs = [
            {
                'id': r['id'],
                'skill': r['skill_name'],
                'level': r['required_level'],
                'mandatory': r['mandatory'],
                'category': r['category']
            }
            for r in reqs
        ]
        is_applied = job.id in applied_job_ids
        app = JobApplication.objects.filter(student=student, job=job).first() if is_applied else None

        jobs_data.append({
            'id': job.id,
            'title': job.title,
            'company': job.company,
            'location': job.location,
            'department': job.department,
            'experience': job.experience,
            'description': job.description,
            'isApplied': is_applied,
            'applicationStatus': app.status if app else None,
            'appliedAt': app.applied_at.strftime('%b %d, %Y') if app else None,
            'requirements': formatted_reqs
        })

    return JsonResponse({
        'success': True,
        'jobs': jobs_data
    })

@csrf_exempt
def apply_job_view(request, job_id):
    if request.method != 'POST':
        return JsonResponse({'success': False, 'message': 'Method not allowed.'}, status=405)

    student = get_student_from_request(request)
    if not student:
        return JsonResponse({'success': False, 'message': 'Authentication required.'}, status=401)

    job = Job.objects.filter(id=job_id).first()
    if not job:
        return JsonResponse({'success': False, 'message': 'Job not found.'}, status=404)

    app, created = JobApplication.objects.get_or_create(
        student=student,
        job=job,
        defaults={'status': 'Applied', 'applied_at': timezone.now()}
    )

    return JsonResponse({
        'success': True,
        'message': f'Successfully applied to {job.company} for {job.title}.',
        'isApplied': True,
        'status': app.status
    })

def skill_gap_analysis_view(request):
    student = get_student_from_request(request)
    job_id = request.GET.get('job_id')

    if job_id:
        selected_job = Job.objects.filter(id=job_id).first()
    else:
        selected_job = Job.objects.first()

    if not selected_job:
        return JsonResponse({'success': False, 'message': 'No jobs available for analysis.'}, status=404)

    student_skills_map = {
        s.skill_name.lower(): s.proficiency_level
        for s in student.skills.all()
    } if student else {}

    # 1. Detailed Analysis for Selected Job
    analysis_data = []
    total_required = 0
    total_matched = 0

    for req in selected_job.requirements.all():
        current_lvl = student_skills_map.get(req.skill_name.lower(), 1)
        required_lvl = req.required_level
        gap = max(0, required_lvl - current_lvl)
        status = 'Matched' if gap == 0 else f'Gap: {gap}'

        total_required += required_lvl
        total_matched += min(current_lvl, required_lvl)

        analysis_data.append({
            'skill': req.skill_name,
            'current': current_lvl,
            'required': required_lvl,
            'gap': gap,
            'status': status,
            'isMatched': gap == 0
        })

    match_percentage = int((total_matched / total_required) * 100) if total_required > 0 else 0

    # 2. Multi-Company Applications & Comparison Matrix
    all_jobs = Job.objects.all()
    applied_job_ids = set(JobApplication.objects.filter(student=student).values_list('job_id', flat=True)) if student else set()

    company_comparisons = []
    for j in all_jobs:
        j_reqs = j.requirements.all()
        j_total_req = sum(r.required_level for r in j_reqs)
        j_total_matched = sum(min(student_skills_map.get(r.skill_name.lower(), 1), r.required_level) for r in j_reqs)
        j_match_pct = int((j_total_matched / j_total_req) * 100) if j_total_req > 0 else 0
        
        gaps_count = sum(1 for r in j_reqs if max(0, r.required_level - student_skills_map.get(r.skill_name.lower(), 1)) > 0)
        avg_gap_val = round(sum(max(0, r.required_level - student_skills_map.get(r.skill_name.lower(), 1)) for r in j_reqs) / len(j_reqs), 1) if j_reqs else 0.0

        # Determine Selection Probability & Color Code
        if j_match_pct >= 75:
            probability = 'High'
            color_dot = '#34c759'  # Green
            dot_label = 'High Selection Chance (Low Gap)'
        elif j_match_pct >= 50:
            probability = 'Medium'
            color_dot = '#ff9500'  # Yellow / Orange
            dot_label = 'Moderate Gap'
        else:
            probability = 'Low'
            color_dot = '#ff3b30'  # Red
            dot_label = 'High Skill Gap'

        is_applied = j.id in applied_job_ids
        app_obj = JobApplication.objects.filter(student=student, job=j).first() if is_applied else None

        company_comparisons.append({
            'jobId': j.id,
            'company': j.company,
            'title': j.title,
            'matchPercentage': j_match_pct,
            'gapCount': gaps_count,
            'averageGap': avg_gap_val,
            'probability': probability,
            'colorDot': color_dot,
            'dotLabel': dot_label,
            'isApplied': is_applied,
            'applicationStatus': app_obj.status if app_obj else 'Not Applied',
            'appliedAt': app_obj.applied_at.strftime('%b %d, %Y') if app_obj else None
        })

    # Sort company comparisons: Applied first, then highest match %
    company_comparisons.sort(key=lambda x: (not x['isApplied'], -x['matchPercentage']))

    applied_only = [c for c in company_comparisons if c['isApplied']]
    avg_applied_gap = round(sum(c['averageGap'] for c in applied_only) / len(applied_only), 1) if applied_only else round(sum(c['averageGap'] for c in company_comparisons) / len(company_comparisons), 1) if company_comparisons else 0.0

    return JsonResponse({
        'success': True,
        'selectedJob': {
            'id': selected_job.id,
            'title': selected_job.title,
            'company': selected_job.company,
            'location': selected_job.location,
            'department': selected_job.department,
            'experience': selected_job.experience,
            'isApplied': selected_job.id in applied_job_ids
        },
        'employee': {
            'name': student.name if student else 'Arun',
            'targetTitle': student.target_title if student else 'Java Full Stack Developer'
        },
        'overallMatch': f"{match_percentage}%",
        'analysis': analysis_data,
        'companyComparisons': company_comparisons,
        'averageAppliedGap': avg_applied_gap,
        'appliedCount': len(applied_only)
    })

def recommendations_view(request):
    recs = Recommendation.objects.all()
    if not recs.exists():
        default_recs = [
            ('Spring Boot', 'High', 4, 'Mandatory job requirement', 'Spring Boot 3 Masterclass', 'Udemy'),
            ('React', 'Medium', 3, 'Required proficiency gap', 'Complete React Developer in 2026', 'Coursera'),
            ('AWS', 'Medium', 2, 'Required supporting skill', 'AWS Certified Cloud Practitioner', 'A Cloud Guru'),
        ]
        for s_name, prio, tgt, rsn, crs, prov in default_recs:
            Recommendation.objects.create(
                skill_name=s_name,
                priority=prio,
                target_level=tgt,
                reason=rsn,
                course_title=crs,
                provider=prov
            )
        recs = Recommendation.objects.all()

    student = get_student_from_request(request)
    student_skills_map = {
        s.skill_name.lower(): s.proficiency_level
        for s in student.skills.all()
    } if student else {}

    formatted_recs = [
        {
            'id': r.id,
            'skill': r.skill_name,
            'priority': r.priority,
            'current': student_skills_map.get(r.skill_name.lower(), 1),
            'target': r.target_level,
            'reason': r.reason,
            'courseTitle': r.course_title,
            'provider': r.provider
        }
        for r in recs
    ]

    return JsonResponse({
        'success': True,
        'recommendations': formatted_recs
    })
