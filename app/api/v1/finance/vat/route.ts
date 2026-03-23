import { GET as handler } from '../../../../finance/vat/route';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 30;

export const GET = handler;
