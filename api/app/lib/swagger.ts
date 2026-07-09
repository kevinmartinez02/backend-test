import swaggerJsdoc from 'swagger-jsdoc';

const options: swaggerJsdoc.Options = {
    definition: {
        openapi: '3.0.3',
        info: {
            title: 'Books API',
            version: '1.0.0',
            description: 'API for managing authors and their books',
        },
        servers: [
            { url: `http://localhost:${process.env.PORT ?? '8000'}`, description: 'Local server' },
        ],
        components: {
            schemas: {
                Author: {
                    type: 'object',
                    properties: {
                        id: { type: 'string', format: 'uuid' },
                        name: { type: 'string' },
                        country: { type: 'string', nullable: true },
                        createdAt: { type: 'string', format: 'date-time' },
                        updatedAt: { type: 'string', format: 'date-time' },
                    },
                },
                AuthorInput: {
                    type: 'object',
                    required: ['name'],
                    properties: {
                        name: { type: 'string', description: "Author's name" },
                        country: { type: 'string' },
                    },
                },
                Tag: {
                    type: 'object',
                    properties: {
                        id: { type: 'string', format: 'uuid' },
                        name: { type: 'string' },
                    },
                },
                Book: {
                    type: 'object',
                    properties: {
                        id: { type: 'string', format: 'uuid' },
                        title: { type: 'string' },
                        genre: { $ref: '#/components/schemas/BookGenre' },
                        status: { $ref: '#/components/schemas/BookStatus' },
                        rating: { type: 'integer', nullable: true },
                        authorId: { type: 'string', format: 'uuid' },
                        tags: {
                            type: 'array',
                            items: { $ref: '#/components/schemas/Tag' },
                        },
                        createdAt: { type: 'string', format: 'date-time' },
                        updatedAt: { type: 'string', format: 'date-time' },
                    },
                },
                BookInput: {
                    type: 'object',
                    required: ['authorId', 'title', 'genre'],
                    properties: {
                        authorId: { type: 'string', format: 'uuid' },
                        title: { type: 'string' },
                        genre: { $ref: '#/components/schemas/BookGenre' },
                        tags: {
                            type: 'array',
                            items: { type: 'string' },
                        },
                    },
                },
                StatusHistory: {
                    type: 'object',
                    properties: {
                        id: { type: 'string', format: 'uuid' },
                        bookId: { type: 'string', format: 'uuid' },
                        fromStatus: { allOf: [{ $ref: '#/components/schemas/BookStatus' }], nullable: true },
                        toStatus: { $ref: '#/components/schemas/BookStatus' },
                        changedAt: { type: 'string', format: 'date-time' },
                    },
                },
                BookUpdateInput: {
                    type: 'object',
                    description: 'All fields optional; only send what you want to change. Setting `rating` requires the book to already be in `read` status.',
                    properties: {
                        title: { type: 'string' },
                        genre: { $ref: '#/components/schemas/BookGenre' },
                        status: { $ref: '#/components/schemas/BookStatus' },
                        rating: { type: 'integer', minimum: 1, maximum: 5 },
                    },
                },
                BookGenre: {
                    type: 'string',
                    enum: ['fiction', 'non_fiction', 'science', 'history', 'biography', 'other'],
                },
                BookStatus: {
                    type: 'string',
                    enum: ['to_read', 'reading', 'read'],
                },
                Error: {
                    type: 'object',
                    properties: {
                        status: { type: 'integer' },
                        message: { type: 'string' },
                    },
                },
            },
        },
    },
    apis: ['./app/**/*.routes.ts'],
};

export const swaggerSpec = swaggerJsdoc(options);
