import { isOriginAllowed } from './CORs.mjs';

describe('Allowed origins', () => {
  const passingOrigins = [
    'http://localhost',
    'http://localhost:4000',
    'https://localhost',
    'https://localhost:4000',
    'http://im-jira-import.herokuapp.com',
    'https://im-jira-import.herokuapp.com',
  ];

  for (const origin of passingOrigins) {
    it(`allows ${origin}`, () => {
      expect(isOriginAllowed(origin)).toBe(true);
    });
  }

  const failingOrigins = [
    'http://hacker',
    'http://localhost:4001',
    'https://immediate.co.uk',
  ];

  for (const origin of failingOrigins) {
    it(`disallows ${origin}`, () => {
      expect(isOriginAllowed(origin)).toBe(false);
    });
  }
});
