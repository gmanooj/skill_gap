import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Sparkles,
  ArrowUpRight,
  Target,
  Search,
  Users,
  Star,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Building2,
  LayoutGrid,
  List,
  SlidersHorizontal,
  Check,
  X,
  Eye,
  Award,
  ArrowUpDown,
  ClipboardList,
} from 'lucide-react';
import { useAuth, authFetch } from '../context/AuthContext';
import AdminLayout from '../components/AdminLayout';
import Loader from '../components/Loader';

export default function AdminStudents() {
  const navigate = useNavigate();
  const { user } = useAuth();

  // Data state
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // UI state
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'table'
  const [selectedStudent, setSelectedStudent] = useState(null); // for detail modal

  // Filtering state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSkills, setSelectedSkills] = useState([]);
  const [selectedGapType, setSelectedGapType] = useState('all'); // 'all', 'low', 'moderate', 'high'
  const [onlyJavaLowGap, setOnlyJavaLowGap] = useState(false);
  const [minStarRating, setMinStarRating] = useState(0);
  const [selectedRole, setSelectedRole] = useState('all');
  const [sortBy, setSortBy] = useState('match_desc');
  const [minMatchThreshold, setMinMatchThreshold] = useState(0);

  const allSkillsList = [
    'Java',
    'Spring Boot',
    'MySQL',
    'Python',
    'React',
    'AWS',
    'Docker',
    'Node.js',
    'TypeScript',
  ];

  const allRolesList = [
    'All Roles',
    'Java Full Stack Developer',
    'Cloud Backend Engineer',
    'Full Stack React Engineer',
    'Java & Spring Boot Specialist',
    'Data & Backend Developer',
    'DevOps & Cloud Engineer',
    'Senior Systems Architect',
  ];

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      setLoading(true);
      const res = await authFetch('/auth/admin/students');
      const data = await res.json();
      if (data.success) {
        setStudents(data.students || []);
      } else {
        setError(data.message || 'Failed to load students directory');
      }
    } catch (err) {
      setError('Error connecting to backend database: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSkillToggle = (skill) => {
    if (selectedSkills.includes(skill)) {
      setSelectedSkills(selectedSkills.filter((s) => s !== skill));
    } else {
      setSelectedSkills([...selectedSkills, skill]);
    }
  };

  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedSkills([]);
    setSelectedGapType('all');
    setOnlyJavaLowGap(false);
    setMinStarRating(0);
    setSelectedRole('all');
    setMinMatchThreshold(0);
    setSortBy('match_desc');
  };

  // Dynamic Metrics
  const totalCount = students.length;
  const lowGapCount = students.filter((s) => s.avg_match >= 75).length;
  const moderateGapCount = students.filter((s) => s.avg_match >= 50 && s.avg_match < 75).length;
  const javaAdvancedCount = students.filter((s) => (s.skills_map?.['Java'] || 0) >= 4).length;

  // Filter & Sort Logic
  const filteredStudents = students
    .filter((st) => {
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchName = st.name.toLowerCase().includes(q);
        const matchEmail = st.email.toLowerCase().includes(q);
        const matchRole = st.target_title && st.target_title.toLowerCase().includes(q);
        const matchSkills = st.skills && st.skills.some((sk) => sk.name.toLowerCase().includes(q));
        if (!matchName && !matchEmail && !matchRole && !matchSkills) return false;
      }

      if (selectedRole !== 'all' && selectedRole !== 'All Roles') {
        if (st.target_title !== selectedRole) return false;
      }

      if (onlyJavaLowGap) {
        if (!st.has_java_low_gap && (st.skills_map?.['Java'] || 0) < 4) return false;
      }

      if (selectedGapType === 'low' && st.avg_match < 75) return false;
      if (selectedGapType === 'moderate' && (st.avg_match < 50 || st.avg_match >= 75)) return false;
      if (selectedGapType === 'high' && st.avg_match >= 50) return false;

      if (selectedSkills.length > 0) {
        const hasAllSelected = selectedSkills.every((sk) => (st.skills_map?.[sk] || 0) >= 1);
        if (!hasAllSelected) return false;
      }

      if (minStarRating > 0) {
        const maxStudentRating = Math.max(...Object.values(st.skills_map || { 0: 0 }));
        if (maxStudentRating < minStarRating) return false;
      }

      if (minMatchThreshold > 0 && st.avg_match < minMatchThreshold) {
        return false;
      }

      return true;
    })
    .sort((a, b) => {
      if (sortBy === 'match_desc') return b.avg_match - a.avg_match;
      if (sortBy === 'match_asc') return a.avg_match - b.avg_match;
      if (sortBy === 'name_asc') return a.name.localeCompare(b.name);
      if (sortBy === 'apps_desc') return b.applications_count - a.applications_count;
      return 0;
    });

  const getStudentInitials = (name) => {
    if (!name) return 'ST';
    return name
      .split(' ')
      .map((w) => w[0])
      .join('')
      .slice(0, 2)
      .toUpperCase();
  };

  // Progress Bar & Indication Colors:
  // Green for high match (>=75%)
  // Yellow for moderate (50-74%)
  // Red for low/deficit (<50%)
  const getGapStatusInfo = (avgMatch) => {
    if (avgMatch >= 75) {
      return {
        label: 'Low Gap',
        barColor: '#10b981', // Green in progress bar
        tagBg: '#ecfdf5',
        tagColor: '#059669',
        tagBorder: '#a7f3d0',
      };
    }
    if (avgMatch >= 50) {
      return {
        label: 'Moderate Gap',
        barColor: '#f59e0b', // Yellow in progress bar
        tagBg: '#fffbeb',
        tagColor: '#d97706',
        tagBorder: '#fde68a',
      };
    }
    return {
      label: 'High Gap',
      barColor: '#ef4444', // Red indication and progress bar
      tagBg: '#fef2f2',
      tagColor: '#dc2626',
      tagBorder: '#fecaca',
    };
  };

  const activeFiltersCount =
    (searchQuery ? 1 : 0) +
    (selectedSkills.length > 0 ? selectedSkills.length : 0) +
    (selectedGapType !== 'all' ? 1 : 0) +
    (onlyJavaLowGap ? 1 : 0) +
    (minStarRating > 0 ? 1 : 0) +
    (selectedRole !== 'all' && selectedRole !== 'All Roles' ? 1 : 0) +
    (minMatchThreshold > 0 ? 1 : 0);

  return (
    <AdminLayout
      activeTab="students"
      pageTitle="Student & Candidate Analyzer"
      tagText="Live MySQL Directory"
      headerAction={
        <button
          onClick={() => navigate('/admin/candidates')}
          style={s.headerScreeningBtn}
        >
          <Sparkles size={14} color="#2563eb" />
          <span>Company Screening</span>
          <ArrowUpRight size={14} color="#2563eb" />
        </button>
      }
    >
      <main style={s.content}>
        {/* KPI Strip - Clean 3-color palette (White, Black, Blue) */}
        <div style={s.kpiStrip}>
          <div style={s.kpiCard}>
            <div style={{ ...s.kpiIconBox, backgroundColor: '#eff6ff', color: '#2563eb' }}>
              <Users size={18} />
            </div>
            <div style={s.kpiInfo}>
              <span style={s.kpiValue}>{totalCount}</span>
              <span style={s.kpiLabel}>Total Candidates</span>
            </div>
          </div>

          <div style={s.kpiCard}>
            <div style={{ ...s.kpiIconBox, backgroundColor: '#eff6ff', color: '#2563eb' }}>
              <CheckCircle2 size={18} />
            </div>
            <div style={s.kpiInfo}>
              <span style={s.kpiValue}>{lowGapCount}</span>
              <span style={s.kpiLabel}>Low Gap (Match ≥75%)</span>
            </div>
          </div>

          <div style={s.kpiCard}>
            <div style={{ ...s.kpiIconBox, backgroundColor: '#eff6ff', color: '#2563eb' }}>
              <Target size={18} />
            </div>
            <div style={s.kpiInfo}>
              <span style={s.kpiValue}>{moderateGapCount}</span>
              <span style={s.kpiLabel}>Moderate Gap (50–74%)</span>
            </div>
          </div>

          <div style={s.kpiCard}>
            <div style={{ ...s.kpiIconBox, backgroundColor: '#eff6ff', color: '#2563eb' }}>
              <Award size={18} />
            </div>
            <div style={s.kpiInfo}>
              <span style={s.kpiValue}>{javaAdvancedCount}</span>
              <span style={s.kpiLabel}>Java High Proficiency (4★+)</span>
            </div>
          </div>
        </div>

        {/* Main 2-Column Layout */}
        <div style={s.layoutGrid}>
          {/* ── LEFT FACETED FILTERS PANEL ── */}
          <aside style={s.filterPanel}>
            <div style={s.filterPanelHeader}>
              <div style={s.filterPanelTitleWrap}>
                <SlidersHorizontal size={15} color="#2563eb" />
                <h3 style={s.filterPanelTitle}>Filters</h3>
                {activeFiltersCount > 0 && (
                  <span style={s.filterBadgeCount}>{activeFiltersCount}</span>
                )}
              </div>
              {activeFiltersCount > 0 && (
                <button onClick={handleResetFilters} style={s.resetFilterBtn}>
                  <RotateCcw size={12} />
                  <span>Reset</span>
                </button>
              )}
            </div>

            {/* Quick Preset Toggles */}
            <div style={s.filterGroup}>
              <label style={s.groupLabel}>Quick Presets</label>
              <button
                type="button"
                onClick={() => setOnlyJavaLowGap((v) => !v)}
                style={{
                  ...s.presetBtn,
                  ...(onlyJavaLowGap ? s.presetBtnActive : {}),
                }}
              >
                <div style={s.presetBtnLeft}>
                  <Star
                    size={14}
                    color={onlyJavaLowGap ? '#2563eb' : '#64748b'}
                    fill={onlyJavaLowGap ? '#2563eb' : 'none'}
                  />
                  <span>Java Specialists (4★+)</span>
                </div>
                {onlyJavaLowGap && <Check size={14} color="#2563eb" />}
              </button>
            </div>

            {/* Gap Type Radio Classification */}
            <div style={s.filterGroup}>
              <label style={s.groupLabel}>Skill Gap Status</label>
              <div style={s.gapOptions}>
                {[
                  { id: 'all', label: 'All Gap Types', count: totalCount },
                  { id: 'low', label: 'Low Gap (≥75%)', count: lowGapCount },
                  { id: 'moderate', label: 'Moderate Gap (50–74%)', count: moderateGapCount },
                  { id: 'high', label: 'High Gap (<50%)', count: totalCount - lowGapCount - moderateGapCount },
                ].map((opt) => {
                  const isSelected = selectedGapType === opt.id;
                  return (
                    <button
                      key={opt.id}
                      onClick={() => setSelectedGapType(opt.id)}
                      style={{
                        ...s.gapOptionBtn,
                        ...(isSelected ? s.gapOptionBtnActive : {}),
                      }}
                    >
                      <span style={s.gapOptionText}>{opt.label}</span>
                      <span style={s.gapOptionCount}>{opt.count}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Technical Skills Required */}
            <div style={s.filterGroup}>
              <div style={s.groupLabelWithAction}>
                <label style={s.groupLabel}>Technical Skills</label>
                {selectedSkills.length > 0 && (
                  <button
                    onClick={() => setSelectedSkills([])}
                    style={s.clearSkillBtn}
                  >
                    Clear
                  </button>
                )}
              </div>
              <div style={s.skillsGrid}>
                {allSkillsList.map((skill) => {
                  const isSelected = selectedSkills.includes(skill);
                  return (
                    <button
                      key={skill}
                      onClick={() => handleSkillToggle(skill)}
                      style={{
                        ...s.skillChip,
                        ...(isSelected ? s.skillChipActive : {}),
                      }}
                    >
                      {isSelected && <Check size={12} strokeWidth={2.5} />}
                      <span>{skill}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Min Top Skill Star Rating */}
            <div style={s.filterGroup}>
              <label style={s.groupLabel}>Min Skill Rating</label>
              <div style={s.starRatingRow}>
                {[
                  { value: 0, label: 'Any' },
                  { value: 3, label: '3★+' },
                  { value: 4, label: '4★+' },
                  { value: 5, label: '5★' },
                ].map((lvl) => {
                  const active = minStarRating === lvl.value;
                  return (
                    <button
                      key={lvl.value}
                      onClick={() => setMinStarRating(lvl.value)}
                      style={{
                        ...s.starRatingBtn,
                        ...(active ? s.starRatingBtnActive : {}),
                      }}
                    >
                      <span>{lvl.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Minimum Job Match Score Slider */}
            <div style={s.filterGroup}>
              <div style={s.sliderLabelRow}>
                <label style={s.groupLabel}>Min Job Match</label>
                <span style={s.sliderValueText}>{minMatchThreshold}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="90"
                step="5"
                value={minMatchThreshold}
                onChange={(e) => setMinMatchThreshold(Number(e.target.value))}
                style={s.rangeSlider}
              />
            </div>

            {/* Target Role Dropdown */}
            <div style={s.filterGroup}>
              <label style={s.groupLabel}>Target Career Role</label>
              <div style={s.selectWrapper}>
                <select
                  value={selectedRole}
                  onChange={(e) => setSelectedRole(e.target.value)}
                  style={s.selectInput}
                >
                  {allRolesList.map((r) => (
                    <option key={r} value={r}>
                      {r}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </aside>

          {/* ── RIGHT CANDIDATE RESULTS AREA ── */}
          <section style={s.resultsArea}>
            {/* Controls Bar: Search, View Mode, Sort */}
            <div style={s.controlsBar}>
              {/* Search Input */}
              <div style={s.searchWrap}>
                <Search size={16} color="#94a3b8" style={s.searchIcon} />
                <input
                  type="text"
                  placeholder="Search candidates by name, email, target role, or skills..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={s.searchInput}
                />
                {searchQuery && (
                  <button onClick={() => setSearchQuery('')} style={s.clearSearchBtn}>
                    <X size={14} />
                  </button>
                )}
              </div>

              {/* Sort Dropdown */}
              <div style={s.sortWrap}>
                <ArrowUpDown size={14} color="#64748b" />
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  style={s.sortSelect}
                >
                  <option value="match_desc">Highest Match %</option>
                  <option value="match_asc">Lowest Match %</option>
                  <option value="name_asc">Candidate Name (A–Z)</option>
                  <option value="apps_desc">Most Applications</option>
                </select>
              </div>

              {/* View Mode Toggle */}
              <div style={s.viewToggle}>
                <button
                  onClick={() => setViewMode('grid')}
                  title="Grid Cards View"
                  style={{
                    ...s.viewBtn,
                    ...(viewMode === 'grid' ? s.viewBtnActive : {}),
                  }}
                >
                  <LayoutGrid size={15} />
                </button>
                <button
                  onClick={() => setViewMode('table')}
                  title="Table View"
                  style={{
                    ...s.viewBtn,
                    ...(viewMode === 'table' ? s.viewBtnActive : {}),
                  }}
                >
                  <List size={15} />
                </button>
              </div>
            </div>

            {/* Active Filters Row & Results Count */}
            <div style={s.metaFilterRow}>
              <div style={s.resultsCountBadge}>
                Showing <strong>{filteredStudents.length}</strong> of <strong>{totalCount}</strong> Candidates
              </div>

              {activeFiltersCount > 0 && (
                <div style={s.activeFilterChips}>
                  {selectedGapType !== 'all' && (
                    <span style={s.activeChip}>
                      Gap: {selectedGapType}
                      <X size={12} onClick={() => setSelectedGapType('all')} />
                    </span>
                  )}
                  {onlyJavaLowGap && (
                    <span style={s.activeChip}>
                      Java 4★+
                      <X size={12} onClick={() => setOnlyJavaLowGap(false)} />
                    </span>
                  )}
                  {selectedRole !== 'all' && selectedRole !== 'All Roles' && (
                    <span style={s.activeChip}>
                      {selectedRole}
                      <X size={12} onClick={() => setSelectedRole('all')} />
                    </span>
                  )}
                  {minStarRating > 0 && (
                    <span style={s.activeChip}>
                      {minStarRating}★+ Min
                      <X size={12} onClick={() => setMinStarRating(0)} />
                    </span>
                  )}
                  {minMatchThreshold > 0 && (
                    <span style={s.activeChip}>
                      ≥{minMatchThreshold}% Match
                      <X size={12} onClick={() => setMinMatchThreshold(0)} />
                    </span>
                  )}
                  {selectedSkills.map((sk) => (
                    <span key={sk} style={s.activeChip}>
                      {sk}
                      <X size={12} onClick={() => handleSkillToggle(sk)} />
                    </span>
                  ))}
                  <button onClick={handleResetFilters} style={s.clearAllLink}>
                    Clear all
                  </button>
                </div>
              )}
            </div>

            {/* Loading / Error / Empty States */}
            {loading ? (
              <Loader message="Synchronizing candidates with MySQL database..." />
            ) : error ? (
              <div style={s.errorBox}>
                <AlertTriangle size={18} color="#dc2626" />
                <span>{error}</span>
              </div>
            ) : filteredStudents.length === 0 ? (
              <div style={s.emptyBox}>
                <div style={s.emptyIconWrap}>
                  <Users size={28} color="#94a3b8" />
                </div>
                <h3 style={s.emptyTitle}>No Matching Candidates</h3>
                <p style={s.emptySubtitle}>
                  Try broadening your search query or adjusting skill filters.
                </p>
                <button onClick={handleResetFilters} style={s.emptyResetBtn}>
                  <RotateCcw size={14} />
                  <span>Reset All Filters</span>
                </button>
              </div>
            ) : viewMode === 'grid' ? (
              /* ── GRID CARDS VIEW ── */
              <div style={s.cardsGrid}>
                {filteredStudents.map((st) => {
                  const statusInfo = getGapStatusInfo(st.avg_match);

                  return (
                    <div
                      key={st.student_id}
                      style={s.candidateCard}
                      onClick={() => setSelectedStudent(st)}
                    >
                      {/* Top Card Row */}
                      <div style={s.cardTop}>
                        <div style={s.cardAvatar}>{getStudentInitials(st.name)}</div>
                        <div style={s.cardIdentity}>
                          <h4 style={s.cardName}>{st.name}</h4>
                          <span style={s.cardEmail}>{st.email}</span>
                        </div>
                        <span
                          style={{
                            ...s.gapBadgePill,
                            backgroundColor: statusInfo.tagBg,
                            color: statusInfo.tagColor,
                            borderColor: statusInfo.tagBorder,
                          }}
                        >
                          {statusInfo.label}
                        </span>
                      </div>

                      {/* Target Role */}
                      <div style={s.cardRoleWrap}>
                        <span style={s.cardRoleText}>{st.target_title || 'Software Developer'}</span>
                      </div>

                      {/* Match Percentage Progress Bar:
                          Green for high match, Yellow for medium, Red for low/gap */}
                      <div style={s.matchMeterWrap}>
                        <div style={s.matchMeterLabelRow}>
                          <span style={s.matchMeterTitle}>Average Match</span>
                          <span style={{ ...s.matchMeterPercent, color: statusInfo.tagColor }}>
                            {st.avg_match}%
                          </span>
                        </div>
                        <div style={s.matchProgressBarBg}>
                          <div
                            style={{
                              ...s.matchProgressBarFill,
                              width: `${Math.min(st.avg_match, 100)}%`,
                              backgroundColor: statusInfo.barColor,
                            }}
                          />
                        </div>
                      </div>

                      {/* Best Matching Company */}
                      {st.best_match && st.best_match.company && (
                        <div style={s.bestMatchTag}>
                          <Building2 size={12} color="#64748b" />
                          <span>
                            Best Fit: <strong>{st.best_match.company}</strong> ({st.best_match.match}%)
                          </span>
                        </div>
                      )}

                      {/* Skills Badges */}
                      <div style={s.cardSkillsArea}>
                        <div style={s.cardSkillsLabel}>Skills</div>
                        <div style={s.cardSkillsList}>
                          {st.skills &&
                            st.skills.slice(0, 5).map((sk) => (
                              <span key={sk.name} style={s.cardSkillPill}>
                                <strong>{sk.name}</strong> {sk.level}★
                              </span>
                            ))}
                          {st.skills && st.skills.length > 5 && (
                            <span style={s.cardSkillMore}>+{st.skills.length - 5}</span>
                          )}
                        </div>
                      </div>

                      {/* Card Bottom */}
                      <div style={s.cardFooter}>
                        <span style={s.cardAppCount}>
                          <ClipboardList size={13} color="#64748b" />
                          {st.applications_count} Applied
                        </span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedStudent(st);
                          }}
                          style={s.cardActionBtn}
                        >
                          <span>Analyze Details</span>
                          <ArrowUpRight size={13} />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              /* ── TABLE VIEW ── */
              <div style={s.tableCard}>
                <table style={s.table}>
                  <thead>
                    <tr style={s.tableHeadRow}>
                      <th style={s.th}>Candidate</th>
                      <th style={s.th}>Target Role</th>
                      <th style={s.th}>Average Match</th>
                      <th style={s.th}>Gap Status</th>
                      <th style={s.th}>Technical Skills</th>
                      <th style={s.th}>Applications</th>
                      <th style={{ ...s.th, textAlign: 'right' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredStudents.map((st) => {
                      const statusInfo = getGapStatusInfo(st.avg_match);
                      return (
                        <tr
                          key={st.student_id}
                          style={s.tableRow}
                          onClick={() => setSelectedStudent(st)}
                        >
                          <td style={s.td}>
                            <div style={s.tableCandidateCell}>
                              <div style={s.tableAvatar}>
                                {getStudentInitials(st.name)}
                              </div>
                              <div>
                                <div style={s.tableCandidateName}>{st.name}</div>
                                <div style={s.tableCandidateEmail}>{st.email}</div>
                              </div>
                            </div>
                          </td>
                          <td style={s.td}>
                            <span style={s.tableRoleTag}>{st.target_title}</span>
                          </td>
                          <td style={s.td}>
                            <div style={s.tableMatchWrap}>
                              <div style={s.tableProgressBarBg}>
                                <div
                                  style={{
                                    ...s.tableProgressBarFill,
                                    width: `${Math.min(st.avg_match, 100)}%`,
                                    backgroundColor: statusInfo.barColor,
                                  }}
                                />
                              </div>
                              <span style={{ ...s.tableMatchPct, color: statusInfo.tagColor }}>
                                {st.avg_match}%
                              </span>
                            </div>
                          </td>
                          <td style={s.td}>
                            <span
                              style={{
                                ...s.gapBadgePill,
                                backgroundColor: statusInfo.tagBg,
                                color: statusInfo.tagColor,
                                borderColor: statusInfo.tagBorder,
                              }}
                            >
                              {statusInfo.label}
                            </span>
                          </td>
                          <td style={s.td}>
                            <div style={s.tableSkillsPills}>
                              {st.skills &&
                                st.skills.slice(0, 3).map((sk) => (
                                  <span key={sk.name} style={s.tableSkillItem}>
                                    {sk.name}: {sk.level}★
                                  </span>
                                ))}
                              {st.skills && st.skills.length > 3 && (
                                <span style={s.tableSkillMore}>
                                  +{st.skills.length - 3}
                                </span>
                              )}
                            </div>
                          </td>
                          <td style={s.td}>
                            <div style={s.tableAppCountWrap}>
                              <span style={s.tableAppNumber}>
                                {st.applications_count} Applied
                              </span>
                              {st.applied_companies && st.applied_companies.length > 0 && (
                                <span style={s.tableAppCompanies}>
                                  {st.applied_companies.join(', ')}
                                </span>
                              )}
                            </div>
                          </td>
                          <td style={{ ...s.td, textAlign: 'right' }}>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedStudent(st);
                              }}
                              style={s.tableActionBtn}
                            >
                              <Eye size={13} />
                              <span>Inspect</span>
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </div>
      </main>

      {/* ── CANDIDATE SKILL MATRIX MODAL ── */}
      {selectedStudent && (
        <div
          style={s.modalOverlay}
          onClick={() => setSelectedStudent(null)}
        >
          <div
            style={s.modalDialog}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div style={s.modalHeader}>
              <div style={s.modalHeaderIdentity}>
                <div style={s.modalAvatar}>
                  {getStudentInitials(selectedStudent.name)}
                </div>
                <div>
                  <div style={s.modalNameRow}>
                    <h2 style={s.modalName}>{selectedStudent.name}</h2>
                    <span
                      style={{
                        ...s.gapBadgePill,
                        ...getGapStatusInfo(selectedStudent.avg_match),
                        backgroundColor: getGapStatusInfo(selectedStudent.avg_match).tagBg,
                        color: getGapStatusInfo(selectedStudent.avg_match).tagColor,
                        borderColor: getGapStatusInfo(selectedStudent.avg_match).tagBorder,
                      }}
                    >
                      {getGapStatusInfo(selectedStudent.avg_match).label}
                    </span>
                  </div>
                  <div style={s.modalSubRow}>
                    <span>{selectedStudent.email}</span>
                    <span>•</span>
                    <span>{selectedStudent.target_title}</span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => setSelectedStudent(null)}
                style={s.modalCloseBtn}
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Body */}
            <div style={s.modalBody}>
              {/* Match Overview Banner */}
              <div style={s.modalMatchBanner}>
                <div style={s.modalMatchCol}>
                  <span style={s.modalMatchLabel}>Average Benchmark Match</span>
                  <span style={s.modalMatchBigVal}>{selectedStudent.avg_match}%</span>
                </div>
                <div style={s.modalMatchDivider} />
                <div style={s.modalMatchCol}>
                  <span style={s.modalMatchLabel}>Best Company Fit</span>
                  <span style={s.modalMatchSubVal}>
                    {selectedStudent.best_match?.company || 'None'} ({selectedStudent.best_match?.match || 0}%)
                  </span>
                </div>
                <div style={s.modalMatchDivider} />
                <div style={s.modalMatchCol}>
                  <span style={s.modalMatchLabel}>Job Applications</span>
                  <span style={s.modalMatchSubVal}>
                    {selectedStudent.applications_count} Active
                  </span>
                </div>
              </div>

              {/* Skills Radar / Breakdown Grid */}
              <div style={s.modalSection}>
                <h4 style={s.modalSectionTitle}>Technical Skills &amp; Proficiency</h4>
                <div style={s.modalSkillsGrid}>
                  {selectedStudent.skills &&
                    selectedStudent.skills.map((sk) => {
                      // Progress bar: green for >=4, yellow for 2.5-3.5, red for <2.5
                      const barCol = sk.level >= 4 ? '#10b981' : sk.level >= 2.5 ? '#f59e0b' : '#ef4444';
                      return (
                        <div key={sk.name} style={s.modalSkillCard}>
                          <div style={s.modalSkillTop}>
                            <span style={s.modalSkillName}>{sk.name}</span>
                            <span style={s.modalSkillTag}>{sk.tag || 'Intermediate'}</span>
                          </div>
                          <div style={s.modalStarRow}>
                            <span style={s.modalStarText}>{sk.level} / 5</span>
                          </div>
                          <div style={s.modalSkillBarBg}>
                            <div
                              style={{
                                ...s.modalSkillBarFill,
                                width: `${(sk.level / 5) * 100}%`,
                                backgroundColor: barCol,
                              }}
                            />
                          </div>
                        </div>
                      );
                    })}
                </div>
              </div>

              {/* Benchmark Applications */}
              {selectedStudent.applied_companies && selectedStudent.applied_companies.length > 0 && (
                <div style={s.modalSection}>
                  <h4 style={s.modalSectionTitle}>Target Companies Applied</h4>
                  <div style={s.modalCompaniesWrap}>
                    {selectedStudent.applied_companies.map((comp) => (
                      <span key={comp} style={s.modalCompanyTag}>
                        <Building2 size={13} color="#64748b" />
                        <span>{comp}</span>
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div style={s.modalFooter}>
              <button
                onClick={() => {
                  setSelectedStudent(null);
                  navigate('/admin/candidates');
                }}
                style={s.modalScreenCandidateBtn}
              >
                <Sparkles size={14} />
                <span>Screen Across Companies</span>
              </button>
              <button
                onClick={() => setSelectedStudent(null)}
                style={s.modalDismissBtn}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}

/* ─────────────────────────────────────────────────────────────────────────
   STYLES: White, Black, Blue Only
   (No colored borders on cards; green/yellow/red strictly for progress bars)
   ───────────────────────────────────────────────────────────────────────── */
const s = {
  content: {
    padding: '20px 24px 36px',
    display: 'flex',
    flexDirection: 'column',
    gap: '18px',
    overflowY: 'auto',
    boxSizing: 'border-box',
  },
  headerScreeningBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    backgroundColor: '#ffffff',
    border: '1px solid #e2e8f0',
    color: '#2563eb',
    fontSize: '12px',
    fontWeight: '600',
    padding: '7px 12px',
    borderRadius: '8px',
    cursor: 'pointer',
  },

  /* KPI Strip */
  kpiStrip: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))',
    gap: '12px',
  },
  kpiCard: {
    backgroundColor: '#ffffff',
    borderRadius: '12px',
    padding: '14px 16px',
    border: '1px solid #e2e8f0',
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  kpiIconBox: {
    width: '38px',
    height: '38px',
    borderRadius: '10px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  kpiInfo: {
    display: 'flex',
    flexDirection: 'column',
    gap: '2px',
  },
  kpiValue: {
    fontSize: '18px',
    fontWeight: '800',
    color: '#0f172a',
    letterSpacing: '-0.02em',
    lineHeight: 1.1,
  },
  kpiLabel: {
    fontSize: '11px',
    color: '#64748b',
    fontWeight: '500',
  },

  /* 2-Column Grid Layout */
  layoutGrid: {
    display: 'grid',
    gridTemplateColumns: '260px 1fr',
    gap: '18px',
    alignItems: 'start',
  },

  /* ── Left Filter Panel ── */
  filterPanel: {
    backgroundColor: '#ffffff',
    borderRadius: '12px',
    border: '1px solid #e2e8f0',
    padding: '16px',
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  filterPanelHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: '12px',
    borderBottom: '1px solid #f1f5f9',
  },
  filterPanelTitleWrap: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  filterPanelTitle: {
    margin: 0,
    fontSize: '14px',
    fontWeight: '700',
    color: '#0f172a',
  },
  filterBadgeCount: {
    fontSize: '11px',
    fontWeight: '700',
    backgroundColor: '#eff6ff',
    color: '#2563eb',
    padding: '2px 6px',
    borderRadius: '999px',
  },
  resetFilterBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    background: 'none',
    border: 'none',
    color: '#2563eb',
    fontSize: '12px',
    fontWeight: '600',
    cursor: 'pointer',
    padding: '3px 6px',
  },
  filterGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  groupLabel: {
    fontSize: '11px',
    fontWeight: '700',
    textTransform: 'uppercase',
    color: '#64748b',
    letterSpacing: '0.05em',
  },
  groupLabelWithAction: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  clearSkillBtn: {
    background: 'none',
    border: 'none',
    color: '#94a3b8',
    fontSize: '11px',
    cursor: 'pointer',
  },
  presetBtn: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    padding: '9px 10px',
    borderRadius: '8px',
    border: '1px solid #e2e8f0',
    backgroundColor: '#f8fafc',
    cursor: 'pointer',
    fontSize: '12px',
    fontWeight: '600',
    color: '#334155',
  },
  presetBtnActive: {
    backgroundColor: '#eff6ff',
    borderColor: '#bfdbfe',
    color: '#2563eb',
  },
  presetBtnLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },

  /* Gap Options */
  gapOptions: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
  },
  gapOptionBtn: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '7px 10px',
    borderRadius: '8px',
    border: '1px solid transparent',
    backgroundColor: 'transparent',
    cursor: 'pointer',
    fontSize: '12px',
    color: '#334155',
  },
  gapOptionBtnActive: {
    backgroundColor: '#eff6ff',
    borderColor: '#bfdbfe',
    fontWeight: '600',
    color: '#2563eb',
  },
  gapOptionText: {
    fontSize: '12px',
  },
  gapOptionCount: {
    fontSize: '11px',
    fontWeight: '600',
    color: '#64748b',
  },

  /* Skills Chips */
  skillsGrid: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '5px',
  },
  skillChip: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '4px',
    padding: '5px 9px',
    borderRadius: '6px',
    fontSize: '11px',
    fontWeight: '500',
    color: '#334155',
    backgroundColor: '#f8fafc',
    border: '1px solid #e2e8f0',
    cursor: 'pointer',
  },
  skillChipActive: {
    backgroundColor: '#2563eb',
    borderColor: '#2563eb',
    color: '#ffffff',
    fontWeight: '600',
  },

  /* Star rating buttons */
  starRatingRow: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: '4px',
  },
  starRatingBtn: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '6px 4px',
    borderRadius: '6px',
    border: '1px solid #e2e8f0',
    backgroundColor: '#f8fafc',
    fontSize: '11px',
    fontWeight: '600',
    color: '#334155',
    cursor: 'pointer',
  },
  starRatingBtnActive: {
    backgroundColor: '#0f172a',
    borderColor: '#0f172a',
    color: '#ffffff',
  },

  /* Slider */
  sliderLabelRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sliderValueText: {
    fontSize: '12px',
    fontWeight: '700',
    color: '#2563eb',
  },
  rangeSlider: {
    width: '100%',
    accentColor: '#2563eb',
    cursor: 'pointer',
  },

  /* Select */
  selectWrapper: {
    position: 'relative',
  },
  selectInput: {
    width: '100%',
    padding: '8px 10px',
    borderRadius: '8px',
    border: '1px solid #e2e8f0',
    fontSize: '12px',
    color: '#0f172a',
    backgroundColor: '#ffffff',
    outline: 'none',
  },

  /* ── Right Results Area ── */
  resultsArea: {
    display: 'flex',
    flexDirection: 'column',
    gap: '14px',
  },

  /* Controls Bar */
  controlsBar: {
    backgroundColor: '#ffffff',
    borderRadius: '10px',
    border: '1px solid #e2e8f0',
    padding: '8px 12px',
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  searchWrap: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    flex: 1,
  },
  searchIcon: {
    flexShrink: 0,
  },
  searchInput: {
    width: '100%',
    border: 'none',
    outline: 'none',
    fontSize: '13px',
    color: '#0f172a',
    backgroundColor: 'transparent',
  },
  clearSearchBtn: {
    background: 'none',
    border: 'none',
    color: '#94a3b8',
    cursor: 'pointer',
    padding: '2px',
    display: 'flex',
  },
  sortWrap: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    borderLeft: '1px solid #e2e8f0',
    paddingLeft: '12px',
  },
  sortSelect: {
    border: 'none',
    outline: 'none',
    fontSize: '12px',
    fontWeight: '500',
    color: '#334155',
    backgroundColor: 'transparent',
    cursor: 'pointer',
  },
  viewToggle: {
    display: 'flex',
    gap: '2px',
    borderLeft: '1px solid #e2e8f0',
    paddingLeft: '10px',
  },
  viewBtn: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '28px',
    height: '28px',
    borderRadius: '6px',
    border: 'none',
    backgroundColor: 'transparent',
    color: '#94a3b8',
    cursor: 'pointer',
  },
  viewBtnActive: {
    backgroundColor: '#eff6ff',
    color: '#2563eb',
    fontWeight: '700',
  },

  /* Meta & Filter Chips Row */
  metaFilterRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: '8px',
  },
  resultsCountBadge: {
    fontSize: '12px',
    color: '#64748b',
  },
  activeFilterChips: {
    display: 'flex',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: '6px',
  },
  activeChip: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '5px',
    fontSize: '11px',
    fontWeight: '600',
    backgroundColor: '#eff6ff',
    color: '#2563eb',
    padding: '3px 8px',
    borderRadius: '999px',
    border: '1px solid #bfdbfe',
    cursor: 'pointer',
  },
  clearAllLink: {
    background: 'none',
    border: 'none',
    color: '#2563eb',
    fontSize: '11px',
    fontWeight: '600',
    cursor: 'pointer',
    textDecoration: 'underline',
  },

  /* ── Candidate Cards Grid ── */
  cardsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(290px, 1fr))',
    gap: '14px',
  },
  candidateCard: {
    backgroundColor: '#ffffff',
    borderRadius: '12px',
    border: '1px solid #e2e8f0',
    padding: '16px',
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    cursor: 'pointer',
    transition: 'border-color 0.15s ease',
  },
  cardTop: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },
  cardAvatar: {
    width: '36px',
    height: '36px',
    borderRadius: '8px',
    background: '#2563eb',
    color: '#ffffff',
    fontSize: '12px',
    fontWeight: '700',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  cardIdentity: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1px',
    flex: 1,
    overflow: 'hidden',
  },
  cardName: {
    margin: 0,
    fontSize: '14px',
    fontWeight: '700',
    color: '#0f172a',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  cardEmail: {
    fontSize: '11px',
    color: '#64748b',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  gapBadgePill: {
    display: 'inline-flex',
    alignItems: 'center',
    fontSize: '10px',
    fontWeight: '700',
    padding: '3px 8px',
    borderRadius: '999px',
    border: '1px solid',
    whiteSpace: 'nowrap',
  },
  cardRoleWrap: {
    fontSize: '12px',
    color: '#334155',
    backgroundColor: '#f8fafc',
    padding: '6px 10px',
    borderRadius: '6px',
    border: '1px solid #e2e8f0',
  },
  cardRoleText: {
    fontWeight: '500',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  matchMeterWrap: {
    display: 'flex',
    flexDirection: 'column',
    gap: '5px',
  },
  matchMeterLabelRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  matchMeterTitle: {
    fontSize: '11px',
    fontWeight: '600',
    color: '#64748b',
  },
  matchMeterPercent: {
    fontSize: '13px',
    fontWeight: '800',
  },
  matchProgressBarBg: {
    width: '100%',
    height: '6px',
    borderRadius: '999px',
    backgroundColor: '#f1f5f9',
    overflow: 'hidden',
  },
  matchProgressBarFill: {
    height: '100%',
    borderRadius: '999px',
  },
  bestMatchTag: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    fontSize: '11px',
    color: '#475569',
  },
  cardSkillsArea: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
    marginTop: '2px',
  },
  cardSkillsLabel: {
    fontSize: '10px',
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: '0.04em',
    color: '#94a3b8',
  },
  cardSkillsList: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '4px',
  },
  cardSkillPill: {
    fontSize: '10px',
    padding: '2px 6px',
    borderRadius: '4px',
    backgroundColor: '#f8fafc',
    border: '1px solid #e2e8f0',
    color: '#0f172a',
  },
  cardSkillMore: {
    fontSize: '10px',
    color: '#94a3b8',
    alignSelf: 'center',
    fontWeight: '500',
  },
  cardFooter: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderTop: '1px solid #f1f5f9',
    paddingTop: '10px',
    marginTop: 'auto',
  },
  cardAppCount: {
    display: 'flex',
    alignItems: 'center',
    gap: '5px',
    fontSize: '11px',
    color: '#64748b',
    fontWeight: '500',
  },
  cardActionBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    background: 'none',
    border: 'none',
    color: '#2563eb',
    fontSize: '11px',
    fontWeight: '700',
    cursor: 'pointer',
  },

  /* ── Detailed Table View ── */
  tableCard: {
    backgroundColor: '#ffffff',
    borderRadius: '12px',
    border: '1px solid #e2e8f0',
    overflow: 'hidden',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    textAlign: 'left',
  },
  tableHeadRow: {
    backgroundColor: '#f8fafc',
    borderBottom: '1px solid #e2e8f0',
  },
  th: {
    padding: '12px 16px',
    fontSize: '11px',
    fontWeight: '700',
    color: '#64748b',
    textTransform: 'uppercase',
    letterSpacing: '0.04em',
  },
  tableRow: {
    borderBottom: '1px solid #f1f5f9',
    cursor: 'pointer',
  },
  td: {
    padding: '12px 16px',
    fontSize: '12px',
    color: '#0f172a',
    verticalAlign: 'middle',
  },
  tableCandidateCell: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },
  tableAvatar: {
    width: '32px',
    height: '32px',
    borderRadius: '6px',
    background: '#2563eb',
    color: '#fff',
    fontSize: '11px',
    fontWeight: '700',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  tableCandidateName: {
    fontWeight: '600',
    color: '#0f172a',
    fontSize: '13px',
  },
  tableCandidateEmail: {
    fontSize: '11px',
    color: '#64748b',
  },
  tableRoleTag: {
    fontSize: '11px',
    backgroundColor: '#f8fafc',
    border: '1px solid #e2e8f0',
    color: '#334155',
    padding: '3px 7px',
    borderRadius: '6px',
    fontWeight: '500',
  },
  tableMatchWrap: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  tableProgressBarBg: {
    width: '60px',
    height: '5px',
    borderRadius: '999px',
    backgroundColor: '#f1f5f9',
    overflow: 'hidden',
  },
  tableProgressBarFill: {
    height: '100%',
    borderRadius: '999px',
  },
  tableMatchPct: {
    fontSize: '12px',
    fontWeight: '700',
  },
  tableSkillsPills: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '4px',
    maxWidth: '220px',
  },
  tableSkillItem: {
    fontSize: '10px',
    backgroundColor: '#f8fafc',
    border: '1px solid #e2e8f0',
    color: '#334155',
    padding: '2px 5px',
    borderRadius: '4px',
  },
  tableSkillMore: {
    fontSize: '10px',
    color: '#94a3b8',
    alignSelf: 'center',
  },
  tableAppCountWrap: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1px',
  },
  tableAppNumber: {
    fontWeight: '600',
    fontSize: '12px',
    color: '#0f172a',
  },
  tableAppCompanies: {
    fontSize: '10px',
    color: '#64748b',
  },
  tableActionBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '4px',
    backgroundColor: '#ffffff',
    border: '1px solid #e2e8f0',
    color: '#2563eb',
    fontSize: '11px',
    fontWeight: '600',
    padding: '4px 8px',
    borderRadius: '6px',
    cursor: 'pointer',
  },

  /* ── Error & Empty ── */
  errorBox: {
    backgroundColor: '#fef2f2',
    border: '1px solid #fecaca',
    borderRadius: '10px',
    padding: '16px',
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    color: '#dc2626',
    fontSize: '13px',
  },
  emptyBox: {
    backgroundColor: '#ffffff',
    borderRadius: '12px',
    border: '1px solid #e2e8f0',
    padding: '48px 24px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    textAlign: 'center',
  },
  emptyIconWrap: {
    width: '48px',
    height: '48px',
    borderRadius: '50%',
    backgroundColor: '#f8fafc',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: '12px',
  },
  emptyTitle: {
    fontSize: '15px',
    fontWeight: '700',
    color: '#0f172a',
    margin: '0 0 6px',
  },
  emptySubtitle: {
    fontSize: '13px',
    color: '#64748b',
    margin: '0 0 16px',
    maxWidth: '380px',
  },
  emptyResetBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    backgroundColor: '#2563eb',
    color: '#ffffff',
    border: 'none',
    borderRadius: '8px',
    padding: '8px 16px',
    fontSize: '12px',
    fontWeight: '600',
    cursor: 'pointer',
  },

  /* ── Modal ── */
  modalOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
    padding: '20px',
  },
  modalDialog: {
    backgroundColor: '#ffffff',
    borderRadius: '14px',
    boxShadow: '0 20px 40px rgba(0,0,0,0.2)',
    width: '100%',
    maxWidth: '640px',
    maxHeight: '90vh',
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
  },
  modalHeader: {
    padding: '16px 20px',
    borderBottom: '1px solid #e2e8f0',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  modalHeaderIdentity: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  modalAvatar: {
    width: '40px',
    height: '40px',
    borderRadius: '10px',
    background: '#2563eb',
    color: '#ffffff',
    fontSize: '14px',
    fontWeight: '700',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  modalNameRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  modalName: {
    fontSize: '16px',
    fontWeight: '700',
    color: '#0f172a',
    margin: 0,
  },
  modalSubRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    fontSize: '12px',
    color: '#64748b',
    marginTop: '2px',
  },
  modalCloseBtn: {
    background: 'none',
    border: 'none',
    color: '#94a3b8',
    cursor: 'pointer',
    padding: '6px',
    display: 'flex',
  },
  modalBody: {
    padding: '18px 20px',
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
    overflowY: 'auto',
  },
  modalMatchBanner: {
    backgroundColor: '#f8fafc',
    border: '1px solid #e2e8f0',
    borderRadius: '10px',
    padding: '12px 16px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-around',
  },
  modalMatchCol: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '2px',
  },
  modalMatchLabel: {
    fontSize: '10px',
    fontWeight: '700',
    textTransform: 'uppercase',
    color: '#64748b',
  },
  modalMatchBigVal: {
    fontSize: '20px',
    fontWeight: '800',
    color: '#0f172a',
  },
  modalMatchSubVal: {
    fontSize: '12px',
    fontWeight: '700',
    color: '#0f172a',
  },
  modalMatchDivider: {
    width: '1px',
    height: '30px',
    backgroundColor: '#e2e8f0',
  },
  modalSection: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
  },
  modalSectionTitle: {
    fontSize: '12px',
    fontWeight: '700',
    textTransform: 'uppercase',
    color: '#0f172a',
    letterSpacing: '0.04em',
    margin: 0,
  },
  modalSkillsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(170px, 1fr))',
    gap: '10px',
  },
  modalSkillCard: {
    backgroundColor: '#ffffff',
    border: '1px solid #e2e8f0',
    borderRadius: '8px',
    padding: '10px 12px',
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
  },
  modalSkillTop: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  modalSkillName: {
    fontSize: '13px',
    fontWeight: '700',
    color: '#0f172a',
  },
  modalSkillTag: {
    fontSize: '10px',
    color: '#64748b',
    backgroundColor: '#f8fafc',
    padding: '1px 5px',
    borderRadius: '4px',
  },
  modalStarRow: {
    display: 'flex',
    alignItems: 'center',
  },
  modalStarText: {
    fontSize: '11px',
    fontWeight: '600',
    color: '#64748b',
  },
  modalSkillBarBg: {
    width: '100%',
    height: '5px',
    borderRadius: '999px',
    backgroundColor: '#f1f5f9',
    overflow: 'hidden',
    marginTop: '2px',
  },
  modalSkillBarFill: {
    height: '100%',
    borderRadius: '999px',
  },
  modalCompaniesWrap: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '6px',
  },
  modalCompanyTag: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    backgroundColor: '#f8fafc',
    border: '1px solid #e2e8f0',
    padding: '5px 8px',
    borderRadius: '6px',
    fontSize: '11px',
    fontWeight: '600',
    color: '#334155',
  },
  modalFooter: {
    padding: '12px 20px',
    borderTop: '1px solid #e2e8f0',
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '10px',
    backgroundColor: '#f8fafc',
  },
  modalScreenCandidateBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    backgroundColor: '#2563eb',
    color: '#ffffff',
    border: 'none',
    borderRadius: '8px',
    padding: '7px 14px',
    fontSize: '12px',
    fontWeight: '600',
    cursor: 'pointer',
  },
  modalDismissBtn: {
    backgroundColor: '#ffffff',
    border: '1px solid #e2e8f0',
    color: '#334155',
    borderRadius: '8px',
    padding: '7px 14px',
    fontSize: '12px',
    fontWeight: '600',
    cursor: 'pointer',
  },
};
