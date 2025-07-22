import type { NextApiRequest, NextApiResponse } from 'next';
import { connectDB } from '@/utils/db';
import Fan from '@/models/Fan';
import { v4 as uuidv4 } from 'uuid';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await connectDB();

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  const { name, email, phone } = req.body;
  if (!name || !email) {
    return res.status(400).json({ error: 'Nombre y email son obligatorios' });
  }

  // Comprobar si el email ya existe
  const exists = await Fan.findOne({ email });
  if (exists) {
    return res.status(409).json({ error: 'El email ya está registrado' });
  }

  const uuid = uuidv4();
  const fan = new Fan({ uuid, name, email });
  await fan.save();

  return res.status(201).json({ success: true, uuid });
}
