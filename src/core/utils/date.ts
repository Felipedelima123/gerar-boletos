import { parse, format, isValid } from 'date-fns';

export function isValidDate(date: unknown): date is Date {
  return date instanceof Date && isValid(date);
}

export function parseBrlDate(dateInput: string | Date): Date {
  if (dateInput instanceof Date) {
    return new Date(format(dateInput, 'yyyy-MM-dd'));
  }
  return parse(dateInput, 'yyyy-MM-dd', new Date());
}
