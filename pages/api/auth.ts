import { NextApiRequest, NextApiResponse } from 'next';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  // Solicitar autenticación
  res.setHeader('WWW-Authenticate', 'Basic realm="Acceso a administración"');
  res.status(401).json({ error: 'Se requiere autenticación' });
}
