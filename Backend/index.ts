import express from "express";
import { json } from "zod";
import router from "./routes/flow.routes";

const PORT = 3000;
const app = express();

app.use(json);

app.post('/api/flows',router );
app.get('/api/flows:id', );
app.post('/api/flows:id/run', );
app.delete('/api/flow:id',);
app.get('api/runs/:id',);
app.get('/health',);


app.listen(3000,()=>{
    `Server is Listening at PORT : ${PORT}`
})