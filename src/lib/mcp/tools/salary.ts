import { z } from 'zod';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { mcpToolHandler } from '../tool-error';
import {
  calculateNetSalary,
  calculateGrossSalary,
  calculateEmployerCost,
} from '@/lib/angola/salary';

export function registerSalaryTools(server: McpServer): void {
  server.registerTool(
    'salary_net',
    {
      title: 'Angola Net Salary',
      description:
        'Calculate Angola take-home (net) salary and full IRT tax breakdown from a gross salary amount. ' +
        'Use this when you have the gross amount and want to know the employee\'s net pay and deductions. ' +
        'For the reverse — finding the gross that produces a target net — use `salary_gross`. ' +
        'To compute total employer cost including the 8% employer social-security contribution, use `salary_employer_cost`.',
      inputSchema: z.object({
        grossSalary: z.number().nonnegative()
          .describe('Gross base salary in Angolan kwanza (AOA). Must be zero or positive.'),
        year: z.number().int().optional().default(2026)
          .describe('Tax year for IRT brackets. Supported: 2025, 2026. Defaults to 2026.'),
        mealSubsidy: z.number().nonnegative().optional().default(0)
          .describe('Meal allowance in AOA per the period specified by subsidyPeriod.'),
        transportSubsidy: z.number().nonnegative().optional().default(0)
          .describe('Transport allowance in AOA per the period specified by subsidyPeriod.'),
        subsidyPeriod: z.enum(['month', 'day']).optional().default('month')
          .describe('Whether subsidies are provided per month or per working day (22 days/month assumed).'),
      }),
    },
    mcpToolHandler(async (input) => calculateNetSalary(input)),
  );

  server.registerTool(
    'salary_gross',
    {
      title: 'Angola Gross From Net',
      description:
        'Find the gross salary required to achieve a target take-home (net) salary in Angola ' +
        'using binary-search over the IRT table. ' +
        'Use this when you know the net you want to pay and need the gross figure to set. ' +
        'For the standard gross-to-net calculation, use `salary_net`. ' +
        'For total employer cost (gross + employer social security), use `salary_employer_cost`.',
      inputSchema: z.object({
        targetNetSalary: z.number().nonnegative()
          .describe('Target take-home (net) salary in AOA. The function finds the gross amount that produces this net.'),
        year: z.number().int().optional().default(2026)
          .describe('Tax year for IRT brackets. Supported: 2025, 2026. Defaults to 2026.'),
        mealSubsidy: z.number().nonnegative().optional().default(0)
          .describe('Meal allowance in AOA per the period specified by subsidyPeriod.'),
        transportSubsidy: z.number().nonnegative().optional().default(0)
          .describe('Transport allowance in AOA per the period specified by subsidyPeriod.'),
        subsidyPeriod: z.enum(['month', 'day']).optional().default('month')
          .describe('Whether subsidies are provided per month or per working day.'),
      }),
    },
    mcpToolHandler(async (input) => calculateGrossSalary(input)),
  );

  server.registerTool(
    'salary_employer_cost',
    {
      title: 'Angola Employer Cost',
      description:
        'Calculate the total cost to an employer for a given gross salary in Angola, ' +
        'including the 8% employer social-security contribution on top of gross. ' +
        'Use this for total employment-cost budgeting. ' +
        'For the employee\'s take-home and IRT breakdown only, use `salary_net`. ' +
        'For gross-to-net reversal, use `salary_gross`.',
      inputSchema: z.object({
        grossSalary: z.number().nonnegative()
          .describe('Gross base salary in Angolan kwanza (AOA). Must be zero or positive.'),
        year: z.number().int().optional().default(2026)
          .describe('Tax year for IRT brackets. Supported: 2025, 2026. Defaults to 2026.'),
        mealSubsidy: z.number().nonnegative().optional().default(0)
          .describe('Meal allowance in AOA per the period specified by subsidyPeriod.'),
        transportSubsidy: z.number().nonnegative().optional().default(0)
          .describe('Transport allowance in AOA per the period specified by subsidyPeriod.'),
        subsidyPeriod: z.enum(['month', 'day']).optional().default('month')
          .describe('Whether subsidies are provided per month or per working day (22 days/month assumed).'),
      }),
    },
    mcpToolHandler(async (input) => calculateEmployerCost(input)),
  );
}
