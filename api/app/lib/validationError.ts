
import {type Response,type Request, type NextFunction} from 'express'
export class CustomError extends Error{
     statusCode: number;
    constructor(message:string,statusCode:number){
        super(message)
        this.statusCode = statusCode;
    }
}
export function globalMiddlewareError(err: Error,_req:Request,res:Response,_next:NextFunction){
    if (err instanceof CustomError) {
        return res.status(err.statusCode).json({
          status: err.statusCode,
          message: err.message,
        });
      }

      console.error(err)
      return res.status(StatusCode.INTERNAL_SERVER_ERROR).json({
        status: StatusCode.INTERNAL_SERVER_ERROR,
        message: 'Something went wrong on the server',
      });
    
}

export const StatusCode = {
    OK : 200,
    BAD_REQUEST : 400,
    NOT_FOUND : 404,
    CONFLICT : 409,
    UNPROCESSABLE_ENTITY : 422,
    INTERNAL_SERVER_ERROR : 500,
    CREATED: 201


} as const