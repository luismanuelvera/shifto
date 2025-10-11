import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';

const Profile = () => {
  const { user, updateProfile } = useAuth();
  const [form, setForm] = useState({
    nombre: user?.nombre || '',
    apellido: user?.apellido || '',
    telefono: user?.telefono || '',
    profesion: user?.profesion || ''
  });
  const [success, setSuccess] = useState(false);

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setSuccess(false);
  };

  const handleSubmit = e => {
    e.preventDefault();
    updateProfile(form);
    setSuccess(true);
  };

  return (
    <div className="profile-page" style={{
      minHeight: '100vh',
      width: '100vw',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #277DA1 0%, #43AA8B 100%)',
      padding: 0,
    }}>
      <div style={{
        maxWidth: 'min(480px, 96vw)',
        background: 'white',
        borderRadius: 20,
        boxShadow: '0 6px 32px rgba(39,125,161,0.10)',
        padding: 'clamp(24px, 6vw, 48px)',
        border: '1.5px solid #eaf3fa',
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        margin: '0 auto',
      }}>
      <div style={{ textAlign: 'center', marginBottom: 18 }}>
        <span style={{ fontSize: 44, color: '#277DA1', filter: 'drop-shadow(0 2px 8px #eaf3fa)' }}>👤</span>
        <h2 style={{ color: '#277DA1', fontWeight: 800, margin: '10px 0 0 0', fontSize: 24, letterSpacing: 0.5 }}>Editar perfil</h2>
  <p style={{ color: '#277DA1', fontSize: 15, fontWeight: 500, marginTop: 4 }}>Actualiza tus datos personales</p>
      </div>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
        <input name="nombre" type="text" placeholder="Nombre" value={form.nombre} onChange={handleChange} required style={inputStyle} />
        <input name="apellido" type="text" placeholder="Apellido" value={form.apellido} onChange={handleChange} required style={inputStyle} />
        <input name="telefono" type="tel" placeholder="Teléfono" value={form.telefono} onChange={handleChange} required style={inputStyle} />
        <input name="profesion" type="text" placeholder="Profesión" value={form.profesion} onChange={handleChange} required style={inputStyle} />
        <button type="submit" style={{ padding: '13px', borderRadius: 10, background: 'linear-gradient(90deg,#277DA1 60%,#43AA8B 100%)', color: 'white', fontWeight: 700, fontSize: 16, border: 'none', cursor: 'pointer', marginTop: 6, boxShadow: '0 2px 8px #eaf3fa' }}>Guardar cambios</button>
        {success && <span style={{ color: '#43AA8B', fontWeight: 700, fontSize: 15, marginTop: 6 }}>¡Perfil actualizado!</span>}
      </form>
    </div>
  </div>
  );
};

const inputStyle = {
  padding: '13px',
  borderRadius: 10,
  border: '1.5px solid #eaf3fa',
  fontSize: 16,
  background: '#f7fafd',
  marginBottom: 2,
  color: '#277DA1',
  fontWeight: 600,
  transition: 'box-shadow 0.2s',
  boxShadow: '0 1px 4px rgba(39,125,161,0.07)',
};

export default Profile;
