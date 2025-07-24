import React, { useState } from 'react';

const API_URL = '/api/tokens';
const BASE_URL = 'https://formularioarucascf.vercel.app';

const CATEGORIAS = ['Tercera', 'Sub 23', 'División de honor'] as const;

export default function AdminTokens() {
  const [count, setCount] = useState(1);
  const [categoria, setCategoria] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [generated, setGenerated] = useState<Array<{token: string, categoria?: string}>>([]);
  const [copied, setCopied] = useState<string | null>(null);
  const [adminToken, setAdminToken] = useState('');
  const [showAdmin, setShowAdmin] = useState(false);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setGenerated([]);
    try {
      const res = await fetch(API_URL, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          count,
          ...(categoria && { categoria }) // Incluir categoría solo si se seleccionó una
        }),
      });
      const data = await res.json();
      if (data.success) {
        setGenerated(data.tokens || []);
      } else {
        console.error('Error al generar tokens:', data.message);
        alert(data.message || 'Error al generar los tokens');
      }
    } catch (error) {
      console.error('Error al generar tokens:', error);
      alert('Error al conectar con el servidor');
    } finally {
      setLoading(false);
      setCopied(null);
    }
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(text);
      setTimeout(() => setCopied(null), 2000); // Reset after 2 seconds
    });
  };

  const handleCopyAll = () => {
    const allLinks = generated.map(item => `${BASE_URL}/?token=${item.token}${item.categoria ? `&categoria=${encodeURIComponent(item.categoria)}` : ''}`).join('\n');
    navigator.clipboard.writeText(allLinks).then(() => {
      setCopied('all'); // Use a special identifier for 'copy all'
      setTimeout(() => setCopied(null), 2000);
    });
  };

  const handleDownload = () => {
    const allLinks = generated.map(item => `${BASE_URL}/?token=${item.token}${item.categoria ? `&categoria=${encodeURIComponent(item.categoria)}` : ''}`).join('\n');
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
      <form onSubmit={handleGenerate} className="mb-6">
        <div className="flex flex-wrap gap-4 items-end">
          <div className="flex-1 min-w-[150px]">
            <label className="block text-sm font-medium mb-1">Cantidad de links</label>
            <input 
              type="number" 
              min={1} 
              max={100} 
              value={count} 
              onChange={e => setCount(Number(e.target.value))} 
              className="border rounded px-2 py-1 w-full" 
              required
            />
          </div>
          <div className="flex-1 min-w-[200px]">
            <label className="block text-sm font-medium mb-1">Categoría (opcional)</label>
            <select 
              value={categoria}
              onChange={e => setCategoria(e.target.value)}
              className="border rounded px-2 py-1 w-full"
            >
              <option value="">Selecciona una categoría</option>
              {CATEGORIAS.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
          <div>
            <button 
              type="submit" 
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 h-10" 
              disabled={loading}
            >
              {loading ? 'Generando...' : 'Generar'}
            </button>
          </div>
        </div>
      </form>

      {generated.length > 0 && (
        <div className="mt-8 w-full">
          <h3 className="text-xl font-bold mb-4 text-center">Enlaces Generados:</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white rounded-lg overflow-hidden">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Categoría</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Enlace</th>
                  <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {generated.map((item, index) => {
                  const link = `${BASE_URL}/?token=${item.token}${item.categoria ? `&categoria=${encodeURIComponent(item.categoria)}` : ''}`;
                  return (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">
                        {item.categoria || 'Sin categoría'}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-700 truncate max-w-xs">
                        {link}
                      </td>
                      <td className="px-4 py-3 text-right whitespace-nowrap text-sm font-medium">
                        <button 
                          onClick={() => handleCopy(link)}
                          className="text-blue-600 hover:text-blue-900 mr-4"
                        >
                          {copied === link ? '¡Copiado!' : 'Copiar'}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          {generated.length > 1 && (
            <div className="mt-6 flex justify-center space-x-4">
               <button 
                onClick={handleCopyAll}
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded transition-colors"
              >
                {copied === 'all' ? '¡Copiado!' : 'Copiar Todos'}
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
