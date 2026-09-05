from django.db import models
from django.utils import timezone

class Student(models.Model):
    ROLE_CHOICES = (
        ('admin', 'Admin'),
        ('student', 'Student'),
    )

    student_id = models.AutoField(primary_key=True)
    name = models.CharField(max_length=150)
    email = models.EmailField(max_length=150, unique=True)
    password = models.CharField(max_length=255)
    role = models.CharField(max_length=10, choices=ROLE_CHOICES, default='student')
    target_title = models.CharField(max_length=150, default='Java Full Stack Developer')
    reset_token = models.CharField(max_length=255, null=True, blank=True)
    reset_token_expiry = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(default=timezone.now)

    class Meta:
        db_table = 'students'
        verbose_name = 'Student'
        verbose_name_plural = 'Students'

    def __str__(self):
        return f"{self.name} ({self.email}) - {self.role}"

class StudentSkill(models.Model):
    student = models.ForeignKey(Student, on_delete=models.CASCADE, related_name='skills')
    skill_name = models.CharField(max_length=100)
    proficiency_level = models.IntegerField(default=1)  # 1 to 5
    proficiency_tag = models.CharField(max_length=50, default='Beginner')  # Beginner, Basic, Intermediate, Advanced, Expert
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'student_skills'
        unique_together = ('student', 'skill_name')

    def __str__(self):
        return f"{self.student.name} - {self.skill_name}: {self.proficiency_level}/5"

class Job(models.Model):
    title = models.CharField(max_length=150)
    company = models.CharField(max_length=150, default='Tech Solutions Inc')
    location = models.CharField(max_length=150, default='Remote / Chennai')
    department = models.CharField(max_length=150, default='Core Product Engineering')
    experience = models.CharField(max_length=100, default='2–4 Years Experience')
    description = models.TextField(blank=True, default='')
    created_at = models.DateTimeField(default=timezone.now)

    class Meta:
        db_table = 'jobs'

    def __str__(self):
        return f"{self.title} at {self.company}"

class JobRequirement(models.Model):
    job = models.ForeignKey(Job, on_delete=models.CASCADE, related_name='requirements')
    skill_name = models.CharField(max_length=100)
    required_level = models.IntegerField(default=3)  # 1 to 5
    mandatory = models.BooleanField(default=True)
    category = models.CharField(max_length=100, default='Technical')

    class Meta:
        db_table = 'job_requirements'
        unique_together = ('job', 'skill_name')

    def __str__(self):
        return f"{self.job.title} - {self.skill_name}: {self.required_level}/5 (Mandatory: {self.mandatory})"

class JobApplication(models.Model):
    student = models.ForeignKey(Student, on_delete=models.CASCADE, related_name='applications')
    job = models.ForeignKey(Job, on_delete=models.CASCADE, related_name='applications')
    applied_at = models.DateTimeField(default=timezone.now)
    status = models.CharField(max_length=50, default='Applied')

    class Meta:
        db_table = 'job_applications'
        unique_together = ('student', 'job')

    def __str__(self):
        return f"{self.student.name} -> {self.job.company} ({self.job.title})"

class Recommendation(models.Model):
    skill_name = models.CharField(max_length=100)
    priority = models.CharField(max_length=20, choices=(('High', 'High'), ('Medium', 'Medium'), ('Low', 'Low')), default='Medium')
    target_level = models.IntegerField(default=3)
    reason = models.CharField(max_length=255)
    course_title = models.CharField(max_length=255, blank=True, default='')
    provider = models.CharField(max_length=100, blank=True, default='')

    class Meta:
        db_table = 'recommendations'

    def __str__(self):
        return f"{self.priority} Priority: {self.skill_name} -> {self.target_level}"

