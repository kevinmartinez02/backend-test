import { CustomError, StatusCode } from "@/lib/validationError.ts";
import { logger } from "@/utils/logger.ts";
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

    if(authorMatched) throw new CustomError('this name is used', StatusCode.CONFLICT)

    const authorCreated = await prisma.author.create({
        data:{
            name: name,
            country: country ?? null
        }
    })

    logger.info(`author created: ${authorCreated.id} "${name}"`)
    return authorCreated
}

async function getDetailsAuthor(id:string){
    const authorFound = await prisma.author.findUnique(
        {
            select:{
                id:true,
                name:true,
                country:true,
                books:true,
                 _count:{
                    select:{
                        books:true
                    }
                }
            },
            where:{
                id:id
            },
            
        }
    )
    if(!authorFound) throw new CustomError("not Found", StatusCode.NOT_FOUND)

    return {...authorFound,countBooks: authorFound._count.books}
}

export {
    getAllAuthors,
    createAuthor,
    getDetailsAuthor
}