import React, { useState } from 'react';


const API_URL = '/api/tokens';

export default function AdminTokens() {
  const [count, setCount] = useState(1);
  const [generated, setGenerated] = useState<string[]>([]);
  const [adminToken, setAdminToken] = useState('');
  const [loading, setLoading] = useState(false);
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
        <div>
          <h3 className="font-semibold mb-2">Links generados:</h3>
          <ul className="list-disc pl-5">
            {generated.map(token => (
              <li key={token} className="mb-1 break-all">
                <span className="font-mono">{`https://formularioarucascf.vercel.app/?token=${token}`}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
      <hr className="my-6" />
      <button onClick={handleShowAdmin} className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700 mb-2">Mostrar token maestro</button>
      {showAdmin && (
        <div className="bg-gray-100 rounded p-3 mt-2">
          <span className="font-mono text-sm">{adminToken}</span>
        </div>
      )}
      <p className="text-xs text-gray-500 mt-6">Esta página es interna y solo debe usarse por administradores.</p>
    </div>
  );
}
