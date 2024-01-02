import {Router, Request, Response} from "express"
export const  router = Router();
import { handleDatabaseTransaction } from "../queries";
import { resourceLimits } from "worker_threads";


router.get("/", async(req,res)=>{
    try{
        const result = await handleDatabaseTransaction( async (client) =>{ 
            return await client.query("select * from timesheetnotification")
        })
        res.status(200).json({data:result.rows});
    }catch(error){
        res.status(400).json({error:error});
    }
})

router.get("/from/:from", async (req,res)=>{
    // get all the queries where from that date until now
    const from = new Date(req.params.from);
    const to = new Date();

    try{
        const query = {
            text: `
                SELECT timesheet.userid,notif.title, notif.content, notif.date
                FROM timesheet, timesheetnotification notif
                WHERE timesheet.userid = notif.fromuserid
                and notif.date >= $1 AND notif.date <= $2`,
            values: [from, to],
        };
        const result = await handleDatabaseTransaction( async (client) =>{
            return await client.query(query)
        })
        
        res.status(200).json({data:result.rows})
    }catch(error){
        console.log(error)
        res.status(400).json({error:error})
    }  
})

