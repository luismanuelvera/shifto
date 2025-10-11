import React from 'react';
import { useAuth } from '../../context/AuthContext';

// ...existing code...

const menuBtnStyle = {
  background: 'none',
  border: 'none',
  textAlign: 'left',
  width: '100%',
  padding: '10px 16px',
  fontSize: 16,
  color: '#277DA1',
  cursor: 'pointer',
  borderRadius: 6,
  transition: 'background 0.2s',
};

const UserMenu = () => {
  const { user, logout } = useAuth();

  const [open, setOpen] = React.useState(false);
  if (!user) return null;

  // Navegación programática
  const navigate = window.location.pathname.startsWith('/shifto')
    ? (path) => window.location.assign(`/shifto${path}`)
    : (path) => window.location.assign(path);

  return (
    <div className="user-menu" style={{ position: 'relative', display: 'inline-block' }}>
      <button
        className="user-menu__icon"
        style={{
          background: 'none', border: 'none', cursor: 'pointer', fontSize: 28, color: '#277DA1', padding: 0
        }}
        onClick={() => setOpen(o => !o)}
        title="Administrar usuario"
      >
        <span role="img" aria-label="usuario">👤</span>
      </button>
      {open && (
        <div className="user-menu__dropdown" style={{
          position: 'absolute', right: 0, top: '110%', minWidth: 180, background: 'white', borderRadius: 10, boxShadow: '0 2px 12px rgba(0,0,0,0.10)', zIndex: 100,
          padding: '12px 0', display: 'flex', flexDirection: 'column', gap: 4
        }}>
          <div style={{ padding: '8px 16px', fontWeight: 600, color: '#277DA1', borderBottom: '1px solid #eee' }}>
            {user.nombre ? `${user.nombre} ${user.apellido || ''}` : user.email}
          </div>
          <button style={menuBtnStyle} onClick={() => navigate('/profile')}>Perfil</button>
          <button style={menuBtnStyle} onClick={() => alert('Configuraciones próximamente')}>Configuraciones</button>
          <button style={{ ...menuBtnStyle, color: '#F94144' }} onClick={logout}>Cerrar sesión</button>
        </div>
      )}
    </div>
  );
};

// ...existing code...

export default UserMenu;
