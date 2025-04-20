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

  useEffect(() => {
    const fetchFans = async () => {
      try {
        const res = await axios.get("/api/fans");
        setFans(res.data);
      } catch (error) {
        console.error("Error fetching fans:", error);
      }
    };
    fetchFans();
  }, []);

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

  return (
    <div className="p-4">
      <h1 className="text-xl mb-4">Lista de Abonados</h1>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {fans.map((fan) => (
          <div key={fan._id} className="border p-4 rounded shadow">
            <h2 className="font-bold">{fan.name}</h2>
            <p className="text-gray-600">{fan.email}</p>
            {fan.qrCode && (
              <div className="mt-2">
                <img src={fan.qrCode} alt={`QR de ${fan.name}`} className="w-full max-w-[200px] mx-auto" />
                <div className="flex justify-center mt-2 space-x-2">
                  <button
                    onClick={() => downloadQR(fan.qrCode, fan.name)}
                    className="bg-blue-600 text-white px-3 py-1 rounded text-sm"
                  >
                    Descargar
                  </button>
                  <button
                    onClick={() => shareQR(fan.qrCode, fan.name)}
                    className="bg-green-600 text-white px-3 py-1 rounded text-sm"
                  >
                    Compartir
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}