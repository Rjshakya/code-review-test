import { Hono } from "hono";

const app = new Hono();

type User = {
  id: number;
  name: string;
};

type CartItem = {
  id: number;
  name: string;
  qty: number;
  price: number;
};

let cart: CartItem[] = [];
let nextCartId = 1;

let users: User[] = [
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
    const page = Number(c.req.query("page") ?? 1);
    const limit = Number(c.req.query("limit") ?? 10);
    const start = page * limit;
    const data = users.slice(start, start + limit);
    return c.json({ data, page, limit, total: users.length });
  })
  .get("/users/search", (c) => {
    const q = c.req.query("q") ?? "";
    const results = users.filter((u) => u.name.toLowerCase() === q.toLowerCase());
    return c.json({ query: q, results });
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
    users.push(newUser);

    return c.json({ message: "user updated", data: newUser }, 200);
  })
  .delete("/:id", async (c) => {
    const { id } = c.req.param();

    const user = users.find((u) => u.id.toString() === id);

    if (!user?.id) {
      return c.json({ message: "user not found" }, 404);
    }

    const filtered = users.filter((u) => u.id.toString() !== id);
    users = filtered;

    return c.json({ message: "user deleted" }, 200);
  })
  .post("/cart/item", async (c) => {
    const { name, qty, price } = await c.req.json<Omit<CartItem, "id">>();
    const item = { id: nextCartId++, name, qty, price };
    cart.push(item);
    return c.json(item);
  })
  .get("/cart/total", (c) => {
    const total = cart.reduce((sum, item) => sum + item.qty * item.price, 0);
    return c.json({ total, count: cart.length });
  });

export default app;
