import { NextApiRequest, NextApiResponse } from 'next';
import { NextRequest, NextResponse } from 'next/server';

// Credenciales de administrador (en producción deberían estar en variables de entorno)
const ADMIN_USERNAME = 'admin';
const ADMIN_PASSWORD = 'Prueba123'; // Cambia esto por la contraseña que prefieras

// Middleware para proteger rutas de API
export function withAuth(handler: any) {
  return async (req: NextApiRequest, res: NextApiResponse) => {
    const authHeader = req.headers.authorization;
    
    if (!isValidAuth(authHeader)) {
      res.setHeader('WWW-Authenticate', 'Basic');
      return res.status(401).json({ error: 'Acceso no autorizado' });
    }
    
    return handler(req, res);
  };
}

// Función para verificar credenciales
export function isValidAuth(authHeader?: string): boolean {
  if (!authHeader || !authHeader.startsWith('Basic ')) {
    return false;
  }
  
  // Extraer y decodificar credenciales
  const base64Credentials = authHeader.split(' ')[1];
  const credentials = Buffer.from(base64Credentials, 'base64').toString('utf-8');
  const [username, password] = credentials.split(':');
  
  return username === ADMIN_USERNAME && password === ADMIN_PASSWORD;
}

// Función para middleware de páginas
export function requireAuth(req: NextRequest) {
  const url = req.nextUrl.clone();
  
  // Si es una ruta de administración
  if (url.pathname.startsWith('/admin')) {
    const authHeader = req.headers.get('authorization');
    
    if (!isValidAuth(authHeader)) {
      url.pathname = '/api/auth';
      return NextResponse.rewrite(url);
    }
  }
  
  return NextResponse.next();
}
