import React, { ReactNode, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const [adminMenuOpen, setAdminMenuOpen] = useState(false);

  const isActive = (path: string) => {
    return router.pathname === path ? 'bg-blue-700' : '';
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header/Menu Principal */}
      <header className="bg-blue-600 text-white p-4">
        <div className="container mx-auto flex justify-between items-center">
          <h1 className="text-xl font-bold">QR Access</h1>
          {/* Botón hamburguesa */}
          <button
            className="md:hidden flex items-center px-3 py-2 border rounded text-white border-white focus:outline-none"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Abrir menú"
          >
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          {/* Menú de navegación */}
          <nav className="hidden md:flex space-x-2">
            <Link href="/" className={`px-3 py-1 rounded ${isActive('/')}`}>Inicio</Link>
            <Link href="/scan" className={`px-3 py-1 rounded ${isActive('/scan')}`}>Escanear</Link>
          </nav>
        </div>
        {/* Menú móvil principal */}
        {menuOpen && (
          <nav className="md:hidden bg-blue-700 px-4 pb-2 flex flex-col space-y-1">
            <Link href="/" className={`block px-3 py-2 rounded ${isActive('/')}`} onClick={() => setMenuOpen(false)}>Inicio</Link>
            <Link href="/scan" className={`block px-3 py-2 rounded ${isActive('/scan')}`} onClick={() => setMenuOpen(false)}>Escanear</Link>
          </nav>
        )}
      </header>

      {/* Menú de administración */}
      {router.pathname.startsWith('/admin') && (
        <div className="bg-gray-100 border-b">
          <div className="container mx-auto py-2 px-4 flex justify-between items-center">
            {/* Botón hamburguesa para admin */}
            <span className="font-semibold text-blue-700 hidden md:inline">Admin</span>
            <button
              className="md:hidden flex items-center px-3 py-2 border rounded text-blue-700 border-blue-700 focus:outline-none"
              onClick={() => setAdminMenuOpen(!adminMenuOpen)}
              aria-label="Abrir menú admin"
            >
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            {/* Menú admin escritorio */}
            <nav className="hidden md:flex space-x-4">
              <Link href="/admin/new" className={`px-3 py-1 rounded ${isActive('/admin/new') ? 'bg-blue-600 text-white' : 'text-blue-600'}`}>Nuevo Abonado</Link>
              <Link href="/admin/list" className={`px-3 py-1 rounded ${isActive('/admin/list') ? 'bg-blue-600 text-white' : 'text-blue-600'}`}>Lista de Abonados</Link>
              <Link href="/admin/import" className={`px-3 py-1 rounded ${isActive('/admin/import') ? 'bg-blue-600 text-white' : 'text-blue-600'}`}>Importar CSV</Link>
              <Link href="/admin/stats" className={`px-3 py-1 rounded ${isActive('/admin/stats') ? 'bg-blue-600 text-white' : 'text-blue-600'}`}>Estadísticas</Link>
            </nav>
          </div>
          {/* Menú admin móvil */}
          {adminMenuOpen && (
            <nav className="md:hidden bg-blue-50 px-4 pb-2 flex flex-col space-y-1">
              <Link href="/admin/new" className={`block px-3 py-2 rounded ${isActive('/admin/new') ? 'bg-blue-600 text-white' : 'text-blue-600'}`} onClick={() => setAdminMenuOpen(false)}>Nuevo Abonado</Link>
              <Link href="/admin/list" className={`block px-3 py-2 rounded ${isActive('/admin/list') ? 'bg-blue-600 text-white' : 'text-blue-600'}`} onClick={() => setAdminMenuOpen(false)}>Lista de Abonados</Link>
              <Link href="/admin/import" className={`block px-3 py-2 rounded ${isActive('/admin/import') ? 'bg-blue-600 text-white' : 'text-blue-600'}`} onClick={() => setAdminMenuOpen(false)}>Importar CSV</Link>
              <Link href="/admin/stats" className={`block px-3 py-2 rounded ${isActive('/admin/stats') ? 'bg-blue-600 text-white' : 'text-blue-600'}`} onClick={() => setAdminMenuOpen(false)}>Estadísticas</Link>
            </nav>
          )}
        </div>
      )}

      <main className="flex-grow container mx-auto p-4">
        {children}
      </main>

      <footer className="bg-gray-800 text-white p-4 text-center">
        <div className="container mx-auto">
          <p>QR Access &copy; {new Date().getFullYear()}</p>
        </div>
      </footer>
    </div>
  );
}
