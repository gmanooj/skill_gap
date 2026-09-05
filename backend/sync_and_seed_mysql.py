import pymysql
import bcrypt
from datetime import datetime

def sync_and_seed():
    conn = pymysql.connect(
        host='127.0.0.1',
        port=3306,
        user='root',
        password='Manooj@12',
        database='skill_gap',
        autocommit=True
    )
    cur = conn.cursor(pymysql.cursors.DictCursor)

    print('[MySQL] Connected successfully to skill_gap database!')

    # 1. Check and add missing columns
    def add_col(table, col_name, col_def):
        cur.execute(f"SHOW COLUMNS FROM `{table}` LIKE %s", (col_name,))
        if not cur.fetchone():
            print(f"[Schema] Adding column {col_name} to {table}...")
            cur.execute(f"ALTER TABLE `{table}` ADD COLUMN {col_name} {col_def}")
        else:
            print(f"[Schema] Column {col_name} exists in {table}")

    add_col('students', 'target_title', "VARCHAR(150) DEFAULT 'Java Full Stack Developer'")
    add_col('jobs', 'department', "VARCHAR(150) DEFAULT 'Core Product Engineering'")
    add_col('jobs', 'experience', "VARCHAR(100) DEFAULT '2–4 Years Experience'")
    add_col('jobs', 'description', "TEXT NULL")
    add_col('recommendations', 'course_title', "VARCHAR(255) DEFAULT ''")
    add_col('recommendations', 'provider', "VARCHAR(100) DEFAULT ''")

    # 2. Master Skills
    skills_data = [
        ('Java', 'Backend'),
        ('Spring Boot', 'Backend'),
        ('MySQL', 'Database'),
        ('Python', 'Data / Scripting'),
        ('React', 'Frontend'),
        ('AWS', 'Cloud'),
        ('Docker', 'DevOps'),
        ('Node.js', 'Backend'),
        ('TypeScript', 'Frontend')
    ]
    skill_ids = {}
    for name, cat in skills_data:
        cur.execute("SELECT skill_id FROM `skills` WHERE name = %s", (name,))
        row = cur.fetchone()
        if row:
            s_id = row['skill_id']
        else:
            cur.execute("INSERT INTO `skills` (name, category) VALUES (%s, %s)", (name, cat))
            s_id = cur.lastrowid
        skill_ids[name] = s_id
    print('[Skills Seeded]', skill_ids)

    # 3. Create Admin Account: G.MANOJ (gmanooj2@gmail.com)
    salt = bcrypt.gensalt(rounds=10)
    admin_pwd_hash = bcrypt.hashpw('Manooj@123'.encode('utf-8'), salt).decode('utf-8')
    default_pwd_hash = bcrypt.hashpw('Student@123'.encode('utf-8'), salt).decode('utf-8')

    cur.execute("SELECT student_id FROM `students` WHERE email = 'gmanooj2@gmail.com'")
    admin_row = cur.fetchone()
    if admin_row:
        cur.execute("""
            UPDATE `students` 
            SET name = 'G.MANOJ', role = 'admin', password = %s, target_title = 'System Administrator & Hiring Lead'
            WHERE email = 'gmanooj2@gmail.com'
        """, (admin_pwd_hash,))
        admin_id = admin_row['student_id']
    else:
        cur.execute("""
            INSERT INTO `students` (name, email, password, role, target_title) 
            VALUES ('G.MANOJ', 'gmanooj2@gmail.com', %s, 'admin', 'System Administrator & Hiring Lead')
        """, (admin_pwd_hash,))
        admin_id = cur.lastrowid
    print(f'[Admin Created/Updated] G.MANOJ (gmanooj2@gmail.com) -> ID: {admin_id}')

    # 4. Seed Diverse Students with unique realistic skills
    candidates = [
        ('Arun', 'arun@example.com', 'Java Full Stack Developer', [('Java', '4'), ('MySQL', '4'), ('Python', '3'), ('React', '2'), ('AWS', '1')]),
        ('Saravanan', 'saravanan@example.com', 'Cloud Backend Engineer', [('Java', '4'), ('MySQL', '4'), ('Python', '4'), ('AWS', '4'), ('Docker', '3'), ('Spring Boot', '2')]),
        ('Anitha', 'anitha@example.com', 'Full Stack React Engineer', [('React', '5'), ('TypeScript', '4'), ('Node.js', '4'), ('MySQL', '3'), ('AWS', '2'), ('Java', '1')]),
        ('Vignesh', 'vignesh@example.com', 'Java & Spring Boot Specialist', [('Java', '5'), ('Spring Boot', '4'), ('MySQL', '4'), ('Docker', '3'), ('React', '1'), ('AWS', '2')]),
        ('Pavithra', 'pavithra@example.com', 'Data & Backend Developer', [('Python', '5'), ('MySQL', '4'), ('Java', '3'), ('AWS', '3'), ('Docker', '2'), ('React', '2')]),
        ('Dinesh', 'dinesh@example.com', 'DevOps & Cloud Engineer', [('AWS', '5'), ('Docker', '5'), ('Python', '3'), ('MySQL', '3'), ('Java', '2'), ('React', '1')]),
        ('Kavitha', 'kavitha@example.com', 'Junior Full Stack Developer', [('Java', '3'), ('React', '3'), ('MySQL', '3'), ('Spring Boot', '1'), ('AWS', '1')]),
        ('Muthukumar', 'muthukumar@example.com', 'Database & API Developer', [('MySQL', '5'), ('Java', '4'), ('Spring Boot', '3'), ('Python', '3'), ('React', '1')]),
        ('Deepika', 'deepika@example.com', 'Frontend UI/UX Specialist', [('React', '5'), ('TypeScript', '5'), ('MySQL', '2'), ('Java', '2'), ('AWS', '1')]),
        ('Karthikeyan', 'karthikeyan@example.com', 'Senior Systems Architect', [('Java', '5'), ('Spring Boot', '5'), ('MySQL', '5'), ('AWS', '4'), ('Docker', '4'), ('React', '3')])
    ]

    student_id_map = {}
    for c_name, c_email, c_target, c_skills in candidates:
        cur.execute("SELECT student_id FROM `students` WHERE email = %s", (c_email,))
        st_row = cur.fetchone()
        if st_row:
            st_id = st_row['student_id']
            cur.execute("UPDATE `students` SET name = %s, target_title = %s WHERE student_id = %s", (c_name, c_target, st_id))
        else:
            cur.execute("INSERT INTO `students` (name, email, password, role, target_title) VALUES (%s, %s, %s, 'student', %s)", (c_name, c_email, default_pwd_hash, c_target))
            st_id = cur.lastrowid
        student_id_map[c_name] = st_id

        # Insert / Update student skills
        for sk_name, lvl in c_skills:
            if sk_name in skill_ids:
                s_id = skill_ids[sk_name]
                cur.execute("SELECT id FROM `student_skills` WHERE student_id = %s AND skill_id = %s", (st_id, s_id))
                if cur.fetchone():
                    cur.execute("UPDATE `student_skills` SET proficiency = %s WHERE student_id = %s AND skill_id = %s", (lvl, st_id, s_id))
                else:
                    cur.execute("INSERT INTO `student_skills` (student_id, skill_id, proficiency) VALUES (%s, %s, %s)", (st_id, s_id, lvl))

    print(f'[Candidates Seeded] {len(student_id_map)} students with unique skill matrices.')

    # 5. Seed Jobs & Skill Requirements
    jobs_to_seed = [
        (
            'ABC Technologies',
            'Java Full Stack Developer',
            'Remote / Chennai',
            'Core Product Engineering',
            '2–4 Years Experience',
            'Architect and deliver high-performance cloud applications using Java, Spring Boot, React, and MySQL.',
            [
                ('Java', '4', 1),
                ('Spring Boot', '4', 1),
                ('React', '3', 1),
                ('MySQL', '3', 1),
                ('AWS', '2', 0),
            ]
        ),
        (
            'TechCorp Solutions',
            'Cloud Backend Engineer',
            'Bangalore / Hybrid',
            'Platform Infrastructure',
            '3–5 Years Experience',
            'Build microservices, database pipelines, and scalable APIs on AWS and Docker.',
            [
                ('Java', '4', 1),
                ('MySQL', '4', 1),
                ('Python', '3', 1),
                ('AWS', '3', 1),
                ('Docker', '3', 0),
            ]
        ),
        (
            'FinTech Global',
            'Full Stack React/Node Engineer',
            'Hyderabad / Remote',
            'Payment Gateways',
            '2–4 Years Experience',
            'Develop modern secure fintech dashboards and high-throughput transactional APIs.',
            [
                ('React', '4', 1),
                ('Java', '3', 1),
                ('MySQL', '3', 1),
                ('AWS', '3', 1),
                ('TypeScript', '3', 0),
            ]
        )
    ]

    job_id_map = {}
    for comp, title, loc, dept, exp, desc, reqs in jobs_to_seed:
        cur.execute("SELECT job_id FROM `jobs` WHERE company = %s AND title = %s", (comp, title))
        j_row = cur.fetchone()
        if j_row:
            j_id = j_row['job_id']
            cur.execute("UPDATE `jobs` SET location = %s, department = %s, experience = %s, description = %s WHERE job_id = %s", (loc, dept, exp, desc, j_id))
        else:
            cur.execute("INSERT INTO `jobs` (company, title, location, department, experience, description) VALUES (%s, %s, %s, %s, %s, %s)", (comp, title, loc, dept, exp, desc))
            j_id = cur.lastrowid
        job_id_map[comp] = j_id

        # Insert Job Skills
        for r_name, r_lvl, r_mand in reqs:
            if r_name in skill_ids:
                s_id = skill_ids[r_name]
                cur.execute("SELECT id FROM `job_skills` WHERE job_id = %s AND skill_id = %s", (j_id, s_id))
                if cur.fetchone():
                    cur.execute("UPDATE `job_skills` SET required_level = %s, mandatory = %s WHERE job_id = %s AND skill_id = %s", (r_lvl, r_mand, j_id, s_id))
                else:
                    cur.execute("INSERT INTO `job_skills` (job_id, skill_id, required_level, mandatory) VALUES (%s, %s, %s, %s)", (j_id, s_id, r_lvl, r_mand))

    print('[Jobs Seeded]', job_id_map)

    # 6. Seed Applications Across Candidates
    # Multiple candidates applying for each job
    applications_seed = [
        ('Arun', 'ABC Technologies', 78.0, 'Applied'),
        ('Arun', 'TechCorp Solutions', 82.0, 'Under Review'),
        ('Vignesh', 'ABC Technologies', 91.0, 'Shortlisted'),
        ('Saravanan', 'TechCorp Solutions', 94.0, 'Shortlisted'),
        ('Saravanan', 'ABC Technologies', 84.0, 'Applied'),
        ('Anitha', 'FinTech Global', 95.0, 'Shortlisted'),
        ('Anitha', 'ABC Technologies', 65.0, 'Under Review'),
        ('Dinesh', 'TechCorp Solutions', 88.0, 'Applied'),
        ('Muthukumar', 'ABC Technologies', 72.0, 'Under Review'),
        ('Karthikeyan', 'ABC Technologies', 98.0, 'Shortlisted'),
        ('Pavithra', 'TechCorp Solutions', 85.0, 'Applied'),
        ('Deepika', 'FinTech Global', 89.0, 'Under Review')
    ]

    for cand_name, comp_name, m_pct, st_val in applications_seed:
        cand_id = student_id_map.get(cand_name)
        j_id = job_id_map.get(comp_name)
        if cand_id and j_id:
            cur.execute("SELECT id FROM `applications` WHERE student_id = %s AND job_id = %s", (cand_id, j_id))
            if cur.fetchone():
                cur.execute("UPDATE `applications` SET match_percent = %s, status = %s WHERE student_id = %s AND job_id = %s", (m_pct, st_val, cand_id, j_id))
            else:
                cur.execute("INSERT INTO `applications` (student_id, job_id, match_percent, status) VALUES (%s, %s, %s, %s)", (cand_id, j_id, m_pct, st_val))

    # 7. Seed Recommendations
    recs = [
        (student_id_map['Arun'], job_id_map['ABC Technologies'], skill_ids['Spring Boot'], 'High', 'Mandatory job requirement for ABC Technologies', 'Spring Boot 3 & Microservices Masterclass', 'Udemy'),
        (student_id_map['Arun'], job_id_map['ABC Technologies'], skill_ids['React'], 'Medium', 'Required proficiency gap for full-stack role', 'Advanced React & Modern State Architecture', 'Coursera'),
        (student_id_map['Arun'], job_id_map['TechCorp Solutions'], skill_ids['AWS'], 'Medium', 'Required supporting skill for cloud deployment', 'AWS Certified Cloud Practitioner Roadmap', 'A Cloud Guru'),
    ]
    for st_id, j_id, sk_id, prio, rsn, crs, prov in recs:
        cur.execute("SELECT id FROM `recommendations` WHERE student_id = %s AND skill_id = %s", (st_id, sk_id))
        if cur.fetchone():
            cur.execute("UPDATE `recommendations` SET job_id = %s, priority = %s, reason = %s, course_title = %s, provider = %s WHERE student_id = %s AND skill_id = %s", (j_id, prio, rsn, crs, prov, st_id, sk_id))
        else:
            cur.execute("INSERT INTO `recommendations` (student_id, job_id, skill_id, priority, reason, course_title, provider) VALUES (%s, %s, %s, %s, %s, %s, %s)", (st_id, j_id, sk_id, prio, rsn, crs, prov))

    print('\n' + '='*60)
    print('DATABASE SEEDING SUMMARY (MySQL `skill_gap`)')
    print('='*60)
    for t in ['students', 'skills', 'student_skills', 'jobs', 'job_skills', 'applications', 'recommendations']:
        cur.execute(f"SELECT COUNT(*) as cnt FROM `{t}`")
        c = cur.fetchone()['cnt']
        print(f"Table `{t}`: {c} rows")
    print('='*60)

    cur.close()
    conn.close()

if __name__ == '__main__':
    sync_and_seed()
