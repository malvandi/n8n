function parseMatchInfo(html) {
    // Try to get match info from related match section
    const relatedMatch = html.match(/<div class="related-match-page">[\s\S]*?<span class="host-team">([^<]+)<\/span>[\s\S]*?<span class="host-goal">([^<]+)<\/span>[\s\S]*?<span class="guest-goal">([^<]+)<\/span>[\s\S]*?<span class="guest-team">([^<]+)<\/span>/);
    
    if (relatedMatch) {
        return {
            host: relatedMatch[1].trim(),
            guest: relatedMatch[4].trim(),
            hostGoals: parseInt(relatedMatch[2]),
            guestGoals: parseInt(relatedMatch[3]),
            isPenalty: false, // We'll check for penalties separately
            hostPenalties: 0,
            guestPenalties: 0
        };
    }

    // Alternative parsing from video title
    const titleMatch = html.match(/<title>([^<]+)<\/title>/);
    if (titleMatch) {
        const title = titleMatch[1];
        // Check for penalty format (e.g. "5 - 0")
        const scoreMatch = title.match(/([\d\w\- ]+)\s(\d+)\s*-\s*([\d\w\- ]+)\s(\d+)/);
        
        if (scoreMatch) {
            return {
                host: scoreMatch[1].trim(),
                guest: scoreMatch[3].trim(),
                hostGoals: parseInt(scoreMatch[2]),
                guestGoals: parseInt(scoreMatch[4]),
                isPenalty: false,
                hostPenalties: 0,
                guestPenalties: 0
            };
        }
    }

    return null;
}

function extractVideoData(html) {
    // Get match info first
    const matchInfo = parseMatchInfo(html);
    console.log('match info', matchInfo);
    
    // Extract download links
    const downloadLinks = [];
    const linkSection = html.match(/<div class="dropdown-menu" aria-labelledby="downloadMenuButton">([\s\S]*?)<\/div>/);
    
    if (linkSection) {
        const linkMatches = linkSection[0].matchAll(/<a\s+class="dropdown-item"\s+href="([^"]+)"[^>]*>\s*<span>([^<]+)<\/span>/g);
        
        for (const match of linkMatches) {
            const qualityMatch = match[2].match(/(\d+)/);
            if (qualityMatch) {
                downloadLinks.push({
                    quality: parseInt(qualityMatch[1]),
                    link: match[1]
                });
            }
        }
    }

    // Sort by highest quality first
    downloadLinks.sort((a, b) => b.quality - a.quality);

    // Extract description
    const descMatch = html.match(/<div class="video-description">\s*<p>([\s\S]*?)<\/p>/);
    const description = descMatch ? descMatch[1].replace(/<p>|<\/p>/g, '').trim() : '';

    return {
        // Include all match info (or null if not found)
        ...(matchInfo || {}),
        downloadLinks,
        description
    };
}

// Example usage:
// const videoData = extractVideoData(document.documentElement.outerHTML);
// console.log(videoData);
