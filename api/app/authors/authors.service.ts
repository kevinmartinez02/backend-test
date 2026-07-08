import { prisma}  from "@client/prisma"

async function getAllAuthors(){
    const allAuthors = await prisma.author.findMany();
    return allAuthors;
}
async function createAuthor(name:string,country?:string){

    const authorMatched = await prisma.author.findFirst({
        select:{
            name: true,
            country: true
        },
        where: {
            name : name
        }
    })

    if(authorMatched) return{
        succesfully: false,
        message: "this name is used",
        data: null
    }

    const authorCreated = await prisma.author.create({
        data:{
            name: name,
            country: country ?? null
        }
    })

    return {
        succesfully: true,
        message: 'author created',
        data: authorCreated
    };
}

export {
    getAllAuthors,
    createAuthor
}