import { connectDB } from '@/utils/db';
import type { NextApiRequest, NextApiResponse } from 'next';
import Fan from '@/models/Fan';
import { v4 as uuidv4 } from 'uuid';
import QRCode from 'qrcode';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await connectDB();

  if (req.method === 'POST') {
    const { name, email } = req.body;
    const fan = await Fan.create({ uuid: uuidv4(), name, email });
    return res.status(201).json(fan);
  }

  if (req.method === 'GET') {
    try {
      const fans = await Fan.find({}).sort({ createdAt: -1 });
      
      // Generar QR para cada fan
      const fansWithQR = await Promise.all(fans.map(async (fan) => {
        const fanObj = fan.toObject();
        try {
          fanObj.qrCode = await QRCode.toDataURL(fan.uuid);
        } catch (error) {
          console.error('Error generando QR:', error);
          fanObj.qrCode = '';
        }
        return fanObj;
      }));
      
      res.status(200).json(fansWithQR);
    } catch (error) {
      res.status(500).json({ error: 'Error fetching fans' });
    }
  } else if (req.method === 'DELETE') {
    try {
      const { id } = req.query;
      
      if (!id) {
        return res.status(400).json({ error: 'Se requiere ID del abonado' });
      }
      
      const deletedFan = await Fan.findByIdAndDelete(id);
      
      if (!deletedFan) {
        return res.status(404).json({ error: 'Abonado no encontrado' });
      }
      
      return res.status(200).json({ message: 'Abonado eliminado correctamente' });
    } catch (error) {
      console.error('Error eliminando abonado:', error);
      return res.status(500).json({ error: 'Error al eliminar abonado' });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}