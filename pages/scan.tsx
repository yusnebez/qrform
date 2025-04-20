import React, { useEffect, useState } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import axios from 'axios';
import Alert from '@/components/Alert';

interface ScanResult {
  access: boolean;
  name?: string;
  message?: string;
}

export default function ScanPage() {
  const [scanning, setScanning] = useState(true);
  const [result, setResult] = useState<ScanResult | null>(null);
  const [error, setError] = useState('');

  const resetScan = () => {
    setScanning(true);
    setResult(null);
    setError('');
    
    // Reiniciar el escáner
    if (typeof window !== 'undefined') {
      const scanner = new Html5QrcodeScanner(
        "reader",
        { 
          qrbox: 250,
          fps: 5 
        },
        false
      );
      scanner.render(onScanSuccess, onScanError);
    }
  };

  const onScanSuccess = async (decodedText: string) => {
    setScanning(false);
    
    try {
      // Limpiar el escáner
      const scanner = new Html5QrcodeScanner(
        "reader",
        { qrbox: 250, fps: 5 },
        false
      );
      scanner.clear();
      
      // Verificar el código QR
      const response = await axios.get(`/api/check?u=${decodedText}`);
      setResult(response.data);
    } catch (err: any) {
      console.error('Error verificando QR:', err);
      setError(err.response?.data?.error || 'Error al verificar el código QR');
    }
  };

  const onScanError = (err: string) => {
    console.error(err);
    // No mostrar errores de escaneo al usuario, solo en consola
  };

  useEffect(() => {
    // Verificamos que estemos en el navegador
    if (typeof window !== 'undefined') {
      const scanner = new Html5QrcodeScanner(
        "reader",
        { 
          qrbox: 250,
          fps: 5 
        },
        false
      );

      scanner.render(onScanSuccess, onScanError);

      // Limpieza al desmontar
      return () => {
        scanner.clear();
      };
    }
  }, []);

  return (
    <div className="max-w-lg mx-auto p-4">
      <h1 className="text-2xl font-bold text-center mb-6">Escáner QR</h1>
      
      {error && (
        <Alert 
          type="error" 
          message={error} 
          onClose={() => setError('')}
        />
      )}
      
      {scanning ? (
        <div id="reader" className="w-full mx-auto"></div>
      ) : result ? (
        <div className={`p-6 rounded-lg shadow-md text-center ${result.access ? 'bg-green-100' : 'bg-red-100'}`}>
          {result.access ? (
            <>
              <div className="text-5xl mb-4">✅</div>
              <h2 className="text-xl font-bold text-green-700 mb-2">Acceso Permitido</h2>
              {result.name && <p className="text-lg">Bienvenido/a, {result.name}</p>}
            </>
          ) : (
            <>
              <div className="text-5xl mb-4">⛔</div>
              <h2 className="text-xl font-bold text-red-700 mb-2">Acceso Denegado</h2>
              {result.message && <p className="text-lg">{result.message}</p>}
            </>
          )}
          
          <button 
            onClick={resetScan}
            className="mt-6 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
          >
            Escanear Otro Código
          </button>
        </div>
      ) : null}
    </div>
  );
}