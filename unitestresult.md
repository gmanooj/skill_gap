# Unit Test Results

```text
======================================================================
SKILL GAP ANALYZER - UNIT TEST REPORT
Generated: 2026-09-05 13:41:31
Status: PASSED
Total Tests Run: 8
Passed: 8
Failures: 0
Errors: 0
Time Taken: 2.954s
======================================================================

Detailed Test Logs:
----------------------------------------------------------------------
test_01_formula_matched_condition (accounts.tests.SkillGapCalculationUnitTests.test_01_formula_matched_condition)
Test: When current_level >= required_level, gap MUST be 0 and status MUST be MATCHED. ... ok
test_02_formula_gap_deficit_condition (accounts.tests.SkillGapCalculationUnitTests.test_02_formula_gap_deficit_condition)
Test: When current_level < required_level, gap MUST be required - current and status MUST be GAP. ... ok
test_03_zero_proficiency_gap (accounts.tests.SkillGapCalculationUnitTests.test_03_zero_proficiency_gap)
Test: Candidate having 0 proficiency in a required skill yields full required gap. ... ok
test_04_weighted_match_percentage (accounts.tests.SkillGapCalculationUnitTests.test_04_weighted_match_percentage)
Test: Overall Match % is weighted with mandatory skills having 1.5x weight. ... ok
test_05_student_authentication_security (accounts.tests.SkillGapCalculationUnitTests.test_05_student_authentication_security)
Test: Password verification using bcrypt salt hashing. ... ok
test_06_single_skill_lag_detection (accounts.tests.SkillGapCalculationUnitTests.test_06_single_skill_lag_detection)
Test: Single Skill Lag rule triggers when a candidate matches >= 2 skills but lags in exactly 1 skill. ... ok
test_07_multiple_skill_lag_does_not_trigger_single_flag (accounts.tests.SkillGapCalculationUnitTests.test_07_multiple_skill_lag_does_not_trigger_single_flag)
Test: When candidate lags in 2 or more skills, single skill lag is FALSE. ... ok
test_08_application_state_progression (accounts.tests.SkillGapCalculationUnitTests.test_08_application_state_progression)
Test: Application lifecycle state transitions. ... ok

----------------------------------------------------------------------
Ran 8 tests in 2.953s

OK

======================================================================
Summary of Test Scenarios Verified:
  [OK] test_01_formula_matched_condition (gap = max(req - curr, 0), MATCHED when curr >= req)
  [OK] test_02_formula_gap_deficit_condition (gap = req - curr, GAP when curr < req)
  [OK] test_03_zero_proficiency_gap (zero proficiency returns full gap amount)
  [OK] test_04_weighted_match_percentage (1.5x weight for mandatory skills)
  [OK] test_05_student_authentication_security (Bcrypt password hashing verification)
  [OK] test_06_single_skill_lag_detection (Candidate matching >= 2 skills with exactly 1 gap)
  [OK] test_07_multiple_skill_lag_does_not_trigger_single_flag (Multiple gaps do not flag single lag)
  [OK] test_08_application_state_progression (Application lifecycle status transitions)
======================================================================

```
