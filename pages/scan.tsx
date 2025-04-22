import React, { useEffect, useState, useRef } from 'react';
import { Html5Qrcode, Html5QrcodeSupportedFormats, Html5QrcodeScannerState } from 'html5-qrcode';
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
  const [preparandoCamara, setPreparandoCamara] = useState(false);
  const scannerRef = useRef<any>(null);
  const [showLoadingCamera, setShowLoadingCamera] = useState(false);
  const [cancelReload, setCancelReload] = useState(false);
  const [showReader, setShowReader] = useState(true);

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

  // Reinicio robusto antes de reactivar cámara (elimina y recrea el div del reader)
  const robustResetAndActivate = async () => {
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
    setPreparandoCamara(true);
    setShowReader(false);
    setTimeout(async () => {
      setShowReader(true);
      setTimeout(async () => {
        try {
          const devices = await Html5Qrcode.getCameras();
          if (!devices || devices.length === 0) {
            setPreparandoCamara(false);
            setError('No se detectó ninguna cámara disponible. Asegúrate de que ningún otro programa la esté usando.');
            return;
          }
          setPreparandoCamara(false);
          activarCamara();
        } catch (e) {
          setPreparandoCamara(false);
          setError('No se pudo acceder a la cámara. Verifica los permisos y que ningún otro programa la esté usando. Si el problema persiste, pulsa Reintentar.');
        }
      }, 1000);
    }, 300);
  };

  // Forzar recarga si es necesario
  const forceReload = () => {
    window.location.reload();
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

  // Cuando hay resultado, inicia el flujo de recarga/cancelar
  useEffect(() => {
    if (result) {
      setShowLoadingCamera(true);
      setCancelReload(false);
      // Tras 2.5s, reactiva la cámara automáticamente (sin mostrar nada más)
      const t = setTimeout(() => {
        if (!cancelReload) {
          setResult(null);
          setError('');
          setScanning(false);
          setCameraActive(false);
          setPreparandoCamara(true);
          setShowReader(false);
          setTimeout(() => {
            setShowReader(true);
            setPreparandoCamara(false);
            setShowLoadingCamera(false);
            activarCamara();
          }, 1000);
        }
      }, 2500);
      return () => clearTimeout(t);
    }
  }, [result, cancelReload]);

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
    <div className="flex flex-col items-center justify-center min-h-[100dvh] sm:min-h-0 sm:max-h-none sm:overflow-visible max-h-[100dvh] overflow-hidden p-1 sm:p-6 bg-white">
      <h1 className="text-lg sm:text-2xl font-bold mb-2 text-blue-600">Escanear QR</h1>
      {/* Mensaje de cargando cámara y cancelar (tras resultado) */}
      {showLoadingCamera && (
        <div className="flex flex-row items-center gap-4 mt-10 animate-pulse">
          <button
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg shadow-md text-base font-semibold"
            disabled
          >
            <span className="inline-block">Cargando cámara nuevamente</span>
            <span className="inline-block animate-bounce">...</span>
          </button>
          <button
            className="bg-gray-400 hover:bg-gray-500 text-white px-3 py-2 rounded-lg text-base"
            onClick={() => setCancelReload(true)}
          >
            Cancelar
          </button>
        </div>
      )}
      {/* Botón activar cámara SOLO si no hay cámara activa, resultado ni cargando */}
      {!scanning && !result && !showLoadingCamera && (
        <div className="flex flex-col gap-3 w-full max-w-xs sm:max-w-md mx-auto mb-2">
          <button
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors w-full text-base sm:text-lg"
            id="btn-activar-camara"
            onClick={activarCamara}
            autoFocus
          >
            Activar cámara
          </button>
        </div>
      )}
      {/* Vista de cámara personalizada */}
      {showReader && (
        <div
          id="reader"
          className={`w-full max-w-[400px] mx-auto mb-4 sm:mb-8 rounded-lg shadow-lg ${cameraActive ? '' : 'hidden'}`}
          style={{ maxWidth: '98vw', minHeight: 0, background: '#111', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}
        >
          {preparandoCamara && (
            <div className="w-full text-center text-blue-600 py-4 animate-pulse text-base sm:text-lg font-semibold">
              Preparando cámara...
            </div>
          )}
        </div>
      )}
    </div>
  );
}