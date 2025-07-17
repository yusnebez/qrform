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

  const handleScanAnother = () => {
    router.replace('/scan');
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
          <p className="text-base text-blue-700 mb-4">Podrá volver a usarlo en {waitTime} minutos</p>
        )}
        <button
          className="mt-6 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg text-lg font-semibold shadow"
          onClick={handleScanAnother}
        >
          Escanear otro QR
        </button>
      </div>
    </div>
  );
};

export default ResultPage;
