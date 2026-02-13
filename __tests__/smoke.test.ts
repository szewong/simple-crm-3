import { describe, it, expect } from "vitest";

describe("Smoke tests", () => {
  it("can import utility functions", async () => {
    const { cn } = await import("@/lib/utils");
    expect(cn("foo", "bar")).toBe("foo bar");
  });

  it("can import format utilities", async () => {
    const format = await import("@/lib/utils/format");
    expect(format).toBeDefined();
  });

  it("can import validation schemas", async () => {
    const { contactSchema } = await import("@/lib/validations/contact");
    const { companySchema } = await import("@/lib/validations/company");
    const { dealSchema } = await import("@/lib/validations/deal");
    const { activitySchema } = await import("@/lib/validations/activity");

    expect(contactSchema).toBeDefined();
    expect(companySchema).toBeDefined();
    expect(dealSchema).toBeDefined();
    expect(activitySchema).toBeDefined();
  });

  it("can import type definitions", async () => {
    const types = await import("@/lib/types");
    expect(types).toBeDefined();
  });

  it("validates contact schema correctly", async () => {
    const { contactSchema } = await import("@/lib/validations/contact");

    const valid = contactSchema.safeParse({
      first_name: "John",
      last_name: "Doe",
      email: "john@example.com",
    });
    expect(valid.success).toBe(true);

    const invalid = contactSchema.safeParse({
      first_name: "",
      last_name: "",
    });
    expect(invalid.success).toBe(false);
  });

  it("validates activity schema correctly", async () => {
    const { activitySchema } = await import("@/lib/validations/activity");

    const valid = activitySchema.safeParse({
      type: "call",
      title: "Follow up call",
      is_completed: false,
    });
    expect(valid.success).toBe(true);

    const invalid = activitySchema.safeParse({
      type: "invalid_type",
      title: "",
    });
    expect(invalid.success).toBe(false);
  });
});
