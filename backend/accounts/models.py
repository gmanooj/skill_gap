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

class Skill(models.Model):
    skill_id = models.AutoField(primary_key=True)
    name = models.CharField(max_length=100, unique=True)
    category = models.CharField(max_length=100, default='Technical')

    class Meta:
        db_table = 'skills'

    def __str__(self):
        return self.name

class StudentSkill(models.Model):
    id = models.AutoField(primary_key=True)
    student = models.ForeignKey(Student, on_delete=models.CASCADE, related_name='skills', db_column='student_id')
    skill = models.ForeignKey(Skill, on_delete=models.CASCADE, related_name='student_skills', db_column='skill_id')
    proficiency = models.CharField(max_length=50, default='1')  # '1' to '5' or label

    class Meta:
        db_table = 'student_skills'

    @property
    def skill_name(self):
        return self.skill.name

    @property
    def proficiency_level(self):
        try:
            return int(self.proficiency)
        except:
            mapping = {'Beginner': 1, 'Basic': 2, 'Intermediate': 3, 'Advanced': 4, 'Expert': 5}
            return mapping.get(self.proficiency, 1)

    @property
    def proficiency_tag(self):
        lvl = self.proficiency_level
        if lvl >= 4:
            return 'Advanced'
        elif lvl == 3:
            return 'Intermediate'
        elif lvl == 2:
            return 'Basic'
        return 'Beginner'

    def __str__(self):
        return f"{self.student.name} - {self.skill.name}: {self.proficiency}"

class Job(models.Model):
    job_id = models.AutoField(primary_key=True)
    company = models.CharField(max_length=150)
    title = models.CharField(max_length=150)
    location = models.CharField(max_length=100, default='Remote / Chennai')
    department = models.CharField(max_length=150, default='Core Product Engineering')
    experience = models.CharField(max_length=100, default='2–4 Years Experience')
    description = models.TextField(blank=True, default='')

    class Meta:
        db_table = 'jobs'

    @property
    def id(self):
        return self.job_id

    def __str__(self):
        return f"{self.title} at {self.company}"

class JobSkill(models.Model):
    id = models.AutoField(primary_key=True)
    job = models.ForeignKey(Job, on_delete=models.CASCADE, related_name='job_skills', db_column='job_id')
    skill = models.ForeignKey(Skill, on_delete=models.CASCADE, related_name='job_skills', db_column='skill_id')
    required_level = models.CharField(max_length=50, default='3')
    mandatory = models.BooleanField(default=True)

    class Meta:
        db_table = 'job_skills'

    @property
    def skill_name(self):
        return self.skill.name

    @property
    def level_int(self):
        try:
            return int(self.required_level)
        except:
            mapping = {'Beginner': 1, 'Basic': 2, 'Intermediate': 3, 'Advanced': 4, 'Expert': 5}
            return mapping.get(self.required_level, 3)

    def __str__(self):
        return f"{self.job.title} - {self.skill.name}: {self.required_level} (Mandatory: {self.mandatory})"

class Application(models.Model):
    id = models.AutoField(primary_key=True)
    student = models.ForeignKey(Student, on_delete=models.CASCADE, related_name='applications', db_column='student_id')
    job = models.ForeignKey(Job, on_delete=models.CASCADE, related_name='applications', db_column='job_id')
    match_percent = models.DecimalField(max_digits=5, decimal_places=2, default=0.0)
    status = models.CharField(max_length=50, default='Applied')

    class Meta:
        db_table = 'applications'

    def __str__(self):
        return f"{self.student.name} -> {self.job.company} ({self.status})"

class Recommendation(models.Model):
    id = models.AutoField(primary_key=True)
    student = models.ForeignKey(Student, on_delete=models.CASCADE, null=True, blank=True, db_column='student_id')
    job = models.ForeignKey(Job, on_delete=models.CASCADE, null=True, blank=True, db_column='job_id')
    skill = models.ForeignKey(Skill, on_delete=models.CASCADE, null=True, blank=True, db_column='skill_id')
    priority = models.CharField(max_length=50, default='Medium')
    reason = models.TextField(blank=True, default='')
    course_title = models.CharField(max_length=255, blank=True, default='')
    provider = models.CharField(max_length=100, blank=True, default='')

    class Meta:
        db_table = 'recommendations'

    @property
    def skill_name(self):
        return self.skill.name if self.skill else 'General'

    def __str__(self):
        return f"{self.priority} Priority: {self.skill_name}"
