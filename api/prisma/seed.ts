import { prisma } from "./prisma.client.ts";
import { Book_Genre, Book_Status } from "./generated/enums.ts";

interface SeedBook {
  title: string;
  genre: Book_Genre;
  status: Book_Status;
  rating?: number;
  tags: Array<string>;
  deleted?: boolean;
}

const library: Array<{
  name: string;
  country?: string;
  books: Array<SeedBook>;
}> = [
  {
    name: "Gabriel García Márquez",
    country: "Colombia",
    books: [
      {
        title: "Cien años de soledad",
        genre: Book_Genre.fiction,
        status: Book_Status.read,
        rating: 5,
        tags: ["classic", "realismo magico"],
      },
      {
        title: "El amor en los tiempos del cólera",
        genre: Book_Genre.fiction,
        status: Book_Status.reading,
        tags: ["classic"],
      },
    ],
  },
  {
    name: "J.R.R. Tolkien",
    country: "United Kingdom",
    books: [
      {
        title: "El Hobbit",
        genre: Book_Genre.fiction,
        status: Book_Status.read,
        rating: 4,
        tags: ["fantasy", "adventure", "classic"],
      },
      {
        title: "El Señor de los Anillos",
        genre: Book_Genre.fiction,
        status: Book_Status.to_read,
        tags: ["fantasy", "adventure"],
      },
      {
        title: "El Silmarillion",
        genre: Book_Genre.fiction,
        status: Book_Status.read,
        rating: 3,
        tags: ["fantasy"],
      },
    ],
  },
  {
    name: "Yuval Noah Harari",
    country: "Israel",
    books: [
      {
        title: "Sapiens",
        genre: Book_Genre.history,
        status: Book_Status.read,
        rating: 5,
        tags: ["history", "ensayo"],
      },
      {
        title: "Homo Deus",
        genre: Book_Genre.science,
        status: Book_Status.reading,
        tags: ["ensayo", "futuro"],
      },
    ],
  },
  {
    name: "Mary Shelley",
    country: "United Kingdom",
    books: [
      {
        title: "Frankenstein",
        genre: Book_Genre.fiction,
        status: Book_Status.read,
        rating: 4,
        tags: ["classic", "gothic"],
      },
    ],
  },
  {
    name: "Walter Isaacson",
    country: "United States",
    books: [
      {
        title: "Steve Jobs",
        genre: Book_Genre.biography,
        status: Book_Status.to_read,
        tags: ["biografia", "tecnologia"],
      },
      {
        title: "Einstein: His Life and Universe",
        genre: Book_Genre.biography,
        status: Book_Status.read,
        rating: 4,
        tags: ["biografia", "ciencia"],
      },
      {
        title: "Benjamin Franklin: An American Life",
        genre: Book_Genre.biography,
        status: Book_Status.to_read,
        tags: ["biografia"],
        deleted: true,
      },
    ],
  },
];

function daysAgo(days: number) {
  return new Date(Date.now() - days * 24 * 60 * 60 * 1000);
}

function buildHistory(status: Book_Status, startDaysAgo: number) {
  const history: Array<{
    fromStatus: Book_Status | null;
    toStatus: Book_Status;
    changedAt: Date;
  }> = [
    {
      fromStatus: null,
      toStatus: Book_Status.to_read,
      changedAt: daysAgo(startDaysAgo),
    },
  ];
  if (status === Book_Status.reading || status === Book_Status.read) {
    history.push({
      fromStatus: Book_Status.to_read,
      toStatus: Book_Status.reading,
      changedAt: daysAgo(Math.max(startDaysAgo - 7, 1)),
    });
  }
  if (status === Book_Status.read) {
    history.push({
      fromStatus: Book_Status.reading,
      toStatus: Book_Status.read,
      changedAt: daysAgo(Math.max(startDaysAgo - 14, 0)),
    });
  }
  return history;
}

async function main() {
  console.log("🌱 seeding database...");

  await prisma.statusHistory.deleteMany();
  await prisma.book.deleteMany();
  await prisma.tag.deleteMany();
  await prisma.author.deleteMany();

  let startDaysAgo = 60;
  for (const authorData of library) {
    const author = await prisma.author.create({
      data: {
        name: authorData.name,
        country: authorData.country ?? null,
      },
    });

    for (const book of authorData.books) {
      await prisma.book.create({
        data: {
          title: book.title,
          genre: book.genre,
          status: book.status,
          rating: book.rating ?? null,
          authorId: author.id,
          deletedAt: book.deleted ? daysAgo(1) : null,
          tags: {
            connectOrCreate: book.tags.map((name) => ({
              where: { name },
              create: { name },
            })),
          },
          statusHistory: {
            create: buildHistory(book.status, startDaysAgo),
          },
        },
      });
      startDaysAgo -= 4;
    }
  }

  const [authors, books, tags, history] = await Promise.all([
    prisma.author.count(),
    prisma.book.count(),
    prisma.tag.count(),
    prisma.statusHistory.count(),
  ]);
  console.log(
    `✅ seed done: ${authors} authors, ${books} books (1 soft-deleted), ${tags} tags, ${history} history entries`,
  );
}

main()
  .catch((e) => {
    console.error("❌ seed failed:", e);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
