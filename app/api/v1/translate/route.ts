import { POST as handler } from '../../translate/route';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 30;

export const POST = handler;
