import { NextApiRequest, NextApiResponse } from 'next';
import { connectDB } from '@/utils/db';
import Fan from '@/models/Fan';

// Eliminamos la autenticación para simplificar
async function handler(req: NextApiRequest, res: NextApiResponse) {
  await connectDB();

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  try {
    // Total de abonados
    const totalFans = await Fan.countDocuments();

    // Fechas para filtrar
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const lastWeek = new Date();
    lastWeek.setDate(lastWeek.getDate() - 7);
    lastWeek.setHours(0, 0, 0, 0);

    const lastMonth = new Date();
    lastMonth.setMonth(lastMonth.getMonth() - 1);
    lastMonth.setHours(0, 0, 0, 0);

    // Accesos de hoy
    const accessToday = await Fan.countDocuments({
      lastAccess: { $gte: today }
    });

    // Accesos de la última semana
    const accessLastWeek = await Fan.countDocuments({
      lastAccess: { $gte: lastWeek }
    });

    // Accesos del último mes
    const accessLastMonth = await Fan.countDocuments({
      lastAccess: { $gte: lastMonth }
    });

    // Últimos accesos
    const lastAccesses = await Fan.find({ lastAccess: { $ne: null } })
      .sort({ lastAccess: -1 })
      .limit(10)
      .select('name email lastAccess -_id');

    res.status(200).json({
      totalFans,
      accessToday,
      accessLastWeek,
      accessLastMonth,
      lastAccesses
    });
  } catch (error) {
    console.error('Error obteniendo estadísticas:', error);
    res.status(500).json({ error: 'Error al obtener estadísticas' });
  }
}

// Exportamos el handler sin autenticación
export default handler;
