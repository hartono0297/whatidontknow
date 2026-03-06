import { NextResponse } from "next/server";
import Parser from "rss-parser";
import { GoogleGenerativeAI } from "@google/generative-ai";

// Initialize RSS Parser
const parser = new Parser();

// Initialize Gemini Pro
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const region = searchParams.get('region') || 'local';

        // 1. Fetch Trending News RSS based on region
        let feedUrl = "https://www.cnnindonesia.com/nasional/rss"; // Default to local

        if (region === 'global') {
            feedUrl = "http://feeds.bbci.co.uk/news/world/rss.xml";
        }

        const feed = await parser.parseURL(feedUrl);

        if (!feed.items || feed.items.length === 0) {
            return NextResponse.json({ error: "No trending topics found" }, { status: 404 });
        }

        // 2. Randomly select one trending item
        const randomIndex = Math.floor(Math.random() * feed.items.length);
        const selectedTrend = feed.items[randomIndex];

        // Extra reading to ensure we have content to summarize
        const title = selectedTrend.title || "Unknown Trend";
        const link = selectedTrend.link || "#";
        const content = selectedTrend.contentSnippet || selectedTrend.content || "No details available.";
        const pubDate = selectedTrend.pubDate || new Date().toISOString();
        const sourceName = region === 'global' ? "BBC News" : "CNN Indonesia";

        // 3. Prepare AI Prompt based on Region
        const isGlobal = region === 'global';
        const languageContext = isGlobal
            ? "You are a viral news curator for Gen-Z. Rewrite the following news into an engaging, highly readable, and detailed narrative. Provide a comprehensive summary of the event (2-3 paragraphs). Wrap paragraphs in HTML <p> tags and highlight important or interesting words/phrases using <strong> tags. Output the formatted summary as 'content', and extract 3-4 key takeaways as a list in 'key_points'. Use a casual, punchy style. IMPORTANT: Do not use ANY emojis at all because the website theme is modern and minimalist. Language MUST be in English."
            : "Kamu adalah kurator berita viral untuk Gen-Z. Ubah berita berikut menjadi narasi panjang yang detail, seru, gaul, dan sangat mudah dibaca. Berikan ringkasan komprehensif dari peristiwa tersebut (2-3 paragraf). Bungkus setiap paragraf dengan tag HTML <p> dan highlight kata atau frasa penting/menarik menggunakan tag <strong>. Output ringkasan berformat ini sebagai 'content', dan ekstrak 3-4 poin penting sebagai daftar di 'key_points'. Gunakan sapaan santai. PENTING: Jangan gunakan emoji APAPUN karena tema website sekarang adalah modern dan minimalis. Bahasa HARUS dalam Bahasa Indonesia.";

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
            const cleanJsonStr = responseText.replace(/```json/g, "").replace(/```/g, "").trim();
            jsonResponse = JSON.parse(cleanJsonStr);

            // Safety net to ensure we actually return the parsed trend's original URL if AI hallucinates it
            if (!jsonResponse.source_url || jsonResponse.source_url === "URL asli yang valid") {
                jsonResponse.source_url = link;
            }
        } catch (parseError) {
            console.error("Error parsing Gemini JSON output:", parseError, responseText);
            // Fallback
            jsonResponse = {
                title: `🔥 Lagi Rame: ${title}`,
                publish_date: new Date().toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' }),
                source_name: sourceName,
                content: `<p>Ini nih yang lagi anget-angetnya dibahas netizen. Langsung aja baca selengkapnya biar nggak ketinggalan berita terbaru yang lagi <strong>viral banget</strong>.</p>`,
                key_points: [`Berita: ${title}`, `Silakan klik sumber untuk membaca lebih detail.`],
                source_url: link,
            };
        }

        return NextResponse.json(jsonResponse);
    } catch (error) {
        console.error("API Error:", error);
        return NextResponse.json({
            title: "🔥 Server Lagi Pusing",
            publish_date: new Date().toLocaleDateString('id-ID'),
            source_name: "System",
            content: "<p>Waduh, koneksi ke pusat trend lagi nyangkut nih. Bentar ya, lagi di-reset modemnya biar bisa ditarik lagi gosip <strong>terbarunya</strong>!</p>",
            key_points: ["Server timeout", "Coba klik Extract Insight lagi beberapa saat lagi"],
            source_url: "#"
        }, { status: 500 });
    }
}
