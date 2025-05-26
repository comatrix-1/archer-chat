import {
  type RouteConfig,
  route,
  index,
  layout,
  prefix,
} from "@react-router/dev/routes";

export default [
  route("login", "./routes/login.tsx"),
  route("register", "./routes/register.tsx"),
  
  layout("./routes/protected-layout.tsx", [
    index("./routes/home.tsx"),
    
    ...prefix("resume", [
      index("./routes/resume/index.tsx"),
      route("generator", "./routes/resume/generator.tsx"),
      route(":id", "./routes/resume/detail.tsx"),
    ]),

    route("charts", "./routes/charts.tsx"),
  ]),
  
  route("*", "./routes/not-found.tsx"),
] satisfies RouteConfig;
