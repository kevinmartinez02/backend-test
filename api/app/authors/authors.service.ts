import { prisma}  from "@client/prisma"

async function getAllAuthors(page=1,pageSize=10,name?:string){
    const where = name ? { name: { contains: name, mode: 'insensitive' as const } } : {}

    const allAuthors = await prisma.author.findMany({
        where,
        take: pageSize,
        skip: (page - 1) * pageSize
    });
    const totalRecords = await prisma.author.count({ where })
    const totalPages = Math.ceil(totalRecords / pageSize)

    return {
        data: allAuthors,
        page: page,
        totalRecords: totalRecords,
        totalPages: totalPages,
    }
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