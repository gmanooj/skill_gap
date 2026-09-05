import json
import re
import secrets
from datetime import datetime, timedelta, timezone as dt_timezone
import bcrypt
import jwt
from django.conf import settings
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from .models import Student, Skill, StudentSkill, Job, JobSkill, Application, Recommendation
from .services import SkillGapService

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
        # Fallback to Arun (student_id=2 or first student)
        student = Student.objects.filter(email='arun@example.com').first() or Student.objects.filter(role='student').first()

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

        # Seed default starting skills from `skills` table
        default_skills = [('Java', '4'), ('MySQL', '4'), ('Python', '3'), ('React', '2'), ('AWS', '1')]
        for s_name, s_lvl in default_skills:
            skill_obj, _ = Skill.objects.get_or_create(name=s_name, defaults={'category': 'Technical'})
            StudentSkill.objects.create(
                student=student,
                skill=skill_obj,
                proficiency=s_lvl
            )

        return JsonResponse({
            'success': True,
            'message': 'Account registered successfully.'
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

        is_valid = False
        try:
            is_valid = bcrypt.checkpw(password.encode('utf-8'), student.password.encode('utf-8'))
        except Exception:
            # Fallback for plain text or legacy password comparison
            is_valid = (password == student.password)

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
    total_employees = Student.objects.filter(role='student').count() or 10
    total_jobs = Job.objects.count() or 3
    applications_count = Application.objects.count() or 2

    # Calculate average skill match from DB
    jobs = Job.objects.prefetch_related('job_skills__skill').all()
    student_skills_map = {
        s.skill.name.lower(): s.proficiency_level
        for s in student.skills.select_related('skill').all()
    } if student else {}

    all_matches = []
    for j in jobs:
        reqs = j.job_skills.all()
        if reqs.exists():
            tot_req = sum(r.level_int for r in reqs)
            tot_mat = sum(min(student_skills_map.get(r.skill.name.lower(), 1), r.level_int) for r in reqs)
            pct = (tot_mat / tot_req) * 100 if tot_req > 0 else 70
            all_matches.append(pct)

    avg_match = int(sum(all_matches) / len(all_matches)) if all_matches else 78

    top_gaps = [
        {
            'skill': 'Spring Boot',
            'deficitPercent': 78,
            'currentScore': '1.0 / 5',
            'requiredScore': '4.0 / 5',
            'color': '#ff3b30',
            'note': 'Highest Deficit'
        },
        {
            'skill': 'React',
            'deficitPercent': 62,
            'currentScore': '2.0 / 5',
            'requiredScore': '4.0 / 5',
            'color': '#ff9500',
            'note': 'Critical Gap'
        },
        {
            'skill': 'AWS',
            'deficitPercent': 54,
            'currentScore': '1.0 / 5',
            'requiredScore': '3.0 / 5',
            'color': '#ff9500',
            'note': 'High Priority'
        },
        {
            'skill': 'Docker',
            'deficitPercent': 45,
            'currentScore': '1.0 / 5',
            'requiredScore': '3.0 / 5',
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

    skills = student.skills.select_related('skill').all()
    formatted_skills = [
        {
            'id': s.id,
            'skill': s.skill.name,
            'level': s.proficiency_level,
            'tag': s.proficiency_tag
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

        skill_obj, _ = Skill.objects.get_or_create(name=skill_name, defaults={'category': 'Technical'})
        
        student_skill, created = StudentSkill.objects.update_or_create(
            student=student,
            skill=skill_obj,
            defaults={'proficiency': str(level)}
        )

        return JsonResponse({
            'success': True,
            'message': f'Skill "{skill_name}" with rating {level}/5 successfully updated to the DB.',
            'created': created,
            'skill': {
                'id': student_skill.id,
                'skill': skill_obj.name,
                'level': student_skill.proficiency_level,
                'tag': student_skill.proficiency_tag
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

    student_skill = StudentSkill.objects.filter(id=skill_id, student=student).first()
    if not student_skill:
        return JsonResponse({'success': False, 'message': 'Skill not found.'}, status=404)

    skill_name = student_skill.skill.name
    student_skill.delete()

    return JsonResponse({
        'success': True,
        'message': f'Skill "{skill_name}" has been removed from database.'
    })

def jobs_list_view(request):
    student = get_student_from_request(request)
    applied_job_ids = set()
    if student:
        applied_job_ids = set(Application.objects.filter(student=student).values_list('job_id', flat=True))

    jobs = Job.objects.prefetch_related('job_skills__skill').all().order_by('job_id')
    jobs_data = []

    for job in jobs:
        reqs = job.job_skills.all()
        formatted_reqs = [
            {
                'id': r.id,
                'skill': r.skill.name,
                'level': r.level_int,
                'mandatory': r.mandatory,
                'category': r.skill.category
            }
            for r in reqs
        ]
        is_applied = job.job_id in applied_job_ids
        app = Application.objects.filter(student=student, job=job).first() if is_applied else None

        jobs_data.append({
            'id': job.job_id,
            'title': job.title,
            'company': job.company,
            'location': job.location,
            'department': job.department,
            'experience': job.experience,
            'description': job.description,
            'isApplied': is_applied,
            'applicationStatus': app.status if app else None,
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

    job = Job.objects.filter(job_id=job_id).first()
    if not job:
        return JsonResponse({'success': False, 'message': 'Job not found.'}, status=404)

    app, created = Application.objects.get_or_create(
        student=student,
        job=job,
        defaults={'status': 'Applied', 'match_percent': 78.0}
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
        selected_job = Job.objects.filter(job_id=job_id).first()
    else:
        selected_job = Job.objects.first()

    if not selected_job:
        return JsonResponse({'success': False, 'message': 'No jobs available for analysis.'}, status=404)

    student_skills_map = {
        s.skill.name.lower(): s.proficiency_level
        for s in student.skills.select_related('skill').all()
    } if student else {}

    # 1. Detailed Analysis for Selected Job
    analysis_data = []
    total_required = 0
    total_matched = 0

    for req in selected_job.job_skills.select_related('skill').all():
        current_lvl = student_skills_map.get(req.skill.name.lower(), 1)
        required_lvl = req.level_int
        gap = max(0, required_lvl - current_lvl)
        status = 'Matched' if gap == 0 else f'Gap: {gap}'

        total_required += required_lvl
        total_matched += min(current_lvl, required_lvl)

        analysis_data.append({
            'skill': req.skill.name,
            'current': current_lvl,
            'required': required_lvl,
            'gap': gap,
            'status': status,
            'isMatched': gap == 0
        })

    match_percentage = int((total_matched / total_required) * 100) if total_required > 0 else 0

    # 2. Multi-Company Applications & Comparison Matrix
    all_jobs = Job.objects.prefetch_related('job_skills__skill').all()
    applied_job_ids = set(Application.objects.filter(student=student).values_list('job_id', flat=True)) if student else set()

    company_comparisons = []
    for j in all_jobs:
        j_reqs = j.job_skills.all()
        j_total_req = sum(r.level_int for r in j_reqs)
        j_total_matched = sum(min(student_skills_map.get(r.skill.name.lower(), 1), r.level_int) for r in j_reqs)
        j_match_pct = int((j_total_matched / j_total_req) * 100) if j_total_req > 0 else 0
        
        gaps_count = sum(1 for r in j_reqs if max(0, r.level_int - student_skills_map.get(r.skill.name.lower(), 1)) > 0)
        avg_gap_val = round(sum(max(0, r.level_int - student_skills_map.get(r.skill.name.lower(), 1)) for r in j_reqs) / len(j_reqs), 1) if j_reqs else 0.0

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

        is_applied = j.job_id in applied_job_ids
        app_obj = Application.objects.filter(student=student, job=j).first() if is_applied else None

        company_comparisons.append({
            'jobId': j.job_id,
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
            'appliedAt': 'Recent'
        })

    # Sort company comparisons: Applied first, then highest match %
    company_comparisons.sort(key=lambda x: (not x['isApplied'], -x['matchPercentage']))

    applied_only = [c for c in company_comparisons if c['isApplied']]
    avg_applied_gap = round(sum(c['averageGap'] for c in applied_only) / len(applied_only), 1) if applied_only else round(sum(c['averageGap'] for c in company_comparisons) / len(company_comparisons), 1) if company_comparisons else 0.0

    return JsonResponse({
        'success': True,
        'selectedJob': {
            'id': selected_job.job_id,
            'title': selected_job.title,
            'company': selected_job.company,
            'location': selected_job.location,
            'department': selected_job.department,
            'experience': selected_job.experience,
            'isApplied': selected_job.job_id in applied_job_ids
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
    recs = Recommendation.objects.select_related('skill', 'job').all()
    student = get_student_from_request(request)
    student_skills_map = {
        s.skill.name.lower(): s.proficiency_level
        for s in student.skills.select_related('skill').all()
    } if student else {}

    # 1. Compute Best Recommended Jobs & Placement Chance from Database
    all_jobs = Job.objects.prefetch_related('job_skills__skill').all()
    applied_job_ids = set(Application.objects.filter(student=student).values_list('job_id', flat=True)) if student else set()

    recommended_jobs = []
    for j in all_jobs:
        j_reqs = j.job_skills.all()
        j_total_req = sum(r.level_int for r in j_reqs)
        j_total_matched = sum(min(student_skills_map.get(r.skill.name.lower(), 1), r.level_int) for r in j_reqs)
        j_match_pct = int((j_total_matched / j_total_req) * 100) if j_total_req > 0 else 0

        matched_skills = []
        gap_skills = []
        for r in j_reqs:
            curr = student_skills_map.get(r.skill.name.lower(), 1)
            if curr >= r.level_int:
                matched_skills.append(r.skill.name)
            else:
                gap_skills.append({'skill': r.skill.name, 'current': curr, 'required': r.level_int})

        if j_match_pct >= 75:
            placement_chance = 'High Placement Chance'
            color_badge = '#059669'
            badge_bg = '#ecfdf5'
            border_color = '#a7f3d0'
        elif j_match_pct >= 50:
            placement_chance = 'Moderate Placement Chance'
            color_badge = '#d97706'
            badge_bg = '#fffbeb'
            border_color = '#fde68a'
        else:
            placement_chance = 'Requires Skill Upskilling'
            color_badge = '#6366f1'
            badge_bg = '#eef2ff'
            border_color = '#c7d2fe'

        is_applied = j.job_id in applied_job_ids
        app_obj = Application.objects.filter(student=student, job=j).first() if is_applied else None

        recommended_jobs.append({
            'id': j.job_id,
            'company': j.company,
            'title': j.title,
            'location': j.location,
            'experience': j.experience,
            'department': j.department,
            'matchPercentage': j_match_pct,
            'placementChance': placement_chance,
            'colorBadge': color_badge,
            'badgeBg': badge_bg,
            'borderColor': border_color,
            'matchedSkills': matched_skills,
            'gapSkills': gap_skills,
            'isApplied': is_applied,
            'applicationStatus': app_obj.status if app_obj else 'Not Applied',
            'isTopPick': False
        })

    # Sort by highest match percentage
    recommended_jobs.sort(key=lambda x: x['matchPercentage'], reverse=True)
    if recommended_jobs:
        recommended_jobs[0]['isTopPick'] = True

    # 2. Compute Priority Learning Roadmap
    formatted_recs = []
    for r in recs:
        s_name = r.skill.name if r.skill else 'General Skill'
        curr_val = student_skills_map.get(s_name.lower(), 1)
        tgt_val = 4 if r.priority == 'High' else 3
        formatted_recs.append({
            'id': r.id,
            'skill': s_name,
            'priority': r.priority,
            'current': curr_val,
            'target': tgt_val,
            'reason': r.reason,
            'courseTitle': r.course_title or f'{s_name} Advanced Masterclass',
            'provider': r.provider or 'Coursera / Udemy',
            'placementImpact': f"+{min(20, (tgt_val - curr_val) * 8)}% Placement Readiness"
        })

    # Sort recommendations by highest gap
    formatted_recs.sort(key=lambda x: (x['target'] - x['current']), reverse=True)

    avg_readiness = int(sum(j['matchPercentage'] for j in recommended_jobs) / len(recommended_jobs)) if recommended_jobs else 75

    return JsonResponse({
        'success': True,
        'overallReadiness': f"{avg_readiness}%",
        'bestMatchCompany': recommended_jobs[0]['company'] if recommended_jobs else 'ABC Technologies',
        'bestMatchJobTitle': recommended_jobs[0]['title'] if recommended_jobs else 'Java Full Stack Developer',
        'recommendedJobs': recommended_jobs,
        'recommendations': formatted_recs
    })

# ============================================================================
# Admin Management & Candidate Screening Endpoints
# ============================================================================

def admin_students_list_view(request):
    """
    Returns full student directory with dynamic skills breakdown, 
    match percentages against active jobs, and gap indicators for Amazon-style filtering.
    """
    students = Student.objects.filter(role='student').prefetch_related('skills__skill', 'applications__job').order_by('student_id')
    jobs = Job.objects.prefetch_related('job_skills__skill').all()

    students_data = []
    for st in students:
        skills_map = {s.skill.name: s.proficiency_level for s in st.skills.all()}
        
        # Calculate best match and average match across all jobs
        job_matches = []
        for j in jobs:
            reqs = j.job_skills.all()
            if reqs.exists():
                tot_req = sum(r.level_int for r in reqs)
                tot_mat = sum(min(skills_map.get(r.skill.name, 1), r.level_int) for r in reqs)
                pct = int((tot_mat / tot_req) * 100) if tot_req > 0 else 0
                job_matches.append({'job_id': j.job_id, 'company': j.company, 'title': j.title, 'match': pct})

        best_match = max(job_matches, key=lambda x: x['match']) if job_matches else {'company': 'N/A', 'match': 0}
        avg_match = int(sum(m['match'] for m in job_matches) / len(job_matches)) if job_matches else 0

        # Determine Gap Type
        if avg_match >= 75:
            gap_type = 'Low Gap (High Match)'
            gap_badge = 'success'
        elif avg_match >= 50:
            gap_type = 'Moderate Gap'
            gap_badge = 'warning'
        else:
            gap_type = 'High Gap'
            gap_badge = 'danger'

        # Java specific gap
        java_level = skills_map.get('Java', 0)
        has_java_low_gap = java_level >= 4

        formatted_skills = [
            {'name': s.skill.name, 'level': s.proficiency_level, 'tag': s.proficiency_tag, 'category': s.skill.category}
            for s in st.skills.all()
        ]

        applied_companies = [app.job.company for app in st.applications.all()]

        students_data.append({
            'student_id': st.student_id,
            'name': st.name,
            'email': st.email,
            'target_title': st.target_title or 'Software Developer',
            'skills': formatted_skills,
            'skills_map': skills_map,
            'java_level': java_level,
            'has_java_low_gap': has_java_low_gap,
            'best_match': best_match,
            'avg_match': avg_match,
            'gap_type': gap_type,
            'gap_badge': gap_badge,
            'applications_count': st.applications.count(),
            'applied_companies': applied_companies,
            'created_at': st.created_at.strftime('%Y-%m-%d')
        })

    return JsonResponse({
        'success': True,
        'total_count': len(students_data),
        'students': students_data
    })

def admin_candidate_screening_view(request):
    """
    Returns all companies / jobs with candidate rankings, 
    detailed skill match vs deficit breakdowns, and single-skill lag detection.
    """
    jobs = Job.objects.prefetch_related('job_skills__skill', 'applications__student__skills__skill').all().order_by('job_id')
    
    companies_data = []
    for job in jobs:
        reqs = list(job.job_skills.all())
        tot_req_score = sum(r.level_int for r in reqs) if reqs else 1

        applications = job.applications.select_related('student').all()
        candidates_list = []

        for app in applications:
            st = app.student
            student_skills_map = {s.skill.name: s.proficiency_level for s in st.skills.all()}

            matched_skills = []
            gap_skills = []
            tot_matched = 0

            for r in reqs:
                s_name = r.skill.name
                req_lvl = r.level_int
                curr_lvl = student_skills_map.get(s_name, 1)

                tot_matched += min(curr_lvl, req_lvl)

                if curr_lvl >= req_lvl:
                    matched_skills.append({
                        'skill': s_name,
                        'current': curr_lvl,
                        'required': req_lvl,
                        'is_matched': True
                    })
                else:
                    gap_amount = req_lvl - curr_lvl
                    gap_skills.append({
                        'skill': s_name,
                        'current': curr_lvl,
                        'required': req_lvl,
                        'gap': gap_amount,
                        'mandatory': r.mandatory,
                        'is_matched': False
                    })

            calculated_match = int((tot_matched / tot_req_score) * 100) if tot_req_score > 0 else 0

            # Single Skill Lag Detection: Candidate matches almost all skills but lags in exactly 1 skill
            has_single_skill_lag = (len(gap_skills) == 1 and len(matched_skills) >= 2)
            single_skill_lag_desc = None
            if has_single_skill_lag:
                g = gap_skills[0]
                single_skill_lag_desc = f"Strong candidate: Meets {len(matched_skills)} requirements but lags only in {g['skill']} (Current: {g['current']}★ / Required: {g['required']}★)"

            # Probability Badge
            if calculated_match >= 75:
                probability = 'High Selection Chance'
                prob_badge = '#059669'
                badge_bg = '#ecfdf5'
            elif calculated_match >= 50:
                probability = 'Moderate Match'
                prob_badge = '#d97706'
                badge_bg = '#fffbeb'
            else:
                probability = 'High Skill Gap'
                prob_badge = '#dc2626'
                badge_bg = '#fef2f2'

            candidates_list.append({
                'application_id': app.id,
                'student_id': st.student_id,
                'name': st.name,
                'email': st.email,
                'target_title': st.target_title or 'Software Developer',
                'match_percent': calculated_match,
                'status': app.status,
                'probability': probability,
                'prob_badge': prob_badge,
                'badge_bg': badge_bg,
                'matched_skills': matched_skills,
                'gap_skills': gap_skills,
                'has_single_skill_lag': has_single_skill_lag,
                'single_skill_lag_desc': single_skill_lag_desc,
                'skills_map': student_skills_map
            })

        # Rank candidates: Highest match score first
        candidates_list.sort(key=lambda x: x['match_percent'], reverse=True)

        avg_score = int(sum(c['match_percent'] for c in candidates_list) / len(candidates_list)) if candidates_list else 0
        best_candidate = candidates_list[0] if candidates_list else None

        companies_data.append({
            'job_id': job.job_id,
            'company': job.company,
            'title': job.title,
            'location': job.location,
            'department': job.department,
            'experience': job.experience,
            'requirements_count': len(reqs),
            'requirements': [{'skill': r.skill.name, 'required': r.level_int, 'mandatory': r.mandatory} for r in reqs],
            'total_applicants': len(candidates_list),
            'avg_match_percent': avg_score,
            'best_candidate': best_candidate,
            'candidates': candidates_list
        })

    return JsonResponse({
        'success': True,
        'companies': companies_data
    })

@csrf_exempt
def admin_update_application_status_view(request):
    """
    Allows Admin to update candidate application status in MySQL database 
    (e.g., 'Shortlisted', 'Interview Scheduled', 'Offer Extended', 'Rejected', 'Under Review').
    """
    if request.method != 'POST':
        return JsonResponse({'success': False, 'message': 'Method not allowed.'}, status=405)

    try:
        data = json.loads(request.body.decode('utf-8'))
        app_id = data.get('application_id')
        new_status = data.get('status', '').strip()

        if not app_id or not new_status:
            return JsonResponse({'success': False, 'message': 'application_id and status are required.'}, status=400)

        app_obj = Application.objects.filter(id=app_id).select_related('student', 'job').first()
        if not app_obj:
            return JsonResponse({'success': False, 'message': 'Application record not found.'}, status=404)

        app_obj.status = new_status
        app_obj.save()

        return JsonResponse({
            'success': True,
            'message': f"Application for {app_obj.student.name} at {app_obj.job.company} updated to '{new_status}' in the DB.",
            'application_id': app_obj.id,
            'status': app_obj.status
        })

    except Exception as e:
        return JsonResponse({'success': False, 'message': str(e)}, status=500)

# ============================================================================
# API Workflow Endpoints (Directly mapped from System Architecture Diagram)
# ============================================================================

@csrf_exempt
def api_students_collection_view(request):
    """
    POST /api/students: Create student / employee
    GET /api/students: List all students
    """
    if request.method == 'POST':
        try:
            data = json.loads(request.body.decode('utf-8'))
            name = data.get('name', '').strip()
            email = data.get('email', '').strip().lower()
            password = data.get('password', 'Manooj@123')
            target_title = data.get('target_title', 'Software Developer')

            if not name or not email:
                return JsonResponse({'success': False, 'message': 'name and email are required.'}, status=400)

            if Student.objects.filter(email=email).exists():
                return JsonResponse({'success': False, 'message': 'Student with this email already exists.'}, status=409)

            hashed_pw = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
            student = Student.objects.create(
                name=name,
                email=email,
                password=hashed_pw,
                role='student',
                target_title=target_title
            )

            return JsonResponse({
                'success': True,
                'message': 'Student / employee created successfully.',
                'student': {
                    'id': student.student_id,
                    'name': student.name,
                    'email': student.email,
                    'target_title': student.target_title
                }
            }, status=201)
        except Exception as e:
            return JsonResponse({'success': False, 'message': str(e)}, status=500)

    # GET
    students = Student.objects.filter(role='student').values('student_id', 'name', 'email', 'target_title', 'created_at')
    return JsonResponse({'success': True, 'students': list(students)})

@csrf_exempt
def api_student_skills_view(request, student_id):
    """
    GET /api/students/{id}/skills: Get current skills
    POST /api/students/{id}/skills: Add / update skill
    """
    student = Student.objects.filter(student_id=student_id).first()
    if not student:
        return JsonResponse({'success': False, 'message': 'Student not found.'}, status=404)

    if request.method == 'GET':
        skills = [
            {
                'id': s.id,
                'skill_id': s.skill.skill_id,
                'name': s.skill.name,
                'category': s.skill.category,
                'proficiency_level': s.proficiency_level,
                'proficiency_tag': s.proficiency_tag
            }
            for s in student.skills.select_related('skill').all()
        ]
        return JsonResponse({'success': True, 'student_id': student_id, 'skills': skills})

    if request.method == 'POST':
        try:
            data = json.loads(request.body.decode('utf-8'))
            skill_name = data.get('skill_name', '').strip()
            level = int(data.get('proficiency_level', 3))

            if not skill_name:
                return JsonResponse({'success': False, 'message': 'skill_name is required.'}, status=400)

            skill_obj, _ = Skill.objects.get_or_create(
                name=skill_name,
                defaults={'category': data.get('category', 'Technical')}
            )

            student_skill, created = StudentSkill.objects.update_or_create(
                student=student,
                skill=skill_obj,
                defaults={
                    'proficiency': str(level)
                }
            )

            return JsonResponse({
                'success': True,
                'message': 'Skill updated successfully.',
                'skill': {
                    'name': skill_obj.name,
                    'level': student_skill.proficiency_level,
                    'tag': student_skill.proficiency_tag
                }
            })
        except Exception as e:
            return JsonResponse({'success': False, 'message': str(e)}, status=500)

@csrf_exempt
def api_job_detail_and_skills_view(request, job_id):
    """
    GET /api/jobs/{id}: Get job details
    POST /api/jobs/{id}/skills: Define required skills
    """
    job = Job.objects.prefetch_related('job_skills__skill').filter(job_id=job_id).first()
    if not job:
        return JsonResponse({'success': False, 'message': 'Job not found.'}, status=404)

    if request.method == 'GET':
        reqs = [
            {
                'skill': r.skill.name,
                'required_level': r.level_int,
                'mandatory': r.mandatory,
                'category': r.skill.category
            }
            for r in job.job_skills.all()
        ]
        return JsonResponse({
            'success': True,
            'job': {
                'id': job.job_id,
                'title': job.title,
                'company': job.company,
                'location': job.location,
                'department': job.department,
                'experience': job.experience,
                'description': job.description,
                'requirements': reqs
            }
        })

    if request.method == 'POST':
        try:
            data = json.loads(request.body.decode('utf-8'))
            skill_name = data.get('skill_name', '').strip()
            level = int(data.get('required_level', 3))
            mandatory = bool(data.get('mandatory', True))

            if not skill_name:
                return JsonResponse({'success': False, 'message': 'skill_name is required.'}, status=400)

            skill_obj, _ = Skill.objects.get_or_create(
                name=skill_name,
                defaults={'category': data.get('category', 'Technical')}
            )

            job_skill, created = JobSkill.objects.update_or_create(
                job=job,
                skill=skill_obj,
                defaults={'required_level': str(level), 'mandatory': mandatory}
            )

            return JsonResponse({
                'success': True,
                'message': f'Required skill {skill_obj.name} defined for {job.company}.',
                'skill': {
                    'name': skill_obj.name,
                    'required_level': job_skill.level_int,
                    'mandatory': job_skill.mandatory
                }
            })
        except Exception as e:
            return JsonResponse({'success': False, 'message': str(e)}, status=500)

def api_student_job_skill_gap_view(request, student_id, job_id):
    """
    GET /api/students/{studentId}/jobs/{jobId}/skill-gap
    Controller action delegating business calculation to SkillGapService.
    """
    student = Student.objects.filter(student_id=student_id).prefetch_related('skills__skill').first()
    job = Job.objects.filter(job_id=job_id).prefetch_related('job_skills__skill').first()

    if not student:
        return JsonResponse({'success': False, 'message': f'Student {student_id} not found.'}, status=404)
    if not job:
        return JsonResponse({'success': False, 'message': f'Job {job_id} not found.'}, status=404)

    result = SkillGapService.calculate_skill_gap(student, job)
    return JsonResponse({
        'success': True,
        **result
    })

def api_student_job_recommendations_view(request, student_id, job_id):
    """
    GET /api/students/{studentId}/jobs/{jobId}/recommendations
    """
    gap_result = api_student_job_skill_gap_view(request, student_id, job_id)
    if gap_result.status_code != 200:
        return gap_result
    
    data = json.loads(gap_result.content.decode('utf-8'))
    return JsonResponse({
        'success': True,
        'student_id': student_id,
        'job_id': job_id,
        'company': data['job']['company'],
        'recommendations': data['recommendations']
    })

@csrf_exempt
def api_applications_collection_view(request):
    """
    POST /api/applications: Create application
    """
    if request.method != 'POST':
        return JsonResponse({'success': False, 'message': 'POST method required.'}, status=405)

    try:
        data = json.loads(request.body.decode('utf-8'))
        student_id = data.get('student_id')
        job_id = data.get('job_id')

        if not student_id or not job_id:
            return JsonResponse({'success': False, 'message': 'student_id and job_id are required.'}, status=400)

        student = Student.objects.filter(student_id=student_id).first()
        job = Job.objects.filter(job_id=job_id).first()

        if not student or not job:
            return JsonResponse({'success': False, 'message': 'Student or Job not found.'}, status=404)

        app, created = Application.objects.get_or_create(
            student=student,
            job=job,
            defaults={'status': 'Applied', 'match_percent': 78.0}
        )

        return JsonResponse({
            'success': True,
            'message': f"Application created for {student.name} at {job.company}.",
            'application_id': app.id,
            'status': app.status,
            'created': created
        }, status=201 if created else 200)

    except Exception as e:
        return JsonResponse({'success': False, 'message': str(e)}, status=500)

