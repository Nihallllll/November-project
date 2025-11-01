import express from "express";
import router from "./routes/flow.routes";
const app = express();

app.use(express.json());
app.get("/health", (req, res) => {
  res.json({ status : "ok"});
});

app.use('/api/v1',router)

export const App = app;
