import React, { useState } from 'react';
import Image from 'next/image';

interface User {
  name: string;
  email: string;
  phone?: string;
}

const fakeExistingEmails = ["test@example.com", "admin@example.com"];

import { useEffect } from 'react';

export default function Home() {
  const [form, setForm] = useState<User>({ name: '', email: '', phone: '' });
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [access, setAccess] = useState<'checking' | 'denied' | 'allowed' | 'admin'>('checking');
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    const url = new URL(window.location.href);
    const t = url.searchParams.get('token');
    if (!t) {
      setAccess('denied');
      return;
    }
    setToken(t);
    fetch(`/api/tokens?token=${t}`)
      .then(res => res.json())
      .then(data => {
        if (data.valid) setAccess(data.admin ? 'admin' : 'allowed');
        else setAccess('denied');
      })
      .catch(() => setAccess('denied'));
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError(null);
    setSuccess(null);
  };

  // El email único ahora se valida en backend
  const checkEmailExists = async (email: string) => false;

  const handleSubmit = async (e: React.FormEvent) => {
    if (!token) return setError('Token inválido.');
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);
    if (!form.name.trim() || !form.email.trim()) {
      setError('Nombre y email son obligatorios.');
      setLoading(false);
      return;
    }
    // Enviar datos al backend con el token
    const res = await fetch('/api/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        name: form.name, 
        email: form.email, 
        phone: form.phone,
        token: token === 'admin' ? null : token // No enviar token si es admin
      }),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error || 'Error al registrar usuario');
      setLoading(false);
      return;
    }
    setSuccess('¡Enhorabuena! Te has inscrito correctamente como abonado del Arucas CF. Pronto recibirás más información.');
    setForm({ name: '', email: '', phone: '' });
    setLoading(false);
    // Marcar token como usado si no es admin
    if (access === 'allowed' && token) {
      await fetch('/api/tokens', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token }),
      });
    }
  };


  if (access === 'checking') {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-lg text-gray-600">Verificando acceso...</div>
      </div>
    );
  }
  if (access === 'denied') {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md mt-12 text-center">
          <h2 className="text-2xl font-bold mb-4 text-red-600">Acceso denegado</h2>
          <p className="text-gray-600">Debes acceder desde un enlace válido. Si crees que es un error, contacta con el administrador.</p>
        </div>
      </div>
    );
  }
  // allowed o admin
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md mt-12">
        <div className="flex justify-center mb-4">
          <Image src="/logo.png" alt="Logo Arucas CF" width={100} height={100} />
        </div>
        <h2 className="text-2xl font-bold mb-6 text-blue-700 text-center">Inscripción de abonado para Arucas CF</h2>
        {success ? (
          <div className="flex flex-col items-center justify-center min-h-[300px]">
            <div className="text-green-700 text-3xl font-bold text-center mb-4">{success}</div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              type="text"
              name="name"
              placeholder="Nombre completo"
              value={form.name}
              onChange={handleChange}
              className="w-full border rounded px-3 py-2"
              required
            />
            <input
              type="email"
              name="email"
              placeholder="Correo electrónico"
              value={form.email}
              onChange={handleChange}
              className="w-full border rounded px-3 py-2"
              required
            />
            <input
              name="phone"
              placeholder="Teléfono (opcional)"
              value={form.phone}
              onChange={handleChange}
              type="tel"
              className="w-full border rounded px-3 py-2"
            />
            {error && <div className="text-red-600 text-center mt-2">{error}</div>}
            <div>
              <button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg transition-colors mt-2 disabled:opacity-60"
                disabled={loading}
              >
                {loading ? 'Creando...' : 'Crear usuario'}
              </button>
            </div>
          </form>
        )}
        {!success && (
          <p className="text-xs text-gray-500 mt-6 text-center">
            Este enlace es de un solo uso. Una vez que te hayas inscrito, el acceso quedará invalidado. Si no completas el registro, deberás solicitar un nuevo enlace para volver a intentarlo.
          </p>
        )}
      </div>
    </div>
  );
}