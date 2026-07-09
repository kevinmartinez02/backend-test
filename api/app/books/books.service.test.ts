import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import { prisma } from '@client/prisma'
import { Book_Genre, Book_Status } from '@generated/enums.ts'
import { createBook, updateBook, listAllBooks, deleteBook } from './books.service.ts'


const stamp = `test-${Date.now()}`
let authorId: string
const createdBookIds: Array<string> = []

async function newBook(overrides: { title?: string; genre?: Book_Genre; tags?: Array<string> } = {}) {
    const book = await createBook({
        authorId,
        title: overrides.title ?? `Libro ${stamp}`,
        genre: overrides.genre ?? Book_Genre.fiction,
        tags: overrides.tags ?? [],
    })
    createdBookIds.push(book.id)
    return book
}

beforeAll(async () => {
    const author = await prisma.author.create({ data: { name: `Autor ${stamp}` } })
    authorId = author.id
})

afterAll(async () => {
    // limpiar en orden inverso a las FKs todo lo que crearon los tests
    await prisma.statusHistory.deleteMany({ where: { bookId: { in: createdBookIds } } })
    await prisma.book.deleteMany({ where: { id: { in: createdBookIds } } })
    await prisma.tag.deleteMany({ where: { name: { contains: stamp } } })
    await prisma.author.delete({ where: { id: authorId } })
    await prisma.$disconnect()
})

describe('status history', () => {
    it('crear un libro genera la entrada inicial del historial (null -> to_read)', async () => {
        const book = await newBook()

        const history = await prisma.statusHistory.findMany({ where: { bookId: book.id } })
        expect(history).toHaveLength(1)
        expect(history[0]?.fromStatus).toBeNull()
        expect(history[0]?.toStatus).toBe(Book_Status.to_read)
    })

    it('cambiar el status crea una nueva entrada con from/to correctos', async () => {
        const book = await newBook()

        await updateBook({ bookId: book.id, status: Book_Status.reading })

        const history = await prisma.statusHistory.findMany({
            where: { bookId: book.id },
            orderBy: { changedAt: 'asc' },
        })
        expect(history).toHaveLength(2)
        expect(history[1]?.fromStatus).toBe(Book_Status.to_read)
        expect(history[1]?.toStatus).toBe(Book_Status.reading)
    })
})

describe('tags', () => {
    it('no se duplican: se reutilizan aunque cambien mayúsculas y espacios', async () => {
        const tagName = `etiqueta-${stamp}`
        const first = await newBook({ tags: [tagName] })
        const second = await newBook({ tags: [`  ${tagName.toUpperCase()}  `] })

        expect(second.tags[0]?.id).toBe(first.tags[0]?.id)
        const count = await prisma.tag.count({ where: { name: tagName } })
        expect(count).toBe(1)
    })
})

describe('rating', () => {
    it('rechaza con 409 poner rating a un libro que no está en read', async () => {
        const book = await newBook()

        await expect(updateBook({ bookId: book.id, rating: 5 }))
            .rejects.toMatchObject({ statusCode: 409 })
    })

    it('acepta status read y rating juntos en el mismo request', async () => {
        const book = await newBook()

        const updated = await updateBook({ bookId: book.id, status: Book_Status.read, rating: 4 })
        expect(updated.status).toBe(Book_Status.read)
        expect(updated.rating).toBe(4)
    })
})

describe('listado', () => {
    it('combina filtros y excluye los libros soft-deleted', async () => {
        const match = await newBook({ title: `Match ${stamp}`, genre: Book_Genre.science })
        await updateBook({ bookId: match.id, status: Book_Status.read, rating: 5 })
        await newBook({ title: `NoMatch ${stamp}`, genre: Book_Genre.science })
        const deleted = await newBook({ title: `Deleted ${stamp}`, genre: Book_Genre.science })
        await updateBook({ bookId: deleted.id, status: Book_Status.read, rating: 5 })
        await deleteBook(deleted.id)

        const result = await listAllBooks({
            authorId,
            genre: Book_Genre.science,
            status: Book_Status.read,
            minRating: 4,
        })

        expect(result.data).toHaveLength(1)
        expect(result.data[0]?.id).toBe(match.id)
        expect(result.total).toBe(1)
    })
})
