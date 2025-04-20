import { NextApiRequest, NextApiResponse } from 'next';
import { connectDB } from '@/utils/db';
import Fan from '@/models/Fan';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await connectDB();
  const { u } = req.query;

  if (!u || typeof u !== 'string') return res.status(400).json({ error: 'Missing uuid' });
  const fan = await Fan.findOne({ uuid: u });
  if (!fan) return res.status(404).json({ error: 'Fan not found' });

  const now = new Date();
  const last = fan.lastAccess;
  
  // Verificar si han pasado menos de 3 horas desde el último acceso
  const threeHoursInMs = 3 * 60 * 60 * 1000; // 3 horas en milisegundos
  const isBlocked = last && (now.getTime() - new Date(last).getTime()) < threeHoursInMs;

  if (isBlocked) {
    // Calcular tiempo restante para desbloqueo
    const timePassedMs = now.getTime() - new Date(last).getTime();
    const timeRemainingMs = threeHoursInMs - timePassedMs;
    const minutesRemaining = Math.ceil(timeRemainingMs / (60 * 1000));
    
    return res.status(200).json({ 
      access: false, 
      message: `Acceso bloqueado. Disponible en ${minutesRemaining} minutos.` 
    });
  }

  fan.lastAccess = now;
  await fan.save();
  res.status(200).json({ access: true, name: fan.name });
}
