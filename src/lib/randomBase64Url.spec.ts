import { describe, expect, it } from "vitest";

import { getRandomBase64Url } from "./randomBase64Url";

describe("randomBase64Url", () => {
  it("should get random base64url", () => {
    expect(getRandomBase64Url()).toBeTypeOf("string");
    expect(getRandomBase64Url()).length(4);
    expect(getRandomBase64Url(5)).length(5);
  });
});
