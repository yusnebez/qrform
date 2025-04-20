import { useEffect, useState } from 'react';
import axios from 'axios';
import Alert from '@/components/Alert';

interface StatsData {
  totalFans: number;
  accessToday: number;
  accessLastWeek: number;
  accessLastMonth: number;
  lastAccesses: Array<{
    name: string;
    email: string;
    lastAccess: string;
  }>;
}

export default function StatsPage() {
  const [stats, setStats] = useState<StatsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const res = await axios.get('/api/stats');
        setStats(res.data);
        setError('');
      } catch (err: any) {
        console.error('Error fetching stats:', err);
        setError(err.response?.data?.error || 'Error al cargar estadísticas');
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const formatDate = (dateString: string) => {
    if (!dateString) return 'Nunca';
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return <Alert type="error" message={error} />;
  }

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold">Estadísticas de Acceso</h1>

      {stats && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h2 className="text-lg font-semibold text-gray-700">Total de Abonados</h2>
              <p className="text-3xl font-bold text-blue-600">{stats.totalFans}</p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h2 className="text-lg font-semibold text-gray-700">Accesos Hoy</h2>
              <p className="text-3xl font-bold text-green-600">{stats.accessToday}</p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h2 className="text-lg font-semibold text-gray-700">Última Semana</h2>
              <p className="text-3xl font-bold text-yellow-600">{stats.accessLastWeek}</p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h2 className="text-lg font-semibold text-gray-700">Último Mes</h2>
              <p className="text-3xl font-bold text-purple-600">{stats.accessLastMonth}</p>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-4">Últimos Accesos</h2>
            
            {stats.lastAccesses.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full bg-white">
                  <thead>
                    <tr>
                      <th className="py-2 px-4 border-b text-left">Nombre</th>
                      <th className="py-2 px-4 border-b text-left">Email</th>
                      <th className="py-2 px-4 border-b text-left">Último Acceso</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stats.lastAccesses.map((access, index) => (
                      <tr key={index} className={index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                        <td className="py-2 px-4 border-b">{access.name}</td>
                        <td className="py-2 px-4 border-b">{access.email}</td>
                        <td className="py-2 px-4 border-b">{formatDate(access.lastAccess)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-gray-500 italic">No hay registros de acceso</p>
            )}
          </div>
        </>
      )}
    </div>
  );
}
