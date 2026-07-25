const CLIENT_ID = process.env.SPOTIFY_CLIENT_ID;
const CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET;
const REFRESH_TOKEN = process.env.SPOTIFY_REFRESH_TOKEN;

const TOKEN_URL = "https://accounts.spotify.com/api/token";
const NOW_PLAYING_URL = "https://api.spotify.com/v1/me/player/currently-playing?additional_types=episode";
const RECENTLY_PLAYED_URL = "https://api.spotify.com/v1/me/player/recently-played?limit=1";

export interface NowPlaying {
  isPlaying: boolean;
  title: string;
  artist: string;
  url: string;
  image: string;
}

let cachedToken: { value: string; expiresAt: number } | null = null;

async function getAccessToken(): Promise<string> {
  if (cachedToken && cachedToken.expiresAt > Date.now()) return cachedToken.value;

  if (!CLIENT_ID || !CLIENT_SECRET || !REFRESH_TOKEN) {
    throw new Error("Spotify env vars are not configured");
  }

  const basic = Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString("base64");
  const res = await fetch(TOKEN_URL, {
    method: "POST",
    headers: {
      Authorization: `Basic ${basic}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      grant_type: "refresh_token",
      refresh_token: REFRESH_TOKEN,
    }),
  });

  if (!res.ok) throw new Error(`Spotify token refresh failed: ${res.status}`);
  const data = await res.json();
  cachedToken = { value: data.access_token, expiresAt: Date.now() + (data.expires_in - 60) * 1000 };
  return cachedToken.value;
}

function fromTrack(item: any, isPlaying: boolean): NowPlaying {
  return {
    isPlaying,
    title: item.name,
    artist: item.artists.map((a: { name: string }) => a.name).join(", "),
    url: item.external_urls.spotify,
    image: item.album.images[0]?.url ?? "",
  };
}

function fromEpisode(item: any, isPlaying: boolean): NowPlaying {
  return {
    isPlaying,
    title: item.name,
    artist: item.show?.name ?? "Podcast",
    url: item.external_urls.spotify,
    image: item.images?.[0]?.url ?? item.show?.images?.[0]?.url ?? "",
  };
}

// ponytail: in-memory only, resets on server restart/cold start. Swap for a KV/file if that matters.
let lastKnown: NowPlaying | null = null;
let cachedResult: { value: NowPlaying | null; expiresAt: number } | null = null;
const RESULT_TTL_MS = 10_000;

export async function getNowPlaying(): Promise<NowPlaying | null> {
  if (cachedResult && cachedResult.expiresAt > Date.now()) return cachedResult.value;

  const result = await fetchNowPlaying();
  cachedResult = { value: result, expiresAt: Date.now() + RESULT_TTL_MS };
  return result;
}

async function fetchNowPlaying(): Promise<NowPlaying | null> {
  const token = await getAccessToken();
  const headers = { Authorization: `Bearer ${token}` };

  const playing = await fetch(NOW_PLAYING_URL, { headers });
  const playingText = await playing.text().catch(() => "");
  if (playing.status === 200 && playingText) {
    const data = JSON.parse(playingText);
    if (data?.item) {
      lastKnown =
        data.currently_playing_type === "episode"
          ? fromEpisode(data.item, Boolean(data.is_playing))
          : fromTrack(data.item, Boolean(data.is_playing));
      return lastKnown;
    }
  }

  const recent = await fetch(RECENTLY_PLAYED_URL, { headers });
  const recentText = await recent.text().catch(() => "");
  if (recent.status === 200 && recentText) {
    const data = JSON.parse(recentText);
    const item = data?.items?.[0]?.track;
    if (item) {
      lastKnown = fromTrack(item, false);
      return lastKnown;
    }
  }

  return lastKnown;
}
