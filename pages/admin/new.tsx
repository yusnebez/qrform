import { useState } from 'react';
import axios from 'axios';
import { useRouter } from 'next/router';

export default function NewFan() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [qr, setQr] = useState('');
  const [fanData, setFanData] = useState<any>(null);
  const [isDeleting, setIsDeleting] = useState(false);
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
    
    if (!confirm(`¿Estás seguro de que deseas eliminar a ${fanData.name}?`)) {
      return;
    }
    
    setIsDeleting(true);
    
    try {
      await axios.delete(`/api/fans?id=${fanData._id}`);
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
    <div className="p-4 max-w-md mx-auto">
      <h1 className="text-xl mb-4">Nuevo abonado</h1>
      
      {!qr ? (
        <form onSubmit={handleSubmit} className="space-y-4">
          <input 
            type="text" 
            value={name} 
            onChange={e => setName(e.target.value)} 
            placeholder="Nombre" 
            className="w-full border p-2 rounded" 
            required 
          />
          <input 
            type="email" 
            value={email} 
            onChange={e => setEmail(e.target.value)} 
            placeholder="Email" 
            className="w-full border p-2 rounded" 
            required 
          />
          <button 
            type="submit" 
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
          >
            Generar QR
          </button>
        </form>
      ) : (
        <div className="space-y-4">
          <div className="bg-green-50 p-4 rounded-lg border border-green-200">
            <h2 className="text-lg font-semibold text-green-800 mb-2">¡Abonado creado con éxito!</h2>
            <p><strong>Nombre:</strong> {fanData?.name}</p>
            <p><strong>Email:</strong> {fanData?.email}</p>
          </div>
          
          <div className="flex flex-col items-center p-4 border rounded-lg">
            <img src={qr} alt="QR code" className="mb-4 max-w-full h-auto" />
            
            <div className="flex flex-wrap gap-2 justify-center">
              <button 
                onClick={handleDownloadQR}
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition flex items-center"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                Descargar QR
              </button>
              
              <button 
                onClick={resetForm}
                className="bg-gray-200 text-gray-800 px-4 py-2 rounded hover:bg-gray-300 transition"
              >
                Crear Otro
              </button>
              
              <button 
                onClick={handleDeleteFan}
                disabled={isDeleting}
                className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition flex items-center"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                {isDeleting ? 'Eliminando...' : 'Eliminar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}