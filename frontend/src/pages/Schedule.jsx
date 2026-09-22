import React, { useState, useEffect } from 'react';
import {
  Calendar as CalendarIcon,
  Plus,
  Clock,
  MapPin,
  Video,
  Trash2,
  X,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  Filter,
  LayoutGrid,
  List,
  Sparkles,
  BookOpen,
  User
} from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';

export const Schedule = () => {
  const { role, showToast } = useAuth();
  const [lessons, setLessons] = useState([]);
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);

  // View mode: 'kundalik' (Weekly grid) or 'list'
  const [viewMode, setViewMode] = useState('kundalik');

  // Selected filters
  const [selectedGroup, setSelectedGroup] = useState('');
  const [selectedTeacher, setSelectedTeacher] = useState('');

  // Week navigation (current week offset from Monday of this week)
  const [weekOffsetDays, setWeekOffsetDays] = useState(0);

  // Modal
  const [showModal, setShowModal] = useState(false);
  const [conflictError, setConflictError] = useState('');
  const [form, setForm] = useState({
    groupId: '',
    title: '',
    date: new Date().toISOString().split('T')[0],
    startTime: '14:00',
    endTime: '15:30',
    room: 'Auditoriya 101',
    onlineUrl: ''
  });

  useEffect(() => {
    fetchSchedule();
    fetchGroups();
  }, []);

  const fetchSchedule = async () => {
    setLoading(true);
    try {
      const res = await api.lessons.getAll();
      if (res?.data) {
        setLessons(res.data);
      }
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const fetchGroups = async () => {
    try {
      const res = await api.groups.getAll();
      if (res?.data) {
        setGroups(res.data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Kundalik Timetable periods definition
  const periods = [
    { num: 1, label: '1-Dars', start: '08:30', end: '09:15' },
    { num: 2, label: '2-Dars', start: '09:25', end: '10:10' },
    { num: 3, label: '3-Dars', start: '10:20', end: '11:05' },
    { num: 4, label: '4-Dars', start: '11:15', end: '12:00' },
    { num: 5, label: '5-Dars', start: '14:00', end: '15:30' },
    { num: 6, label: '6-Dars', start: '16:00', end: '17:30' },
    { num: 7, label: '7-Dars', start: '18:00', end: '19:30' }
  ];

  // Days of the week (Dushanba - Shanba / Mon - Sat)
  const getWeekDays = () => {
    const today = new Date();
    const currentDayOfWeek = today.getDay(); // 0 is Sunday, 1 is Monday...
    const diffToMonday = (currentDayOfWeek === 0 ? -6 : 1) - currentDayOfWeek;

    const baseMonday = new Date(today);
    baseMonday.setDate(today.getDate() + diffToMonday + weekOffsetDays);
    baseMonday.setHours(0, 0, 0, 0);

    const days = [];
    const dayNames = ['Dushanba', 'Seshanba', 'Chorshanba', 'Payshanba', 'Juma', 'Shanba'];

    for (let i = 0; i < 6; i++) {
      const d = new Date(baseMonday);
      d.setDate(baseMonday.getDate() + i);

      const isToday =
        d.getDate() === today.getDate() &&
        d.getMonth() === today.getMonth() &&
        d.getFullYear() === today.getFullYear();

      days.push({
        dayName: dayNames[i],
        date: d,
        dateStr: d.toISOString().split('T')[0],
        formattedDate: d.toLocaleDateString('uz-UZ', { day: 'numeric', month: 'short' }),
        isToday
      });
    }

    return days;
  };

  const weekDays = getWeekDays();

  // Filter lessons
  const filteredLessons = lessons.filter((l) => {
    if (selectedGroup && l.groupId !== selectedGroup) return false;
    if (selectedTeacher && l.teacherId !== selectedTeacher) return false;
    return true;
  });

  // Helper to find lessons for a specific day and period
  const getLessonsForSlot = (dateStr, period) => {
    return filteredLessons.filter((l) => {
      const lDate = new Date(l.startsAt);
      const lDateStr = lDate.toISOString().split('T')[0];
      if (lDateStr !== dateStr) return false;

      const [pStartH, pStartM] = period.start.split(':').map(Number);
      const [pEndH, pEndM] = period.end.split(':').map(Number);

      const startMinutes = lDate.getHours() * 60 + lDate.getMinutes();
      const pStartMinutes = pStartH * 60 + pStartM;
      const pEndMinutes = pEndH * 60 + pEndM;

      // Check if lesson start falls within period or close (+/- 25 min)
      return Math.abs(startMinutes - pStartMinutes) < 30 || (startMinutes >= pStartMinutes && startMinutes < pEndMinutes);
    });
  };

  const handleCreateLesson = async (e) => {
    e.preventDefault();
    setConflictError('');

    try {
      const startsAt = new Date(`${form.date}T${form.startTime}:00`).toISOString();
      const endsAt = new Date(`${form.date}T${form.endTime}:00`).toISOString();

      await api.lessons.create({
        groupId: form.groupId,
        title: form.title,
        startsAt,
        endsAt,
        room: form.room,
        onlineUrl: form.onlineUrl
      });

      showToast('Dars jadvalga muvaffaqiyatli kiritildi', 'success');
      setShowModal(false);
      setForm({
        groupId: '',
        title: '',
        date: new Date().toISOString().split('T')[0],
        startTime: '14:00',
        endTime: '15:30',
        room: 'Auditoriya 101',
        onlineUrl: ''
      });
      fetchSchedule();
    } catch (err) {
      setConflictError(err.message);
      showToast(err.message, 'error');
    }
  };

  const handleDelete = async (id, title) => {
    if (!window.confirm(`'${title}' darsini o'chirishni tasdiqlaysizmi?`)) return;
    try {
      await api.lessons.delete(id);
      showToast('Dars o\'chirildi', 'success');
      fetchSchedule();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const openSlotModal = (dateStr, period) => {
    if (role !== 'Admin' && role !== 'Teacher') return;
    setForm({
      groupId: selectedGroup || (groups[0]?.id || ''),
      title: '',
      date: dateStr,
      startTime: period.start,
      endTime: period.end,
      room: 'Auditoriya 101',
      onlineUrl: ''
    });
    setConflictError('');
    setShowModal(true);
  };

  const formatDateTime = (iso) => {
    if (!iso) return '';
    return new Date(iso).toLocaleString('uz-UZ', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div>
      {/* Top Header */}
      <div className="page-header" style={{ marginBottom: '18px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <h1 className="page-title">Kundalik Dars Jadvali</h1>
            <span className="badge badge-emerald" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Sparkles size={12} /> Kundalik.com Tizimi
            </span>
          </div>
          <p className="page-subtitle">
            Haftalik darslar jadvali, o'quv xonalari va har bir guruhning alohida yorqin ranglari
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {/* View toggle */}
          <div style={{ display: 'flex', background: 'rgba(255, 255, 255, 0.05)', padding: '4px', borderRadius: '10px', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
            <button
              onClick={() => setViewMode('kundalik')}
              className={`btn btn-sm ${viewMode === 'kundalik' ? 'btn-primary' : 'btn-ghost'}`}
              style={{ padding: '6px 12px' }}
            >
              <LayoutGrid size={15} />
              <span>Haftalik Jadval</span>
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`btn btn-sm ${viewMode === 'list' ? 'btn-primary' : 'btn-ghost'}`}
              style={{ padding: '6px 12px' }}
            >
              <List size={15} />
              <span>Ro'yxat</span>
            </button>
          </div>

          {(role === 'Admin' || role === 'Teacher') && (
            <button
              onClick={() => {
                setConflictError('');
                setShowModal(true);
              }}
              className="btn btn-primary"
            >
              <Plus size={18} />
              <span>Yangi Dars</span>
            </button>
          )}
        </div>
      </div>

      {/* Week Navigator & Group Filter Bar */}
      <div
        className="card"
        style={{
          padding: '14px 20px',
          marginBottom: '20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '16px'
        }}
      >
        {/* Week navigation buttons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button
            onClick={() => setWeekOffsetDays((prev) => prev - 7)}
            className="btn btn-secondary btn-sm"
            title="Oldingi hafta"
          >
            <ChevronLeft size={16} />
            <span>Oldingi Hafta</span>
          </button>

          <button
            onClick={() => setWeekOffsetDays(0)}
            className={`btn btn-sm ${weekOffsetDays === 0 ? 'btn-primary' : 'btn-secondary'}`}
          >
            Joriy Hafta
          </button>

          <button
            onClick={() => setWeekOffsetDays((prev) => prev + 7)}
            className="btn btn-secondary btn-sm"
            title="Keyingi hafta"
          >
            <span>Keyingi Hafta</span>
            <ChevronRight size={16} />
          </button>

          <div style={{ fontSize: '14px', fontWeight: 700, color: '#fff', marginLeft: '12px' }}>
            📅 {weekDays[0].formattedDate} &mdash; {weekDays[5].formattedDate}, {weekDays[0].date.getFullYear()}-yil
          </div>
        </div>

        {/* Group Filter */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Filter size={15} color="#9ca3af" />
            <span style={{ fontSize: '13px', color: '#9ca3af' }}>Guruh:</span>
            <select
              value={selectedGroup}
              onChange={(e) => setSelectedGroup(e.target.value)}
              className="form-select"
              style={{ padding: '6px 12px', fontSize: '13px', width: '200px' }}
            >
              <option value="">Barcha Guruhlar</option>
              {groups.map((g) => (
                <option key={g.id} value={g.id}>
                  {g.name} ({g.courseName})
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Groups Color Legend Bar */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          overflowX: 'auto',
          paddingBottom: '12px',
          marginBottom: '18px'
        }}
      >
        <span style={{ fontSize: '12px', color: '#9ca3af', fontWeight: 600, flexShrink: 0 }}>
          Guruhlar Ranglari:
        </span>
        {groups.slice(0, 10).map((g) => (
          <div
            key={g.id}
            onClick={() => setSelectedGroup(selectedGroup === g.id ? '' : g.id)}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '4px 10px',
              borderRadius: '20px',
              background: `${g.color || '#10b981'}1a`,
              border: `1px solid ${selectedGroup === g.id ? '#fff' : g.color || '#10b981'}`,
              color: '#fff',
              fontSize: '12px',
              fontWeight: 600,
              cursor: 'pointer',
              flexShrink: 0,
              boxShadow: selectedGroup === g.id ? `0 0 10px ${g.color}` : 'none',
              transition: 'all 0.2s ease'
            }}
          >
            <span
              style={{
                width: '10px',
                height: '10px',
                borderRadius: '50%',
                background: g.color || '#10b981'
              }}
            />
            <span>{g.name}</span>
          </div>
        ))}
        {groups.length > 10 && (
          <span style={{ fontSize: '12px', color: '#6b7280', flexShrink: 0 }}>
            +{groups.length - 10} ta guruh
          </span>
        )}
      </div>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '80px' }}>
          <div className="spinner" style={{ width: '40px', height: '40px' }} />
        </div>
      ) : viewMode === 'kundalik' ? (
        /* KUNDALIK.COM WEEKLY TIMETABLE GRID */
        <div className="card" style={{ padding: 0, overflowX: 'auto' }}>
          <div style={{ minWidth: '1100px' }}>
            {/* Grid Header (Days) */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '120px repeat(6, 1fr)',
                borderBottom: '2px solid rgba(255, 255, 255, 0.1)',
                background: 'rgba(15, 23, 42, 0.7)'
              }}
            >
              <div
                style={{
                  padding: '16px',
                  fontWeight: 800,
                  fontSize: '13px',
                  color: '#9ca3af',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRight: '1px solid rgba(255, 255, 255, 0.08)'
                }}
              >
                Dars Soati
              </div>

              {weekDays.map((d) => (
                <div
                  key={d.dateStr}
                  style={{
                    padding: '14px',
                    textAlign: 'center',
                    borderRight: '1px solid rgba(255, 255, 255, 0.08)',
                    background: d.isToday ? 'rgba(16, 185, 129, 0.12)' : 'transparent',
                    position: 'relative'
                  }}
                >
                  <div style={{ fontWeight: 800, fontSize: '15px', color: d.isToday ? '#34d399' : '#fff' }}>
                    {d.dayName}
                  </div>
                  <div style={{ fontSize: '12px', color: d.isToday ? '#10b981' : '#9ca3af', marginTop: '2px' }}>
                    {d.formattedDate}
                  </div>
                  {d.isToday && (
                    <span
                      className="badge badge-emerald"
                      style={{
                        position: 'absolute',
                        top: '6px',
                        right: '6px',
                        fontSize: '9px',
                        padding: '2px 6px'
                      }}
                    >
                      Bugun
                    </span>
                  )}
                </div>
              ))}
            </div>

            {/* Grid Rows (Periods 1 through 7) */}
            {periods.map((p) => (
              <div
                key={p.num}
                style={{
                  display: 'grid',
                  gridTemplateColumns: '120px repeat(6, 1fr)',
                  borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
                  minHeight: '125px'
                }}
              >
                {/* Period Time Slot Cell */}
                <div
                  style={{
                    padding: '14px 10px',
                    background: 'rgba(0, 0, 0, 0.25)',
                    borderRight: '1px solid rgba(255, 255, 255, 0.08)',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    textAlign: 'center'
                  }}
                >
                  <span style={{ fontWeight: 800, fontSize: '14px', color: '#fff' }}>{p.label}</span>
                  <span style={{ fontSize: '12px', color: '#34d399', fontWeight: 700, marginTop: '4px' }}>
                    {p.start} &ndash; {p.end}
                  </span>
                </div>

                {/* Day Cells for this Period */}
                {weekDays.map((d) => {
                  const slotLessons = getLessonsForSlot(d.dateStr, p);
                  return (
                    <div
                      key={d.dateStr}
                      style={{
                        padding: '8px',
                        borderRight: '1px solid rgba(255, 255, 255, 0.08)',
                        background: d.isToday ? 'rgba(16, 185, 129, 0.03)' : 'transparent',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '8px',
                        position: 'relative'
                      }}
                    >
                      {slotLessons.length === 0 ? (
                        /* Empty Slot with optional quick add */
                        <div
                          onClick={() => openSlotModal(d.dateStr, p)}
                          style={{
                            flex: 1,
                            minHeight: '80px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            borderRadius: '8px',
                            cursor: role === 'Admin' || role === 'Teacher' ? 'pointer' : 'default',
                            transition: 'background 0.2s ease',
                            color: '#4b5563'
                          }}
                          className="hover-slot"
                        >
                          {(role === 'Admin' || role === 'Teacher') && (
                            <span style={{ fontSize: '11px', color: '#4b5563', display: 'flex', alignItems: 'center', gap: '4px' }}>
                              <Plus size={12} /> Dars qo'shish
                            </span>
                          )}
                        </div>
                      ) : (
                        /* Render Lesson Cards inside this Kundalik Slot */
                        slotLessons.map((l) => {
                          const groupColor = l.groupColor || '#10b981';
                          return (
                            <div
                              key={l.id}
                              style={{
                                background: `linear-gradient(135deg, ${groupColor}24 0%, rgba(15, 23, 42, 0.95) 100%)`,
                                border: `1.5px solid ${groupColor}`,
                                borderRadius: '12px',
                                padding: '10px 12px',
                                display: 'flex',
                                flexDirection: 'column',
                                gap: '6px',
                                boxShadow: `0 4px 15px rgba(0, 0, 0, 0.4), 0 0 10px ${groupColor}22`,
                                position: 'relative'
                              }}
                            >
                              {/* Distinct Group Badge & Delete action */}
                              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                <span
                                  style={{
                                    background: groupColor,
                                    color: '#000',
                                    fontWeight: 900,
                                    fontSize: '11px',
                                    padding: '3px 8px',
                                    borderRadius: '6px',
                                    letterSpacing: '0.3px',
                                    textTransform: 'uppercase'
                                  }}
                                >
                                  {l.groupName}
                                </span>

                                {(role === 'Admin' || role === 'Teacher') && (
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleDelete(l.id, l.title);
                                    }}
                                    style={{
                                      background: 'none',
                                      border: 'none',
                                      color: '#fb7185',
                                      cursor: 'pointer',
                                      padding: '2px'
                                    }}
                                    title="Darsni o'chirish"
                                  >
                                    <Trash2 size={13} />
                                  </button>
                                )}
                              </div>

                              {/* Lesson Title */}
                              <div
                                style={{
                                  fontSize: '13px',
                                  fontWeight: 700,
                                  color: '#fff',
                                  lineHeight: '1.3'
                                }}
                              >
                                {l.title}
                              </div>

                              {/* Teacher name */}
                              <div style={{ fontSize: '11px', color: '#cbd5e1', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                <User size={11} color={groupColor} />
                                <span>{l.teacherName}</span>
                              </div>

                              {/* Room & Online link badge */}
                              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap', marginTop: '2px' }}>
                                {l.room && (
                                  <span
                                    style={{
                                      fontSize: '10px',
                                      background: 'rgba(0,0,0,0.4)',
                                      color: '#9ca3af',
                                      padding: '2px 6px',
                                      borderRadius: '4px',
                                      display: 'inline-flex',
                                      alignItems: 'center',
                                      gap: '3px'
                                    }}
                                  >
                                    <MapPin size={10} color="#10b981" /> {l.room}
                                  </span>
                                )}

                                {l.onlineUrl && (
                                  <a
                                    href={l.onlineUrl}
                                    target="_blank"
                                    rel="noreferrer"
                                    style={{
                                      fontSize: '10px',
                                      background: 'rgba(16, 185, 129, 0.2)',
                                      color: '#34d399',
                                      padding: '2px 6px',
                                      borderRadius: '4px',
                                      textDecoration: 'none',
                                      display: 'inline-flex',
                                      alignItems: 'center',
                                      gap: '3px',
                                      fontWeight: 700
                                    }}
                                  >
                                    <Video size={10} /> Online
                                  </a>
                                )}
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      ) : (
        /* LIST VIEW */
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {filteredLessons.map((l) => {
            const groupColor = l.groupColor || '#10b981';
            return (
              <div
                key={l.id}
                className="card"
                style={{
                  padding: '18px 24px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: '16px',
                  borderLeft: `5px solid ${groupColor}`
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '18px' }}>
                  <div
                    style={{
                      width: '50px',
                      height: '50px',
                      borderRadius: '14px',
                      background: `${groupColor}20`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: groupColor,
                      flexShrink: 0
                    }}
                  >
                    <Clock size={24} />
                  </div>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#fff', margin: 0 }}>
                        {l.title}
                      </h3>
                      <span
                        style={{
                          background: groupColor,
                          color: '#000',
                          fontSize: '11px',
                          fontWeight: 900,
                          padding: '3px 10px',
                          borderRadius: '8px'
                        }}
                      >
                        {l.groupName}
                      </span>
                    </div>
                    <div style={{ fontSize: '13px', color: '#9ca3af', marginTop: '6px', display: 'flex', alignItems: 'center', gap: '14px' }}>
                      <span>
                        Ustoz: <strong style={{ color: '#d1d5db' }}>{l.teacherName}</strong>
                      </span>
                      <span>&bull;</span>
                      <span>{formatDateTime(l.startsAt)}</span>
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  {l.room && (
                    <span className="badge badge-slate" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <MapPin size={13} color="#10b981" /> {l.room}
                    </span>
                  )}

                  {l.onlineUrl && (
                    <a
                      href={l.onlineUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="btn btn-secondary btn-sm"
                      style={{ borderColor: 'rgba(16, 185, 129, 0.3)', color: '#34d399' }}
                    >
                      <Video size={14} />
                      <span>Ulanish</span>
                    </a>
                  )}

                  {(role === 'Admin' || role === 'Teacher') && (
                    <button
                      onClick={() => handleDelete(l.id, l.title)}
                      className="btn btn-ghost btn-icon"
                      title="O'chirish"
                    >
                      <Trash2 size={16} color="#fb7185" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* CREATE LESSON MODAL */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-box">
            <div className="modal-header">
              <h3 className="modal-title">Dars Jadvaliga Qo'shish</h3>
              <button onClick={() => setShowModal(false)} className="btn btn-ghost btn-icon">
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleCreateLesson}>
              <div className="modal-body">
                {conflictError && (
                  <div style={{ background: 'rgba(244, 63, 94, 0.15)', border: '1px solid rgba(244, 63, 94, 0.4)', borderRadius: '10px', padding: '12px', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '10px', color: '#fb7185', fontSize: '13px' }}>
                    <AlertTriangle size={18} flexShrink={0} />
                    <span>{conflictError}</span>
                  </div>
                )}

                <div className="form-group">
                  <label className="form-label">Guruhni Tanlang *</label>
                  <select
                    required
                    value={form.groupId}
                    onChange={(e) => setForm({ ...form, groupId: e.target.value })}
                    className="form-select"
                  >
                    <option value="">Guruhni tanlang...</option>
                    {groups.map((g) => (
                      <option key={g.id} value={g.id}>
                        {g.name} &mdash; {g.courseName}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Dars Mavzusi / Fan *</label>
                  <input
                    type="text"
                    required
                    value={form.title}
                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                    placeholder="Masalan: 1-Dars: Clean Architecture asoslari"
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Dars Sanasi *</label>
                  <input
                    type="date"
                    required
                    value={form.date}
                    onChange={(e) => setForm({ ...form, date: e.target.value })}
                    className="form-input"
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div className="form-group">
                    <label className="form-label">Boshlanish Vaqti *</label>
                    <input
                      type="time"
                      required
                      value={form.startTime}
                      onChange={(e) => setForm({ ...form, startTime: e.target.value })}
                      className="form-input"
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Tugash Vaqti *</label>
                    <input
                      type="time"
                      required
                      value={form.endTime}
                      onChange={(e) => setForm({ ...form, endTime: e.target.value })}
                      className="form-input"
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div className="form-group">
                    <label className="form-label">Auditoriya / Xona</label>
                    <input
                      type="text"
                      value={form.room}
                      onChange={(e) => setForm({ ...form, room: e.target.value })}
                      placeholder="Auditoriya 101"
                      className="form-input"
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Online Havola (Google Meet / Zoom)</label>
                    <input
                      type="url"
                      value={form.onlineUrl}
                      onChange={(e) => setForm({ ...form, onlineUrl: e.target.value })}
                      placeholder="https://meet.google.com/..."
                      className="form-input"
                    />
                  </div>
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" onClick={() => setShowModal(false)} className="btn btn-secondary">
                  Bekor qilish
                </button>
                <button type="submit" className="btn btn-primary">
                  Jadvalga Kiritish
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Schedule;
