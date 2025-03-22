import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { login } from './login';
import { PrismaClient } from '@prisma/client';

jest.mock('@prisma/client', () => {
  const mUser = { findUnique: jest.fn() };
  const mPrismaClient = { user: mUser };
  return { PrismaClient: jest.fn(() => mPrismaClient) };
});

jest.mock('bcrypt', () => ({
  compare: jest.fn(),
}));

jest.mock('jsonwebtoken', () => ({
  sign: jest.fn(),
}));

describe('Login Controller', () => {
  const mockUser = {
    id: 1,
    email: 'test@example.com',
    password: 'hashedpassword',
    role: 'USER',
  };

  let prismaInstanceMock: any;

  beforeAll(() => {
    process.env.JWT_SECRET = 'secret';
    prismaInstanceMock = (PrismaClient as jest.Mock).mock.results[0].value;
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should login successfully with valid credentials', async () => {
    prismaInstanceMock.user.findUnique.mockResolvedValue(mockUser);
    (bcrypt.compare as jest.Mock).mockResolvedValue(true);
    (jwt.sign as jest.Mock).mockReturnValue('dummy_token');

    const req = {
      body: {
        email: 'test@example.com',
        password: 'plainpassword',
      },
    } as any;

    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    } as any;

    await login(req, res);

    expect(prismaInstanceMock.user.findUnique).toHaveBeenCalledWith({
      where: { email: 'test@example.com' },
    });
    expect(bcrypt.compare).toHaveBeenCalledWith(
      'plainpassword',
      mockUser.password,
    );
    expect(jwt.sign).toHaveBeenCalledWith(
      { userId: mockUser.id, email: mockUser.email, role: mockUser.role },
      'secret',
      { expiresIn: '24h' },
    );
    expect(res.json).toHaveBeenCalledWith({
      token: 'dummy_token',
      message: 'Login successful, this token will expire in 24 hours',
    });
  });

  it('should return 401 if user is not found', async () => {
    prismaInstanceMock.user.findUnique.mockResolvedValue(null);

    const req = {
      body: {
        email: 'nonexistent@example.com',
        password: 'anyPassword',
      },
    } as any;

    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    } as any;

    await login(req, res);

    expect(prismaInstanceMock.user.findUnique).toHaveBeenCalledWith({
      where: { email: 'nonexistent@example.com' },
    });
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ error: 'Invalid credentials' });
  });

  it('should return 401 if password is invalid', async () => {
    prismaInstanceMock.user.findUnique.mockResolvedValue(mockUser);
    (bcrypt.compare as jest.Mock).mockResolvedValue(false);

    const req = {
      body: {
        email: 'test@example.com',
        password: 'wrongPassword',
      },
    } as any;

    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    } as any;

    await login(req, res);

    expect(prismaInstanceMock.user.findUnique).toHaveBeenCalledWith({
      where: { email: 'test@example.com' },
    });
    expect(bcrypt.compare).toHaveBeenCalledWith(
      'wrongPassword',
      mockUser.password,
    );
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ error: 'Invalid credentials' });
  });

  it('should return 500 if an error occurs during login', async () => {
    prismaInstanceMock.user.findUnique.mockRejectedValue(
      new Error('Database error'),
    );

    const req = {
      body: {
        email: 'test@example.com',
        password: 'plainpassword',
      },
    } as any;

    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    } as any;

    await login(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      error: 'Login failed: Error: Database error',
    });
  });
});
