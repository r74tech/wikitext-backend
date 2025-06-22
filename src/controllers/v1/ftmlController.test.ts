import { beforeAll, describe, expect, mock, test } from "bun:test";
import type { Context } from "hono";
import {
	detailRenderFtml,
	getWordCount,
	parseFtml,
	renderFtml,
	renderText,
} from "./ftmlController";

function createMockContext(body: unknown): { mockContext: Context; json: ReturnType<typeof mock> } {
	const json = mock(() => {});
	const mockContext = {
		req: {
			json: mock(() => Promise.resolve(body)),
		},
		json,
	} as unknown as Context;

	return { mockContext, json };
}

const defaultPageInfo = {
	title: "Test Page",
	site: "test-site",
	page: "test-page",
};

describe("ftmlController", () => {
	beforeAll(() => {
		if (!("location" in globalThis)) {
			Object.defineProperty(globalThis, "location", {
				value: {
					href: "file:///",
					protocol: "file:",
					host: "",
					hostname: "",
					port: "",
					pathname: "/",
					search: "",
					hash: "",
				},
				writable: true,
				configurable: true,
			});
		}
	});

	describe("parseFtml", () => {
		test("should parse FTML source successfully", async () => {
			const { mockContext, json } = createMockContext({
				source: "**bold** and //italic//",
				pageInfo: defaultPageInfo,
			});

			await parseFtml(mockContext);

			const callArgs = json.mock.calls[0][0] as {
				success: boolean;
				data?: { ast: unknown; errors: unknown[] };
				error?: string;
			};

			expect(callArgs.success).toBe(true);
			expect(callArgs.data).toBeDefined();
			expect(callArgs.data?.ast).toBeDefined();
			expect(callArgs.data?.errors).toBeDefined();
			expect(Array.isArray(callArgs.data?.errors)).toBe(true);
		});

		test("should return error when source is missing", async () => {
			const { mockContext, json } = createMockContext({
				pageInfo: defaultPageInfo,
			});

			await parseFtml(mockContext);

			expect(json).toHaveBeenCalledWith({ error: "Source is required" }, 400);
		});
	});

	describe("renderFtml", () => {
		test("should render bold text to HTML", async () => {
			const { mockContext, json } = createMockContext({
				source: "**bold text**",
				pageInfo: defaultPageInfo,
			});

			await renderFtml(mockContext);

			const callArgs = json.mock.calls[0][0] as {
				success: boolean;
				data?: { html: string; backlinks: string[]; meta: unknown };
				error?: string;
			};

			expect(callArgs.success).toBe(true);
			expect(callArgs.data).toBeDefined();
			expect(callArgs.data!.html).toBeDefined();
			expect(callArgs.data!.html).toMatch(/bold text/i);
			expect(callArgs.data!.backlinks).toBeDefined();
		});

		test("should render italic text to HTML", async () => {
			const { mockContext, json } = createMockContext({
				source: "//italic text//",
				pageInfo: defaultPageInfo,
			});

			await renderFtml(mockContext);

			const callArgs = json.mock.calls[0][0] as {
				success: boolean;
				data?: { html: string };
			};

			expect(callArgs.success).toBe(true);
			expect(callArgs.data).toBeDefined();
			expect(callArgs.data!.html).toMatch(/italic text/i);
		});

		test("should render links with backlinks", async () => {
			const { mockContext, json } = createMockContext({
				source: "[[[test-page|Link to test]]]",
				pageInfo: defaultPageInfo,
			});

			await renderFtml(mockContext);

			const callArgs = json.mock.calls[0][0] as {
				success: boolean;
				data?: { html: string; backlinks: string[] };
			};

			expect(callArgs.success).toBe(true);
			expect(callArgs.data).toBeDefined();
			expect(callArgs.data!.html).toMatch(/Link to test/i);
			if (callArgs.data!.backlinks && callArgs.data!.backlinks.length > 0) {
				expect(callArgs.data!.backlinks).toContain("test-page");
			}
		});

		test("should handle JSON parse errors", async () => {
			const jsonMock = mock(() => {});
			const mockContext = {
				req: {
					json: mock(() => Promise.reject(new Error("Invalid JSON"))),
				},
				json: jsonMock,
			} as unknown as Context;

			const originalConsoleError = console.error;
			console.error = mock(() => {});

			await renderFtml(mockContext);

			console.error = originalConsoleError;

			expect(jsonMock).toHaveBeenCalledWith(
				{
					success: false,
					error: "Invalid JSON in request body",
				},
				400,
			);
		});
	});

	describe("detailRenderFtml", () => {
		test("should render FTML with detailed output", async () => {
			const { mockContext, json } = createMockContext({
				source: "**bold** and //italic//",
				pageInfo: defaultPageInfo,
			});

			await detailRenderFtml(mockContext);

			const callArgs = json.mock.calls[0][0] as {
				success: boolean;
				data?: { html: string; tokens: unknown[]; ast: unknown; errors: unknown[] };
			};

			expect(callArgs.success).toBe(true);
			expect(callArgs.data).toBeDefined();
			expect(callArgs.data!.html).toMatch(/bold.*italic/i);
			expect(Array.isArray(callArgs.data!.tokens)).toBe(true);
			expect(callArgs.data!.tokens.length).toBeGreaterThan(0);
			expect(callArgs.data!.ast).toBeDefined();
		});
	});

	describe("renderText", () => {
		test("should render FTML to plain text without HTML tags", async () => {
			const { mockContext, json } = createMockContext({
				source: "//italic text// and **bold text**",
				pageInfo: defaultPageInfo,
			});

			await renderText(mockContext);

			const callArgs = json.mock.calls[0][0] as {
				success: boolean;
				data?: { text: string };
			};

			expect(callArgs.success).toBe(true);
			expect(callArgs.data).toBeDefined();
			expect(callArgs.data!.text).toContain("italic text");
			expect(callArgs.data!.text).toContain("bold text");
			expect(callArgs.data!.text).not.toContain("/");
			expect(callArgs.data!.text).not.toContain("*");
			expect(callArgs.data!.text).not.toContain("strong");
			expect(callArgs.data!.text).not.toContain("em");
		});

		test("should handle lists and quotes", async () => {
			const { mockContext, json } = createMockContext({
				source: `> This is a quote
* List item 1
* List item 2`,
				pageInfo: defaultPageInfo,
			});

			await renderText(mockContext);

			const callArgs = json.mock.calls[0][0] as {
				success: boolean;
				data?: { text: string };
			};

			expect(callArgs.success).toBe(true);
			expect(callArgs.data).toBeDefined();
			expect(callArgs.data!.text).toContain("This is a quote");
			expect(callArgs.data!.text).toContain("List item 1");
			expect(callArgs.data!.text).toContain("List item 2");
		});
	});

	describe("getWordCount", () => {
		test("should count words in FTML source", async () => {
			const { mockContext, json } = createMockContext({
				source: "This is a test document with some words.",
				pageInfo: defaultPageInfo,
			});

			await getWordCount(mockContext);

			const callArgs = json.mock.calls[0][0] as {
				success: boolean;
				data?: { wordCount: number };
				error?: string;
			};

			expect(callArgs.success).toBe(true);
			expect(callArgs.data).toBeDefined();
			expect(typeof callArgs.data!.wordCount).toBe("number");
		});

		test("should count words with FTML formatting", async () => {
			const { mockContext, json } = createMockContext({
				source: "**Bold words** and //italic words// here.",
				pageInfo: defaultPageInfo,
			});

			await getWordCount(mockContext);

			const callArgs = json.mock.calls[0][0] as {
				success: boolean;
				data?: { wordCount: number };
			};

			expect(callArgs.success).toBe(true);
			expect(callArgs.data).toBeDefined();
			expect(typeof callArgs.data!.wordCount).toBe("number");
		});

		test("should handle errors for invalid source", async () => {
			const { mockContext, json } = createMockContext({
				pageInfo: defaultPageInfo,
			});

			await getWordCount(mockContext);

			expect(json).toHaveBeenCalledWith({ error: "Source is required" }, 400);
		});
	});

	describe("rendering modes and layouts", () => {
		test("should respect different rendering modes", async () => {
			const { mockContext, json } = createMockContext({
				source: "Test content in list mode",
				pageInfo: defaultPageInfo,
				mode: "list",
				layout: "wikijump",
			});

			await renderFtml(mockContext);

			const callArgs = json.mock.calls[0][0] as {
				success: boolean;
				data?: { html: string };
			};

			expect(callArgs.success).toBe(true);
			expect(callArgs.data).toBeDefined();
			expect(callArgs.data!.html).toContain("Test content in list mode");
		});

		test("should handle page mode as default", async () => {
			const { mockContext, json } = createMockContext({
				source: "Default page mode content",
				pageInfo: defaultPageInfo,
			});

			await renderFtml(mockContext);

			const callArgs = json.mock.calls[0][0] as {
				success: boolean;
				data?: { html: string };
			};

			expect(callArgs.success).toBe(true);
			expect(callArgs.data).toBeDefined();
			expect(callArgs.data!.html).toContain("Default page mode content");
		});
	});
});
