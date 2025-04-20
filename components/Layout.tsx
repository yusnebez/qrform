import React, { ReactNode } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const router = useRouter();
  
  const isActive = (path: string) => {
    return router.pathname === path ? 'bg-blue-700' : '';
  };

  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-blue-600 text-white p-4">
        <div className="container mx-auto flex justify-between items-center">
          <h1 className="text-xl font-bold">QR Access</h1>
          <nav className="flex space-x-2">
            <Link href="/" className={`px-3 py-1 rounded ${isActive('/')}`}>
              Inicio
            </Link>
            <Link href="/scan" className={`px-3 py-1 rounded ${isActive('/scan')}`}>
              Escanear
            </Link>
          </nav>
        </div>
      </header>
      
      {router.pathname.startsWith('/admin') && (
        <div className="bg-gray-100 border-b">
          <div className="container mx-auto py-2 px-4">
            <nav className="flex space-x-4">
              <Link href="/admin/new" className={`px-3 py-1 rounded ${isActive('/admin/new') ? 'bg-blue-600 text-white' : 'text-blue-600'}`}>
                Nuevo Abonado
              </Link>
              <Link href="/admin/list" className={`px-3 py-1 rounded ${isActive('/admin/list') ? 'bg-blue-600 text-white' : 'text-blue-600'}`}>
                Lista de Abonados
              </Link>
              <Link href="/admin/import" className={`px-3 py-1 rounded ${isActive('/admin/import') ? 'bg-blue-600 text-white' : 'text-blue-600'}`}>
                Importar CSV
              </Link>
              <Link href="/admin/stats" className={`px-3 py-1 rounded ${isActive('/admin/stats') ? 'bg-blue-600 text-white' : 'text-blue-600'}`}>
                Estadísticas
              </Link>
            </nav>
          </div>
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
