import { describe, expect, it } from "vitest";
import { mapErrorToStatus } from "@/lib/http/errors";

describe("mapErrorToStatus", () => {
  it("retourne une erreur serveur generique pour une valeur non Error", () => {
    expect(mapErrorToStatus("boom")).toEqual({ status: 500, message: "Erreur serveur" });
  });

  it("detecte un objet ApiError-like", () => {
    expect(mapErrorToStatus({ statusCode: 418, message: "teapot" })).toEqual({
      status: 418,
      message: "teapot",
    });
  });
});

