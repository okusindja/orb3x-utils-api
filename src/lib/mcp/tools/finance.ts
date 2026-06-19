import { z } from 'zod';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { mcpToolHandler } from '../tool-error';
import {
  calculateVat,
  calculateInvoiceTotals,
  adjustForInflation,
} from '@/lib/angola/finance';

export function registerFinanceTools(server: McpServer): void {
  server.registerTool(
    'finance_vat',
    {
      title: 'Angola VAT Calculator',
      description:
        'Calculate Angola VAT breakdown from a given amount and rate. ' +
        'Returns the net amount, VAT amount, and gross amount. ' +
        'Use this when you need to split or compute VAT on a single transaction. ' +
        'For full invoice totals across multiple lines use `finance_invoice_total`. ' +
        'To adjust a historical amount for inflation use `finance_inflation_adjust`.',
      inputSchema: z.object({
        amount: z.number().positive()
          .describe('The monetary amount in AOA. Must be positive.'),
        rate: z.number().min(0).max(100).optional().default(14)
          .describe('VAT rate as a percentage (0–100). Defaults to the Angola standard rate of 14%.'),
        inclusive: z.boolean().optional().default(true)
          .describe('Whether the amount already includes VAT (tax-inclusive). Defaults to true.'),
      }),
    },
    mcpToolHandler(async (input) => calculateVat(input)),
  );

  server.registerTool(
    'finance_invoice_total',
    {
      title: 'Angola Invoice Totals',
      description:
        'Calculate subtotal, VAT, and grand total for a multi-line Angola invoice. ' +
        'Supports optional discounts (fixed amount or percentage) and per-line VAT rates. ' +
        'Use this for invoice generation or validation across multiple line items. ' +
        'For a single-amount VAT split, use `finance_vat`. ' +
        'For inflation-adjusted historical amounts, use `finance_inflation_adjust`.',
      inputSchema: z.object({
        lines: z.array(
          z.object({
            description: z.string().optional()
              .describe('Optional label for the line item.'),
            quantity: z.number().positive()
              .describe('Quantity of units. Must be positive.'),
            unitPrice: z.number().nonnegative()
              .describe('Price per unit in AOA. Must be zero or positive.'),
            vatRate: z.number().min(0).max(100).optional().default(14)
              .describe('VAT rate for this line as a percentage (0–100). Defaults to 14%.'),
          }),
        ).min(1)
          .describe('Invoice lines. At least one line is required.'),
        discount: z.number().nonnegative().optional().default(0)
          .describe('Discount to apply to the subtotal. Zero or positive. Defaults to 0.'),
        discountType: z.enum(['amount', 'percent']).optional().default('amount')
          .describe('Whether the discount is a fixed AOA amount or a percentage. Defaults to "amount".'),
      }),
    },
    mcpToolHandler(async (input) => calculateInvoiceTotals(input)),
  );

  server.registerTool(
    'finance_inflation_adjust',
    {
      title: 'Angola Inflation Adjustment',
      description:
        'Adjust a monetary amount for Angola inflation between two years using the annual CPI index. ' +
        'Supported years: 2019–2025. ' +
        'Use this to compare historical and current purchasing power. ' +
        'For VAT breakdowns use `finance_vat`. ' +
        'For full invoice totals use `finance_invoice_total`.',
      inputSchema: z.object({
        amount: z.number().positive()
          .describe('The original monetary amount in AOA to adjust for inflation. Must be positive.'),
        from: z.string()
          .describe('The source year as a string (e.g., "2019"). Must be a supported CPI year (2019–2025).'),
        to: z.string()
          .describe('The target year as a string (e.g., "2025"). Must be a supported CPI year (2019–2025).'),
      }),
    },
    mcpToolHandler(async (input) => adjustForInflation(input)),
  );
}
