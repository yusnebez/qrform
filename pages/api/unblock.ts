import type { NextApiRequest, NextApiResponse } from 'next';

// Aquí deberías importar tu lógica real de desbloqueo, por ejemplo desde una base de datos o utilidades
// import { unblockQrByName } from '../../lib/qr';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Método no permitido' });
  }

  const { name } = req.body;
  if (!name) {
    return res.status(400).json({ success: false, message: 'Nombre de QR requerido' });
  }

  // Simulación lógica de desbloqueo
  // const result = await unblockQrByName(name);
  // if (!result) {
  //   return res.status(404).json({ success: false, message: 'QR no encontrado o no se pudo desbloquear' });
  // }

  // Simulación: desbloqueo exitoso
  return res.status(200).json({ success: true, message: `QR ${name} desbloqueado` });
}
