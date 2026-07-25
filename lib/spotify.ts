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

async function getAccessToken(): Promise<string> {
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
  return data.access_token as string;
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

export async function getNowPlaying(): Promise<NowPlaying | null> {
  const token = await getAccessToken();
  const headers = { Authorization: `Bearer ${token}` };

  const playing = await fetch(NOW_PLAYING_URL, { headers });
  const playingText = await playing.text().catch(() => "");
  if (playing.status === 200 && playingText) {
    const data = JSON.parse(playingText);
    if (data?.item) {
      return data.currently_playing_type === "episode"
        ? fromEpisode(data.item, Boolean(data.is_playing))
        : fromTrack(data.item, Boolean(data.is_playing));
    }
  }

  const recent = await fetch(RECENTLY_PLAYED_URL, { headers });
  const recentText = await recent.text().catch(() => "");
  if (recent.status === 200 && recentText) {
    const data = JSON.parse(recentText);
    const item = data?.items?.[0]?.track;
    if (item) return fromTrack(item, false);
  }

  return null;
}
