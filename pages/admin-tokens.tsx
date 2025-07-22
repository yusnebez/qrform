import React, { useState } from 'react';

const API_URL = '/api/tokens';
const BASE_URL = 'https://formularioarucascf.vercel.app';

export default function AdminTokens() {
  const [count, setCount] = useState(1);
  const [loading, setLoading] = useState(false);
  const [generated, setGenerated] = useState<string[]>([]);
  const [copied, setCopied] = useState<string | null>(null);
  const [adminToken, setAdminToken] = useState('');
  const [showAdmin, setShowAdmin] = useState(false);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setGenerated([]);
    const res = await fetch(API_URL, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ count }),
    });
    const data = await res.json();
    setGenerated(data.tokens || []);
    setLoading(false);
    setCopied(null);
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(text);
      setTimeout(() => setCopied(null), 2000); // Reset after 2 seconds
    });
  };

  const handleCopyAll = () => {
    const allLinks = generated.map(token => `${BASE_URL}/?token=${token}`).join('\n');
    handleCopy(allLinks);
  };

  const handleDownload = () => {
    const allLinks = generated.map(token => `${BASE_URL}/?token=${token}`).join('\n');
    const blob = new Blob([allLinks], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'tokens.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleShowAdmin = async () => {
    setShowAdmin(true);
    // Fetch admin token from JSON (static for now)
    const res = await fetch('/api/tokens.json');
    const data = await res.json();
    setAdminToken(data.adminToken || '');
  };

  return (
    <div className="max-w-xl mx-auto mt-12 p-6 bg-white rounded shadow">
      <h2 className="text-2xl font-bold mb-4 text-blue-700">Generador de links de inscripción</h2>
      <form onSubmit={handleGenerate} className="mb-6 flex gap-2 items-end">
        <div>
          <label className="block text-sm font-medium mb-1">Cantidad de links</label>
          <input type="number" min={1} max={100} value={count} onChange={e => setCount(Number(e.target.value))} className="border rounded px-2 py-1 w-24" />
        </div>
        <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700" disabled={loading}>
          {loading ? 'Generando...' : 'Generar'}
        </button>
      </form>

      {generated.length > 0 && (
        <div className="mt-8 w-full">
          <h3 className="text-xl font-bold mb-4 text-center">Enlaces Generados:</h3>
          <ul className="space-y-2">
            {generated.map(token => {
              const link = `${BASE_URL}/?token=${token}`;
              return (
                <li key={token} className="flex items-center justify-between bg-white p-3 rounded-lg shadow">
                  <span className="text-sm text-gray-700 truncate mr-4">{link}</span>
                  <button 
                    onClick={() => handleCopy(link)}
                    className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-1 px-3 rounded text-xs transition-colors"
                  >
                    {copied === link ? '¡Copiado!' : 'Copiar'}
                  </button>
                </li>
              );
            })}
          </ul>
          {generated.length > 1 && (
            <div className="mt-6 flex justify-center space-x-4">
               <button 
                onClick={handleCopyAll}
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded transition-colors"
              >
                Copiar Todos
              </button>
              <button 
                onClick={handleDownload}
                className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded transition-colors"
              >
                Descargar (.txt)
              </button>
            </div>
          )}
        </div>
      )}
      <hr className="my-6" />
      <p className="text-xs text-gray-500 mt-6">Esta página es interna y solo debe usarse por administradores.</p>
    </div>
  );
}
