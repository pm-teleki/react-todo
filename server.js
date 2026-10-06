import express from "express";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import process from "node:process";
import { fileURLToPath } from "node:url";
import { join } from "node:path";

const dataDirectory = fileURLToPath(new URL("./data/", import.meta.url));
const todosFile = join(dataDirectory, "todos.json");
const port = Number(process.env.PORT) || 3001;
let writeQueue = Promise.resolve();
const app = express();

app.use(express.json({ limit: "1mb" }));

app.get("/api/todos", async (_request, response) => {
  try {
    const todos = JSON.parse(await readFile(todosFile, "utf8"));
    response.json(todos);
  } catch (error) {
    if (error.code === "ENOENT") {
      response.json([]);
    } else {
      console.error("Error reading todos:", error);
      response.status(500).json({ error: "Unable to read todos" });
    }
  }
});

app.put("/api/todos", async (request, response) => {
  if (!Array.isArray(request.body)) {
    response.status(400).json({ error: "Expected an array of todos" });
    return;
  }

  try {
    writeQueue = writeQueue.catch(() => {}).then(async () => {
      await mkdir(dataDirectory, { recursive: true });
      await writeFile(todosFile, JSON.stringify(request.body, null, 2));
    });
    await writeQueue;
    response.json(request.body);
  } catch (error) {
    console.error("Error saving todos:", error);
    response.status(500).json({ error: "Unable to save todos" });
  }
});

app.use((_request, response) => {
  response.status(404).json({ error: "Not found" });
});

app.use((error, _request, response, next) => {
  if (response.headersSent) {
    next(error);
    return;
  }

  const statusCode = error.status || 500;
  response.status(statusCode).json({
    error: statusCode === 413 ? "Request body too large" : "Invalid request body",
  });
});

app.listen(port, () => {
  console.log(`Todo API listening on http://localhost:${port}`);
});