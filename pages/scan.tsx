import React, { useEffect, useState, useRef } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import axios from 'axios';
import Alert from '@/components/Alert';

interface ScanResult {
  access: boolean;
  name?: string;
  message?: string;
}

export default function ScanPage() {
  const [scanning, setScanning] = useState(false);
  const [result, setResult] = useState<ScanResult | null>(null);
  const [error, setError] = useState('');
  const [cameraActive, setCameraActive] = useState(false);
  const scannerRef = useRef<any>(null);

  // Iniciar cámara personalizada
  const activarCamara = async () => {
    setError('');
    setResult(null);
    setScanning(true);
    setCameraActive(true);
    setTimeout(async () => {
      try {
        if (scannerRef.current) {
          await scannerRef.current.stop();
          scannerRef.current.clear();
        }
        const qr = new Html5Qrcode('reader');
        scannerRef.current = qr;
        qr.start(
          { facingMode: 'environment' },
          { fps: 10, qrbox: 250 },
          onScanSuccess,
          onScanError
        );
      } catch (err: any) {
        setError('No se pudo acceder a la cámara.');
        setScanning(false);
        setCameraActive(false);
      }
    }, 100);
  };

  const stopScanner = async () => {
    setScanning(false);
    setCameraActive(false);
    if (scannerRef.current) {
      try {
        await scannerRef.current.stop();
        scannerRef.current.clear();
      } catch (error) {
        // ignore
      }
    }
  };

  const resetScan = async () => {
    if (scannerRef.current) {
      try {
        await scannerRef.current.stop();
        scannerRef.current.clear();
      } catch (error) {}
    }
    setResult(null);
    setError('');
    setScanning(false);
    setCameraActive(false);
    setTimeout(() => {}, 100);
  };

  const onScanSuccess = async (decodedText: string) => {
    await stopScanner();
    try {
      const response = await axios.get(`/api/check?u=${decodedText}`);
      setResult(response.data);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Error verificando el código QR.');
    }
  };

  const onScanError = (err: string) => {
    // Solo loguear
    // console.error(err);
  };

  // Limpiar escáner al desmontar
  useEffect(() => {
    return () => {
      if (scannerRef.current) {
        try {
          scannerRef.current.stop();
          scannerRef.current.clear();
        } catch (error) {}
      }
    };
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] p-2 sm:p-6">
      <h1 className="text-xl sm:text-3xl font-bold mb-4 text-blue-600">Escanear QR</h1>
      {error && (
        <div className="bg-red-100 text-red-800 p-2 rounded-lg mb-4 text-center w-full max-w-xs sm:max-w-md mx-auto">
          {error}
        </div>
      )}
      {/* Botones de acción */}
      {!scanning && !result && (
        <div className="flex flex-col gap-4 w-full max-w-xs sm:max-w-md mx-auto mb-4">
          <button
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors w-full"
            onClick={activarCamara}
          >
            Activar cámara
          </button>
        </div>
      )}
      {/* Vista de cámara personalizada */}
      <div id="reader" className={`w-full max-w-xs sm:max-w-md mx-auto mb-4 ${cameraActive ? '' : 'hidden'}`} />
      {/* Resultado */}
      {result && (
        <div className="w-full max-w-xs sm:max-w-md mx-auto">
          {result.access ? (
            <div className="bg-green-100 text-green-800 p-4 rounded-lg mb-4 text-center">
              <h2 className="font-bold text-lg mb-2">Acceso concedido</h2>
              <p>{result.name}</p>
              <p>{result.message}</p>
            </div>
          ) : (
            <div className="bg-red-100 text-red-800 p-4 rounded-lg mb-4 text-center">
              <h2 className="font-bold text-lg mb-2">Acceso denegado</h2>
              <p>{result.message}</p>
            </div>
          )}
        </div>
      )}
      {/* Botón de reinicio */}
      {(result || scanning) && (
        <div className="flex flex-col items-center w-full max-w-xs sm:max-w-md mx-auto mt-2">
          <button
            onClick={resetScan}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors w-full"
          >
            Nuevo escaneo
          </button>
        </div>
      )}
    </div>
  );
}