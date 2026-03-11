import jwt from "jsonwebtoken";
import request from "supertest";
import app from "../src/app";
import * as database from "../src/config/database";

const buildAuthHeader = (): string => {
  const token = jwt.sign(
    { id: "11111111-1111-1111-1111-111111111111", email: "test@example.com" },
    process.env.JWT_SECRET as string
  );
  return `Bearer ${token}`;
};

describe("critical backend API behavior", () => {
  it("returns liveness payload on /health", async () => {
    const response = await request(app).get("/health");

    expect(response.status).toBe(200);
    expect(response.body.status).toBe("success");
    expect(response.body.data.service).toBe("receipt-scanner-backend");
  });

  it("returns ready status when database is healthy", async () => {
    jest.spyOn(database, "isDatabaseHealthy").mockResolvedValueOnce(true);

    const response = await request(app).get("/ready");

    expect(response.status).toBe(200);
    expect(response.body.status).toBe("success");
    expect(response.body.data.database).toBe("up");
  });

  it("returns service unavailable when database is unhealthy", async () => {
    jest.spyOn(database, "isDatabaseHealthy").mockResolvedValueOnce(false);

    const response = await request(app).get("/ready");

    expect(response.status).toBe(503);
    expect(response.body.status).toBe("error");
    expect(response.body.code).toBe("SERVICE_UNAVAILABLE");
  });

  it("blocks receipt creation when unauthenticated", async () => {
    const response = await request(app).post("/api/receipts").send({
      amount: 1,
      date: "2025-01-01",
      description: "Unauthenticated test",
    });

    expect(response.status).toBe(401);
    expect(response.body.code).toBe("UNAUTHORIZED");
    expect(response.body.requestId).toBeTruthy();
  });

  it("validates userId path format before fetching receipts", async () => {
    const response = await request(app)
      .get("/api/receipts/not-a-uuid")
      .set("Authorization", buildAuthHeader());

    expect(response.status).toBe(400);
    expect(response.body.code).toBe("VALIDATION_ERROR");
    expect(response.body.message).toBe("Validation failed");
  });

  it("returns standardized 404 error for unknown route", async () => {
    const response = await request(app).get("/route-that-does-not-exist");

    expect(response.status).toBe(404);
    expect(response.body.code).toBe("NOT_FOUND");
    expect(response.body.message).toBe("Route not found");
  });
});
