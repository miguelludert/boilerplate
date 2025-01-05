import express, { NextFunction, Request, Response, Router } from "express";
import { userRouter } from "./routers/user";
import { authRouter } from "./routers/auth";
import { validateJwt } from "./utils/auth";
import cors from "cors";
import { AppRequest } from "./types";
import { sendAvatarToResponse } from "./services/user";

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req: Request, res: Response<any>) => {
  res.send("OK");
});
app.get("/health", (req: Request, res: Response<any>) => {
  res.send("HEALTHY");
});

app.use("/auth", authRouter);

// app.use((req: Request, res: Response, next: NextFunction) => {
//   validateJwt(req, res, next);
// });

app.use("/user", userRouter);

//app.use(process.env.API_ROOT_PATH ?? '/', routes);

export { app };
