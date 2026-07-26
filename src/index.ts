import { Hono } from "hono";

const app = new Hono();

type User = {
  id: number;
  name: string;
};

const users: User[] = [
  {
    id: 1,
    name: "raj",
  },
  {
    id: 2,
    name: "sham",
  },
  {
    id: 3,
    name: "ben",
  },
];

app
  .get("/", (c) => {
    return c.text("Hello Hono!");
  })
  .get("/users", (c) => {
    return c.json(users);
  })
  .get("/user/:id", (c) => {
    const { id } = c.req.param();
    return c.json(users.find((u) => u.id.toString() === id));
  })
  .post("/user", async (c) => {
    const user = await c.req.json<User>();
    users.push(user);
    return c.json(user);
  })
  .put("/user/:id", async (c) => {
    const { id } = c.req.param();
    const body = await c.req.json<{ name: string }>();
    const existing = users.find((u) => u.id.toString() == id);

    if (!existing) return c.json({ message: "user didn't exit" }, 404);

    const newUser = { ...existing, name: body.name };
    // users.push(newUser);

    return c.json({ message: "user updated", data: newUser }, 200);
  });

export default app;
