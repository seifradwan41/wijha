import bcrypt from 'bcryptjs';

describe('Auth utilities', () => {
  describe('Password hashing', () => {
    it('should hash a password', async () => {
      const password = 'testpassword123';
      const hashed = await bcrypt.hash(password, 10);
      expect(hashed).not.toBe(password);
      expect(hashed.length).toBeGreaterThan(0);
    });

    it('should verify a correct password', async () => {
      const password = 'testpassword123';
      const hashed = await bcrypt.hash(password, 10);
      const match = await bcrypt.compare(password, hashed);
      expect(match).toBe(true);
    });

    it('should reject an incorrect password', async () => {
      const password = 'testpassword123';
      const hashed = await bcrypt.hash(password, 10);
      const match = await bcrypt.compare('wrongpassword', hashed);
      expect(match).toBe(false);
    });
  });
});
