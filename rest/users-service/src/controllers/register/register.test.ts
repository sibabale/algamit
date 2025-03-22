import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { register } from './register';
import { PrismaClient } from '@prisma/client';

jest.mock('@prisma/client', () => {
  const mUser = {
    findUnique: jest.fn(),
    create: jest.fn(),
  };
  const mPrismaClient = { user: mUser };
  return { PrismaClient: jest.fn(() => mPrismaClient) };
});

jest.mock('bcrypt', () => ({
  genSalt: jest.fn(),
  hash: jest.fn(),
}));

jest.mock('jsonwebtoken', () => ({
  sign: jest.fn(),
}));

describe('Register Controller', () => {
  let prismaInstanceMock: any;

  beforeAll(() => {
    process.env.JWT_SECRET = 'secret';
    prismaInstanceMock = (PrismaClient as jest.Mock).mock.results[0].value;
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should register successfully with valid credentials', async () => {
    const req = {
      body: {
        email: 'newuser@example.com',
        password: 'plainpassword',
      },
    } as any;

    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    } as any;

    prismaInstanceMock.user.findUnique.mockResolvedValue(null);

    (bcrypt.genSalt as jest.Mock).mockResolvedValue('salt');
    (bcrypt.hash as jest.Mock).mockResolvedValue('hashedpassword');

    const createdUser = {
      id: 2,
      email: 'newuser@example.com',
      password: 'hashedpassword',
      role: 'USER',
    };
    prismaInstanceMock.user.create.mockResolvedValue(createdUser);
    (jwt.sign as jest.Mock).mockReturnValue('dummy_token');

    await register(req, res);

    expect(prismaInstanceMock.user.findUnique).toHaveBeenCalledWith({
      where: { email: 'newuser@example.com' },
    });
    expect(bcrypt.genSalt).toHaveBeenCalledWith(10);
    expect(bcrypt.hash).toHaveBeenCalledWith('plainpassword', 'salt');
    expect(prismaInstanceMock.user.create).toHaveBeenCalledWith({
      data: {
        email: 'newuser@example.com',
        password: 'hashedpassword',
      },
    });
    expect(jwt.sign).toHaveBeenCalledWith(
      {
        userId: createdUser.id,
        email: createdUser.email,
        role: createdUser.role,
      },
      'secret',
      { expiresIn: '24h' },
    );
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({
      token: 'dummy_token',
      message: 'Registration successful, this token will expire in 24 hours',
    });
  });

  it('should return 400 if email or password is missing', async () => {
    const reqMissingEmail = { body: { password: 'plainpassword' } } as any;
    const resMissingEmail = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    } as any;

    await register(reqMissingEmail, resMissingEmail);
    expect(resMissingEmail.status).toHaveBeenCalledWith(400);
    expect(resMissingEmail.json).toHaveBeenCalledWith({
      error: 'Email and password are required',
    });

    const reqMissingPassword = { body: { email: 'user@example.com' } } as any;
    const resMissingPassword = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    } as any;

    await register(reqMissingPassword, resMissingPassword);
    expect(resMissingPassword.status).toHaveBeenCalledWith(400);
    expect(resMissingPassword.json).toHaveBeenCalledWith({
      error: 'Email and password are required',
    });
  });

  it('should return 400 if email is already registered', async () => {
    const req = {
      body: {
        email: 'existing@example.com',
        password: 'plainpassword',
      },
    } as any;

    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    } as any;

    prismaInstanceMock.user.findUnique.mockResolvedValue({
      id: 1,
      email: 'existing@example.com',
      password: 'hashedpassword',
      role: 'USER',
    });

    await register(req, res);

    expect(prismaInstanceMock.user.findUnique).toHaveBeenCalledWith({
      where: { email: 'existing@example.com' },
    });
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      error: 'Email already registered',
    });
  });

  it('should return 500 if a server error occurs during registration', async () => {
    const req = {
      body: {
        email: 'error@example.com',
        password: 'plainpassword',
      },
    } as any;

    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    } as any;

    prismaInstanceMock.user.findUnique.mockResolvedValue(null);
    (bcrypt.genSalt as jest.Mock).mockResolvedValue('salt');
    (bcrypt.hash as jest.Mock).mockResolvedValue('hashedpassword');

    const testError = new Error('Database error');
    prismaInstanceMock.user.create.mockRejectedValue(testError);

    await register(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      error: 'Registration failed',
      details: testError,
    });
  });
});
