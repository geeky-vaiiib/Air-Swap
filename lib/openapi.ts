/**
 * OpenAPI 3.0 Specification for AirSwap Growth API
 */

export const openApiSpec = {
  openapi: '3.0.3',
  info: {
    title: 'AirSwap Growth API',
    description: 'Carbon credit verification and trading platform API',
    version: '1.0.0',
    contact: {
      name: 'AirSwap Growth Team',
    },
  },
  servers: [
    {
      url: '/api',
      description: 'API Server',
    },
  ],
  tags: [
    { name: 'Auth', description: 'Authentication endpoints' },
    { name: 'Claims', description: 'Carbon offset claims management' },
    { name: 'Credits', description: 'Carbon credits management' },
    { name: 'Marketplace', description: 'Credit trading marketplace' },
    { name: 'Evidence', description: 'Claim evidence management' },
    { name: 'Health', description: 'System health checks' },
  ],
  paths: {
    '/health': {
      get: {
        tags: ['Health'],
        summary: 'Health check endpoint',
        responses: {
          '200': { description: 'System is healthy' },
          '503': { description: 'System is unhealthy' },
        },
      },
    },
    '/auth/signup': {
      post: {
        tags: ['Auth'],
        summary: 'Register a new user',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/SignupInput' },
            },
          },
        },
        responses: {
          '201': { description: 'User created successfully' },
          '400': { description: 'Validation error' },
        },
      },
    },
    '/auth/login': {
      post: {
        tags: ['Auth'],
        summary: 'Authenticate user',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/LoginInput' },
            },
          },
        },
        responses: {
          '200': { description: 'Login successful' },
          '401': { description: 'Invalid credentials' },
        },
      },
    },
    '/auth/logout': {
      post: {
        tags: ['Auth'],
        summary: 'Logout user',
        responses: {
          '200': { description: 'Logout successful' },
        },
      },
    },
    '/claims': {
      get: {
        tags: ['Claims'],
        summary: 'Get all claims',
        parameters: [
          { name: 'userId', in: 'query', schema: { type: 'string' } },
          { name: 'status', in: 'query', schema: { type: 'string', enum: ['pending', 'verified', 'rejected'] } },
        ],
        responses: {
          '200': { description: 'Claims retrieved' },
        },
        security: [{ cookieAuth: [] }],
      },
      post: {
        tags: ['Claims'],
        summary: 'Create a new claim',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/ClaimInput' },
            },
          },
        },
        responses: {
          '201': { description: 'Claim created' },
          '400': { description: 'Validation error' },
          '429': { description: 'Rate limit exceeded' },
        },
        security: [{ cookieAuth: [] }],
      },
    },
    '/claims/{id}/verify': {
      patch: {
        tags: ['Claims'],
        summary: 'Verify a claim (verifier only)',
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'string' } },
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/VerifyInput' },
            },
          },
        },
        responses: {
          '200': { description: 'Claim verified' },
          '403': { description: 'Not authorized' },
          '404': { description: 'Claim not found' },
        },
        security: [{ cookieAuth: [] }],
      },
    },
    '/credits/{userId}': {
      get: {
        tags: ['Credits'],
        summary: 'Get user credits',
        parameters: [
          { name: 'userId', in: 'path', required: true, schema: { type: 'string' } },
        ],
        responses: {
          '200': { description: 'Credits retrieved' },
        },
        security: [{ cookieAuth: [] }],
      },
    },
    '/credits/issue': {
      post: {
        tags: ['Credits'],
        summary: 'Issue credits (verifier only)',
        responses: {
          '201': { description: 'Credits issued' },
          '403': { description: 'Not authorized' },
        },
        security: [{ cookieAuth: [] }],
      },
    },
  },
  components: {
    schemas: {},
    securitySchemes: {
      cookieAuth: {
        type: 'apiKey',
        in: 'cookie',
        name: 'airswap-session',
      },
    },
  },
};

