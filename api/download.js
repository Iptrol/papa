export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).end();

  const { url, videoQuality, downloadMode } = req.body || {};
  if (!url) return res.status(400).json({ error: 'no url' });

  const videoId = extractVideoId(url);
  if (!videoId) return res.status(400).json({ error: 'invalid youtube url' });

  // Try multiple Invidious instances (public, free, no auth)
  const instances = [
    'https://inv.nadeko.net',
    'https://invidious.nerdvpn.de',
    'https://yewtu.be',
    'https://invidious.privacydev.net',
    'https://iv.melmac.space',
  ];

  let data = null;
  let usedInstance = null;
  for (const inst of instances) {
    try {
      const r = await fetch(`${inst}/api/v1/videos/${videoId}`, {
        headers: { 'User-Agent': 'Mozilla/5.0' },
        signal: AbortSignal.timeout(6000),
      });
      if (r.ok) { data = await r.json(); usedInstance = inst; break; }
    } catch { continue; }
  }

  if (!data) return res.status(500).json({ error: 'Не удалось получить данные видео. Попробуй позже!' });

  if (downloadMode === 'audio') {
    // Best audio stream (m4a preferred, then webm/opus)
    const streams = (data.adaptiveFormats || []).filter(f => f.type?.startsWith('audio'));
    const m4a = streams.find(f => f.type?.includes('mp4'));
    const best = m4a || streams.sort((a,b) => (b.bitrate||0)-(a.bitrate||0))[0];
    if (!best) return res.status(404).json({ error: 'Аудио поток не найден' });
    const streamUrl = best.url.startsWith('http') ? best.url : usedInstance + best.url;
    return res.json({ status: 'redirect', url: streamUrl, ext: 'mp4', mimeType: 'audio/mp4' });
  } else {
    // Combined video+audio streams (formatStreams)
    const combined = data.formatStreams || [];
    const q = videoQuality || '360';
    let stream = combined.find(f => f.qualityLabel?.startsWith(q))
      || combined.find(f => f.qualityLabel?.startsWith('720'))
      || combined.find(f => f.qualityLabel?.startsWith('360'))
      || combined[0];
    if (!stream) return res.status(404).json({ error: 'Видео поток не найден' });
    const streamUrl = stream.url.startsWith('http') ? stream.url : usedInstance + stream.url;
    return res.json({ status: 'redirect', url: streamUrl, ext: 'mp4', mimeType: 'video/mp4', quality: stream.qualityLabel });
  }
}

function extractVideoId(url) {
  const patterns = [
    /youtube\.com\/watch\?.*v=([a-zA-Z0-9_-]{11})/,
    /youtu\.be\/([a-zA-Z0-9_-]{11})/,
    /youtube\.com\/shorts\/([a-zA-Z0-9_-]{11})/,
    /youtube\.com\/embed\/([a-zA-Z0-9_-]{11})/,
  ];
  for (const p of patterns) {
    const m = url.match(p);
    if (m) return m[1];
  }
  return null;
}
