import {
  type RouteConfig,
  index,
  layout,
  prefix,
  route,
} from "@react-router/dev/routes";

export default [
  route("login", "./routes/login.tsx"),
  route("register", "./routes/register.tsx"),

  layout("./routes/protected-layout.tsx", [
    index("./routes/home.tsx"),

    ...prefix("resume", [
      index("./routes/resume/index.tsx"),
      route("generator", "./routes/resume/generator.tsx"),
      route("builder", "./routes/resume/builder.tsx"),
    ]),

    ...prefix("job-tracker", [
      index("./routes/job-tracker/index.tsx"),
      route("add", "./routes/job-tracker/add.tsx"),
      route(":id", "./routes/job-tracker/detail.tsx"),
    ])
  ]),

  route("*", "./routes/not-found.tsx"),
] satisfies RouteConfig;
