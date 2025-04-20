import { NextApiRequest, NextApiResponse } from 'next';
import QRCode from 'qrcode';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { uuid } = req.query;
  if (!uuid || typeof uuid !== 'string') return res.status(400).json({ error: 'Missing uuid' });

  try {
    const qr = await QRCode.toDataURL(uuid);
    res.status(200).json({ qr });
  } catch (err) {
    res.status(500).json({ error: 'Failed to generate QR' });
  }
}