import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Auth = ({ onAuthSuccess }) => {
  const { login, updateProfile } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState('login');
  const [step, setStep] = useState(1); // 1: login/register, 2: datos básicos
  const [form, setForm] = useState({
    email: '',
    password: '',
    nombre: '',
    apellido: '',
    telefono: '',
    profesion: ''
  });

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleLogin = e => {
    e.preventDefault();
    login(form.email, form.password);
    if (onAuthSuccess) onAuthSuccess();
    navigate('/');
  };

  const handleRegister = e => {
    e.preventDefault();
    login(form.email, form.password);
    setStep(2);
  };

  const handleProfile = e => {
    e.preventDefault();
    updateProfile({
      nombre: form.nombre,
      apellido: form.apellido,
      telefono: form.telefono,
      profesion: form.profesion
    });
    if (onAuthSuccess) onAuthSuccess();
  };

  return (
    <div className="auth-page" style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #277DA1 0%, #43AA8B 100%)',
      padding: '0 8px',
    }}>
      <div style={{
        background: 'white',
        borderRadius: '20px',
        boxShadow: '0 6px 32px rgba(39,125,161,0.10)',
        padding: '40px 6vw',
        minWidth: 0,
        maxWidth: 420,
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        border: '1.5px solid #eaf3fa',
      }}>
        <div style={{ marginBottom: 24, textAlign: 'center' }}>
          <span style={{ fontSize: 54, color: '#277DA1', filter: 'drop-shadow(0 2px 8px #eaf3fa)' }}>👤</span>
          <h2 style={{ margin: '10px 0 0 0', fontWeight: 800, color: '#277DA1', fontSize: 26, letterSpacing: 0.5 }}>Bienvenido a Shifto</h2>
          <p style={{ color: '#277DA1', fontSize: 15, fontWeight: 500, marginTop: 4 }}>Gestiona tus turnos y perfil de manera segura</p>
        </div>
  <div className="auth-tabs" style={{ display: 'flex', gap: 8, marginBottom: 24, width: '100%' }}>
          <button onClick={() => { setTab('login'); setStep(1); }} className={tab === 'login' ? 'active' : ''} style={{
            flex: 1,
            padding: '12px 0',
            borderRadius: 10,
            border: tab === 'login' ? '2.5px solid #277DA1' : '1.5px solid #eaf3fa',
            background: tab === 'login' ? 'linear-gradient(90deg,#277DA1 60%,#43AA8B 100%)' : '#f7f7f7',
            color: tab === 'login' ? 'white' : '#277DA1',
            fontWeight: 700,
            fontSize: 16,
            cursor: 'pointer',
            boxShadow: tab === 'login' ? '0 2px 8px #eaf3fa' : 'none',
            transition: 'all 0.2s',
          }}>Login</button>
          <button onClick={() => { setTab('register'); setStep(1); }} className={tab === 'register' ? 'active' : ''} style={{
            flex: 1,
            padding: '12px 0',
            borderRadius: 10,
            border: tab === 'register' ? '2.5px solid #43AA8B' : '1.5px solid #eaf3fa',
            background: tab === 'register' ? 'linear-gradient(90deg,#43AA8B 60%,#277DA1 100%)' : '#f7f7f7',
            color: tab === 'register' ? 'white' : '#43AA8B',
            fontWeight: 700,
            fontSize: 16,
            cursor: 'pointer',
            boxShadow: tab === 'register' ? '0 2px 8px #eaf3fa' : 'none',
            transition: 'all 0.2s',
          }}>Registro</button>
        </div>
        {step === 1 && tab === 'login' && (
          <form className="auth-form" onSubmit={handleLogin} style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 16 }}>
            <input name="email" type="email" placeholder="Email" value={form.email} onChange={handleChange} required style={{
              padding: '13px', borderRadius: 10, border: '1.5px solid #eaf3fa', fontSize: 16, background: '#f7fafd', marginBottom: 2, color: '#277DA1', fontWeight: 600
            }} />
            <input name="password" type="password" placeholder="Contraseña" value={form.password} onChange={handleChange} required style={{
              padding: '13px', borderRadius: 10, border: '1.5px solid #eaf3fa', fontSize: 16, background: '#f7fafd', marginBottom: 2, color: '#277DA1', fontWeight: 600
            }} />
            <button type="submit" style={{
              padding: '12px', borderRadius: 8, background: '#277DA1', color: 'white', fontWeight: 600, fontSize: 16, border: 'none', cursor: 'pointer'
            }}>Ingresar</button>
          </form>
        )}
        {step === 1 && tab === 'register' && (
          <form className="auth-form" onSubmit={handleRegister} style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 16 }}>
            <input name="email" type="email" placeholder="Email" value={form.email} onChange={handleChange} required style={{
              padding: '13px', borderRadius: 10, border: '1.5px solid #eaf3fa', fontSize: 16, background: '#f7fafd', marginBottom: 2, color: '#277DA1', fontWeight: 600
            }} />
            <input name="password" type="password" placeholder="Contraseña" value={form.password} onChange={handleChange} required style={{
              padding: '13px', borderRadius: 10, border: '1.5px solid #eaf3fa', fontSize: 16, background: '#f7fafd', marginBottom: 2, color: '#277DA1', fontWeight: 600
            }} />
            <button type="submit" style={{
              padding: '12px', borderRadius: 8, background: '#43AA8B', color: 'white', fontWeight: 600, fontSize: 16, border: 'none', cursor: 'pointer'
            }}>Registrarse</button>
          </form>
        )}
        {step === 2 && (
          <form className="auth-form" onSubmit={handleProfile} style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 18, marginTop: 8 }}>
            <div style={{ textAlign: 'center', marginBottom: 8 }}>
              <span style={{ fontSize: 38, color: '#43AA8B' }}>📝</span>
              <h3 style={{ color: '#277DA1', fontWeight: 700, margin: '10px 0 0 0', fontSize: 20 }}>Completa tus datos básicos</h3>
              <p style={{ color: '#277DA1', fontSize: 14, marginTop: 2 }}>Para personalizar tu experiencia y perfil</p>
            </div>
            <input name="nombre" type="text" placeholder="Nombre" value={form.nombre} onChange={handleChange} required style={{
              padding: '13px', borderRadius: 10, border: '1.5px solid #eaf3fa', fontSize: 16, background: '#f7fafd', marginBottom: 2, color: '#277DA1', fontWeight: 600
            }} />
            <input name="apellido" type="text" placeholder="Apellido" value={form.apellido} onChange={handleChange} required style={{
              padding: '13px', borderRadius: 10, border: '1.5px solid #eaf3fa', fontSize: 16, background: '#f7fafd', marginBottom: 2, color: '#277DA1', fontWeight: 600
            }} />
            <input name="telefono" type="tel" placeholder="Teléfono" value={form.telefono} onChange={handleChange} required style={{
              padding: '13px', borderRadius: 10, border: '1.5px solid #eaf3fa', fontSize: 16, background: '#f7fafd', marginBottom: 2, color: '#277DA1', fontWeight: 600
            }} />
            <input name="profesion" type="text" placeholder="Profesión" value={form.profesion} onChange={handleChange} required style={{
              padding: '13px', borderRadius: 10, border: '1.5px solid #eaf3fa', fontSize: 16, background: '#f7fafd', marginBottom: 2, color: '#277DA1', fontWeight: 600
            }} />
            <button type="submit" style={{
              padding: '13px', borderRadius: 10, background: 'linear-gradient(90deg,#277DA1 60%,#43AA8B 100%)', color: 'white', fontWeight: 700, fontSize: 16, border: 'none', cursor: 'pointer', marginTop: 6, boxShadow: '0 2px 8px #eaf3fa'
            }}>Guardar y continuar</button>
          </form>
        )}
      </div>
    </div>
  );
};

export default Auth;
