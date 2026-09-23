const path = require("node:path");
const express = require("express");
const { identifyHash, identifyBatch } = require("./src/hashIdentifier");

const app = express();
const port = Number(process.env.PORT) || 3000;

app.use(express.json({ limit: "16kb" }));
app.use(express.static(path.join(__dirname, "public")));

app.post("/api/identify", (request, response) => {
  if (typeof request.body?.hash !== "string") {
    return response.status(400).json({ error: "The request body must include a string field named hash." });
  }

  return response.json(identifyHash(request.body.hash));
});

app.post("/api/identify/batch", (request, response) => {
  const hashes = request.body?.hashes;
  if (!Array.isArray(hashes) || hashes.some((hash) => typeof hash !== "string")) {
    return response.status(400).json({ error: "The request body must include a hashes array containing only strings." });
  }
  if (hashes.length > 100) {
    return response.status(400).json({ error: "A batch can contain at most 100 hashes." });
  }

  return response.json({ results: identifyBatch(hashes) });
});

app.use((error, request, response, next) => {
  if (error instanceof SyntaxError && "body" in error) {
    return response.status(400).json({ error: "Request body must contain valid JSON." });
  }
  return next(error);
});

if (require.main === module) {
  app.listen(port, () => console.log(`Hash Identifier running at http://localhost:${port}`));
}

module.exports = app;