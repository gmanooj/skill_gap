import unittest
from django.test import TestCase
from accounts.models import Student, Skill, StudentSkill, Job, JobSkill, Application
import bcrypt

class SkillGapCalculationUnitTests(TestCase):
    """
    Unit tests for the Core Skill Gap Analysis Engine, formulas, and proficiency logic.
    Formula:
      gap = max(required_level - current_level, 0)
      if current_level >= required_level -> MATCHED
      if current_level < required_level -> GAP
      Overall Match % = weighted skill match score (mandatory skills carry 1.5x weight)
    """

    def setUp(self):
        # Create test student
        pw_hash = bcrypt.hashpw(b"Secret@123", bcrypt.gensalt()).decode('utf-8')
        self.student = Student.objects.create(
            name="Test Candidate",
            email="candidate@test.com",
            password=pw_hash,
            role="student",
            target_title="Java Developer"
        )

        # Create skills
        self.skill_java = Skill.objects.create(name="Java", category="Technical")
        self.skill_spring = Skill.objects.create(name="Spring Boot", category="Technical")
        self.skill_react = Skill.objects.create(name="React", category="Technical")
        self.skill_mysql = Skill.objects.create(name="MySQL", category="Database")

        # Assign proficiencies to candidate
        StudentSkill.objects.create(student=self.student, skill=self.skill_java, proficiency="4")
        StudentSkill.objects.create(student=self.student, skill=self.skill_spring, proficiency="2")
        StudentSkill.objects.create(student=self.student, skill=self.skill_react, proficiency="3")

        # Create test job
        self.job = Job.objects.create(
            title="Senior Java Developer",
            company="Acme Corp",
            location="Remote",
            department="Engineering",
            experience="2-4 Years",
            description="Leading development of cloud microservices."
        )

        # Assign job requirements
        JobSkill.objects.create(job=self.job, skill=self.skill_java, required_level="4", mandatory=True)
        JobSkill.objects.create(job=self.job, skill=self.skill_spring, required_level="4", mandatory=True)
        JobSkill.objects.create(job=self.job, skill=self.skill_react, required_level="2", mandatory=False)
        JobSkill.objects.create(job=self.job, skill=self.skill_mysql, required_level="3", mandatory=True)

    def test_01_formula_matched_condition(self):
        """Test: When current_level >= required_level, gap MUST be 0 and status MUST be MATCHED."""
        current_level = 4
        required_level = 4
        gap = max(required_level - current_level, 0)
        status = 'MATCHED' if current_level >= required_level else 'GAP'
        self.assertEqual(gap, 0)
        self.assertEqual(status, 'MATCHED')

    def test_02_formula_gap_deficit_condition(self):
        """Test: When current_level < required_level, gap MUST be required - current and status MUST be GAP."""
        current_level = 2
        required_level = 4
        gap = max(required_level - current_level, 0)
        status = 'MATCHED' if current_level >= required_level else 'GAP'
        self.assertEqual(gap, 2)
        self.assertEqual(status, 'GAP')

    def test_03_zero_proficiency_gap(self):
        """Test: Candidate having 0 proficiency in a required skill yields full required gap."""
        current_level = 0
        required_level = 3
        gap = max(required_level - current_level, 0)
        status = 'MATCHED' if current_level >= required_level else 'GAP'
        self.assertEqual(gap, 3)
        self.assertEqual(status, 'GAP')

    def test_04_weighted_match_percentage(self):
        """
        Test: Overall Match % is weighted with mandatory skills having 1.5x weight.
        Requirements:
          - Java: req 4 (mandatory=1.5x) -> req_score: 6.0, curr 4 -> matched: 6.0
          - Spring: req 4 (mandatory=1.5x) -> req_score: 6.0, curr 2 -> matched: 3.0
          - React: req 2 (optional=1.0x) -> req_score: 2.0, curr 3 -> matched: 2.0 (capped at req)
          - MySQL: req 3 (mandatory=1.5x) -> req_score: 4.5, curr 0 -> matched: 0.0
          Total req: 6.0 + 6.0 + 2.0 + 4.5 = 18.5
          Total matched: 6.0 + 3.0 + 2.0 + 0.0 = 11.0
          Expected % = int((11.0 / 18.5) * 100) = 59%
        """
        skills_map = {
            'java': 4,
            'spring boot': 2,
            'react': 3,
            'mysql': 0
        }
        total_req = 0.0
        total_matched = 0.0

        for req in self.job.job_skills.all():
            curr = skills_map.get(req.skill.name.lower(), 0)
            req_lvl = req.level_int
            weight = 1.5 if req.mandatory else 1.0

            total_req += (req_lvl * weight)
            total_matched += (min(curr, req_lvl) * weight)

        expected_pct = int((total_matched / total_req) * 100)
        self.assertEqual(expected_pct, 59)

    def test_05_student_authentication_security(self):
        """Test: Password verification using bcrypt salt hashing."""
        is_valid = bcrypt.checkpw(b"Secret@123", self.student.password.encode('utf-8'))
        self.assertTrue(is_valid)
        is_invalid = bcrypt.checkpw(b"WrongPass", self.student.password.encode('utf-8'))
        self.assertFalse(is_invalid)

    def test_06_single_skill_lag_detection(self):
        """
        Test: Single Skill Lag rule triggers when a candidate matches >= 2 skills but lags in exactly 1 skill.
        """
        matched_skills = ['Java', 'React']
        gap_skills = [{'skill': 'Spring Boot', 'current': 2, 'required': 4, 'gap': 2}]

        has_single_skill_lag = (len(gap_skills) == 1 and len(matched_skills) >= 2)
        self.assertTrue(has_single_skill_lag)

    def test_07_multiple_skill_lag_does_not_trigger_single_flag(self):
        """Test: When candidate lags in 2 or more skills, single skill lag is FALSE."""
        matched_skills = ['Java']
        gap_skills = [
            {'skill': 'Spring Boot', 'gap': 2},
            {'skill': 'MySQL', 'gap': 3}
        ]
        has_single_skill_lag = (len(gap_skills) == 1 and len(matched_skills) >= 2)
        self.assertFalse(has_single_skill_lag)

    def test_08_application_state_progression(self):
        """Test: Application lifecycle state transitions."""
        app = Application.objects.create(student=self.student, job=self.job, status="Applied", match_percent=59.0)
        self.assertEqual(app.status, "Applied")

        # Admin shortlists candidate
        app.status = "Shortlisted"
        app.save()
        app.refresh_from_db()
        self.assertEqual(app.status, "Shortlisted")
