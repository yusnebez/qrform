import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Desactivamos temporalmente el middleware para permitir el acceso directo
export function middleware(request: NextRequest) {
  // Permitir acceso directo a todas las rutas
  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*'],
};
