import express, { NextFunction, Request, Response, Router } from "express";
import cors from "cors";
import { authRouter } from "./routers/auth";
import { validateJwt } from "./utils/auth";
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

const protectedRoutes = (routers: Record<string, Router>) => {
  const routerEntries = Object.entries(routers);
  routerEntries.forEach(([route, router]) => {
    router.use((req: Request, res: Response, next: NextFunction) => {
      validateJwt(req, res, next);
    });
    app.use(route, router);
  });
};

app.get("/", (req: Request, res: Response<any>) => {
  res.send("OK");
});
app.get("/health", (req: Request, res: Response<any>) => {
  res.send("HEALTHY");
});

app.use("/auth", authRouter);

protectedRoutes({
  "/user": userRouter,
});

//app.use(process.env.API_ROOT_PATH ?? '/', routes);

export { app };
