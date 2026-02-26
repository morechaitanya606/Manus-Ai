const POLLINATIONS_UNIFIED_BASE_URL = 'https://gen.pollinations.ai';
const POLLINATIONS_LEGACY_BASE_URL = 'https://image.pollinations.ai';
const POLLINATIONS_ALT_BASE_URL = 'https://pollinations.ai';

type PollinationsCandidate = {
    name: string;
    url: string;
    headers?: Record<string, string>;
};

function getPollinationsApiKey() {
    const key = process.env.POLLINATIONS_API_KEY?.trim();
    return key || null;
}

function buildUnifiedUrl(prompt: string, seed: number, apiKey?: string | null) {
    const params = new URLSearchParams({
        width: '1024',
        height: '1024',
        nologo: 'true',
        model: 'flux',
        seed: String(seed),
    });
    if (apiKey) params.set('key', apiKey);
    return `${POLLINATIONS_UNIFIED_BASE_URL}/image/${encodeURIComponent(prompt)}?${params.toString()}`;
}

function buildLegacyPromptUrl(prompt: string, seed: number) {
    return `${POLLINATIONS_LEGACY_BASE_URL}/prompt/${encodeURIComponent(
        prompt
    )}?width=1024&height=1024&nologo=true&seed=${seed}`;
}

function buildLegacyAltUrl(prompt: string, seed: number) {
    return `${POLLINATIONS_ALT_BASE_URL}/p/${encodeURIComponent(
        prompt
    )}?width=1024&height=1024&nologo=true&seed=${seed}`;
}

function clipErrorText(value: string) {
    const compact = value.replace(/\s+/g, ' ').trim();
    if (!compact) return 'empty error response';
    return compact.length > 220 ? `${compact.slice(0, 220)}...` : compact;
}

async function responseToImageBlob(res: Response, sourceName: string): Promise<Blob> {
    if (!res.ok) {
        const text = await res.text();
        throw new Error(`${sourceName} failed: ${clipErrorText(text || String(res.status))}`);
    }

    const contentType = (res.headers.get('content-type') || '').toLowerCase();
    if (contentType.startsWith('image/')) {
        return res.blob();
    }

    if (contentType.includes('application/json')) {
        const data = await res.json().catch(() => null);
        const imageUrl =
            typeof data?.image === 'string'
                ? data.image
                : typeof data?.url === 'string'
                    ? data.url
                    : null;

        if (imageUrl) {
            const imageRes = await fetch(imageUrl);
            if (!imageRes.ok) {
                const text = await imageRes.text();
                throw new Error(`${sourceName} image URL failed: ${clipErrorText(text || String(imageRes.status))}`);
            }
            return imageRes.blob();
        }

        throw new Error(`${sourceName} returned JSON without image data`);
    }

    const text = await res.text();
    throw new Error(`${sourceName} returned non-image response: ${clipErrorText(text)}`);
}

async function fetchCandidate(candidate: PollinationsCandidate): Promise<Blob> {
    const res = await fetch(candidate.url, {
        headers: {
            Accept: 'image/*',
            ...(candidate.headers || {}),
        },
    });
    return responseToImageBlob(res, candidate.name);
}

export async function generateWithPollinations(prompt: string): Promise<Blob> {
    const apiKey = getPollinationsApiKey();
    const seed = Math.floor(Math.random() * 1000000);
    const candidates: PollinationsCandidate[] = [];

    if (apiKey) {
        candidates.push({
            name: 'Pollinations unified (api key query)',
            url: buildUnifiedUrl(prompt, seed, apiKey),
        });
        candidates.push({
            name: 'Pollinations unified (api key header)',
            url: buildUnifiedUrl(prompt, seed),
            headers: {
                Authorization: `Bearer ${apiKey}`,
                'X-API-Key': apiKey,
            },
        });
    }

    candidates.push({
        name: 'Pollinations unified (public)',
        url: buildUnifiedUrl(prompt, seed),
    });

    if (apiKey) {
        candidates.push({
            name: 'Pollinations legacy /prompt (api key header)',
            url: buildLegacyPromptUrl(prompt, seed),
            headers: {
                Authorization: `Bearer ${apiKey}`,
                'X-API-Key': apiKey,
            },
        });
    }

    candidates.push({
        name: 'Pollinations legacy /prompt (public)',
        url: buildLegacyPromptUrl(prompt, seed),
    });
    candidates.push({
        name: 'Pollinations legacy /p (public)',
        url: buildLegacyAltUrl(prompt, seed),
    });

    const failures: string[] = [];
    for (const candidate of candidates) {
        try {
            return await fetchCandidate(candidate);
        } catch (error) {
            const message = error instanceof Error ? error.message : String(error);
            failures.push(`${candidate.name}: ${clipErrorText(message)}`);
        }
    }

    throw new Error(`Pollinations failed on all endpoints. ${failures.join(' | ')}`);
}
