# 📚 Biblioteca Personal — API REST

API para gestionar una biblioteca personal: autores, libros, tags, historial de lectura y estadísticas.

**Stack:** Node.js · TypeScript (strict) · Express 5 · PostgreSQL · Prisma 7 · Zod 4

## Requisitos previos

**Opción A — con Docker (recomendada):**

- Docker instalado y corriendo (Docker Desktop o Docker Engine 24+)
- Docker Compose v2 instalado (incluido en Docker Desktop; verificá con `docker compose version`)

**Opción B — desarrollo local sin Docker:**

- Node.js 22 o superior instalado (verificá con `node -v`)
- pnpm 11 o superior instalado (`corepack enable` lo activa si tenés Node)
- PostgreSQL 16 instalado y corriendo — o usá el Postgres local de Prisma con `npx prisma dev` (no requiere instalar nada más)

## 🚀 Levantar el proyecto (Docker)

```bash
# 1. copiar las variables de entorno y completar las credenciales de la base
cp .env.example .env

# 2. levantar todo (Postgres + API; las migraciones corren solas al arrancar)
docker compose up 

# 3. (opcional) cargar datos de ejemplo
docker compose exec api npx prisma db seed
```

La API queda disponible en `http://localhost:<PORT>` (el puerto que definiste en tu `.env`) y la documentación Swagger en `http://localhost:<PORT>/docs`. No hace falta ningún paso adicional: las migraciones y la generación del cliente de Prisma corren automáticamente al arrancar el contenedor.

Ejemplo de `.env`:

```env
PORT=8000
NODE_ENV=development
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres
POSTGRES_DB=library
DATABASE_URL=postgresql://${POSTGRES_USER}:${POSTGRES_PASSWORD}@db:5432/${POSTGRES_DB}
```

## 💻 Desarrollo local (sin Docker)

```bash
cd api
pnpm install            # instala las dependencias
npx prisma dev          # levanta el Postgres local de Prisma (dejalo corriendo en esta terminal)
```

Creá el archivo `api/.env` con la `DATABASE_URL` que `npx prisma dev` imprime al arrancar (la que empieza con `postgres://...`). Si en cambio usás tu propio PostgreSQL, poné ahí su URL de conexión.

Luego, en otra terminal:

```bash
cd api
npx prisma migrate dev  # aplica migraciones y genera el cliente
npx prisma db seed      # (opcional) carga datos de ejemplo
pnpm dev                # servidor con hot-reload en http://localhost:8000
```

## Endpoints

Documentación completa e interactiva en **`/docs`** (Swagger). Resumen:

| Método | Endpoint | Descripción |
|---|---|---|
| POST | `/authors` | Crear autor |
| GET | `/authors?page=&pageSize=&name=` | Listar autores (paginado, búsqueda por nombre) |
| GET | `/authors/:id` | Detalle del autor + cantidad de libros |
| POST | `/books` | Crear libro (con array de `tags` opcional) |
| GET | `/books` | Listar libros con filtros combinables |
| GET | `/books/:id` | Detalle del libro (autor + tags) |
| PATCH | `/books/:id` | Actualizar libro (status, rating, tags…) |
| DELETE | `/books/:id` | Soft delete |
| GET | `/books/:id/history` | Historial de cambios de status |
| GET | `/stats` | Estadísticas (agregaciones en DB) |

Filtros de `GET /books` (todos combinables): `status`, `genre`, `authorId`, `authorName` (parcial, case-insensitive), `tag`, `minRating`, `page`, `limit` (máx. 100), `sortBy` (`createdAt|rating|title`), `order` (`asc|desc`).

### Ejemplos de request

```bash
# crear autor
curl -X POST localhost:8000/authors -H 'content-type: application/json' \
  -d '{"name":"J.R.R. Tolkien","country":"United Kingdom"}'

# crear libro con tags (se crean o reutilizan, siempre en minúsculas)
curl -X POST localhost:8000/books -H 'content-type: application/json' \
  -d '{"authorId":"<uuid>","title":"El Hobbit","genre":"fiction","tags":["Fantasy","adventure"]}'

# listar con filtros combinados
curl 'localhost:8000/books?status=read&genre=fiction&minRating=4&sortBy=rating&order=desc&page=1&limit=10'

# marcar como leído y calificar (genera entrada en el historial automáticamente)
curl -X PATCH localhost:8000/books/<uuid> -H 'content-type: application/json' \
  -d '{"status":"read","rating":5}'

# historial de status
curl localhost:8000/books/<uuid>/history

# soft delete (deja de aparecer en listados y estadísticas)
curl -X DELETE localhost:8000/books/<uuid>

# estadísticas
curl localhost:8000/stats
```

## Decisiones técnicas

- **Historial de status en transacción:** crear un libro o cambiarle el status escribe el `StatusHistory` dentro de la misma transacción de Prisma — o pasa todo, o no pasa nada.
- **Tags create-or-reuse:** se normalizan (minúsculas + trim) y se resuelven con `connectOrCreate`, así nunca hay duplicados. En el `PATCH`, mandar `tags` **reemplaza** la lista completa (comportamiento predecible: lo que mandás es lo que queda).
- **Soft delete:** `deletedAt` en `Book`; todas las queries de lectura, actualización y estadísticas filtran `deletedAt: null`.
- **`/stats` 100% en la base:** `count`, `groupBy` y `aggregate` de Prisma — no se traen los libros a memoria.
- **Rating solo en libros leídos:** se valida contra el status *final* del request, así `{"status":"read","rating":5}` funciona en una sola llamada (409 si el libro no queda en `read`).
- **Índices según las queries reales:** `Book(authorId)`, `Book(status)`, `Book(genre)` para los filtros, y `StatusHistory(bookId, changedAt)` que cubre el filtro y el orden del historial en un solo índice.
- **Enums con `_`** (`to_read`, `non_fiction`): Prisma no permite `-` en nombres de enum; se mantuvo el mismo valor en la API por consistencia.
- **Validación con Zod** en body, params y query; los tipos de TS se infieren de los schemas (`z.infer`). Errores de validación → 422; JSON malformado → 400; manejo centralizado en un middleware.
- **Logs con winston + morgan:** requests HTTP, eventos de negocio (creaciones, cambios de status, deletes) y errores con stack; sin `console.log` en el código de la app.
- **Rate limiting:** 100 requests/15min por IP con headers estándar (`draft-8`).
