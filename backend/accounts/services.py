from typing import Dict, List, Any, Optional
from .models import Student, Job, Skill, StudentSkill, JobSkill, Application

class SkillGapService:
    """
    Core Domain Service for Skill Gap Analysis & Evaluation.
    Implements standardized competency matching, weighted scoring, and remediation roadmaps.
    """

    MANDATORY_WEIGHT = 1.5
    OPTIONAL_WEIGHT = 1.0

    @staticmethod
    def compare_levels(current_level: int, required_level: int) -> Dict[str, Any]:
        """
        Calculates gap deficit and status indicator for a single competency.
        Formula: gap = max(required_level - current_level, 0)
        """
        gap = max(required_level - current_level, 0)
        status = 'MATCHED' if current_level >= required_level else 'GAP'
        return {
            'gap': gap,
            'status': status,
            'is_matched': (status == 'MATCHED')
        }

    @classmethod
    def calculate_skill_gap(cls, student: Student, job: Job) -> Dict[str, Any]:
        """
        Performs comprehensive multi-factor skill gap analysis between a student and a job requirement.
        Weights mandatory skills higher to reflect industry hiring benchmarks.
        """
        student_skills = {
            s.skill.name.lower(): s.proficiency_level
            for s in student.skills.select_related('skill').all()
        }

        breakdown = []
        total_weighted_req = 0.0
        total_weighted_matched = 0.0

        for req in job.job_skills.select_related('skill').all():
            skill_name = req.skill.name
            current_lvl = student_skills.get(skill_name.lower(), 0)
            required_lvl = req.level_int
            weight = cls.MANDATORY_WEIGHT if req.mandatory else cls.OPTIONAL_WEIGHT

            eval_res = cls.compare_levels(current_lvl, required_lvl)
            
            total_weighted_req += (required_lvl * weight)
            total_weighted_matched += (min(current_lvl, required_lvl) * weight)

            breakdown.append({
                'skill': skill_name,
                'category': req.skill.category,
                'current_level': current_lvl,
                'required_level': required_lvl,
                'gap': eval_res['gap'],
                'status': eval_res['status'],
                'is_matched': eval_res['is_matched'],
                'mandatory': req.mandatory
            })

        overall_match_pct = int((total_weighted_matched / total_weighted_req) * 100) if total_weighted_req > 0 else 0
        recommendations = cls.generate_recommendations(breakdown, job)

        return {
            'student': {
                'id': student.student_id,
                'name': student.name,
                'email': student.email,
                'target_title': student.target_title
            },
            'job': {
                'id': job.job_id,
                'title': job.title,
                'company': job.company,
                'location': job.location,
                'department': job.department
            },
            'overall_match_percentage': overall_match_pct,
            'gap_count': len([s for s in breakdown if s['gap'] > 0]),
            'skills_breakdown': breakdown,
            'recommendations': recommendations
        }

    @classmethod
    def generate_recommendations(cls, breakdown: List[Dict[str, Any]], job: Job) -> List[Dict[str, Any]]:
        """
        Generates targeted remediation actions for skills exhibiting a deficit.
        """
        recommendations = []
        for item in breakdown:
            if item['gap'] > 0:
                is_urgent = item['mandatory'] or item['gap'] >= 2
                recommendations.append({
                    'skill': item['skill'],
                    'current': item['current_level'],
                    'target': item['required_level'],
                    'gap': item['gap'],
                    'priority': 'High' if is_urgent else 'Medium',
                    'action': f"Upskill {item['skill']} by +{item['gap']} level(s) to meet {job.company} benchmark"
                })

        recommendations.sort(key=lambda x: (1 if x['priority'] == 'High' else 2, -x['gap']))
        return recommendations
