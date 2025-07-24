import type { NextApiRequest, NextApiResponse } from 'next';
import { connectDB } from '@/utils/db';
import Fan from '@/models/Fan';
import Token from '@/models/Token';
import { v4 as uuidv4 } from 'uuid';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await connectDB();

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  const { name, email, phone, token } = req.body;
  if (!name || !email) {
    return res.status(400).json({ error: 'Nombre y email son obligatorios' });
  }

  // Comprobar si el email ya existe
  const exists = await Fan.findOne({ email });
  if (exists) {
    return res.status(409).json({ error: 'El email ya está registrado' });
  }

  // Buscar el token en la base de datos
  let tokenData = null;
  if (token) {
    tokenData = await Token.findOne({ token });
    if (!tokenData) {
      return res.status(400).json({ error: 'Token no válido' });
    }
  }

  // Crear el usuario con la categoría del token si existe
  const uuid = uuidv4();
  const fanData: any = { 
    uuid, 
    name, 
    email, 
    ...(phone && { phone }),
    ...(token && { tokenUsed: token }),
    ...(tokenData?.categoria && { categoria: tokenData.categoria })
  };
  
  const fan = new Fan(fanData);
  await fan.save();

  // Marcar el token como usado
  if (tokenData) {
    tokenData.used = true;
    await tokenData.save();
  }

  return res.status(201).json({ 
    success: true, 
    uuid,
    ...(tokenData?.categoria && { categoria: tokenData.categoria })
  });
}
