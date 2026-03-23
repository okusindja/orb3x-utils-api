import {
  addWorkingDays,
  calculateWorkingDays,
  listAngolanHolidays,
} from '@/lib/angola/calendar';

describe('angola calendar utilities', () => {
  it('includes carnival and good friday', () => {
    const holidays = listAngolanHolidays(2026);

    expect(holidays.some((holiday) => holiday.name === 'Carnival')).toBe(true);
    expect(holidays.some((holiday) => holiday.name === 'Good Friday')).toBe(true);
  });

  it('calculates working days across a holiday window', () => {
    const result = calculateWorkingDays({
      from: '2026-03-20',
      to: '2026-03-24',
    });

    expect(result.workingDays).toBe(2);
    expect(result.excludedHolidayDays).toBe(1);
  });

  it('adds working days across a holiday', () => {
    const result = addWorkingDays({
      date: '2026-03-20',
      days: 1,
    });

    expect(result.resultDate).toBe('2026-03-24');
  });
});
