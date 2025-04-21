import { useState } from 'react';
import axios from 'axios';
import { useRouter } from 'next/router';

export default function NewFan() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [qr, setQr] = useState('');
  const [fanData, setFanData] = useState<any>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { data } = await axios.post('/api/fans', { name, email });
      setFanData(data);
      const qrRes = await axios.get(`/api/generate-qr?uuid=${data.uuid}`);
      setQr(qrRes.data.qr);
    } catch (error) {
      console.error('Error al crear abonado:', error);
      alert('Error al crear abonado. Inténtalo de nuevo.');
    }
  };

  const handleDownloadQR = () => {
    if (!qr) return;
    
    // Crear un enlace temporal
    const link = document.createElement('a');
    link.href = qr;
    link.download = `qr-${fanData?.name || 'abonado'}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDeleteFan = async () => {
    if (!fanData || !fanData._id) return;
    setIsDeleting(true);
    try {
      await axios.delete(`/api/fans?id=${fanData._id}`);
      setShowDeleteConfirm(false);
      alert('Abonado eliminado correctamente');
      resetForm();
    } catch (error) {
      console.error('Error al eliminar abonado:', error);
      alert('Error al eliminar abonado. Inténtalo de nuevo.');
    } finally {
      setIsDeleting(false);
    }
  };

  const resetForm = () => {
    setName('');
    setEmail('');
    setQr('');
    setFanData(null);
  };

  return (
    <div className="p-2 sm:p-4 max-w-md mx-auto w-full">
      <h1 className="text-lg sm:text-xl mb-4">Nuevo abonado</h1>
      {!qr ? (
        <form onSubmit={handleSubmit} className="space-y-4">
          <input 
            type="text" 
            placeholder="Nombre" 
            value={name} 
            onChange={e => setName(e.target.value)} 
            className="w-full border p-2 rounded" 
            required 
          />
          <input 
            type="email" 
            placeholder="Email" 
            value={email} 
            onChange={e => setEmail(e.target.value)} 
            className="w-full border p-2 rounded" 
            required 
          />
          <button 
            type="submit" 
            className="w-full bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition" 
            disabled={!name || !email}
          >
            Crear abonado
          </button>
        </form>
      ) : (
        <div className="space-y-4 mt-6">
          <div className="bg-green-50 p-4 rounded-lg border border-green-200">
            <h2 className="text-base sm:text-lg font-semibold text-green-800 mb-2">¡Abonado creado con éxito!</h2>
            <p className="text-green-700">Nombre: {fanData?.name}</p>
            <p className="text-green-700">Email: {fanData?.email}</p>
          </div>
          {qr && (
            <div className="flex flex-col items-center p-4 border rounded-lg">
              <img src={qr} alt="QR code" className="mb-4 max-w-full h-auto" />
              <div className="flex flex-wrap gap-2 justify-center">
                <button 
                  onClick={handleDownloadQR}
                  className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition flex items-center"
                  type="button"
                >
                  Descargar QR
                </button>
                <button 
                  onClick={resetForm}
                  className="bg-gray-200 text-gray-800 px-4 py-2 rounded hover:bg-gray-300 transition"
                  type="button"
                >
                  Crear otro abonado
                </button>
                <button 
                  onClick={() => setShowDeleteConfirm(true)}
                  className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition flex items-center"
                  type="button"
                  disabled={isDeleting}
                >
                  {isDeleting ? 'Eliminando...' : 'Eliminar abonado'}
                </button>
              </div>
              {/* Confirmación de eliminación en la web */}
              {showDeleteConfirm && (
                <div className="mt-4 bg-red-50 border border-red-200 rounded p-4 text-center">
                  <p className="mb-2 text-red-700 font-semibold">¿Estás seguro de que deseas eliminar a {fanData.name}?</p>
                  <div className="flex gap-2 justify-center">
                    <button
                      onClick={handleDeleteFan}
                      className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition"
                      disabled={isDeleting}
                    >
                      Sí, eliminar
                    </button>
                    <button
                      onClick={() => setShowDeleteConfirm(false)}
                      className="bg-gray-200 text-gray-800 px-4 py-2 rounded hover:bg-gray-300 transition"
                    >
                      Cancelar
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}