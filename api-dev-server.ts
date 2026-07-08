import http from "http";
import { URL } from "url";
import leadsCountHandler from "./api/leads-count";
import submitLeadHandler from "./api/submit-lead";

const PORT = 3001;

const server = http.createServer((req, res) => {
  // CORS Configuration
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    res.writeHead(200);
    res.end();
    return;
  }

  const url = new URL(req.url || "", `http://${req.headers.host}`);
  
  // Custom mock response object satisfying Vercel serverless signature
  const mockedRes = Object.assign(res, {
    status(code: number) {
      res.statusCode = code;
      return this;
    },
    json(body: any) {
      res.setHeader("Content-Type", "application/json");
      res.end(JSON.stringify(body));
      return this;
    },
    end() {
      res.end();
      return this;
    }
  });

  // Read raw request buffer
  let buffer = "";
  req.on("data", (chunk) => {
    buffer += chunk;
  });

  req.on("end", async () => {
    let parsedBody: any = {};
    if (buffer) {
      try {
        parsedBody = JSON.parse(buffer);
      } catch {
        // Non-JSON format parsed as empty body
      }
    }

    const mockedReq = Object.assign(req, {
      body: parsedBody,
      query: Object.fromEntries(url.searchParams.entries())
    });

    try {
      if (url.pathname === "/api/leads-count") {
        await leadsCountHandler(mockedReq, mockedRes);
      } else if (url.pathname === "/api/submit-lead") {
        await submitLeadHandler(mockedReq, mockedRes);
      } else {
        res.writeHead(404, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: "Route Not Found" }));
      }
    } catch (err: any) {
      console.error("[API Server Error] Execution failed:", err);
      res.writeHead(500, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: "Internal Server Error", details: err.message }));
    }
  });
});

server.listen(PORT, () => {
  console.log(`[API DEV SERVER] Mock Vercel serverless listening on http://localhost:${PORT}`);
});
