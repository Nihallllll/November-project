import express from "express";
import { json } from "zod";

const PORT = 3000;
const app = express();

app.use(json);

app.post('/api/flows', );
app.get('/api/flows:id', );
app.post('/api/flows:id/run', );
app.delete('/api/flow:id',);
app.get('api/runs/:id',);
app.get('/health',);


app.listen(()=>{
    `Server is Listening at PORT : ${PORT}`
})