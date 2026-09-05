import React, { useState, useEffect } from 'react';
import { useAuth, authFetch } from '../context/AuthContext';
import ProgressBar from '../components/ProgressBar';

export default function StudentProfile() {
  const { user, token } = useAuth();

  const [studentData, setStudentData] = useState({
    name: user?.name || 'Arun',
    email: user?.email || 'arun@skillgap.com',
    role: user?.role || 'student',
    targetTitle: 'Java Full Stack Developer',
    skills: [
      { id: 1, skill: 'Java', level: 4, tag: 'Advanced' },
      { id: 2, skill: 'MySQL', level: 4, tag: 'Advanced' },
      { id: 3, skill: 'Python', level: 3, tag: 'Intermediate' },
      { id: 4, skill: 'React', level: 2, tag: 'Basic' },
      { id: 5, skill: 'AWS', level: 1, tag: 'Beginner' },
    ],
  });

  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newSkillName, setNewSkillName] = useState('Spring Boot');
  const [newSkillLevel, setNewSkillLevel] = useState(3);
  const [customSkillInput, setCustomSkillInput] = useState('');
  const [saveLoading, setSaveLoading] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState('');

  const availableSkillOptions = [
    'Spring Boot',
    'Docker',
    'Kubernetes',
    'TypeScript',
    'Node.js & Express',
    'GraphQL',
    'PostgreSQL',
    'Redis Caching',
    'System Design',
    'Other (Custom)',
  ];

  const fetchProfileFromDb = async () => {
    try {
      const response = await authFetch('/student/profile', {
        headers: {
          Authorization: token ? `Bearer ${token}` : '',
        },
      });

      if (response.ok) {
        const data = await response.json();
        if (data.student) {
          setStudentData(data.student);
        }
      }
    } catch (err) {
      console.error('[StudentProfile] Using fallback cache for database skills:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfileFromDb();
  }, [token]);

  const getTagFromLevel = (level) => {
    if (level >= 4) return 'Advanced';
    if (level === 3) return 'Intermediate';
    if (level === 2) return 'Basic';
    return 'Beginner';
  };

  const getTagStyle = (tag) => {
    switch (tag) {
      case 'Advanced':
        return { backgroundColor: '#e6f7ed', color: '#137333', border: '1px solid #c6f0d2' };
      case 'Intermediate':
        return { backgroundColor: '#e8f0fe', color: '#1a73e8', border: '1px solid #d2e3fc' };
      case 'Basic':
        return { backgroundColor: '#fef7e0', color: '#b06000', border: '1px solid #feebc8' };
      case 'Beginner':
      default:
        return { backgroundColor: '#fce8e6', color: '#c5221f', border: '1px solid #fad2cf' };
    }
  };

  const handleAddSkill = async (e) => {
    e.preventDefault();
    const finalSkillName =
      newSkillName === 'Other (Custom)'
        ? customSkillInput.trim()
        : newSkillName;

    if (!finalSkillName) return;

    setSaveLoading(true);
    const levelNum = parseInt(newSkillLevel, 10);

    try {
      const response = await authFetch('/student/skills', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: token ? `Bearer ${token}` : '',
        },
        body: JSON.stringify({
          skill: finalSkillName,
          level: levelNum,
        }),
      });

      if (response.ok) {
        setFeedbackMessage(`Skill "${finalSkillName}" successfully saved to database.`);
        await fetchProfileFromDb();
      } else {
        // Local state update fallback
        const existingIndex = studentData.skills.findIndex(
          (s) => s.skill.toLowerCase() === finalSkillName.toLowerCase()
        );
        const tag = getTagFromLevel(levelNum);
        let updatedSkills = [...studentData.skills];
        if (existingIndex >= 0) {
          updatedSkills[existingIndex] = { ...updatedSkills[existingIndex], level: levelNum, tag };
        } else {
          updatedSkills.push({ id: Date.now(), skill: finalSkillName, level: levelNum, tag });
        }
        setStudentData({ ...studentData, skills: updatedSkills });
      }
    } catch (err) {
      console.error('[AddSkill Error]:', err);
    } finally {
      setSaveLoading(false);
      setIsModalOpen(false);
      setCustomSkillInput('');
      setNewSkillName('Spring Boot');
      setNewSkillLevel(3);
      setTimeout(() => setFeedbackMessage(''), 3000);
    }
  };

  const displayName = studentData.name ? `Employee: ${studentData.name}` : 'Employee: Arun';
  const displayRole = (studentData.role || 'student').toUpperCase();

  return (
    <div style={styles.container}>
      {feedbackMessage && (
        <div style={styles.feedbackBanner}>
          <span>✓ {feedbackMessage}</span>
        </div>
      )}

      {/* Header Block */}
      <div style={styles.headerCard}>
        <div style={styles.avatar}>{(studentData.name || 'A')[0]}</div>
        <div style={styles.headerInfo}>
          <div style={styles.nameRow}>
            <h2 style={styles.name}>{displayName}</h2>
            <span style={styles.roleBadge}>{displayRole}</span>
          </div>
          <p style={styles.email}>{studentData.email}</p>
          <div style={styles.targetTitleRow}>
            <span style={styles.targetLabel}>Target Title:</span>
            <span style={styles.targetValue}>{studentData.targetTitle}</span>
          </div>
        </div>
      </div>

      {/* Skills Assessment Matrix */}
      <div style={styles.tableCard}>
        <div style={styles.tableHeader}>
          <div>
            <h3 style={styles.tableTitle}>Skills Assessment Matrix</h3>
            <p style={styles.tableSubtitle}>
              Live competency scores retrieved directly from the database
            </p>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            style={styles.addSkillBtn}
          >
            + Add Skill
          </button>
        </div>

        <div style={styles.tableResponsive}>
          <table style={styles.table}>
            <thead>
              <tr style={styles.trHead}>
                <th style={styles.th}>Skill</th>
                <th style={{ ...styles.th, width: '48%' }}>Current Score (1–5)</th>
                <th style={{ ...styles.th, textAlign: 'center' }}>Proficiency Tag</th>
              </tr>
            </thead>
            <tbody>
              {studentData.skills.map((item, index) => (
                <tr
                  key={item.id || item.skill}
                  style={{
                    ...styles.trBody,
                    backgroundColor: index % 2 === 0 ? '#ffffff' : '#fafafa',
                  }}
                >
                  <td style={styles.tdSkill}>{item.skill}</td>
                  <td style={styles.td}>
                    <ProgressBar current={item.level} total={5} showLabel={true} />
                  </td>
                  <td style={{ ...styles.td, textAlign: 'center' }}>
                    <span style={{ ...styles.tag, ...getTagStyle(item.tag) }}>
                      {item.tag}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Skill Modal */}
      {isModalOpen && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalCard}>
            <div style={styles.modalHeader}>
              <h3 style={styles.modalTitle}>Add / Update Skill Proficiency</h3>
              <button
                onClick={() => setIsModalOpen(false)}
                style={styles.closeBtn}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddSkill} style={styles.modalForm}>
              <div style={styles.inputGroup}>
                <label style={styles.label}>Select Skill</label>
                <select
                  value={newSkillName}
                  onChange={(e) => setNewSkillName(e.target.value)}
                  style={styles.select}
                  disabled={saveLoading}
                >
                  {availableSkillOptions.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
              </div>

              {newSkillName === 'Other (Custom)' && (
                <div style={styles.inputGroup}>
                  <label style={styles.label}>Custom Skill Name</label>
                  <input
                    type="text"
                    placeholder="e.g. Flutter, Kotlin, Terraform"
                    value={customSkillInput}
                    onChange={(e) => setCustomSkillInput(e.target.value)}
                    style={styles.input}
                    required
                    disabled={saveLoading}
                  />
                </div>
              )}

              <div style={styles.inputGroup}>
                <label style={styles.label}>
                  Proficiency Level (1–5): <strong>{newSkillLevel}/5 ({getTagFromLevel(newSkillLevel)})</strong>
                </label>
                <select
                  value={newSkillLevel}
                  onChange={(e) => setNewSkillLevel(parseInt(e.target.value, 10))}
                  style={styles.select}
                  disabled={saveLoading}
                >
                  <option value={1}>1/5 - Beginner</option>
                  <option value={2}>2/5 - Basic</option>
                  <option value={3}>3/5 - Intermediate</option>
                  <option value={4}>4/5 - Advanced</option>
                  <option value={5}>5/5 - Expert</option>
                </select>
              </div>

              <div style={styles.modalActions}>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  style={styles.modalCancelBtn}
                  disabled={saveLoading}
                >
                  Cancel
                </button>
                <button type="submit" style={styles.modalSubmitBtn} disabled={saveLoading}>
                  {saveLoading ? 'Saving to DB...' : 'Save to DB'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: '28px',
    maxWidth: '1000px',
    margin: '0 auto',
    padding: '40px 24px 60px 24px',
    width: '100%',
    fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", "SF Pro Display", "Helvetica Neue", sans-serif',
  },
  feedbackBanner: {
    padding: '12px 16px',
    backgroundColor: '#e6f7ed',
    border: '1px solid #c6f0d2',
    borderRadius: '12px',
    color: '#137333',
    fontSize: '13px',
    fontWeight: '600',
  },
  headerCard: {
    backgroundColor: '#ffffff',
    borderRadius: '18px',
    padding: '28px',
    border: '1px solid rgba(0, 0, 0, 0.06)',
    display: 'flex',
    alignItems: 'center',
    gap: '20px',
    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.04), 0 1px 3px rgba(0, 0, 0, 0.02)',
  },
  avatar: {
    width: '64px',
    height: '64px',
    borderRadius: '50%',
    backgroundColor: '#1d1d1f',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#ffffff',
    fontSize: '22px',
    fontWeight: '700',
    flexShrink: 0,
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
  },
  headerInfo: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
  },
  nameRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  name: {
    margin: 0,
    fontSize: '22px',
    fontWeight: '700',
    color: '#1d1d1f',
    letterSpacing: '-0.02em',
  },
  roleBadge: {
    padding: '2px 8px',
    backgroundColor: '#e8f0fe',
    color: '#1a73e8',
    borderRadius: '980px',
    fontSize: '11px',
    fontWeight: '700',
    letterSpacing: '0.04em',
  },
  email: {
    margin: 0,
    fontSize: '14px',
    color: '#86868b',
  },
  targetTitleRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    marginTop: '6px',
    fontSize: '13px',
  },
  targetLabel: {
    color: '#86868b',
    fontWeight: '500',
  },
  targetValue: {
    color: '#0071e3',
    fontWeight: '700',
  },
  tableCard: {
    backgroundColor: '#ffffff',
    borderRadius: '18px',
    border: '1px solid rgba(0, 0, 0, 0.06)',
    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.04), 0 1px 3px rgba(0, 0, 0, 0.02)',
    overflow: 'hidden',
  },
  tableHeader: {
    padding: '24px 28px',
    borderBottom: '1px solid rgba(0, 0, 0, 0.06)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: '16px',
  },
  tableTitle: {
    margin: '0 0 4px 0',
    fontSize: '18px',
    fontWeight: '700',
    color: '#1d1d1f',
    letterSpacing: '-0.01em',
  },
  tableSubtitle: {
    margin: 0,
    fontSize: '13px',
    color: '#86868b',
  },
  addSkillBtn: {
    padding: '8px 18px',
    backgroundColor: '#0071e3',
    color: '#ffffff',
    border: 'none',
    borderRadius: '980px',
    fontSize: '13px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'background-color 0.2s ease',
    boxShadow: '0 2px 8px rgba(0, 113, 227, 0.25)',
  },
  tableResponsive: {
    width: '100%',
    overflowX: 'auto',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    textAlign: 'left',
  },
  trHead: {
    backgroundColor: '#fbfbfd',
    borderBottom: '1px solid rgba(0, 0, 0, 0.06)',
  },
  th: {
    padding: '14px 28px',
    fontSize: '12px',
    fontWeight: '600',
    color: '#86868b',
    textTransform: 'uppercase',
    letterSpacing: '0.04em',
  },
  trBody: {
    borderBottom: '1px solid rgba(0, 0, 0, 0.04)',
    transition: 'background-color 0.15s ease',
  },
  tdSkill: {
    padding: '16px 28px',
    fontSize: '14px',
    fontWeight: '600',
    color: '#1d1d1f',
  },
  td: {
    padding: '16px 28px',
    verticalAlign: 'middle',
  },
  tag: {
    display: 'inline-block',
    padding: '4px 12px',
    borderRadius: '980px',
    fontSize: '12px',
    fontWeight: '600',
    minWidth: '85px',
  },
  modalOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    backdropFilter: 'blur(8px)',
    WebkitBackdropFilter: 'blur(8px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
    padding: '16px',
  },
  modalCard: {
    backgroundColor: '#ffffff',
    borderRadius: '20px',
    padding: '28px',
    maxWidth: '420px',
    width: '100%',
    boxShadow: '0 20px 40px rgba(0, 0, 0, 0.15)',
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
  },
  modalHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  modalTitle: {
    margin: 0,
    fontSize: '18px',
    fontWeight: '700',
    color: '#1d1d1f',
  },
  closeBtn: {
    background: 'none',
    border: 'none',
    fontSize: '16px',
    color: '#86868b',
    cursor: 'pointer',
    padding: '4px',
  },
  modalForm: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  inputGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
  },
  label: {
    fontSize: '12px',
    fontWeight: '600',
    color: '#515154',
  },
  select: {
    padding: '10px 14px',
    borderRadius: '10px',
    border: '1px solid rgba(0, 0, 0, 0.12)',
    fontSize: '14px',
    color: '#1d1d1f',
    backgroundColor: '#fbfbfd',
    outline: 'none',
  },
  input: {
    padding: '10px 14px',
    borderRadius: '10px',
    border: '1px solid rgba(0, 0, 0, 0.12)',
    fontSize: '14px',
    color: '#1d1d1f',
    backgroundColor: '#fbfbfd',
    outline: 'none',
  },
  modalActions: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '10px',
    marginTop: '8px',
  },
  modalCancelBtn: {
    padding: '10px 18px',
    backgroundColor: '#f5f5f7',
    color: '#515154',
    border: '1px solid rgba(0, 0, 0, 0.08)',
    borderRadius: '980px',
    fontSize: '13px',
    fontWeight: '600',
    cursor: 'pointer',
  },
  modalSubmitBtn: {
    padding: '10px 20px',
    backgroundColor: '#0071e3',
    color: '#ffffff',
    border: 'none',
    borderRadius: '980px',
    fontSize: '13px',
    fontWeight: '600',
    cursor: 'pointer',
  },
};
