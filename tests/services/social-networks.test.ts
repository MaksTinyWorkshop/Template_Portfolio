import { describe, expect, it } from "vitest";
import {
  normalizeSocialNetworkKey,
  SOCIAL_NETWORK_KEYS,
  SOCIAL_NETWORK_OPTIONS,
} from "@/lib/modules/person/domain/social-networks";

describe("social-networks domain helpers", () => {
  it("normalise les alias Twitter vers x", () => {
    expect(normalizeSocialNetworkKey("twitter")).toBe("x");
    expect(normalizeSocialNetworkKey("x-twitter")).toBe("x");
  });

  it("normalise espaces/casse et reconnait les cles valides", () => {
    expect(normalizeSocialNetworkKey(" LinkedIn ")).toBe("linkedin");
    expect(normalizeSocialNetworkKey("you tube")).toBeNull();
    expect(normalizeSocialNetworkKey("YouTube")).toBe("youtube");
  });

  it("retourne null pour les reseaux inconnus", () => {
    expect(normalizeSocialNetworkKey("myspace")).toBeNull();
    expect(normalizeSocialNetworkKey("")).toBeNull();
  });

  it("expose un set coherent avec les options", () => {
    expect(SOCIAL_NETWORK_OPTIONS.length).toBeGreaterThan(5);
    expect(SOCIAL_NETWORK_KEYS.has("github")).toBe(true);
    expect(SOCIAL_NETWORK_KEYS.has("linkedin")).toBe(true);
    expect(SOCIAL_NETWORK_KEYS.has("x")).toBe(true);
  });
});
