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

        // 3. Prepare AI Prompt based on Region
        const isGlobal = region === 'global';
        const languageContext = isGlobal
            ? "You are a viral news curator for Gen-Z. Rewrite the following news into an engaging, viral, punchy, and informative style. Use casual greetings. Keep it short, maximum 3 sentences for the summary. IMPORTANT: Do not use ANY emojis in the title or summary because the website theme is modern and minimalist. Language MUST be in English."
            : "Kamu adalah kurator berita viral untuk Gen-Z. Ubah berita berikut menjadi gaya bahasa yang seru, viral, gaul, singkat, dan informatif. Gunakan sapaan santai. Jangan terlalu panjang, maksimal 3 kalimat untuk ringkasannya. PENTING: Jangan gunakan emoji APAPUN dalam judul atau ringkasan karena tema website sekarang adalah modern dan minimalis. Bahasa HARUS dalam Bahasa Indonesia.";

        const prompt = `
        ${languageContext}
        
        Original News:
        Title: ${title}
        Content: ${content}
        Source URL: ${link}
        
        Output format MUST ALWAYS be valid JSON (without markdown backticks around it) with this structure:
        {
          "title": "Clickbait Title (No Emojis)",
          "summary": "Gen-Z style summary content (max 3 sentences, No Emojis)",
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
                summary: `Ini nih yang lagi anget-angetnya dibahas netizen. Langsung aja cek TKP-nya ya!`,
                source_url: link,
            };
        }

        return NextResponse.json(jsonResponse);
    } catch (error) {
        console.error("API Error:", error);
        return NextResponse.json({
            title: "🔥 Server Lagi Pusing",
            summary: "Waduh, koneksi ke pusat trend lagi nyangkut nih. Bentar ya, lagi di-reset modemnya!",
            source_url: "#"
        }, { status: 500 });
    }
}
