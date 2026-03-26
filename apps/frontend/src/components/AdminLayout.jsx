import { Outlet, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import AdminSidebar from './AdminSidebar';

const AdminLayout = () => {
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  // Cerrar sidebar al navegar en móvil
  useEffect(() => {
    setSidebarOpen(false);
  }, [location.pathname]);

  return (
    <div className="flex bg-surface min-h-screen text-on-surface overflow-x-hidden">
      {/* Botón de toggle para móvil */}
      <button 
        onClick={() => setSidebarOpen(!isSidebarOpen)}
        className="lg:hidden fixed bottom-6 right-6 z-[100] w-14 h-14 bg-primary text-on-primary rounded-full shadow-2xl flex items-center justify-center border-none cursor-pointer active:scale-90 transition-transform"
        aria-label="Toggle Sidebar"
      >
        <span className="material-symbols-outlined text-2xl">
          {isSidebarOpen ? 'close' : 'menu'}
        </span>
      </button>

      {/* Overlay para móvil */}
      {isSidebarOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-[55] animate-fade-in"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar con clases de responsividad */}
      <div className={`
        fixed inset-y-0 left-0 z-[60] w-64 transform bg-surface border-r border-outline-variant/10 transition-transform duration-300 ease-in-out
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0 lg:static lg:inset-0
      `}>
        <AdminSidebar />
      </div>

      {/* Contenido principal */}
      <div className="flex-1 flex flex-col min-w-0 bg-surface-container-low min-h-screen relative">
        <Outlet />
      </div>
    </div>
  );
};

export default AdminLayout;
