import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Building, CheckSquare, LayoutDashboard, LogOut, User, Zap, Menu, X } from 'lucide-react';
import { useAuth } from '../lib/api-context';

const menuItems = [
  { path: '/dashboard', label: 'Home', icon: LayoutDashboard },
  { path: '/companies', label: 'Aziende', icon: Building },
  { path: '/activities', label: 'Attività', icon: Zap },
  { path: '/tasks', label: 'Task', icon: CheckSquare },
];

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout, user } = useAuth();
  const [mobileOpen, setMobileOpen] = React.useState(false);

  const handleLogout = async () => {
    try {
      await logout();
    } catch { /* ignore */ }
    setMobileOpen(false);
    navigate('/login', { replace: true });
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', flexDirection: 'column' }}>
      {/* Desktop sidebar */}
      <nav className="desktop-sidebar" style={{
        width: '260px',
        flexShrink: 0,
        backgroundColor: '#000',
        borderRight: '1px solid var(--border)',
        padding: '1.5rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '2rem',
        position: 'fixed',
        top: 0,
        left: 0,
        height: '100vh',
        zIndex: 50,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: 'var(--accent-primary)' }}>
          <Building size={32} />
          <h1 style={{ fontSize: '1.25rem', fontWeight: 700, letterSpacing: '-0.025em', color: 'var(--text-primary)' }}>Marketing CRM</h1>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path || (item.path !== '/dashboard' && location.pathname.startsWith(item.path));
            return (
              <Link
                key={item.path}
                to={item.path}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  padding: '0.75rem 1rem',
                  borderRadius: '0.5rem',
                  backgroundColor: isActive ? 'var(--bg-tertiary)' : 'transparent',
                  color: isActive ? 'var(--accent-primary)' : 'var(--text-secondary)',
                  fontWeight: isActive ? 600 : 400,
                  minHeight: '44px',
                }}
              >
                <Icon size={20} />
                {item.label}
              </Link>
            );
          })}
        </div>

        {user && (
          <div style={{ marginTop: 'auto', borderTop: '1px solid var(--border)', paddingTop: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
              <div style={{
                width: '32px', height: '32px', borderRadius: '0.5rem',
                backgroundColor: 'var(--bg-tertiary)', display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <User size={16} color="var(--text-secondary)" />
              </div>
              <div style={{ overflow: 'hidden' }}>
                <div style={{ fontSize: '0.8125rem', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user.name}</div>
                <div style={{ fontSize: '0.6875rem', color: 'var(--text-secondary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user.email}</div>
              </div>
            </div>
            <button
              onClick={handleLogout}
              style={{
                width: '100%', display: 'flex', alignItems: 'center', gap: '0.5rem',
                padding: '0.5rem 0.75rem', borderRadius: '0.5rem', fontSize: '0.8125rem',
                backgroundColor: 'transparent', color: 'var(--danger)', cursor: 'pointer',
                border: '1px solid var(--danger)', minHeight: '44px',
              }}
            >
              <LogOut size={14} /> Esci
            </button>
          </div>
        )}
      </nav>

      {/* Mobile top bar */}
      <header className="mobile-header" style={{
        display: 'none',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0.75rem 1rem',
        backgroundColor: 'var(--bg-secondary)',
        borderBottom: '1px solid var(--border)',
        position: 'sticky',
        top: 0,
        zIndex: 40,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <button
            onClick={() => setMobileOpen(true)}
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: 'transparent', border: '1px solid var(--border)',
              borderRadius: '0.5rem', color: 'var(--text-primary)', cursor: 'pointer',
              padding: '0.5rem', minWidth: '44px', minHeight: '44px',
            }}
          >
            <Menu size={20} />
          </button>
          <span style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '1.1rem' }}>CRM</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <div style={{
            width: '32px', height: '32px', borderRadius: '50%',
            backgroundColor: 'var(--bg-tertiary)', display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <User size={14} color="var(--text-secondary)" />
          </div>
        </div>
      </header>

      {/* Mobile drawer overlay */}
      {mobileOpen && (
        <div
          style={{
            position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.6)',
            zIndex: 60, display: 'none',
          }}
          className="mobile-overlay"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Mobile drawer */}
      <nav className="mobile-drawer" style={{
        position: 'fixed',
        top: 0,
        left: 0,
        height: '100vh',
        width: '280px',
        maxWidth: '85vw',
        backgroundColor: 'var(--bg-secondary)',
        borderRight: '1px solid var(--border)',
        padding: '1.5rem',
        display: 'none',
        flexDirection: 'column',
        gap: '1.5rem',
        zIndex: 70,
        transform: mobileOpen ? 'translateX(0)' : 'translateX(-100%)',
        transition: 'transform 0.2s ease',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: 'var(--accent-primary)' }}>
            <Building size={28} />
            <h1 style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--text-primary)' }}>Marketing CRM</h1>
          </div>
          <button
            onClick={() => setMobileOpen(false)}
            style={{
              background: 'transparent', border: '1px solid var(--border)', borderRadius: '0.5rem',
              padding: '0.4rem', color: 'var(--text-secondary)', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
          >
            <X size={18} />
          </button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path || (item.path !== '/dashboard' && location.pathname.startsWith(item.path));
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setMobileOpen(false)}
                style={{
                  display: 'flex', alignItems: 'center', gap: '0.75rem',
                  padding: '0.75rem 1rem', borderRadius: '0.5rem',
                  backgroundColor: isActive ? 'var(--bg-tertiary)' : 'transparent',
                  color: isActive ? 'var(--accent-primary)' : 'var(--text-secondary)',
                  fontWeight: isActive ? 600 : 400, minHeight: '44px',
                }}
              >
                <Icon size={20} />
                {item.label}
              </Link>
            );
          })}
        </div>

        {user && (
          <div style={{ marginTop: 'auto', borderTop: '1px solid var(--border)', paddingTop: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
              <div style={{
                width: '32px', height: '32px', borderRadius: '0.5rem',
                backgroundColor: 'var(--bg-tertiary)', display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <User size={16} color="var(--text-secondary)" />
              </div>
              <div style={{ overflow: 'hidden' }}>
                <div style={{ fontSize: '0.8125rem', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user.name}</div>
                <div style={{ fontSize: '0.6875rem', color: 'var(--text-secondary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user.email}</div>
              </div>
            </div>
            <button
              onClick={handleLogout}
              style={{
                width: '100%', display: 'flex', alignItems: 'center', gap: '0.5rem',
                padding: '0.625rem 0.75rem', borderRadius: '0.5rem', fontSize: '0.875rem',
                backgroundColor: 'transparent', color: 'var(--danger)', cursor: 'pointer',
                border: '1px solid var(--danger)', minHeight: '44px',
              }}
            >
              <LogOut size={14} /> Esci
            </button>
          </div>
        )}
      </nav>

      {/* Main content */}
      <main style={{
        flex: 1,
        padding: '1rem',
        marginLeft: '260px',
        minHeight: '100vh',
      }} className="main-content">
        {children}
      </main>

      {/* Mobile bottom nav */}
      <nav className="mobile-bottom-nav" style={{
        display: 'none',
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: 'var(--bg-secondary)',
        borderTop: '1px solid var(--border)',
        padding: '0.5rem 0',
        zIndex: 50,
      }}>
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path || (item.path !== '/dashboard' && location.pathname.startsWith(item.path));
          return (
            <Link
              key={item.path}
              to={item.path}
              style={{
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.125rem',
                padding: '0.375rem 0.5rem', flex: 1, color: isActive ? 'var(--accent-primary)' : 'var(--text-secondary)',
                fontSize: '0.625rem', fontWeight: isActive ? 600 : 400,
              }}
            >
              <Icon size={20} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <style>{`
        @media (max-width: 768px) {
          .desktop-sidebar { display: none !important; }
          .mobile-header { display: flex !important; }
          .mobile-drawer { display: flex !important; }
          .mobile-overlay { display: block !important; }
          .mobile-bottom-nav { display: flex !important; }
          .main-content { margin-left: 0 !important; padding: 1rem 1rem 5rem !important; }
        }

        @media (min-width: 769px) {
          .mobile-header { display: none !important; }
          .mobile-drawer { display: none !important; }
          .mobile-overlay { display: none !important; }
          .mobile-bottom-nav { display: none !important; }
        }
      `}</style>
    </div>
  );
};

export default Layout;
