from django.urls import path
from .views import (
    register_view,
    login_view,
    forgot_password_view,
    reset_password_view,
    dashboard_stats_view,
    student_profile_view,
    add_or_update_skill_view,
    delete_skill_view,
    jobs_list_view,
    apply_job_view,
    skill_gap_analysis_view,
    recommendations_view,
    admin_students_list_view,
    admin_candidate_screening_view,
    admin_update_application_status_view,
    api_students_collection_view,
    api_student_skills_view,
    api_job_detail_and_skills_view,
    api_student_job_skill_gap_view,
    api_student_job_recommendations_view,
    api_applications_collection_view,
)

urlpatterns = [
    # Auth endpoints
    path('auth/register', register_view, name='register'),
    path('auth/login', login_view, name='login'),
    path('auth/forgot-password', forgot_password_view, name='forgot_password'),
    path('auth/reset-password', reset_password_view, name='reset_password'),

    # Direct short aliases
    path('register', register_view, name='register_short'),
    path('login', login_view, name='login_short'),
    path('forgot-password', forgot_password_view, name='forgot_password_short'),
    path('reset-password', reset_password_view, name='reset_password_short'),

    # Data endpoints (supporting both /api/ and /api/auth/ prefixes)
    path('dashboard/stats', dashboard_stats_view, name='dashboard_stats'),
    path('auth/dashboard/stats', dashboard_stats_view, name='auth_dashboard_stats'),

    path('student/profile', student_profile_view, name='student_profile'),
    path('auth/student/profile', student_profile_view, name='auth_student_profile'),

    path('student/skills', add_or_update_skill_view, name='add_or_update_skill'),
    path('auth/student/skills', add_or_update_skill_view, name='auth_add_or_update_skill'),

    path('student/skills/<int:skill_id>', delete_skill_view, name='delete_skill'),
    path('auth/student/skills/<int:skill_id>', delete_skill_view, name='auth_delete_skill'),

    path('jobs', jobs_list_view, name='jobs_list'),
    path('auth/jobs', jobs_list_view, name='auth_jobs_list'),

    path('jobs/<int:job_id>/apply', apply_job_view, name='apply_job'),
    path('auth/jobs/<int:job_id>/apply', apply_job_view, name='auth_apply_job'),

    path('analysis', skill_gap_analysis_view, name='skill_gap_analysis'),
    path('auth/analysis', skill_gap_analysis_view, name='auth_skill_gap_analysis'),

    path('recommendations', recommendations_view, name='recommendations'),
    path('auth/recommendations', recommendations_view, name='auth_recommendations'),

    # Admin endpoints
    path('admin/students', admin_students_list_view, name='admin_students'),
    path('auth/admin/students', admin_students_list_view, name='auth_admin_students'),

    path('admin/candidate-screening', admin_candidate_screening_view, name='admin_candidate_screening'),
    path('auth/admin/candidate-screening', admin_candidate_screening_view, name='auth_admin_candidate_screening'),

    path('admin/update-application-status', admin_update_application_status_view, name='admin_update_application_status'),
    path('auth/admin/update-application-status', admin_update_application_status_view, name='auth_admin_update_application_status'),

    # Architecture Spec Endpoints (from flow diagram)
    path('students', api_students_collection_view, name='api_students'),
    path('students/<int:student_id>/skills', api_student_skills_view, name='api_student_skills'),
    path('jobs/<int:job_id>', api_job_detail_and_skills_view, name='api_job_detail'),
    path('jobs/<int:job_id>/skills', api_job_detail_and_skills_view, name='api_job_skills'),
    path('students/<int:student_id>/jobs/<int:job_id>/skill-gap', api_student_job_skill_gap_view, name='api_student_job_skill_gap'),
    path('students/<int:student_id>/jobs/<int:job_id>/recommendations', api_student_job_recommendations_view, name='api_student_job_recommendations'),
    path('applications', api_applications_collection_view, name='api_applications'),
]
