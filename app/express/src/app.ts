import express, { NextFunction, Request, Response, Router } from "express";
import cors from "cors";
import { userRouter } from "./routers/user";

const app = express();

app.use(
  cors({
    origin: "*",
    methods: ["*"],
    allowedHeaders: ["*"], // Allowed headers
    credentials: true, // Allow cookies/auth headers
  })
);
app.use(express.json());

const addRouters = (routers: Record<string, Router>) => {
  const routerEntries = Object.entries(routers);
  routerEntries.forEach(([route, router]) => {
    app.use(route, router);
  });
};

// this route is intended to be removed or changed for your application
app.get("/", (req: Request, res: Response<any>) => {
  res.send("BOILERPLATE - MINIMAL WEB APP");
});

app.get("/health", (req: Request, res: Response<any>) => {
  res.send("HEALTHY");
});

app.use("/user", userRouter);
// addRouters({
//   "/user": userRouter,
// });

//app.use(process.env.API_ROOT_PATH ?? '/', routes);

export { app };
