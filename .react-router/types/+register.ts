import "react-router";

declare module "react-router" {
  interface Register {
    params: Params;
  }
}

type Params = {
  "/": {};
  "/login": {};
  "/register": {};
  "/resume": {};
  "/resume/generator": {};
  "/resume/:id": {
    "id": string;
  };
  "/*": {
    "*": string;
  };
};