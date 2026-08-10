import { NextResponse } from 'next/server';

// Liveness probe: "is the process alive and serving requests?"
// Intentionally never reads secrets or touches the DB. Returns 200 as long as
// the Node.js process can execute. Used by Kubernetes/container `livenessProbe`.
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export function GET() {
  return NextResponse.json(
    { status: 'alive', uptime: process.uptime() },
    {
      status: 200,
      headers: { 'Cache-Control': 'no-store, max-age=0' },
    },
  );
}