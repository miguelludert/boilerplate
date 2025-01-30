import serverlessExpress from "@codegenie/serverless-express";
// import serverless from "serverless-http";
import { app } from "./app";
console.info("TIMESTAMP", new Date().toISOString());
export const handler = serverlessExpress({ app });
// export const handler = (event: any, context: any) => {
//   console.info("THAT'S MY 2!");
// };

// import serverless from "serverless-http";
// import { app } from "./app";
// console.info("I'M OLD GREEEGGG!!!");

// const server = serverless(app);
// export async function handler(event: any, context: any) {
//   console.info("THAT'S MY serverkess!");
//   context.res = await server(event, context);
// }
