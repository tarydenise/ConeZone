import { describe, it, expect } from 'vitest';
import { normalizeEmail, validateSignup, safeRedirectPath } from './validation.js';

describe('validateSignup', () => {
  it('accepts valid input', () => {
    expect(validateSignup({ name: 'Jo', email: 'jo@example.com', password: '12345678' })).toEqual({});
  });
  it('rejects a 7-character password', () => {
    expect(validateSignup({ name: 'Jo', email: 'jo@example.com', password: '1234567' }).password).toBeDefined();
  });
  it('rejects a bad email', () => {
    expect(validateSignup({ name: 'Jo', email: 'nope', password: '12345678' }).email).toBeDefined();
  });
  it('rejects a missing name', () => {
    expect(validateSignup({ name: '', email: 'jo@example.com', password: '12345678' }).name).toBeDefined();
  });
});

describe('normalizeEmail', () => {
  it('trims and lowercases', () => {
    expect(normalizeEmail('  Jo@Example.com ')).toBe('jo@example.com');
  });
});

describe('safeRedirectPath', () => {
  it('allows local paths', () => expect(safeRedirectPath('/jobs/5')).toBe('/jobs/5'));
  it('blocks outside links', () => expect(safeRedirectPath('//evil.com')).toBe('/'));
});