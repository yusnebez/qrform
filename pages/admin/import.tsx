import { useState } from 'react';
import Papa from 'papaparse';
import axios from 'axios';

export default function ImportFans() {
  const [file, setFile] = useState<File | null>(null);
  const [msg, setMsg] = useState('');

  const handleUpload = async () => {
    if (!file) return;
    Papa.parse(file, {
      header: true,
      complete: async (results) => {
        const fans = results.data as any[];
        for (const fan of fans) {
          await axios.post('/api/fans', { name: fan.name, email: fan.email });
        }
        setMsg('Importación completada');
      },
    });
  };

  return (
    <div className="p-4 max-w-md mx-auto w-full">
      <h1 className="text-lg sm:text-xl mb-4">Importar desde CSV</h1>
      <input type="file" accept=".csv" onChange={(e) => setFile(e.target.files?.[0] || null)} className="block w-full mb-4" />
      <button onClick={handleUpload} className="w-full sm:w-auto bg-green-600 text-white px-4 py-2 rounded">Importar</button>
      {msg && <p className="mt-4 text-green-700">{msg}</p>}
    </div>
  );
}