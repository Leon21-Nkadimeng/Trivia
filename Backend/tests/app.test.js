const request = require("supertest");
const app = require("../src/app");

describe("Application integration tests", () => {

  describe("GET /", () => {
    test("should return HTTP 200 and a welcome message", async () => {
      // simulate an http get request against the express application.
      const response = await request(app).get("/");
      // check the http status code
      expect(response.statusCode).toBe(200);
      // check the response body.
      expect(response.body).toEqual({
        message: "Hello World"
      });
    });
  });

});
