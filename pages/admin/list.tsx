import { useEffect, useState } from "react";
import axios from "axios";
import Image from "next/image";

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

  const handleDeleteFan = async (id: string, name: string) => {
    if (!confirm(`¿Estás seguro de que deseas eliminar a ${name}?`)) {
      return;
    }
    
    try {
      await axios.delete(`/api/fans?id=${id}`);
      alert('Abonado eliminado correctamente');
      // Actualizar la lista después de eliminar
      setAllFans(allFans.filter(fan => fan._id !== id));
      setFans(fans.filter(fan => fan._id !== id));
    } catch (error) {
      console.error('Error al eliminar abonado:', error);
      alert('Error al eliminar abonado. Inténtalo de nuevo.');
    }
  };

  return (
    <div className="p-4 max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Lista de Abonados</h1>
      
      {/* Toggle de vista */}
      <div className="mb-4 flex justify-end gap-2">
        <button
          className={`px-3 py-1 rounded-l border ${viewMode === 'grid' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700'}`}
          onClick={() => setViewMode('grid')}
        >
          <svg className="inline-block w-5 h-5 mr-1" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>
          Tarjetas
        </button>
        <button
          className={`px-3 py-1 rounded-r border ${viewMode === 'list' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700'}`}
          onClick={() => setViewMode('list')}
        >
          <svg className="inline-block w-5 h-5 mr-1" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M4 6h16M4 12h16M4 18h16"/></svg>
          Listado
        </button>
      </div>

      {/* Buscador */}
      <div className="mb-6">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <svg className="w-4 h-4 text-gray-500" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 20">
              <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z"/>
            </svg>
          </div>
          <input
            type="search"
            className="block w-full p-3 pl-10 text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Buscar por nombre o email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>
      
      {/* Contador de resultados */}
      <p className="text-gray-600 mb-4">
        {isLoading 
          ? "Cargando abonados..." 
          : `Mostrando ${fans.length} de ${allFans.length} abonados`}
      </p>
      
      {/* Lista de abonados */}
      {isLoading ? (
        <div className="flex justify-center items-center h-40">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      ) : fans.length > 0 ? (
        viewMode === 'grid' ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {fans.map((fan) => (
              <div key={fan._id} className="border p-4 rounded shadow hover:shadow-md transition">
                <h2 className="font-bold text-lg">{fan.name}</h2>
                <p className="text-gray-600">{fan.email}</p>
                {fan.qrCode && (
                  <div className="mt-3">
                    <img src={fan.qrCode} alt={`QR de ${fan.name}`} className="w-full max-w-[200px] mx-auto" />
                    <div className="flex justify-center mt-3 space-x-2">
                      <button
                        onClick={() => downloadQR(fan.qrCode, fan.name)}
                        className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700 transition flex items-center"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                        </svg>
                        Descargar
                      </button>
                      <button
                        onClick={() => shareQR(fan.qrCode, fan.name)}
                        className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700 transition flex items-center"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                        </svg>
                        Compartir
                      </button>
                      <button
                        onClick={() => handleDeleteFan(fan._id, fan.name)}
                        className="bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700 transition flex items-center"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                        Eliminar
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white border border-gray-200 rounded-lg">
              <thead>
                <tr>
                  <th className="py-2 px-4 border-b">Nombre</th>
                  <th className="py-2 px-4 border-b">Email</th>
                  <th className="py-2 px-4 border-b">QR</th>
                  <th className="py-2 px-4 border-b">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {fans.map((fan) => (
                  <tr key={fan._id} className="hover:bg-gray-50">
                    <td className="py-2 px-4 border-b font-semibold">{fan.name}</td>
                    <td className="py-2 px-4 border-b">{fan.email}</td>
                    <td className="py-2 px-4 border-b">
                      {fan.qrCode && (
                        <img src={fan.qrCode} alt={`QR de ${fan.name}`} className="w-16 h-16 inline-block" />
                      )}
                    </td>
                    <td className="py-2 px-4 border-b">
                      <div className="flex flex-wrap gap-2">
                        <button
                          onClick={() => downloadQR(fan.qrCode, fan.name)}
                          className="bg-blue-600 text-white px-2 py-1 rounded text-xs hover:bg-blue-700 transition flex items-center"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                          </svg>
                          Descargar
                        </button>
                        <button
                          onClick={() => shareQR(fan.qrCode, fan.name)}
                          className="bg-green-600 text-white px-2 py-1 rounded text-xs hover:bg-green-700 transition flex items-center"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                          </svg>
                          Compartir
                        </button>
                        <button
                          onClick={() => handleDeleteFan(fan._id, fan.name)}
                          className="bg-red-600 text-white px-2 py-1 rounded text-xs hover:bg-red-700 transition flex items-center"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                          Eliminar
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )
      ) : (
        <div className="text-center p-8 bg-gray-50 rounded-lg">
          <p className="text-gray-500">No se encontraron abonados con esos criterios de búsqueda.</p>
        </div>
      )}
    </div>
  );
}