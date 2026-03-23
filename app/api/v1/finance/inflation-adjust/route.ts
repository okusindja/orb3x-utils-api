import { GET as handler } from '../../../../finance/inflation-adjust/route';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 30;

export const GET = handler;
