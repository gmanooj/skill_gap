from django.urls import path
from .views import (
    register_view,
    login_view,
    forgot_password_view,
    reset_password_view,
    dashboard_stats_view,
    student_profile_view,
    add_or_update_skill_view,
    job_details_view,
    skill_gap_analysis_view,
    recommendations_view,
)

urlpatterns = [
    # Auth endpoints
    path('auth/register', register_view, name='register'),
    path('auth/login', login_view, name='login'),
    path('auth/forgot-password', forgot_password_view, name='forgot_password'),
    path('auth/reset-password', reset_password_view, name='reset_password'),

    # Data endpoints (all served from database)
    path('dashboard/stats', dashboard_stats_view, name='dashboard_stats'),
    path('student/profile', student_profile_view, name='student_profile'),
    path('student/skills', add_or_update_skill_view, name='add_or_update_skill'),
    path('jobs', job_details_view, name='job_details'),
    path('analysis', skill_gap_analysis_view, name='skill_gap_analysis'),
    path('recommendations', recommendations_view, name='recommendations'),
]
