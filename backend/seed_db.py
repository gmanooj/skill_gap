import os
import django
import bcrypt

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from accounts.models import Student, StudentSkill, Job, JobRequirement, JobApplication, Recommendation

def seed():
    salt = bcrypt.gensalt(10)
    admin_pwd = bcrypt.hashpw('Admin@123'.encode('utf-8'), salt).decode('utf-8')
    student_pwd = bcrypt.hashpw('Student@123'.encode('utf-8'), salt).decode('utf-8')

    admin, _ = Student.objects.get_or_create(
        email='admin@skillgap.com',
        defaults={
            'name': 'Administrator',
            'password': admin_pwd,
            'role': 'admin',
            'target_title': 'Enterprise Cloud & DevOps Architect'
        }
    )

    student, _ = Student.objects.get_or_create(
        email='arun@skillgap.com',
        defaults={
            'name': 'Arun',
            'password': student_pwd,
            'role': 'student',
            'target_title': 'Java Full Stack Developer'
        }
    )

    # Skills from Specification Table 4.2:
    # Java: 4/5 (Advanced)
    # MySQL: 4/5 (Advanced)
    # Python: 3/5 (Intermediate)
    # React: 2/5 (Basic)
    # AWS: 1/5 (Beginner)
    skills_data = [
        ('Java', 4, 'Advanced'),
        ('MySQL', 4, 'Advanced'),
        ('Python', 3, 'Intermediate'),
        ('React', 2, 'Basic'),
        ('AWS', 1, 'Beginner'),
    ]

    for s_name, s_lvl, s_tag in skills_data:
        StudentSkill.objects.update_or_create(
            student=student,
            skill_name=s_name,
            defaults={'proficiency_level': s_lvl, 'proficiency_tag': s_tag}
        )

    # 1. ABC Technologies - Java Full Stack Developer (From Job Screen Image)
    job1, _ = Job.objects.update_or_create(
        title='Java Full Stack Developer',
        company='ABC Technologies',
        defaults={
            'location': 'Remote / Chennai',
            'department': 'Core Product Engineering',
            'experience': '2–4 Years Experience',
            'description': 'Architect and deliver high-performance cloud applications using Java, Spring Boot, React, and MySQL.'
        }
    )
    reqs_job1 = [
        ('Java', 4, True, 'Backend'),
        ('Spring Boot', 4, True, 'Backend'),
        ('React', 3, True, 'Frontend'),
        ('MySQL', 3, True, 'Database'),
        ('AWS', 2, False, 'Cloud'),
    ]
    for r_name, r_lvl, r_mand, r_cat in reqs_job1:
        JobRequirement.objects.update_or_create(
            job=job1,
            skill_name=r_name,
            defaults={'required_level': r_lvl, 'mandatory': r_mand, 'category': r_cat}
        )

    # 2. TechCorp Solutions - Cloud Backend Engineer
    job2, _ = Job.objects.update_or_create(
        title='Cloud Backend Engineer',
        company='TechCorp Solutions',
        defaults={
            'location': 'Bangalore / Hybrid',
            'department': 'Platform Infrastructure',
            'experience': '3–5 Years Experience',
            'description': 'Build microservices, database pipelines, and scalable APIs on AWS and Docker.'
        }
    )
    reqs_job2 = [
        ('Java', 4, True, 'Backend'),
        ('MySQL', 4, True, 'Database'),
        ('Python', 3, True, 'Scripting'),
        ('AWS', 3, True, 'Cloud'),
        ('Spring Boot', 3, False, 'Backend'),
    ]
    for r_name, r_lvl, r_mand, r_cat in reqs_job2:
        JobRequirement.objects.update_or_create(
            job=job2,
            skill_name=r_name,
            defaults={'required_level': r_lvl, 'mandatory': r_mand, 'category': r_cat}
        )

    # 3. FinTech Global - Full Stack React/Node Engineer
    job3, _ = Job.objects.update_or_create(
        title='Full Stack React/Node Engineer',
        company='FinTech Global',
        defaults={
            'location': 'Hyderabad / Remote',
            'department': 'Payment Gateways',
            'experience': '2–4 Years Experience',
            'description': 'Develop modern secure fintech dashboards and high-throughput transactional APIs.'
        }
    )
    reqs_job3 = [
        ('React', 4, True, 'Frontend'),
        ('Java', 3, True, 'Backend'),
        ('MySQL', 3, True, 'Database'),
        ('AWS', 3, True, 'Cloud'),
        ('Python', 3, False, 'Data'),
    ]
    for r_name, r_lvl, r_mand, r_cat in reqs_job3:
        JobRequirement.objects.update_or_create(
            job=job3,
            skill_name=r_name,
            defaults={'required_level': r_lvl, 'mandatory': r_mand, 'category': r_cat}
        )

    # Seed sample applications for Arun to show applied companies comparison
    JobApplication.objects.get_or_create(student=student, job=job1, defaults={'status': 'Applied'})
    JobApplication.objects.get_or_create(student=student, job=job2, defaults={'status': 'Under Review'})

    # Recommendations from Specification Table 4.5
    recs_data = [
        ('Spring Boot', 'High', 4, 'Mandatory job requirement', 'Spring Boot 3 & Microservices Masterclass', 'Udemy'),
        ('React', 'Medium', 3, 'Required proficiency gap', 'Advanced React & Modern State Architecture', 'Coursera'),
        ('AWS', 'Medium', 2, 'Required supporting skill', 'AWS Certified Cloud Practitioner Roadmap', 'A Cloud Guru'),
    ]

    for s_name, prio, tgt, rsn, crs, prov in recs_data:
        Recommendation.objects.update_or_create(
            skill_name=s_name,
            defaults={
                'priority': prio,
                'target_level': tgt,
                'reason': rsn,
                'course_title': crs,
                'provider': prov
            }
        )

    print('[Database] Seeded Students, Skills, Jobs, Requirements, Applications, and Recommendations successfully!')

if __name__ == '__main__':
    seed()
