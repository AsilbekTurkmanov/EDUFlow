import React, { useState, useEffect } from 'react';
import {
  DoorClosed,
  Plus,
  Monitor,
  Tv,
  Wind,
  Users,
  Search,
  CheckCircle,
  AlertTriangle,
  X,
  Edit2,
  Trash2,
  Calendar,
  Clock
} from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';

export const Rooms = () => {
  const { role, showToast } = useAuth();
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  // Modals
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingRoom, setEditingRoom] = useState(null);
  const [form, setForm] = useState({
    name: '',
    capacity: 25,
    computersCount: 20,
    hasProjector: true,
    hasAirConditioner: true
  });

  // Conflict Checker Tool state
  const [checkRoomId, setCheckRoomId] = useState('');
  const [checkDate, setCheckDate] = useState(new Date().toISOString().split('T')[0]);
  const [checkStartTime, setCheckStartTime] = useState('14:00');
  const [checkEndTime, setCheckEndTime] = useState('15:30');
  const [checkResult, setCheckResult] = useState(null);

  useEffect(() => {
    fetchRooms();
  }, []);

  const fetchRooms = async () => {
    setLoading(true);
    try {
      const res = await api.rooms.getAll();
      if (res?.data) {
        setRooms(res.data);
        if (res.data.length > 0 && !checkRoomId) {
          setCheckRoomId(res.data[0].id);
        }
      }
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenCreate = () => {
    setEditingRoom(null);
    setForm({
      name: '',
      capacity: 25,
      computersCount: 20,
      hasProjector: true,
      hasAirConditioner: true
    });
    setShowCreateModal(true);
  };

  const handleOpenEdit = (room) => {
    setEditingRoom(room);
    setForm({
      name: room.name,
      capacity: room.capacity,
      computersCount: room.computersCount,
      hasProjector: room.hasProjector,
      hasAirConditioner: room.hasAirConditioner
    });
    setShowCreateModal(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      if (editingRoom) {
        await api.rooms.update(editingRoom.id, { ...form, isActive: true });
        showToast('Auditoriya muvaffaqiyatli tahrirlandi!', 'success');
      } else {
        await api.rooms.create(form);
        showToast('Yangi auditoriya muvaffaqiyatli qo\'shildi!', 'success');
      }
      setShowCreateModal(false);
      fetchRooms();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handleDelete = async (room) => {
    if (!window.confirm(`Haqiqatan ham "${room.name}" auditoriyasini o'chirmoqchimisiz?`)) return;
    try {
      await api.rooms.delete(room.id);
      showToast('Auditoriya o\'chirildi', 'success');
      fetchRooms();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handleCheckAvailability = async (e) => {
    e.preventDefault();
    if (!checkRoomId) return;
    try {
      const startsAt = `${checkDate}T${checkStartTime}:00Z`;
      const endsAt = `${checkDate}T${checkEndTime}:00Z`;
      const res = await api.rooms.checkAvailability(checkRoomId, startsAt, endsAt);
      setCheckResult({
        available: res.success,
        message: res.message || (res.success ? 'Ushbu vaqtda xona bo\'sh va dars uchun tayyor.' : res.message)
      });
    } catch (err) {
      setCheckResult({
        available: false,
        message: err.message
      });
    }
  };

  const filteredRooms = rooms.filter((r) =>
    r.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Page Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 800, color: '#fff', margin: '0 0 6px 0' }}>
            🏢 Auditoriyalar & Xonalar Boshqaruvi
          </h1>
          <p style={{ fontSize: '13px', color: '#9ca3af', margin: 0 }}>
            Markazdagi o'quv xonalari sig'imi, texnik jihozlari va darslar to'qnashuvini real-vaqtda boshqarish.
          </p>
        </div>

        {role === 'Admin' && (
          <button onClick={handleOpenCreate} className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Plus size={16} /> Yangi Auditoriya Qo'shish
          </button>
        )}
      </div>

      {/* Room Conflict Checking Card */}
      <div
        className="card"
        style={{
          background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.7) 0%, rgba(15, 23, 42, 0.8) 100%)',
          border: '1px solid rgba(56, 189, 248, 0.2)',
          borderRadius: '16px',
          padding: '20px'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
          <Clock size={20} color="#38bdf8" />
          <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#fff', margin: 0 }}>
            Auditoriya Bo'shligini Tekshirish (Collision Detector)
          </h3>
        </div>

        <form onSubmit={handleCheckAvailability} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '14px', alignItems: 'flex-end' }}>
          <div>
            <label style={{ display: 'block', fontSize: '12px', color: '#9ca3af', marginBottom: '6px' }}>Auditoriya</label>
            <select
              value={checkRoomId}
              onChange={(e) => setCheckRoomId(e.target.value)}
              className="form-control"
              style={{ width: '100%', background: 'rgba(0,0,0,0.3)', color: '#fff' }}
            >
              {rooms.map((r) => (
                <option key={r.id} value={r.id} style={{ background: '#1e293b' }}>
                  {r.name} (Sig'imi: {r.capacity})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '12px', color: '#9ca3af', marginBottom: '6px' }}>Sana</label>
            <input
              type="date"
              value={checkDate}
              onChange={(e) => setCheckDate(e.target.value)}
              className="form-control"
              style={{ width: '100%', background: 'rgba(0,0,0,0.3)', color: '#fff' }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '12px', color: '#9ca3af', marginBottom: '6px' }}>Boshlanish Vaqti</label>
            <input
              type="time"
              value={checkStartTime}
              onChange={(e) => setCheckStartTime(e.target.value)}
              className="form-control"
              style={{ width: '100%', background: 'rgba(0,0,0,0.3)', color: '#fff' }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '12px', color: '#9ca3af', marginBottom: '6px' }}>Tugash Vaqti</label>
            <input
              type="time"
              value={checkEndTime}
              onChange={(e) => setCheckEndTime(e.target.value)}
              className="form-control"
              style={{ width: '100%', background: 'rgba(0,0,0,0.3)', color: '#fff' }}
            />
          </div>

          <div>
            <button type="submit" className="btn btn-secondary" style={{ width: '100%', height: '42px', fontWeight: 700 }}>
              Bandlikni Tekshirish
            </button>
          </div>
        </form>

        {checkResult && (
          <div
            style={{
              marginTop: '16px',
              padding: '12px 16px',
              borderRadius: '10px',
              background: checkResult.available ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.12)',
              border: `1px solid ${checkResult.available ? 'rgba(16, 185, 129, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`,
              color: checkResult.available ? '#34d399' : '#f87171',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              fontSize: '13px',
              fontWeight: 600
            }}
          >
            {checkResult.available ? <CheckCircle size={18} /> : <AlertTriangle size={18} />}
            <span>{checkResult.message}</span>
          </div>
        )}
      </div>

      {/* Search & Rooms Grid */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px' }}>
        <div style={{ position: 'relative', width: '320px' }}>
          <Search size={16} style={{ position: 'absolute', left: '12px', top: '13px', color: '#9ca3af' }} />
          <input
            type="text"
            placeholder="Xona nomi bo'yicha izlash..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="form-control"
            style={{ paddingLeft: '38px', width: '100%', background: 'rgba(255,255,255,0.04)', color: '#fff' }}
          />
        </div>

        <div style={{ color: '#9ca3af', fontSize: '13px' }}>
          Jami auditoriyalar: <strong style={{ color: '#fff' }}>{rooms.length} ta</strong>
        </div>
      </div>

      {/* Cards Grid */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px 0' }}>
          <div className="spinner" style={{ width: '40px', height: '40px', margin: '0 auto 12px' }} />
          <div style={{ color: '#9ca3af', fontSize: '13px' }}>Auditoriyalar yuklanmoqda...</div>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
          {filteredRooms.map((room) => (
            <div
              key={room.id}
              className="card"
              style={{
                borderRadius: '16px',
                background: 'rgba(255, 255, 255, 0.03)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                padding: '20px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                transition: 'transform 0.2s ease, border-color 0.2s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-3px)';
                e.currentTarget.style.borderColor = 'rgba(56, 189, 248, 0.4)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.08)';
              }}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '14px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div
                      style={{
                        width: '42px',
                        height: '42px',
                        borderRadius: '12px',
                        background: 'rgba(56, 189, 248, 0.1)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#38bdf8'
                      }}
                    >
                      <DoorClosed size={22} />
                    </div>
                    <div>
                      <h4 style={{ margin: 0, fontSize: '16px', fontWeight: 800, color: '#fff' }}>
                        {room.name}
                      </h4>
                      <span style={{ fontSize: '12px', color: '#9ca3af' }}>
                        {room.centerName || 'Markaz filiali'}
                      </span>
                    </div>
                  </div>

                  <span
                    className={room.isActive ? 'badge badge-emerald' : 'badge badge-amber'}
                    style={{ fontSize: '11px', padding: '3px 8px' }}
                  >
                    {room.isActive ? 'Faol' : 'Nofaol'}
                  </span>
                </div>

                {/* Features Badges */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '18px' }}>
                  <span
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '5px',
                      padding: '4px 10px',
                      borderRadius: '8px',
                      background: 'rgba(255,255,255,0.05)',
                      fontSize: '12px',
                      color: '#e5e7eb'
                    }}
                  >
                    <Users size={13} color="#a78bfa" /> {room.capacity} o'rin
                  </span>

                  {room.computersCount > 0 && (
                    <span
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '5px',
                        padding: '4px 10px',
                        borderRadius: '8px',
                        background: 'rgba(255,255,255,0.05)',
                        fontSize: '12px',
                        color: '#e5e7eb'
                      }}
                    >
                      <Monitor size={13} color="#38bdf8" /> {room.computersCount} ta PC
                    </span>
                  )}

                  {room.hasProjector && (
                    <span
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '5px',
                        padding: '4px 10px',
                        borderRadius: '8px',
                        background: 'rgba(255,255,255,0.05)',
                        fontSize: '12px',
                        color: '#34d399'
                      }}
                    >
                      <Tv size={13} /> Proyektor
                    </span>
                  )}

                  {room.hasAirConditioner && (
                    <span
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '5px',
                        padding: '4px 10px',
                        borderRadius: '8px',
                        background: 'rgba(255,255,255,0.05)',
                        fontSize: '12px',
                        color: '#60a5fa'
                      }}
                    >
                      <Wind size={13} /> Konditsioner
                    </span>
                  )}
                </div>
              </div>

              {/* Footer info & actions */}
              <div
                style={{
                  borderTop: '1px solid rgba(255,255,255,0.06)',
                  paddingTop: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between'
                }}
              >
                <div style={{ fontSize: '11px', color: '#9ca3af', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Calendar size={13} />
                  <span>Kutilayotgan darslar: <strong style={{ color: '#fff' }}>{room.upcomingLessonsCount || 0}</strong></span>
                </div>

                {role === 'Admin' && (
                  <div style={{ display: 'flex', gap: '6px' }}>
                    <button
                      onClick={() => handleOpenEdit(room)}
                      className="btn btn-ghost btn-sm"
                      style={{ padding: '6px', color: '#38bdf8' }}
                      title="Tahrirlash"
                    >
                      <Edit2 size={14} />
                    </button>
                    <button
                      onClick={() => handleDelete(room)}
                      className="btn btn-ghost btn-sm"
                      style={{ padding: '6px', color: '#f87171' }}
                      title="O'chirish"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create / Edit Modal */}
      {showCreateModal && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '480px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#fff', margin: 0 }}>
                {editingRoom ? 'Auditoriyani Tahrirlash' : 'Yangi Auditoriya Qo\'shish'}
              </h3>
              <button onClick={() => setShowCreateModal(false)} className="btn btn-ghost btn-sm" style={{ padding: '4px' }}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '13px', color: '#9ca3af', marginBottom: '6px' }}>
                  Auditoriya Nomi / Raqami *
                </label>
                <input
                  type="text"
                  required
                  placeholder="masalan: 101-Auditoriya yoki Frontend Lab"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="form-control"
                  style={{ width: '100%', background: 'rgba(255,255,255,0.04)', color: '#fff' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', color: '#9ca3af', marginBottom: '6px' }}>
                    O'quvchi Sig'imi (O'rin)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="200"
                    value={form.capacity}
                    onChange={(e) => setForm({ ...form, capacity: parseInt(e.target.value) || 0 })}
                    className="form-control"
                    style={{ width: '100%', background: 'rgba(255,255,255,0.04)', color: '#fff' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '13px', color: '#9ca3af', marginBottom: '6px' }}>
                    Kompyuterlar Soni
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="200"
                    value={form.computersCount}
                    onChange={(e) => setForm({ ...form, computersCount: parseInt(e.target.value) || 0 })}
                    className="form-control"
                    style={{ width: '100%', background: 'rgba(255,255,255,0.04)', color: '#fff' }}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '6px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', color: '#e5e7eb', fontSize: '13px' }}>
                  <input
                    type="checkbox"
                    checked={form.hasProjector}
                    onChange={(e) => setForm({ ...form, hasProjector: e.target.checked })}
                  />
                  <span>Proyektor / Katta Ekran mavjud</span>
                </label>

                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', color: '#e5e7eb', fontSize: '13px' }}>
                  <input
                    type="checkbox"
                    checked={form.hasAirConditioner}
                    onChange={(e) => setForm({ ...form, hasAirConditioner: e.target.checked })}
                  />
                  <span>Konditsioner / Sovutish tizimi mavjud</span>
                </label>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '16px' }}>
                <button type="button" onClick={() => setShowCreateModal(false)} className="btn btn-ghost">
                  Bekor qilish
                </button>
                <button type="submit" className="btn btn-primary" style={{ fontWeight: 700 }}>
                  {editingRoom ? 'O\'zgarishlarni Saqlash' : 'Qo\'shish'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Rooms;
