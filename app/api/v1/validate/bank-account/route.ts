import { GET as handler } from '../../../../validate/bank-account/route';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 30;

export const GET = handler;
