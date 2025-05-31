function extractMatchesFromHTML(html) {
    const matches = [];
    const regex = /<a class="video-cover-box" target="_blank" href="([^"]+)".*?<img[^>]+alt="([^"]+)"[^>]+src="([^"]+)".*?<span class="duration">([^<]+)<\/span>/gs;

    let match;
    while ((match = regex.exec(html)) !== null) {
        const [_, link, altText, image, duration] = match;
        const matchInfo = parseMatchInfo(altText);

        if(matchInfo === null) continue;
        matches.push({
            ...matchInfo,
            link,
            coverImage: image,
            duration
        });
    }

    return matches;
}

function parseMatchInfo(altText) {
    // Check for penalty format (e.g. "2 (3) - 2 (4)")
    const penaltyPattern = /خلاصه بازی (.+) (\d+) \((\d+)\) - (.+) (\d+) \((\d+)\)/;
    const penaltyMatch = altText.match(penaltyPattern);

    if (penaltyMatch) {
        return {
            host: penaltyMatch[1].trim(),
            guest: penaltyMatch[4].trim(),
            hostGoals: parseInt(penaltyMatch[2]),
            guestGoals: parseInt(penaltyMatch[5]),
            hostPenalties: parseInt(penaltyMatch[3]),
            guestPenalties: parseInt(penaltyMatch[6]),
            isPenalty: true
        };
    }

    // Check for normal format
    const normalPattern = /خلاصه بازی (.+) (\d+) - (.+) (\d+)/;
    const normalMatch = altText.match(normalPattern);

    if (!normalMatch) {
        console.log(`Could not parse match info from alt text: ${altText}`);
        return null
    }

    return {
        host: normalMatch[1].trim(),
        guest: normalMatch[3].trim(),
        hostGoals: parseInt(normalMatch[2]),
        guestGoals: parseInt(normalMatch[4]),
        hostPenalties: 0,
        guestPenalties: 0,
        isPenalty: false
    };
}

// var result = extractMatchesFromHTML($input.all()[0].json.data);
// return result;