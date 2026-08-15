import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  DEFAULT_ALLOWED_ORIGINS,
  getAllowedOrigins,
  isOriginAllowed,
} from './CORs.mjs';

describe('Allowed origins', () => {
  for (const origin of DEFAULT_ALLOWED_ORIGINS) {
    it(`allows ${origin}`, () => {
      assert.equal(isOriginAllowed(origin), true);
    });
  }

  for (const origin of [
    'http://hacker',
    'http://localhost:4001',
    'https://immediate.co.uk',
  ]) {
    it(`disallows ${origin}`, () => {
      assert.equal(isOriginAllowed(origin), false);
    });
  }

  it('adds comma-separated origins from configuration', () => {
    const origins = getAllowedOrigins(
      'https://preview.example.com, https://production.example.com',
    );

    assert.equal(origins.includes('https://preview.example.com'), true);
    assert.equal(origins.includes('https://production.example.com'), true);
    assert.equal(origins.includes('http://localhost'), true);
  });
});
