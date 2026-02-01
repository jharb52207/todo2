import { describe, it, expect, vi, afterEach } from "vitest";
import {
  getEffectiveHorizon,
  isCompletedBeforeToday,
  isOverdueCheck,
} from "./TodoCard";

// Helper to mock "now" by overriding Date
function mockDate(dateStr: string) {
  const fixed = new Date(dateStr);
  vi.useFakeTimers();
  vi.setSystemTime(fixed);
}

afterEach(() => {
  vi.useRealTimers();
});

describe("getEffectiveHorizon", () => {
  it("returns Today as-is regardless of updatedAt", () => {
    mockDate("2026-02-01T12:00:00");
    expect(getEffectiveHorizon(0, "2026-01-30T10:00:00Z")).toBe(0); // Today
  });

  it("returns Someday as-is regardless of updatedAt", () => {
    mockDate("2026-02-01T12:00:00");
    expect(getEffectiveHorizon(2, "2026-01-20T10:00:00Z")).toBe(2); // Someday
  });

  it("keeps Tomorrow when updatedAt is today", () => {
    mockDate("2026-02-01T12:00:00");
    expect(getEffectiveHorizon(1, "2026-02-01T08:00:00Z")).toBe(1); // Tomorrow
  });

  it("promotes Tomorrow to Today when updatedAt is yesterday", () => {
    mockDate("2026-02-01T12:00:00");
    expect(getEffectiveHorizon(1, "2026-01-31T20:00:00Z")).toBe(0); // Today
  });

  it("promotes Tomorrow to Today when updatedAt is days ago", () => {
    mockDate("2026-02-01T12:00:00");
    expect(getEffectiveHorizon(1, "2026-01-28T10:00:00Z")).toBe(0); // Today
  });

  it("returns timeHorizon as-is when updatedAt is missing", () => {
    mockDate("2026-02-01T12:00:00");
    expect(getEffectiveHorizon(1, undefined)).toBe(1); // Tomorrow
  });
});

describe("isCompletedBeforeToday", () => {
  it("returns false when not completed", () => {
    mockDate("2026-02-01T12:00:00");
    expect(isCompletedBeforeToday(false, "2026-01-30T10:00:00Z")).toBe(false);
  });

  it("returns false when completed today", () => {
    mockDate("2026-02-01T12:00:00");
    expect(isCompletedBeforeToday(true, "2026-02-01T08:00:00Z")).toBe(false);
  });

  it("returns true when completed yesterday", () => {
    mockDate("2026-02-01T12:00:00");
    expect(isCompletedBeforeToday(true, "2026-01-31T23:00:00Z")).toBe(true);
  });

  it("returns false when updatedAt is missing", () => {
    expect(isCompletedBeforeToday(true, undefined)).toBe(false);
  });
});

describe("isOverdueCheck", () => {
  it("returns false for completed tasks", () => {
    mockDate("2026-02-01T12:00:00");
    expect(isOverdueCheck(0, true, "2026-01-30T10:00:00Z", "2026-01-30T10:00:00Z")).toBe(false);
  });

  it("returns false for Today task created today", () => {
    mockDate("2026-02-01T12:00:00");
    expect(isOverdueCheck(0, false, "2026-02-01T08:00:00Z", "2026-02-01T08:00:00Z")).toBe(false);
  });

  it("returns true for Today task created yesterday", () => {
    mockDate("2026-02-01T12:00:00");
    expect(isOverdueCheck(0, false, "2026-01-31T10:00:00Z", "2026-01-31T10:00:00Z")).toBe(true);
  });

  it("returns false for Tomorrow task (not yet promoted)", () => {
    mockDate("2026-02-01T12:00:00");
    expect(isOverdueCheck(1, false, "2026-02-01T08:00:00Z", "2026-02-01T08:00:00Z")).toBe(false);
  });

  it("returns true for promoted Tomorrow task (old, now effectively Today)", () => {
    mockDate("2026-02-01T12:00:00");
    // Set to Tomorrow yesterday, promotes to Today, created yesterday = overdue
    expect(isOverdueCheck(1, false, "2026-01-31T10:00:00Z", "2026-01-31T10:00:00Z")).toBe(true);
  });

  it("returns false for Someday tasks regardless of age", () => {
    mockDate("2026-02-01T12:00:00");
    expect(isOverdueCheck(2, false, "2026-01-01T10:00:00Z", "2026-01-01T10:00:00Z")).toBe(false);
  });

  it("returns false when createdAt is missing", () => {
    mockDate("2026-02-01T12:00:00");
    expect(isOverdueCheck(0, false, undefined, "2026-01-31T10:00:00Z")).toBe(false);
  });

  it("handles Today→Tomorrow bounce: moved to Tomorrow today, not overdue", () => {
    mockDate("2026-02-01T12:00:00");
    // Task created yesterday (would be overdue if Today), moved to Tomorrow today
    // updatedAt is today so effective horizon = Tomorrow, not overdue
    expect(isOverdueCheck(1, false, "2026-01-31T10:00:00Z", "2026-02-01T09:00:00Z")).toBe(false);
  });
});
