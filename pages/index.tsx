import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useRef } from 'react';

export default function Home() {
  const router = useRouter();
  const escanearBtnRef = useRef<HTMLAnchorElement>(null);

  // Automatiza el click en "Activar cámara" al navegar
  const handleEscanearClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    router.push('/scan').then(() => {
      setTimeout(() => {
        const btn = document.getElementById('btn-activar-camara');
        if (btn) btn.click();
      }, 300);
    });
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] p-4 sm:p-6 text-center">
      <h1 className="text-3xl sm:text-4xl font-bold mb-6 text-blue-600">Control de Acceso con QR</h1>
      <p className="text-base sm:text-xl text-gray-600 max-w-lg mb-8">
        Sistema de control de acceso mediante códigos QR para abonados.
        Escanea tu código para verificar tu acceso.
      </p>
      <div className="flex flex-col items-center w-full max-w-xs mx-auto gap-4 mt-4">
        <a
          href="/scan"
          ref={escanearBtnRef}
          onClick={handleEscanearClick}
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg transition-colors text-center w-full"
        >
          Escanear QR
        </a>
        <Link href="/login?redirect=/admin/list" className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-3 px-6 rounded-lg transition-colors text-center w-full">
          Administración
        </Link>
      </div>
    </div>
  );
}