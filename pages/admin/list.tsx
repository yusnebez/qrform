import { useEffect, useState } from "react";
import axios from "axios";
import Image from "next/image";
import { HiViewGrid, HiViewList } from 'react-icons/hi';

interface Fan {
  _id: string;
  name: string;
  email: string;
  qrCode: string;
}

export default function AdminListPage() {
  const [fans, setFans] = useState<Fan[]>([]);
  const [allFans, setAllFans] = useState<Fan[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [deleteFanId, setDeleteFanId] = useState<string | null>(null);
  const [deleteFanName, setDeleteFanName] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const fetchFans = async () => {
      setIsLoading(true);
      try {
        const res = await axios.get("/api/fans");
        setAllFans(res.data);
        setFans(res.data);
      } catch (error) {
        console.error("Error fetching fans:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchFans();
  }, []);

  useEffect(() => {
    if (searchTerm.trim() === "") {
      setFans(allFans);
      return;
    }

    const lowerCaseSearch = searchTerm.toLowerCase();
    const filtered = allFans.filter(
      (fan) =>
        fan.name.toLowerCase().includes(lowerCaseSearch) ||
        fan.email.toLowerCase().includes(lowerCaseSearch)
    );
    setFans(filtered);
  }, [searchTerm, allFans]);

  const downloadQR = (base64Data: string, name: string) => {
    const link = document.createElement("a");
    link.href = base64Data;
    link.download = `${name}_qr.png`;
    link.click();
  };

  const shareQR = async (qr: string, name: string) => {
    if (navigator.share) {
      const response = await fetch(qr);
      const blob = await response.blob();
      const file = new File([blob], `${name}_qr.png`, { type: blob.type });
      navigator.share({
        files: [file],
        title: `QR de ${name}`,
        text: `Aquí tienes el QR de acceso de ${name}`,
      });
    } else {
      alert("Tu dispositivo no soporta la función de compartir.");
    }
  };

  const handleDeleteFan = async (fanId: string, name: string) => {
    setIsDeleting(true);
    try {
      await axios.delete(`/api/fans?id=${fanId}`);
      setFans(fans.filter(f => f._id !== fanId));
      setDeleteFanId(null);
      setDeleteFanName(null);
    } catch (error) {
      alert('Error al eliminar abonado. Inténtalo de nuevo.');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="p-2 sm:p-4 max-w-6xl mx-auto w-full">
      <h1 className="text-lg sm:text-2xl font-bold mb-6">Lista de Abonados</h1>
      
      {/* Toggle de vista */}
      <div className="mb-2 flex flex-row justify-start gap-2">
        <button
          className={`flex items-center gap-1 px-3 py-1 rounded-l border ${viewMode === 'grid' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700'}`}
          onClick={() => setViewMode('grid')}
          title="Vista de cuadrícula"
        >
          <HiViewGrid size={20} />
          <span className="hidden sm:inline">Grid</span>
        </button>
        <button
          className={`flex items-center gap-1 px-3 py-1 rounded-r border ${viewMode === 'list' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700'}`}
          onClick={() => setViewMode('list')}
          title="Vista de lista"
        >
          <HiViewList size={20} />
          <span className="hidden sm:inline">Lista</span>
        </button>
      </div>
      {/* Buscador */}
      <form
        className="w-full max-w-md mb-4 flex flex-row"
        onSubmit={e => { e.preventDefault(); }}
      >
        <input
          type="text"
          placeholder="Buscar por nombre o email"
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          className="flex-1 border p-2 rounded-l"
        />
        <button
          type="submit"
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 rounded-r"
        >
          Buscar
        </button>
      </form>
      
      {/* Contador de resultados */}
      <p className="text-gray-600 mb-4">
        {isLoading 
          ? "Cargando abonados..." 
          : `Mostrando ${fans.length} de ${allFans.length} abonados`}
      </p>
      
      {/* Lista de abonados */}
      {isLoading ? (
        <div className="flex justify-center items-center h-32">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : fans.length === 0 ? (
        <p className="text-center text-gray-500">No se encontraron abonados.</p>
      ) : (
        <div className={viewMode === 'grid' ? 'grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4' : 'flex flex-col gap-4'}>
          {fans.map(fan => (
            <div key={fan._id} className="bg-white p-4 rounded-lg shadow-md flex flex-col items-center">
              <Image src={fan.qrCode} alt={fan.name} width={120} height={120} className="mb-2 max-w-full h-auto" />
              <h2 className="font-semibold text-base sm:text-lg mb-1 text-center break-words">{fan.name}</h2>
              <p className="text-gray-600 text-sm mb-2 break-words">{fan.email}</p>
              <div className="flex flex-wrap gap-2 justify-center w-full">
                <button
                  onClick={() => downloadQR(fan.qrCode, fan.name)}
                  className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 transition text-sm flex items-center"
                >
                  Descargar QR
                </button>
                <button
                  onClick={() => shareQR(fan.qrCode, fan.name)}
                  className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700 transition text-sm flex items-center"
                >
                  Compartir QR
                </button>
                <button
                  onClick={() => { setDeleteFanId(fan._id); setDeleteFanName(fan.name); }}
                  className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700 transition text-sm flex items-center"
                  disabled={isDeleting}
                >
                  Eliminar
                </button>
              </div>
              {/* Confirmación de eliminación en la web */}
              {deleteFanId === fan._id && (
                <div className="mt-4 bg-red-50 border border-red-200 rounded p-4 text-center">
                  <p className="mb-2 text-red-700 font-semibold">¿Estás seguro de que deseas eliminar a {deleteFanName}?</p>
                  <div className="flex gap-2 justify-center">
                    <button
                      onClick={() => handleDeleteFan(fan._id, fan.name)}
                      className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition"
                      disabled={isDeleting}
                    >
                      Sí, eliminar
                    </button>
                    <button
                      onClick={() => { setDeleteFanId(null); setDeleteFanName(null); }}
                      className="bg-gray-200 text-gray-800 px-4 py-2 rounded hover:bg-gray-300 transition"
                    >
                      Cancelar
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}