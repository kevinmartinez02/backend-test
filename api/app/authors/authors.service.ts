import { prisma}  from "@client/prisma"

async function getAllAuthors(){
    const allAuthors = await prisma.author.findMany();
    return allAuthors;
}
async function createAuthor(name:string,country?:string){

    const authorCreated = await prisma.author.create({
        data:{
            name: name,
            country: country ?? null
        }
    })

    return authorCreated;
}

export {
    getAllAuthors,
    createAuthor
}