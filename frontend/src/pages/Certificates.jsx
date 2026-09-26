import React, { useState, useEffect } from 'react';
import {
  Award,
  Plus,
  QrCode,
  CheckCircle,
  Search,
  ExternalLink,
  Printer,
  X,
  FileCheck,
  ShieldCheck,
  Calendar,
  Sparkles
} from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';

export const Certificates = () => {
  const { role, user, showToast } = useAuth();
  const [certificates, setCertificates] = useState([]);
  const [students, setStudents] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  // Modals
  const [showIssueModal, setShowIssueModal] = useState(false);
  const [viewingCertificate, setViewingCertificate] = useState(null);
  const [issueForm, setIssueForm] = useState({
    studentId: '',
    courseId: '',
    finalScore: 90
  });

  // Public verification simulator
  const [verifyCode, setVerifyCode] = useState('');
  const [verifyResult, setVerifyResult] = useState(null);
  const [verifying, setVerifying] = useState(false);

  useEffect(() => {
    fetchCertificates();
    if (role === 'Admin' || role === 'Teacher') {
      fetchStudentsAndCourses();
    }
  }, []);

  const fetchCertificates = async () => {
    setLoading(true);
    try {
      const studentIdParam = role === 'Student' ? user?.id : undefined;
      const res = await api.certificates.getAll(studentIdParam);
      if (res?.data) {
        setCertificates(res.data);
      }
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const fetchStudentsAndCourses = async () => {
    try {
      const [stRes, cRes] = await Promise.all([
        api.users.getAll({ role: 'Student', pageSize: 100 }),
        api.courses.getAll()
      ]);
      if (stRes?.data?.items) {
        setStudents(stRes.data.items);
        if (stRes.data.items.length > 0 && !issueForm.studentId) {
          setIssueForm((prev) => ({ ...prev, studentId: stRes.data.items[0].id }));
        }
      }
      if (cRes?.data) {
        setCourses(cRes.data);
        if (cRes.data.length > 0 && !issueForm.courseId) {
          setIssueForm((prev) => ({ ...prev, courseId: cRes.data[0].id }));
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleIssueCertificate = async (e) => {
    e.preventDefault();
    try {
      await api.certificates.issue(issueForm);
      showToast('Sertifikat muvaffaqiyatli topshirildi va QR kod berildi!', 'success');
      setShowIssueModal(false);
      fetchCertificates();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    if (!verifyCode.trim()) return;
    setVerifying(true);
    try {
      const res = await api.certificates.verify(verifyCode.trim());
      setVerifyResult({
        valid: res.success,
        cert: res.data,
        message: res.message
      });
    } catch (err) {
      setVerifyResult({
        valid: false,
        message: err.message || 'Sertifikat topilmadi yoki kiritilgan kod haqiqiy emas.'
      });
    } finally {
      setVerifying(false);
    }
  };

  const filteredCertificates = (certificates || []).filter((c) => {
    const q = (search || '').toLowerCase();
    const sName = (c?.studentName || '').toLowerCase();
    const cName = (c?.courseName || '').toLowerCase();
    const cCode = (c?.certificateCode || c?.certificateNumber || c?.verificationCode || '').toLowerCase();
    return sName.includes(q) || cName.includes(q) || cCode.includes(q);
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 800, color: '#fff', margin: '0 0 6px 0', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Award size={28} color="#f59e0b" /> Sertifikatlar & QR Tasdiq Tizimi
          </h1>
          <p style={{ fontSize: '13px', color: '#9ca3af', margin: 0 }}>
            Kursni muvaffaqiyatli bitirgan o'quvchilarga sertifikat berish va unikal QR kod orqali haqiqiyligini tekshirish.
          </p>
        </div>

        {(role === 'Admin' || role === 'Teacher') && (
          <button
            onClick={() => setShowIssueModal(true)}
            className="btn btn-primary"
            style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
          >
            <Plus size={16} /> Yangi Sertifikat Topshirish
          </button>
        )}
      </div>

      {/* Public QR Verification Simulator Box */}
      <div
        className="card"
        style={{
          background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.08) 0%, rgba(15, 23, 42, 0.7) 100%)',
          border: '1px solid rgba(245, 158, 11, 0.25)',
          borderRadius: '16px',
          padding: '20px'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
          <ShieldCheck size={22} color="#fbbf24" />
          <div>
            <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#fff', margin: 0 }}>
              Sertifikat Haqiqiyligini Tekshirish (QR Verification Engine)
            </h3>
            <span style={{ fontSize: '12px', color: '#9ca3af' }}>
              Istalgan sertifikat kodini kiriting (masalan: <strong>EDF-2026-9812A</strong>)
            </span>
          </div>
        </div>

        <form onSubmit={handleVerify} style={{ display: 'flex', gap: '10px', maxWidth: '560px' }}>
          <input
            type="text"
            placeholder="Sertifikat kodi: EDF-XXXX-XXXX"
            value={verifyCode}
            onChange={(e) => setVerifyCode(e.target.value)}
            className="form-control"
            style={{ flex: 1, background: 'rgba(0,0,0,0.3)', color: '#fff', fontWeight: 700 }}
          />
          <button type="submit" disabled={verifying} className="btn btn-secondary" style={{ fontWeight: 700 }}>
            {verifying ? 'Tekshirilmoqda...' : 'Tasdiqlash'}
          </button>
        </form>

        {verifyResult && (
          <div
            style={{
              marginTop: '16px',
              padding: '16px',
              borderRadius: '12px',
              background: verifyResult.valid ? 'rgba(16, 185, 129, 0.12)' : 'rgba(239, 68, 68, 0.12)',
              border: `1px solid ${verifyResult.valid ? 'rgba(16, 185, 129, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`,
              color: '#fff'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
              {verifyResult.valid ? <CheckCircle size={20} color="#34d399" /> : <X size={20} color="#f87171" />}
              <span style={{ fontWeight: 800, fontSize: '15px', color: verifyResult.valid ? '#34d399' : '#f87171' }}>
                {verifyResult.valid ? 'Rasmiy Tasdiqlangan Sertifikat' : 'Sertifikat Yaroqsiz'}
              </span>
            </div>

            {verifyResult.valid && verifyResult.cert && (
              <div style={{ fontSize: '13px', color: '#d1d5db', display: 'flex', flexDirection: 'column', gap: '4px', marginTop: '8px' }}>
                <div>Talaba: <strong style={{ color: '#fff' }}>{verifyResult.cert.studentName}</strong></div>
                <div>Kurs: <strong style={{ color: '#fff' }}>{verifyResult.cert.courseName}</strong></div>
                <div>Yakuniy Baho: <strong style={{ color: '#38bdf8' }}>{verifyResult.cert.finalScore} ball ({verifyResult.cert.gradeLetter})</strong></div>
                <div>Berilgan sana: <strong style={{ color: '#9ca3af' }}>{new Date(verifyResult.cert.issuedAt).toLocaleDateString()}</strong></div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Certificates List */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px', flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', width: '320px' }}>
          <Search size={16} style={{ position: 'absolute', left: '12px', top: '13px', color: '#9ca3af' }} />
          <input
            type="text"
            placeholder="Talaba yoki kurs nomi bo'yicha..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="form-control"
            style={{ paddingLeft: '38px', width: '100%', background: 'rgba(255,255,255,0.04)', color: '#fff' }}
          />
        </div>

        <div style={{ color: '#9ca3af', fontSize: '13px' }}>
          Jami sertifikatlar: <strong style={{ color: '#fff' }}>{certificates.length} ta</strong>
        </div>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px 0' }}>
          <div className="spinner" style={{ width: '40px', height: '40px', margin: '0 auto 12px' }} />
          <div style={{ color: '#9ca3af', fontSize: '13px' }}>Sertifikatlar yuklanmoqda...</div>
        </div>
      ) : filteredCertificates.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '60px 0', color: '#9ca3af', borderRadius: '16px' }}>
          <Award size={40} style={{ opacity: 0.3, margin: '0 auto 12px' }} />
          <div>Hozircha berilgan sertifikatlar yo'q.</div>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '20px' }}>
          {filteredCertificates.map((cert) => (
            <div
              key={cert.id}
              className="card"
              style={{
                borderRadius: '16px',
                background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.4) 0%, rgba(15, 23, 42, 0.8) 100%)',
                border: '1px solid rgba(245, 158, 11, 0.2)',
                padding: '20px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => (e.currentTarget.style.borderColor = 'rgba(245, 158, 11, 0.5)')}
              onMouseLeave={(e) => (e.currentTarget.style.borderColor = 'rgba(245, 158, 11, 0.2)')}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                  <span
                    style={{
                      fontFamily: 'monospace',
                      fontWeight: 800,
                      background: 'rgba(245, 158, 11, 0.15)',
                      border: '1px solid rgba(245, 158, 11, 0.3)',
                      color: '#fbbf24',
                      padding: '3px 8px',
                      borderRadius: '6px',
                      fontSize: '12px'
                    }}
                  >
                    {cert?.certificateCode || cert?.certificateNumber || 'EDU-2026'}
                  </span>

                  <span className="badge badge-emerald" style={{ fontSize: '11px' }}>
                    {cert?.gradeLetter || 'A'} ({cert?.finalScore ?? 100}%)
                  </span>
                </div>

                <h3 style={{ fontSize: '18px', fontWeight: 900, color: '#fff', margin: '0 0 4px 0' }}>
                  {cert?.studentName || 'Bitiruvchi'}
                </h3>
                <div style={{ fontSize: '13px', color: '#38bdf8', fontWeight: 600, marginBottom: '12px' }}>
                  {cert?.courseName || 'Kurs'}
                </div>

                <div style={{ fontSize: '11px', color: '#9ca3af', display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '16px' }}>
                  <Calendar size={13} /> Berilgan: {cert?.issuedAt ? new Date(cert.issuedAt).toLocaleDateString() : 'Bugun'}
                </div>
              </div>

              <button
                onClick={() => setViewingCertificate(cert)}
                className="btn btn-secondary"
                style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', fontWeight: 700 }}
              >
                <Award size={16} /> Sertifikatni Ko'rish & Chop Etish
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Issue Certificate Modal */}
      {showIssueModal && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '440px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#fff', margin: 0 }}>
                Yangi Sertifikat Topshirish
              </h3>
              <button onClick={() => setShowIssueModal(false)} className="btn btn-ghost btn-sm" style={{ padding: '4px' }}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleIssueCertificate} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', color: '#9ca3af', marginBottom: '4px' }}>Talaba *</label>
                <select
                  required
                  value={issueForm.studentId}
                  onChange={(e) => setIssueForm({ ...issueForm, studentId: e.target.value })}
                  className="form-control"
                  style={{ width: '100%', background: 'rgba(255,255,255,0.04)', color: '#fff' }}
                >
                  {students.map((s) => (
                    <option key={s.id} value={s.id} style={{ background: '#1e293b' }}>
                      {s.fullName} ({s.phone || s.email})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', color: '#9ca3af', marginBottom: '4px' }}>Kurs *</label>
                <select
                  required
                  value={issueForm.courseId}
                  onChange={(e) => setIssueForm({ ...issueForm, courseId: e.target.value })}
                  className="form-control"
                  style={{ width: '100%', background: 'rgba(255,255,255,0.04)', color: '#fff' }}
                >
                  {courses.map((c) => (
                    <option key={c.id} value={c.id} style={{ background: '#1e293b' }}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', color: '#9ca3af', marginBottom: '4px' }}>
                  Yakuniy Ball (0 - 100) *
                </label>
                <input
                  type="number"
                  min="50"
                  max="100"
                  required
                  value={issueForm.finalScore}
                  onChange={(e) => setIssueForm({ ...issueForm, finalScore: parseInt(e.target.value) || 0 })}
                  className="form-control"
                  style={{ width: '100%', background: 'rgba(255,255,255,0.04)', color: '#fff' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '14px' }}>
                <button type="button" onClick={() => setShowIssueModal(false)} className="btn btn-ghost">
                  Bekor qilish
                </button>
                <button type="submit" className="btn btn-primary" style={{ fontWeight: 700 }}>
                  Sertifikatni Tasdiqlash
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Printable Certificate View Modal */}
      {viewingCertificate && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '680px', background: '#0b0f19', padding: '0', overflow: 'hidden' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
              <div style={{ fontWeight: 800, color: '#fff', fontSize: '15px' }}>Rasmiy Sertifikat Blankasi</div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button onClick={() => window.print()} className="btn btn-secondary btn-sm" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Printer size={14} /> Chop etish / PDF
                </button>
                <button onClick={() => setViewingCertificate(null)} className="btn btn-ghost btn-sm" style={{ padding: '4px' }}>
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* Official Diploma Canvas */}
            <div
              style={{
                margin: '24px',
                padding: '40px 32px',
                borderRadius: '16px',
                background: 'linear-gradient(135deg, #0f172a 0%, #1e1e38 100%)',
                border: '4px double #d97706',
                boxShadow: '0 0 30px rgba(217, 119, 6, 0.15)',
                textAlign: 'center',
                position: 'relative'
              }}
            >
              <div style={{ color: '#d97706', fontSize: '13px', fontWeight: 800, letterSpacing: '4px', textTransform: 'uppercase', marginBottom: '8px' }}>
                ✦ EDUFLOW EDUCATION PLATFORM ✦
              </div>

              <h2 style={{ fontSize: '30px', fontWeight: 900, color: '#fff', letterSpacing: '2px', margin: '0 0 16px 0', textTransform: 'uppercase' }}>
                SERTIFIKAT
              </h2>

              <div style={{ fontSize: '13px', color: '#9ca3af', fontStyle: 'italic', marginBottom: '16px' }}>
                Ushbu sertifikat quyidagi talabaga topshiriladi:
              </div>

              <div style={{ fontSize: '26px', fontWeight: 900, color: '#38bdf8', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '16px', borderBottom: '1px solid rgba(56, 189, 248, 0.3)', display: 'inline-block', paddingBottom: '4px' }}>
                {viewingCertificate.studentName}
              </div>

              <div style={{ fontSize: '13px', color: '#d1d5db', lineHeight: 1.6, maxWidth: '480px', margin: '0 auto 24px auto' }}>
                "{viewingCertificate.courseName}" professional ta'lim kursini <strong>{viewingCertificate.finalScore}%</strong> ko'rsatkich va <strong>{viewingCertificate.gradeLetter}</strong> daraja bilan muvaffaqiyatli tamomlaganligi uchun berildi.
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '20px', marginTop: '10px' }}>
                <div style={{ textAlign: 'left' }}>
                  <div style={{ fontSize: '11px', color: '#9ca3af' }}>Sertifikat ID:</div>
                  <div style={{ fontFamily: 'monospace', fontWeight: 800, color: '#fbbf24', fontSize: '14px' }}>
                    {viewingCertificate.certificateCode}
                  </div>
                  <div style={{ fontSize: '11px', color: '#6b7280', marginTop: '2px' }}>
                    Sana: {new Date(viewingCertificate.issuedAt).toLocaleDateString()}
                  </div>
                </div>

                {/* QR Code Container */}
                <div style={{ background: '#fff', padding: '8px', borderRadius: '10px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                  <QrCode size={56} color="#0f172a" />
                  <span style={{ fontSize: '8px', color: '#0f172a', fontWeight: 800 }}>EDF VERIFIED</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Certificates;
