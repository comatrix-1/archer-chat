import {
  type RouteConfig,
  route,
  index,
  prefix,
} from "@react-router/dev/routes";

export default [
  index("./routes/home.tsx"),
  route("login", "./routes/login.tsx"),
  route("register", "./routes/register.tsx"),
  route("resume", "./routes/resume.tsx"),
  route("charts", "./routes/charts.tsx"),
  ...prefix("chats", [
    index("./routes/chats/index.tsx"),
    route(":chatId", "./routes/chats/[chatId].tsx"),
  ]),
  route("resume-generator", "./routes/resume-generator.tsx"),
  route("resume-list", "./routes/resume-list.tsx"),
  route("resume-generator-detail", "./routes/resume-generator-detail.tsx"),
] satisfies RouteConfig;
