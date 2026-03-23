import { GET as handler } from '../../../../calendar/add-working-days/route';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 30;

export const GET = handler;
