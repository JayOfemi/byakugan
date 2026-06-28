import { describe, it, expect } from "vitest";
import { detect } from "../src/detect.js";
import { findTells } from "../src/tells.js";
import { checkOverlap } from "../src/reuse.js";

describe("detect", () => {
	it("flags input that is too short", () => {
		const result = detect("Only a handful of words here today.");
		expect(result.tooShort).toBe(true);
	});

	it("returns a 0..100 likelihood and no verdict for longer input", () => {
		const text =
			"My neighbor fixes old radios in his garage on weekends. He found a cracked tube last Saturday, swore for a while, then drove across town to buy a replacement. By Sunday the thing hummed back to life, and he grinned like a kid showing off a brand new bike.";
		const result = detect(text);
		expect(result.tooShort).toBe(false);
		expect(result.likelihood).toBeGreaterThanOrEqual(0);
		expect(result.likelihood).toBeLessThanOrEqual(100);
		expect(["human", "mixed", "ai"]).toContain(result.band);
		expect(result.signals.length).toBe(4);
	});
});

describe("findTells", () => {
	it("locates stock phrasing, a long dash, and a formulaic opener", () => {
		const emDash = String.fromCharCode(0x2014);
		const text = `Let us delve into a rich tapestry of ideas ${emDash} truly. Moreover, it works.`;
		const types = findTells(text).map(t => t.type);
		expect(types).toContain("stock-phrase");
		expect(types).toContain("long-dash");
		expect(types).toContain("formulaic-opener");
	});
});

describe("checkOverlap", () => {
	it("finds a shared passage between the text and a reference", () => {
		const text = "The quick brown fox jumps over the lazy dog every single morning without fail.";
		const reference = "In my notes, the quick brown fox jumps over the lazy dog repeatedly.";
		const result = checkOverlap(text, [reference]);
		expect(result.passages.length).toBeGreaterThan(0);
		expect(result.overlapRatio).toBeGreaterThan(0);
	});

	it("reports no overlap when there is none", () => {
		const result = checkOverlap("Completely unrelated sentence about gardening tools.", ["Nothing similar here at all friend."]);
		expect(result.passages.length).toBe(0);
	});
});
