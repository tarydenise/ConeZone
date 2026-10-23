import { describe, it, expect } from 'vitest';
import { can, PERMISSIONS } from './permissions.js';

describe('can', () => {
  it('lets a dispatcher create jobs', () => expect(can('dispatcher', 'job.create')).toBe(true));
  it('blocks a field worker from creating jobs', () => expect(can('field_worker', 'job.create')).toBe(false));
  it('blocks a supervisor from managing users', () => expect(can('supervisor', 'user.manage')).toBe(false));
  it('lets an admin manage users', () => expect(can('admin', 'user.manage')).toBe(true));
  it('denies unknown actions', () => expect(can('admin', 'made.up')).toBe(false));
  it('denies unknown roles', () => expect(can('hacker', 'job.create')).toBe(false));
});

describe('PERMISSIONS', () => {
  it('only uses the four real roles', () => {
    const roles = new Set(['admin', 'dispatcher', 'supervisor', 'field_worker']);
    for (const allowed of Object.values(PERMISSIONS)) {
      for (const r of allowed) expect(roles.has(r)).toBe(true);
    }
  });
});