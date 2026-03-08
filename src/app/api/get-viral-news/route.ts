import { NextResponse } from "next/server";
import Parser from "rss-parser";
import { GoogleGenerativeAI } from "@google/generative-ai";

// Initialize RSS Parser
const parser = new Parser({
    customFields: {
        item: [
            ['media:content', 'mediaContent', { keepArray: true }],
            ['media:thumbnail', 'mediaThumbnail', { keepArray: true }]
        ]
    }
});

// Initialize Gemini Pro
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const region = searchParams.get('region') || 'local';

        // 1. Fetch Trending News RSS based on region
        const localSources = [
            { url: "https://www.cnnindonesia.com/nasional/rss", name: "CNN Indonesia" },
            { url: "https://www.antaranews.com/rss/terkini.xml", name: "Antara News" },
            { url: "https://www.cnbcindonesia.com/news/rss", name: "CNBC Indonesia" },
            { url: "https://www.republika.co.id/rss", name: "Republika" }
        ];

        const globalSources = [
            { url: "http://feeds.bbci.co.uk/news/world/rss.xml", name: "BBC News" },
            { url: "https://rss.nytimes.com/services/xml/rss/nyt/World.xml", name: "The New York Times" },
            { url: "https://www.aljazeera.com/xml/rss/all.xml", name: "Al Jazeera" }
        ];

        const sources = region === 'global' ? globalSources : localSources;
        const randomSource = sources[Math.floor(Math.random() * sources.length)];
        const feedUrl = randomSource.url;
        const regionSourceName = randomSource.name;

        const feed = await parser.parseURL(feedUrl);

        if (!feed.items || feed.items.length === 0) {
            return NextResponse.json({ error: "No trending topics found in " + regionSourceName }, { status: 404 });
        }

        // 2. Randomly select one trending item
        const randomIndex = Math.floor(Math.random() * feed.items.length);
        const selectedTrend = feed.items[randomIndex];

        // Extra reading to ensure we have content to summarize
        const title = selectedTrend.title || "Unknown Trend";
        const link = selectedTrend.link || "#";
        const content = selectedTrend.contentSnippet || selectedTrend.content || "No details available.";
        const pubDate = selectedTrend.pubDate || new Date().toISOString();
        const sourceName = regionSourceName;

        // Extract Image URL if available
        const enclosureUrl = selectedTrend.enclosure?.url;
        const mediaContentUrl = selectedTrend.mediaContent?.[0]?.$?.url;
        const mediaThumbnailUrl = selectedTrend.mediaThumbnail?.[0]?.$?.url;
        const imageUrl = enclosureUrl || mediaContentUrl || mediaThumbnailUrl || null;

        // 3. Prepare AI Prompt based on Region
        const isGlobal = region === 'global';
        const languageContext = isGlobal
            ? "You are a professional news curator. Rewrite the following news into a clear, detailed, and easily understood narrative suitable for all audiences. Provide a comprehensive summary of the event (2-3 paragraphs). Wrap paragraphs in HTML <p> tags and highlight important or interesting words/phrases using <strong> tags. Output the formatted summary as 'content', and extract 3-4 key takeaways as a list in 'key_points'. Use a polite, well-structured style. IMPORTANT: Do not use ANY emojis at all because the website theme is modern and minimalist. Language MUST be in English."
            : "Kamu adalah kurator berita profesional. Ubah berita berikut menjadi narasi yang terstruktur dengan baik, rapi, dan bahasanya mudah dipahami oleh semua kalangan (hindari bahasa gaul atau slang). Berikan ringkasan komprehensif dari peristiwa tersebut (2-3 paragraf). Bungkus setiap paragraf dengan tag HTML <p> dan highlight kata atau frasa penting/menarik menggunakan tag <strong>. Output ringkasan berformat ini sebagai 'content', dan ekstrak 3-4 poin penting sebagai daftar di 'key_points'. Gunakan sapaan formal tapi santai. PENTING: Jangan gunakan emoji APAPUN karena tema website sekarang adalah modern dan minimalis. Bahasa HARUS dalam Bahasa Indonesia.";

        const prompt = `
        ${languageContext}
        
        Original News:
        Title: ${title}
        Publish Date: ${pubDate}
        Source: ${sourceName}
        Content: ${content}
        Source URL: ${link}
        
        Output format MUST ALWAYS be valid JSON (without markdown backticks around it) with this structure:
        {
          "title": "Clickbait Title (No Emojis)",
          "publish_date": "Human readable date format (e.g. 6 Mar 2026, 12:00 WIB)",
          "source_name": "${sourceName}",
          "content": "<p>Detailed and engaging Gen-Z style narrative (No Emojis).</p><p>Here is another interesting point, highlighting <strong>important words</strong> for emphasis.</p>",
          "key_points": ["Key point 1", "Key point 2", "Key point 3"],
          "source_url": "Valid original URL"
        }
        `;

        // 4. Generate Content with Gemini 2.5 Flash (Stable)
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
        const result = await model.generateContent(prompt);
        const responseText = result.response.text();

        // 5. Parse JSON (strip out possible markdown blocks from Gemini)
        let jsonResponse;
        try {
            // Force extract substring containing valid JSON arrays or objects
            const textMatch = responseText.match(/{(?:[^{}]|{(?:[^{}]|{(?:[^{}]|{[^{}]*})*})*})*}/);

            if (textMatch) {
                jsonResponse = JSON.parse(textMatch[0]);
            } else {
                throw new Error("No valid JSON found in response");
            }

            // Safety net to ensure we actually return the parsed trend's original URL if AI hallucinates it
            if (!jsonResponse.source_url || jsonResponse.source_url === "URL asli yang valid") {
                jsonResponse.source_url = link;
            }

            // Inject the extracted image URL directly
            jsonResponse.image_url = imageUrl;
        } catch (parseError) {
            console.error("Error parsing Gemini JSON output:", parseError, responseText);
            // Fallback
            jsonResponse = {
                title: `Berita Terkini: ${title}`,
                publish_date: new Date().toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' }),
                source_name: sourceName,
                content: `<p>Berikut adalah informasi terbaru yang sedang hangat diperbincangkan. Silakan baca selengkapnya untuk mendapatkan informasi yang <strong>komprehensif</strong>.</p>`,
                key_points: [`Informasi: ${title}`, `Silakan klik sumber untuk membaca lebih detail.`],
                source_url: link,
                image_url: imageUrl,
            };
        }

        return NextResponse.json(jsonResponse);
    } catch (error) {
        console.error("API Error:", error);
        return NextResponse.json({
            title: "Gangguan Sistem",
            publish_date: new Date().toLocaleDateString('id-ID'),
            source_name: "System",
            content: "<p>Mohon maaf, saat ini sistem sedang memulihkan koneksi ke sumber berita. Silakan tunggu beberapa saat untuk mendapatkan <strong>pembaruan</strong>.</p>",
            key_points: ["Koneksi terputus", "Silakan coba tekan tombol Extract Insight kembali nanti"],
            source_url: "#"
        }, { status: 500 });
    }
}
