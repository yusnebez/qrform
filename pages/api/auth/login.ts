import { NextApiRequest, NextApiResponse } from 'next';
import { isValidAuth } from '@/utils/auth';
import { serialize } from 'cookie';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Solo permitir método POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  try {
    const { credentials } = req.body;
    
    if (!credentials) {
      return res.status(400).json({ error: 'Credenciales no proporcionadas' });
    }

    // Validar las credenciales
    const authHeader = `Basic ${credentials}`;
    if (!isValidAuth(authHeader)) {
      return res.status(401).json({ error: 'Usuario o contraseña incorrectos' });
    }

    // Si las credenciales son válidas, establecer una cookie
    const authCookie = serialize('auth_token', credentials, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24, // 1 día
      path: '/',
      sameSite: 'strict',
    });

    res.setHeader('Set-Cookie', authCookie);
    res.status(200).json({ success: true });
  } catch (error) {
    console.error('Error en login:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
}
