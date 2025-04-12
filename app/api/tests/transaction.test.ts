import { expect, describe, it, jest, beforeEach, afterEach } from '@jest/globals';
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { POST } from '../transactions/route';

// Mock Clerk auth
jest.mock('@clerk/nextjs/server', () => ({
  auth: jest.fn(() => ({
    userId: 'test_user_id',
    orgId: 'test_org_id',
  })),
}));

// Mock Prisma client
jest.mock('@prisma/client', () => {
  const mockCreate = jest.fn().mockResolvedValue({
    id: 'test_transaction_id',
    description: 'Test transaction',
    category: 'Test category',
    relatedParty: 'Test party',
    amountTotal: 100,
    type: 'pemasukan',
    organizationId: 'test_org_id',
    userId: 'test_user_id',
    items: [
      {
        id: 'test_item_id',
        name: 'Test item',
        itemPrice: 100,
        quantity: 1,
        totalPrice: 100,
        organizationId: 'test_org_id',
        userId: 'test_user_id',
      }
    ]
  });

  const mockPrismaClient = {
    transaction: {
      create: mockCreate,
      findUnique: jest.fn().mockResolvedValue({
        id: 'test_transaction_id',
        description: 'Test transaction',
        category: 'Test category',
        relatedParty: 'Test party',
        amountTotal: 100,
        type: 'pemasukan',
        organizationId: 'test_org_id',
        userId: 'test_user_id',
        items: [
          {
            id: 'test_item_id',
            name: 'Test item',
            itemPrice: 100,
            quantity: 1,
            totalPrice: 100,
            organizationId: 'test_org_id',
            userId: 'test_user_id',
          }
        ]
      }),
    },
    $transaction: jest.fn().mockImplementation(callback => callback(mockPrismaClient)),
  };

  return {
    PrismaClient: jest.fn(() => mockPrismaClient),
  };
});

// Mock TransactionService
jest.mock('../services/transaction.service', () => {
  return {
    TransactionService: jest.fn().mockImplementation(() => {
      return {
        createTransaction: jest.fn().mockResolvedValue({
          id: 'test_transaction_id',
          description: 'Test transaction',
          category: 'Test category',
          relatedParty: 'Test party',
          amountTotal: 100,
          type: 'pemasukan',
          organizationId: 'test_org_id',
          userId: 'test_user_id',
          items: [
            {
              id: 'test_item_id',
              name: 'Test item',
              itemPrice: 100,
              quantity: 1,
              totalPrice: 100,
              organizationId: 'test_org_id',
              userId: 'test_user_id',
            }
          ]
        }),
      };
    }),
  };
});

describe('Transaction API', () => {
  let mockJson: jest.Mock;
  let originalJson: any;

  beforeEach(() => {
    mockJson = jest.fn().mockReturnValue({
      status: 200,
    });
    originalJson = NextResponse.json;
    NextResponse.json = mockJson;
  });

  afterEach(() => {
    NextResponse.json = originalJson;
    jest.clearAllMocks();
  });

  describe('POST /api/transactions', () => {
    it('should create a transaction with organizationId and userId', async () => {
      // Prepare the request data
      const requestData = {
        date: '2025-04-11',
        description: 'Test transaction',
        category: 'Test category',
        relatedParty: 'Test party',
        amountTotal: 100,
        type: 'pemasukan',
        items: [
          {
            name: 'Test item',
            itemPrice: 100,
            quantity: 1,
          }
        ]
      };

      // Create a mock request
      const request = {
        json: jest.fn().mockResolvedValue(requestData),
      } as unknown as NextRequest;

      // Call the API endpoint
      await POST(request);

      // Check if auth was called
      expect(auth).toHaveBeenCalled();

      // Check if the response has the expected format
      expect(mockJson).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Transaction created',
          transaction: expect.objectContaining({
            id: 'test_transaction_id',
            organizationId: 'test_org_id',
            userId: 'test_user_id',
          }),
        }),
        expect.objectContaining({
          status: 201,
        })
      );
    });

    it('should return 403 when no organization is selected', async () => {
      // Override the mock for this test only
      (auth as jest.Mock).mockReturnValueOnce({
        userId: 'test_user_id',
        orgId: null,
      });

      // Create a mock request
      const request = {
        json: jest.fn().mockResolvedValue({}),
      } as unknown as NextRequest;

      // Call the API endpoint
      await POST(request);

      // Check if the response is an error
      expect(mockJson).toHaveBeenCalledWith(
        expect.objectContaining({
          error: 'No organization selected',
        }),
        expect.objectContaining({
          status: 403,
        })
      );
    });

    it('should return 401 when no user is authenticated', async () => {
      // Override the mock for this test only
      (auth as jest.Mock).mockReturnValueOnce({
        userId: null,
        orgId: 'test_org_id',
      });

      // Create a mock request
      const request = {
        json: jest.fn().mockResolvedValue({}),
      } as unknown as NextRequest;

      // Call the API endpoint
      await POST(request);

      // Check if the response is an error
      expect(mockJson).toHaveBeenCalledWith(
        expect.objectContaining({
          error: 'Unauthorized',
        }),
        expect.objectContaining({
          status: 401,
        })
      );
    });
  });
}); 