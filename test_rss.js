import Parser from 'rss-parser';

const parser = new Parser({
    customFields: {
        item: [
            ['media:content', 'mediaContent', { keepArray: true }],
            ['enclosure', 'enclosure']
        ]
    }
});

async function test() {
    const feeds = [
        "https://www.cnnindonesia.com/nasional/rss",
        "http://feeds.bbci.co.uk/news/world/rss.xml"
    ];

    for (const url of feeds) {
        try {
            const feed = await parser.parseURL(url);
            console.log(`\n\n--- FEED: ${url} ---`);
            const item = feed.items[0];
            console.log("Enclosure:", JSON.stringify(item.enclosure, null, 2));
            console.log("MediaContent:", JSON.stringify(item.mediaContent, null, 2));
        } catch (e) {
            console.error("Error for", url, e.message);
        }
    }
}

test();
