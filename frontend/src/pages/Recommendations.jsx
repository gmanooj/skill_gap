import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Sparkles,
  Briefcase,
  BookOpen,
  Award,
  Check,
  TrendingUp,
  ArrowRight,
  Lightbulb,
  Building2,
  MapPin,
  Clock,
  ChevronRight,
} from 'lucide-react';
import { authFetch, useAuth } from '../context/AuthContext';
import Loader from '../components/Loader';

export default function Recommendations() {
  const navigate = useNavigate();
  const { token } = useAuth();

  const [data, setData] = useState({
    overallReadiness: '82%',
    bestMatchCompany: 'ABC Technologies',
    bestMatchJobTitle: 'Java Full Stack Developer',
    recommendedJobs: [],
    recommendations: [],
  });

  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('jobs'); // 'jobs' | 'learning'
  const [applyLoadingId, setApplyLoadingId] = useState(null);
  const [feedbackMessage, setFeedbackMessage] = useState('');

  const fetchRecommendations = async () => {
    try {
      const response = await authFetch('/recommendations', {
        headers: {
          Authorization: token ? `Bearer ${token}` : '',
        },
      });

      if (response.ok) {
        const resData = await response.json();
        setData(resData);
      }
    } catch (err) {
      console.error('[Recommendations] Error querying recommendations:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecommendations();
  }, [token]);

  const handleApplyJob = async (jobId, companyName) => {
    setApplyLoadingId(jobId);
    try {
      const response = await authFetch(`/jobs/${jobId}/apply`, {
        method: 'POST',
        headers: {
          Authorization: token ? `Bearer ${token}` : '',
        },
      });

      if (response.ok) {
        setFeedbackMessage(`Application successfully submitted to ${companyName}!`);
        await fetchRecommendations();
      }
    } catch (err) {
      console.error('[Apply Error]:', err);
    } finally {
      setApplyLoadingId(null);
      setTimeout(() => setFeedbackMessage(''), 4000);
    }
  };

  const getPriorityBadgeStyle = (priority) => {
    switch (priority) {
      case 'High':
        return {
          backgroundColor: '#fef2f2',
          color: '#ef4444',
          border: '1px solid #fee2e2',
          dotColor: '#ef4444',
        };
      case 'Medium':
        return {
          backgroundColor: '#eff6ff',
          color: '#2563eb',
          border: '1px solid #dbeafe',
          dotColor: '#2563eb',
        };
      case 'Low':
      default:
        return {
          backgroundColor: '#f8fafc',
          color: '#475569',
          border: '1px solid #e2e8f0',
          dotColor: '#64748b',
        };
    }
  };

  if (loading) {
    return <Loader message="Analyzing job recommendations and tailored learning roadmaps..." />;
  }

  return (
    <div style={styles.container}>
      {feedbackMessage && (
        <div style={styles.feedbackBanner}>
          <Check size={16} color="#0f172a" strokeWidth={2.5} />
          <span>{feedbackMessage}</span>
        </div>
      )}

      {/* Hero Placement Readiness Banner */}
      <div style={styles.heroCard}>
        <div style={styles.heroContent}>
          <div style={styles.heroBadge}>
            <Sparkles size={13} color="#93c5fd" />
            <span>AI Career Placement Intelligence</span>
          </div>
          <h1 style={styles.heroTitle}>Placement & Career Optimization</h1>
          <p style={styles.heroSubtitle}>
            Personalized role recommendations with the highest probability of hiring selection, paired with targeted learning milestones.
          </p>

          <div style={styles.heroMetricsGrid}>
            <div style={styles.heroMetricItem}>
              <span style={styles.heroMetricLabel}>Top Hiring Fit</span>
              <span style={styles.heroMetricValue}>{data.bestMatchCompany}</span>
              <span style={styles.heroMetricSub}>{data.bestMatchJobTitle}</span>
            </div>
            <div style={styles.heroMetricDivider} />
            <div style={styles.heroMetricItem}>
              <span style={styles.heroMetricLabel}>Placement Readiness</span>
              <span style={styles.heroMetricValueAccent}>{data.overallReadiness}</span>
              <span style={styles.heroMetricSub}>Based on verified skills in DB</span>
            </div>
            <div style={styles.heroMetricDivider} />
            <div style={styles.heroMetricItem}>
              <span style={styles.heroMetricLabel}>Actionable Gaps</span>
              <span style={styles.heroMetricValue}>
                {data.recommendations?.length || 0} Skills
              </span>
              <span style={styles.heroMetricSub}>Ready for progression</span>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Segmented Switch */}
      <div style={styles.tabBar}>
        <button
          onClick={() => setActiveTab('jobs')}
          style={{
            ...styles.tabBtn,
            ...(activeTab === 'jobs' ? styles.tabBtnActive : {}),
          }}
        >
          <Briefcase size={14} />
          <span>Recommended Jobs ({data.recommendedJobs?.length || 0})</span>
        </button>
        <button
          onClick={() => setActiveTab('learning')}
          style={{
            ...styles.tabBtn,
            ...(activeTab === 'learning' ? styles.tabBtnActive : {}),
          }}
        >
          <BookOpen size={14} />
          <span>Learning Roadmap ({data.recommendations?.length || 0})</span>
        </button>
      </div>

      {/* 1. Best Recommended Jobs Section */}
      {activeTab === 'jobs' && (
        <div style={styles.sectionContainer}>
          <div style={styles.sectionHeader}>
            <div>
              <h2 style={styles.sectionTitle}>Top Placement Recommendations</h2>
              <p style={styles.sectionSubtitle}>
                Opportunities matching your competency profile with highest likelihood of selection
              </p>
            </div>
          </div>

          <div style={styles.jobsList}>
            {loading ? (
              <div style={styles.emptyState}>Loading recommended jobs from database...</div>
            ) : data.recommendedJobs.length === 0 ? (
              <div style={styles.emptyState}>No job listings found in database.</div>
            ) : (
              data.recommendedJobs.map((job) => {
                const isHighChance = job.matchPercentage >= 75;
                return (
                  <div
                    key={job.id}
                    style={{
                      ...styles.jobCard,
                      border: '1px solid #e2e8f0',
                      boxShadow: job.isTopPick
                        ? '0 10px 30px rgba(37, 99, 235, 0.08), 0 2px 6px rgba(0,0,0,0.04)'
                        : '0 4px 16px rgba(0, 0, 0, 0.03)',
                    }}
                  >
                    {job.isTopPick && (
                      <div style={styles.topPickBanner}>
                        <Award size={14} color="#ffffff" />
                        <span>#1 Best Placement Match</span>
                      </div>
                    )}

                    <div style={styles.jobCardMain}>
                      <div style={styles.jobInfoColumn}>
                        <div style={styles.companyRow}>
                          <span style={styles.companyNameBadge}>{job.company}</span>
                          <span
                            style={{
                              ...styles.placementChanceBadge,
                              backgroundColor: job.badgeBg || '#ecfdf5',
                              color: job.colorBadge || '#059669',
                              borderColor: job.borderColor || '#a7f3d0',
                            }}
                          >
                            <span
                              style={{
                                width: '6px',
                                height: '6px',
                                borderRadius: '50%',
                                backgroundColor: job.colorBadge || '#059669',
                                display: 'inline-block',
                              }}
                            />
                            {job.placementChance}
                          </span>
                        </div>

                        <h3 style={styles.jobTitleText}>{job.title}</h3>
                        <div style={styles.jobMetaTags}>
                          <span style={styles.metaPill}>
                            <MapPin size={11} /> {job.location}
                          </span>
                          <span style={styles.metaPill}>
                            <Building2 size={11} /> {job.department}
                          </span>
                          <span style={styles.metaPill}>
                            <Clock size={11} /> {job.experience}
                          </span>
                        </div>

                        {/* Skill Match Breakdown */}
                        <div style={styles.skillsBreakdown}>
                          <div style={styles.matchedSkillsGroup}>
                            <span style={styles.skillGroupLabel}>Matched Skills:</span>
                            <div style={styles.skillTagList}>
                              {job.matchedSkills && job.matchedSkills.length > 0 ? (
                                job.matchedSkills.map((s) => (
                                  <span key={s} style={styles.matchedSkillPill}>
                                    <Check size={10} strokeWidth={3} />
                                    <span>{s}</span>
                                  </span>
                                ))
                              ) : (
                                <span style={styles.noneText}>None yet</span>
                              )}
                            </div>
                          </div>

                          {job.gapSkills && job.gapSkills.length > 0 && (
                            <div style={styles.gapSkillsGroup}>
                              <span style={styles.skillGroupLabel}>Required Upskill:</span>
                              <div style={styles.skillTagList}>
                                {job.gapSkills.map((g) => (
                                  <span key={g.skill} style={styles.gapSkillPill}>
                                    <TrendingUp size={10} />
                                    <span>{g.skill} (Need {g.required}/5)</span>
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Right Action Column */}
                      <div style={styles.jobActionColumn}>
                        <div style={styles.matchScoreCard}>
                          <span style={styles.scoreNumber}>{job.matchPercentage}%</span>
                          <span style={styles.scoreCaption}>Match Score</span>
                          <div style={styles.scoreProgressBar}>
                            <div
                              style={{
                                ...styles.scoreProgressFill,
                                width: `${job.matchPercentage}%`,
                                backgroundColor: isHighChance ? '#10b981' : '#f59e0b',
                              }}
                            />
                          </div>
                        </div>

                        <div style={styles.buttonGroup}>
                          {!job.isApplied ? (
                            <button
                              onClick={() => handleApplyJob(job.id, job.company)}
                              disabled={applyLoadingId === job.id}
                              style={styles.applyButton}
                            >
                              {applyLoadingId === job.id ? 'Applying...' : 'Apply for Position'}
                            </button>
                          ) : (
                            <div style={styles.appliedConfirmBadge}>
                              <Check size={12} strokeWidth={3} />
                              <span>Applied ({job.applicationStatus || 'Under Review'})</span>
                            </div>
                          )}

                          <button
                            onClick={() => navigate('/skill-gap-analysis')}
                            style={styles.inspectBtn}
                          >
                            <span>Inspect Matrix</span>
                            <ChevronRight size={13} />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* 2. Targeted Learning Roadmap Section */}
      {activeTab === 'learning' && (
        <div style={styles.sectionContainer}>
          <div style={styles.sectionHeader}>
            <div>
              <h2 style={styles.sectionTitle}>Prioritized Learning Roadmap</h2>
              <p style={styles.sectionSubtitle}>
                Target level progressions and curated courseware to bridge competencies efficiently
              </p>
            </div>
          </div>

          <div style={styles.learningCardsGrid}>
            {loading ? (
              <div style={styles.emptyState}>Loading learning roadmap...</div>
            ) : data.recommendations.length === 0 ? (
              <div style={styles.emptyState}>All skills are at target proficiency levels!</div>
            ) : (
              data.recommendations.map((item) => {
                const badgeStyle = getPriorityBadgeStyle(item.priority);
                return (
                  <div key={item.id || item.skill} style={styles.learningCard}>
                    <div style={styles.learningCardTop}>
                      <div style={styles.learningHeaderRow}>
                        <span
                          style={{
                            ...styles.priorityPill,
                            backgroundColor: badgeStyle.backgroundColor,
                            color: badgeStyle.color,
                            borderColor: badgeStyle.border,
                          }}
                        >
                          <span
                            style={{
                              ...styles.priorityDot,
                              backgroundColor: badgeStyle.dotColor,
                            }}
                          />
                          {item.priority} Priority
                        </span>
                        <span style={styles.impactBadge}>{item.placementImpact}</span>
                      </div>
                      <h3 style={styles.learningSkillTitle}>{item.skill}</h3>
                      <p style={styles.learningReason}>{item.reason}</p>
                    </div>

                    <div style={styles.progressionContainer}>
                      <div style={styles.progressionSteps}>
                        <div style={styles.stepBlock}>
                          <span style={styles.stepLabel}>Current Level</span>
                          <span style={styles.stepVal}>{item.current || 1} / 5</span>
                        </div>
                        <ArrowRight size={16} color="#3b82f6" />
                        <div style={styles.stepBlock}>
                          <span style={styles.stepLabel}>Target Level</span>
                          <span style={styles.stepValTarget}>{item.target || 3} / 5</span>
                        </div>
                      </div>
                    </div>

                    {item.courseTitle ? (
                      <div style={styles.coursewareBlock}>
                        <span style={styles.courseHeaderLabel}>Curated Courseware:</span>
                        <div style={styles.courseContent}>
                          <span style={styles.courseTitle}>{item.courseTitle}</span>
                          {item.provider && (
                            <span style={styles.providerBadge}>Platform: {item.provider}</span>
                          )}
                        </div>
                      </div>
                    ) : (
                      <div style={styles.selfPacedNote}>
                        <Lightbulb size={13} color="#64748b" />
                        <span>Practice real-world enterprise projects and scenario exercises</span>
                      </div>
                    )}
                  </div>
                );
              })
            )}
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
    maxWidth: '1080px',
    margin: '0 auto',
    padding: '40px 24px 60px 24px',
    width: '100%',
    fontFamily:
      '-apple-system, BlinkMacSystemFont, "SF Pro Text", "SF Pro Display", "Helvetica Neue", sans-serif',
  },
  feedbackBanner: {
    padding: '14px 20px',
    backgroundColor: '#ecfdf5',
    border: '1px solid #a7f3d0',
    borderRadius: '14px',
    color: '#065f46',
    fontSize: '14px',
    fontWeight: '600',
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    boxShadow: '0 4px 12px rgba(5, 150, 105, 0.08)',
  },
  heroCard: {
    background: 'linear-gradient(135deg, #1e1e24 0%, #0f172a 100%)',
    borderRadius: '24px',
    padding: '36px 36px',
    color: '#ffffff',
    boxShadow: '0 16px 40px rgba(15, 23, 42, 0.18)',
    position: 'relative',
    overflow: 'hidden',
  },
  heroContent: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    position: 'relative',
    zIndex: 2,
  },
  heroBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    backdropFilter: 'blur(10px)',
    padding: '4px 12px',
    borderRadius: '980px',
    fontSize: '12px',
    fontWeight: '600',
    color: '#93c5fd',
    alignSelf: 'flex-start',
  },
  heroTitle: {
    margin: 0,
    fontSize: '26px',
    fontWeight: '800',
    letterSpacing: '-0.02em',
    color: '#ffffff',
  },
  heroSubtitle: {
    margin: 0,
    fontSize: '14px',
    color: '#94a3b8',
    lineHeight: '1.5',
    maxWidth: '680px',
  },
  heroMetricsGrid: {
    display: 'flex',
    alignItems: 'center',
    gap: '24px',
    marginTop: '16px',
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    backdropFilter: 'blur(12px)',
    padding: '16px 24px',
    borderRadius: '16px',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    flexWrap: 'wrap',
  },
  heroMetricItem: {
    display: 'flex',
    flexDirection: 'column',
    gap: '2px',
    flex: 1,
    minWidth: '150px',
  },
  heroMetricLabel: {
    fontSize: '11px',
    color: '#94a3b8',
    textTransform: 'uppercase',
    fontWeight: '600',
    letterSpacing: '0.04em',
  },
  heroMetricValue: {
    fontSize: '18px',
    fontWeight: '800',
    color: '#ffffff',
  },
  heroMetricValueAccent: {
    fontSize: '22px',
    fontWeight: '800',
    color: '#34d399',
  },
  heroMetricSub: {
    fontSize: '12px',
    color: '#cbd5e1',
  },
  heroMetricDivider: {
    width: '1px',
    height: '40px',
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
  },
  tabBar: {
    display: 'flex',
    gap: '10px',
    backgroundColor: '#e2e8f0',
    padding: '4px',
    borderRadius: '980px',
    alignSelf: 'flex-start',
  },
  tabBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    padding: '8px 20px',
    backgroundColor: 'transparent',
    border: 'none',
    borderRadius: '980px',
    fontSize: '13px',
    fontWeight: '600',
    color: '#475569',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  },
  tabBtnActive: {
    backgroundColor: '#ffffff',
    color: '#0f172a',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
  },
  sectionContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '18px',
  },
  sectionHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sectionTitle: {
    margin: 0,
    fontSize: '20px',
    fontWeight: '700',
    color: '#0f172a',
    letterSpacing: '-0.01em',
  },
  sectionSubtitle: {
    margin: '4px 0 0 0',
    fontSize: '13px',
    color: '#64748b',
  },
  jobsList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
  },
  jobCard: {
    backgroundColor: '#ffffff',
    borderRadius: '20px',
    overflow: 'hidden',
    transition: 'transform 0.2s ease, box-shadow 0.2s ease',
  },
  topPickBanner: {
    backgroundColor: '#2563eb',
    color: '#ffffff',
    padding: '6px 20px',
    fontSize: '12px',
    fontWeight: '800',
    letterSpacing: '0.02em',
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
  },
  jobCardMain: {
    padding: '24px 28px',
    display: 'flex',
    justifyContent: 'space-between',
    gap: '24px',
    flexWrap: 'wrap',
  },
  jobInfoColumn: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    flex: 2,
    minWidth: '280px',
  },
  companyRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    flexWrap: 'wrap',
  },
  companyNameBadge: {
    fontSize: '13px',
    fontWeight: '800',
    color: '#0f172a',
    textTransform: 'uppercase',
    letterSpacing: '0.04em',
  },
  placementChanceBadge: {
    fontSize: '11px',
    fontWeight: '700',
    padding: '3px 10px',
    borderRadius: '980px',
    border: '1px solid',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
  },
  jobTitleText: {
    margin: 0,
    fontSize: '20px',
    fontWeight: '700',
    color: '#0f172a',
    letterSpacing: '-0.01em',
  },
  jobMetaTags: {
    display: 'flex',
    gap: '8px',
    flexWrap: 'wrap',
  },
  metaPill: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '4px',
    fontSize: '12px',
    color: '#475569',
    backgroundColor: '#f1f5f9',
    padding: '3px 10px',
    borderRadius: '8px',
  },
  skillsBreakdown: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    marginTop: '4px',
    backgroundColor: '#f8fafc',
    padding: '12px 16px',
    borderRadius: '12px',
  },
  matchedSkillsGroup: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    flexWrap: 'wrap',
  },
  gapSkillsGroup: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    flexWrap: 'wrap',
  },
  skillGroupLabel: {
    fontSize: '11px',
    fontWeight: '700',
    color: '#64748b',
    minWidth: '100px',
  },
  skillTagList: {
    display: 'flex',
    gap: '6px',
    flexWrap: 'wrap',
  },
  matchedSkillPill: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '4px',
    fontSize: '11px',
    fontWeight: '700',
    color: '#047857',
    backgroundColor: '#d1fae5',
    padding: '2px 8px',
    borderRadius: '6px',
  },
  gapSkillPill: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '4px',
    fontSize: '11px',
    fontWeight: '700',
    color: '#b45309',
    backgroundColor: '#fef3c7',
    padding: '2px 8px',
    borderRadius: '6px',
  },
  noneText: {
    fontSize: '11px',
    color: '#94a3b8',
    fontStyle: 'italic',
  },
  jobActionColumn: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    gap: '16px',
    flex: 1,
    minWidth: '200px',
  },
  matchScoreCard: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-end',
    gap: '4px',
    width: '100%',
  },
  scoreNumber: {
    fontSize: '28px',
    fontWeight: '900',
    color: '#0f172a',
    letterSpacing: '-0.02em',
  },
  scoreCaption: {
    fontSize: '11px',
    fontWeight: '700',
    color: '#64748b',
    textTransform: 'uppercase',
  },
  scoreProgressBar: {
    width: '100%',
    height: '6px',
    backgroundColor: '#e2e8f0',
    borderRadius: '980px',
    overflow: 'hidden',
    marginTop: '4px',
  },
  scoreProgressFill: {
    height: '100%',
    borderRadius: '980px',
  },
  buttonGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    width: '100%',
  },
  applyButton: {
    padding: '12px 18px',
    backgroundColor: '#0071e3',
    color: '#ffffff',
    border: 'none',
    borderRadius: '980px',
    fontSize: '13px',
    fontWeight: '700',
    cursor: 'pointer',
    transition: 'background-color 0.2s ease',
    boxShadow: '0 4px 12px rgba(0, 113, 227, 0.25)',
    textAlign: 'center',
  },
  appliedConfirmBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '5px',
    padding: '10px 14px',
    backgroundColor: '#ecfdf5',
    color: '#047857',
    border: '1px solid #a7f3d0',
    borderRadius: '980px',
    fontSize: '12px',
    fontWeight: '700',
  },
  inspectBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '4px',
    padding: '9px 14px',
    backgroundColor: '#f1f5f9',
    color: '#0f172a',
    border: '1px solid #e2e8f0',
    borderRadius: '980px',
    fontSize: '12px',
    fontWeight: '600',
    cursor: 'pointer',
  },
  learningCardsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
    gap: '20px',
  },
  learningCard: {
    backgroundColor: '#ffffff',
    borderRadius: '20px',
    padding: '24px',
    border: '1px solid rgba(0, 0, 0, 0.06)',
    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.04)',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    gap: '18px',
  },
  learningCardTop: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  learningHeaderRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: '8px',
  },
  priorityPill: {
    fontSize: '11px',
    fontWeight: '700',
    padding: '3px 10px',
    borderRadius: '980px',
    border: '1px solid',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
  },
  priorityDot: {
    width: '6px',
    height: '6px',
    borderRadius: '50%',
  },
  impactBadge: {
    fontSize: '11px',
    fontWeight: '700',
    color: '#059669',
    backgroundColor: '#ecfdf5',
    padding: '3px 8px',
    borderRadius: '6px',
  },
  learningSkillTitle: {
    margin: '4px 0 0 0',
    fontSize: '18px',
    fontWeight: '800',
    color: '#0f172a',
  },
  learningReason: {
    margin: 0,
    fontSize: '13px',
    color: '#64748b',
    lineHeight: '1.4',
  },
  progressionContainer: {
    backgroundColor: '#f8fafc',
    padding: '12px 16px',
    borderRadius: '12px',
  },
  progressionSteps: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-around',
  },
  stepBlock: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  stepLabel: {
    fontSize: '10px',
    color: '#94a3b8',
    textTransform: 'uppercase',
    fontWeight: '600',
  },
  stepVal: {
    fontSize: '14px',
    fontWeight: '700',
    color: '#475569',
  },
  stepValTarget: {
    fontSize: '14px',
    fontWeight: '800',
    color: '#059669',
  },
  coursewareBlock: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
    borderTop: '1px solid #f1f5f9',
    paddingTop: '12px',
  },
  courseHeaderLabel: {
    fontSize: '11px',
    fontWeight: '700',
    color: '#64748b',
  },
  courseContent: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: '8px',
  },
  courseTitle: {
    fontSize: '13px',
    fontWeight: '700',
    color: '#0071e3',
  },
  providerBadge: {
    fontSize: '10px',
    fontWeight: '700',
    backgroundColor: '#f1f5f9',
    color: '#475569',
    padding: '2px 8px',
    borderRadius: '980px',
    whiteSpace: 'nowrap',
  },
  selfPacedNote: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    fontSize: '12px',
    color: '#64748b',
    fontStyle: 'italic',
    borderTop: '1px solid #f1f5f9',
    paddingTop: '10px',
  },
  emptyState: {
    padding: '40px',
    textAlign: 'center',
    color: '#94a3b8',
    fontSize: '14px',
  },
};
