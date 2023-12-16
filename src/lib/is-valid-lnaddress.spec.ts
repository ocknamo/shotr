import { describe, expect, it } from 'vitest';
import { isValidLnAddress } from './is-valid-lnaddress';

describe('isValidLnAddress', () => {
  it('shoud return true with valid lightning address', () => {
    expect(isValidLnAddress('jhondoe@ocknamo.com')).toBe(true);
    expect(isValidLnAddress('s14pes@getalby.com')).toBe(true);
  });

  it('shoud return true with invalid address', () => {
    expect(isValidLnAddress('@jhondoe@ocknamo.com')).toBe(false);
    expect(isValidLnAddress('s14pes@getalby#.com')).toBe(false);
  });
});
