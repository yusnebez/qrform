import { useRouter } from 'next/router';
import React from 'react';

interface Props {
  name: string;
  access: boolean;
  message: string;
  waitTime?: number;
}

const ResultPage = () => {
  const router = useRouter();
  const { name, access, message, waitTime } = router.query;

  console.log('Access:', access);
  console.log('WaitTime:', waitTime);

  const handleScanAnother = () => {
    router.replace('/scan');
  };

  // Nueva función para desbloquear QR
  const handleUnblockQr = async () => {
    // Simulación de petición al backend
    try {
      const res = await fetch('/api/unblock', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name }),
      });
      const data = await res.json();
      if (data.success) {
        alert('QR desbloqueado correctamente');
        router.replace('/scan');
      } else {
        alert('No se pudo desbloquear el QR');
      }
    } catch (error) {
      alert('Error al intentar desbloquear el QR');
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[100dvh] bg-white p-4">
      <div className={`max-w-md w-full rounded-lg shadow-lg p-6 mb-6 text-center ${access === 'true' ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
        <h1 className={`text-2xl font-bold mb-2 ${access === 'true' ? 'text-green-700' : 'text-red-700'}`}>
          {access === 'true'
            ? `${name} Tiene acceso concedido para entrar en ver este partido`
            : `${name} Ya ha sido utilizado el acceso a este partido`}
        </h1>
        <p className="text-base mb-4 text-gray-700">{message}</p>
        {access !== 'true' && waitTime && (
          <div className="flex flex-row items-center justify-center gap-4 mb-4">
            <button
              className="bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded-lg text-base font-semibold shadow"
              onClick={handleUnblockQr}
            >
             Salir del partido
            </button>
            <span className="text-base text-blue-700">{waitTime} min restante</span>
          </div>
        )}
        <div className="flex flex-row items-center justify-center gap-4">
          <button
            className="mt-6 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg text-lg font-semibold shadow"
            onClick={handleScanAnother}
          >
            Escanear otro QR
          </button>
        </div>
      </div>
    </div>
  );
};

export default ResultPage;
