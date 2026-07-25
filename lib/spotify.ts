import { supabaseAdmin } from "./supabase";

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

const LAST_PLAYED_KEY = "spotify_last_played";

// in-memory copy of the DB row, avoids a Supabase round trip on every request
let lastKnown: NowPlaying | null = null;
let lastKnownLoaded = false;

async function loadLastKnown(): Promise<NowPlaying | null> {
  if (lastKnownLoaded) return lastKnown;
  lastKnownLoaded = true;
  const { data, error } = await supabaseAdmin.from("site_settings").select("value").eq("key", LAST_PLAYED_KEY).single();
  if (error && error.code !== "PGRST116") console.error("Error loading last-played track:", error);
  if (data?.value) {
    try {
      lastKnown = JSON.parse(data.value);
    } catch {
      lastKnown = null;
    }
  }
  return lastKnown;
}

async function saveLastKnown(value: NowPlaying) {
  lastKnown = value;
  lastKnownLoaded = true;
  const { error } = await supabaseAdmin
    .from("site_settings")
    .upsert({ key: LAST_PLAYED_KEY, value: JSON.stringify(value) }, { onConflict: "key" });
  if (error) console.error("Error saving last-played track:", error);
}

// data.url/data.image round-trip through Supabase; validate before trusting them as href/src.
function sanitize(np: NowPlaying | null): NowPlaying | null {
  if (!np) return np;
  return {
    ...np,
    url: /^https:\/\/open\.spotify\.com\//.test(np.url) ? np.url : "",
    image: /^https:\/\/i\.scdn\.co\//.test(np.image) ? np.image : "",
  };
}

let cachedResult: { value: NowPlaying | null; expiresAt: number } | null = null;
const RESULT_TTL_MS = 10_000;

export async function getNowPlaying(): Promise<NowPlaying | null> {
  if (cachedResult && cachedResult.expiresAt > Date.now()) return cachedResult.value;

  const result = sanitize(await fetchNowPlaying());
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
      const result =
        data.currently_playing_type === "episode"
          ? fromEpisode(data.item, Boolean(data.is_playing))
          : fromTrack(data.item, Boolean(data.is_playing));
      await saveLastKnown(result);
      return result;
    }
  }

  const recent = await fetch(RECENTLY_PLAYED_URL, { headers });
  const recentText = await recent.text().catch(() => "");
  if (recent.status === 200 && recentText) {
    const data = JSON.parse(recentText);
    const item = data?.items?.[0]?.track;
    if (item) {
      const result = fromTrack(item, false);
      await saveLastKnown(result);
      return result;
    }
  }

  return loadLastKnown();
}
