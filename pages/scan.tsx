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
  const [countdown, setCountdown] = useState<number | null>(null);
  const countdownRef = useRef<NodeJS.Timeout | null>(null);

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

  // Lanzar cuenta atrás y reactivar cámara
  useEffect(() => {
    if (result) {
      setCountdown(3);
      countdownRef.current = setInterval(() => {
        setCountdown(prev => {
          if (prev === 1) {
            clearInterval(countdownRef.current!);
            setCountdown(null);
            resetScan();
            activarCamara();
            return null;
          }
          return prev! - 1;
        });
      }, 1000);
    } else {
      if (countdownRef.current) clearInterval(countdownRef.current);
      setCountdown(null);
    }
    return () => { if (countdownRef.current) clearInterval(countdownRef.current); };
  }, [result]);

  // Nuevo escaneo inmediato (detiene countdown y reactiva cámara)
  const handleNuevoEscaneo = async () => {
    if (countdownRef.current) clearInterval(countdownRef.current);
    setCountdown(null);
    await resetScan();
    activarCamara();
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
    <div className="flex flex-col items-center justify-center min-h-[100dvh] max-h-[100dvh] overflow-hidden p-1 sm:p-6 bg-white">
      <h1 className="text-lg sm:text-2xl font-bold mb-2 text-blue-600">Escanear QR</h1>
      {error && (
        <div className="bg-red-100 text-red-800 p-2 rounded-lg mb-2 text-center w-full max-w-xs sm:max-w-md mx-auto text-sm sm:text-base">
          {error}
        </div>
      )}
      {/* Botones de acción */}
      {!scanning && !result && (
        <div className="flex flex-col gap-3 w-full max-w-xs sm:max-w-md mx-auto mb-2">
          <button
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors w-full text-base sm:text-lg"
            onClick={activarCamara}
          >
            Activar cámara
          </button>
        </div>
      )}
      {/* Vista de cámara personalizada */}
      <div
        id="reader"
        className={`w-full max-w-[340px] aspect-square mx-auto mb-2 ${cameraActive ? '' : 'hidden'}`}
        style={{ maxWidth: '95vw', minHeight: 0 }}
      />
      {/* Resultado */}
      {result && (
        <div className="w-full max-w-xs sm:max-w-md mx-auto">
          {result.access ? (
            <div className="bg-green-100 text-green-800 p-3 rounded-lg mb-2 text-center">
              <h2 className="font-bold text-base sm:text-lg mb-1">Acceso concedido</h2>
              <p className="text-sm sm:text-base">{result.name}</p>
              <p className="text-sm sm:text-base">{result.message}</p>
            </div>
          ) : (
            <div className="bg-red-100 text-red-800 p-3 rounded-lg mb-2 text-center">
              <h2 className="font-bold text-base sm:text-lg mb-1">Acceso denegado</h2>
              <p className="text-sm sm:text-base">{result.message}</p>
            </div>
          )}
          {/* Botón y cuenta atrás */}
          <div className="flex flex-col items-center gap-2">
            <button
              onClick={handleNuevoEscaneo}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors w-full text-base sm:text-lg"
            >
              Nuevo escaneo{countdown !== null ? ` (${countdown})` : ''}
            </button>
            {countdown !== null && (
              <p className="text-blue-700 font-semibold text-lg sm:text-xl animate-pulse">La cámara se reactivará en {countdown} segundo{countdown === 1 ? '' : 's'}...</p>
            )}
          </div>
        </div>
      )}
      {/* Botón de reinicio (solo si no hay resultado) */}
      {scanning && !result && (
        <div className="flex flex-col items-center w-full max-w-xs sm:max-w-md mx-auto mt-1">
          <button
            onClick={resetScan}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors w-full text-base sm:text-lg"
          >
            Nuevo escaneo
          </button>
        </div>
      )}
    </div>
  );
}