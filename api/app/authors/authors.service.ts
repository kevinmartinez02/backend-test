import { prisma}  from "@client/prisma"

async function getAllAuthors(){
    const allAuthors = await prisma.author.findMany();
    return allAuthors;
}

export {
    getAllAuthors
}