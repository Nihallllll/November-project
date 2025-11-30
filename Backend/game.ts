import type {Request , Response} from "express"
import type { email, string } from "zod"

declare global{
    namespace Express {
        interface Request{
        userId? : string;
        email? :string;
        }
    }
}

export const authMiddleware = (req :Request, res : Response)=>{
   try{
     const authHeader = req.headers.authorization;
     if(!authHeader){
     return res.status(400).json({
        message: "Authentication failed"
     })
     }
      const parts = authHeader?.split(' ')

      if(parts.length !== 2 || parts[0] !== 'Bearer' ){ 
        return res.status(401).json({
            message :"Authentication failed"
        })
        }

        const token = parts[0]
    }catch{

    }
}
