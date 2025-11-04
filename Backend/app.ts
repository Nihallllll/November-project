import express from "express";
import router from "./routes/flow.routes";
import credentailRouter from "./routes/credential.routes";
const app = express();

app.use(express.json());
app.get("/health", (req, res) => {
  res.json({ status : "ok"});
});

app.use('/api/v1',router);
app.use('/api/v1', credentailRouter);

export const App = app;
