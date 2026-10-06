import { getCollection } from "astro:content";
import { createMarkdownProcessor } from "@astrojs/markdown-remark";
import {
	dynamicSearchText,
	dynamicSlug,
	sortDynamics,
} from "@/utils/dynamic-utils";
import { url } from "@/utils/url-utils";
import { posix } from "node:path";

const dynamicImages = import.meta.glob<string>(
	"/Blog/Dynamic/**/*.{jpg,jpeg,png,webp,avif,gif,svg}",
	{ eager: true, query: "?url", import: "default" },
);

const markdownImagePattern = /!\[([^\]]*)\]\((\S+?)(?:\s+["']([^"']*)["'])?\)/g;

const resolveDynamicImage = (
	entryFilePath: string | undefined,
	source: string,
): string => {
	if (/^(https?:)?\/\//.test(source) || source.startsWith("data:")) {
		return source;
	}

	if (source.startsWith("/")) return url(source);
	if (!entryFilePath) throw new Error("Missing dynamic file path");
	const filePath = entryFilePath.replace(/\\/g, "/");
	const path = posix.join("/", posix.dirname(filePath), decodeURIComponent(source));
	const imageUrl = dynamicImages[path];
	if (!imageUrl) throw new Error(`Dynamic image not found: ${path}`);
	return imageUrl;
};

export async function GET(): Promise<Response> {
	const processor = await createMarkdownProcessor();
	const dynamics = sortDynamics(await getCollection("dynamic"));
	const data = await Promise.all(
		dynamics.map(async (entry) => {
			const images: Array<{ alt: string; src: string; title?: string }> = [];
			const markdown = (entry.body || "").replace(
				markdownImagePattern,
				(_match, alt: string, src: string, title?: string) => {
					images.push({
						alt,
						src: resolveDynamicImage(
						(entry as { filePath?: string }).filePath,
						src,
					),
						...(title ? { title } : {}),
					});
					return "";
				},
			);
			const rendered = await processor.render(markdown);

			return {
				id: dynamicSlug(entry.id),
				published: entry.data.published.getTime(),
				html: rendered.code,
				images,
				searchText: dynamicSearchText(entry),
				pinned: entry.data.pinned || false,
				location: entry.data.location.trim(),
			};
		}),
	);

	return new Response(JSON.stringify(data), {
		headers: {
			"Content-Type": "application/json; charset=utf-8",
		},
	});
}
