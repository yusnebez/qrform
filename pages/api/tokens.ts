import { NextApiRequest, NextApiResponse } from 'next';
import { connectDB } from '@/utils/db';
import Token from '@/models/Token';
import crypto from 'crypto';

// Get the admin token from environment variables for security
const ADMIN_TOKEN = process.env.ADMIN_TOKEN || 'DEFAULT_ADMIN_TOKEN_REPLACE_ME';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await connectDB();

  if (req.method === 'GET') {
    // Return admin token if requested
    if (req.query.getAdminToken === 'true') {
      return res.status(200).json({ adminToken: ADMIN_TOKEN });
    }

    // Validate a token
    const { token } = req.query;
    if (!token || typeof token !== 'string') {
      return res.status(400).json({ valid: false, message: 'Token no proporcionado.' });
    }

    if (token === ADMIN_TOKEN) {
      return res.status(200).json({ valid: true, admin: true });
    }

    const foundToken = await Token.findOne({ token: token, used: false });
    return res.status(200).json({ valid: !!foundToken, admin: false });
  }

  if (req.method === 'POST') {
    // Mark token as used
    const { token } = req.body;
    if (!token || typeof token !== 'string') {
      return res.status(400).json({ success: false, message: 'Token no proporcionado.' });
    }

    if (token === ADMIN_TOKEN) {
      return res.status(200).json({ success: true }); // Admin token is not marked as used
    }

    const result = await Token.updateOne({ token: token, used: false }, { $set: { used: true } });

    if (result.modifiedCount === 0) {
      return res.status(404).json({ success: false, message: 'Token no válido o ya utilizado.' });
    }

    return res.status(200).json({ success: true });
  }

  if (req.method === 'PUT') {
    // Generate tokens
    const { count, categoria } = req.body;
    if (!count || typeof count !== 'number' || count < 1 || count > 100) {
      return res.status(400).json({ success: false, message: 'Cantidad no válida.' });
    }

    // Validar categoría si se proporciona
    const categoriasValidas = ['Tercera', 'Sub 23', 'División de honor'];
    if (categoria && !categoriasValidas.includes(categoria)) {
      return res.status(400).json({ success: false, message: 'Categoría no válida.' });
    }

    const newTokens = Array.from({ length: count }, () => ({
      token: crypto.randomUUID(),
      created: Date.now(),
      used: false,
      ...(categoria && { categoria }) // Añadir categoría solo si se proporciona
    }));
    
    try {
      const insertedTokens = await Token.insertMany(newTokens);
      return res.status(201).json({ 
        success: true, 
        tokens: insertedTokens.map(t => ({
          token: t.token,
          categoria: t.categoria
        }))
      });
    } catch (error) {
      console.error('Error creating tokens:', error);
      return res.status(500).json({ success: false, message: 'Error al generar los tokens.' });
    }
  }

  return res.status(405).json({ message: 'Método no permitido' });
}
