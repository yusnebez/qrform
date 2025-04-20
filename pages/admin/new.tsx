import { useState } from 'react';
import axios from 'axios';

export default function NewFan() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [qr, setQr] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const { data } = await axios.post('/api/fans', { name, email });
    const qrRes = await axios.get(`/api/generate-qr?uuid=${data.uuid}`);
    setQr(qrRes.data.qr);
  };

  return (
    <div className="p-4 max-w-md mx-auto">
      <h1 className="text-xl mb-4">Nuevo abonado</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="Nombre" className="w-full border p-2 rounded" required />
        <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="Email" className="w-full border p-2 rounded" required />
        <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">Generar QR</button>
      </form>
      {qr && <img src={qr} alt="QR code" className="mt-4" />}
    </div>
  );
}