export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).end();

  const { url, videoQuality, audioFormat, downloadMode } = req.body || {};
  if (!url) return res.status(400).json({ error: 'no url' });

  try {
    const r = await fetch('https://api.cobalt.tools/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'User-Agent': 'Mozilla/5.0 papa-downloader/1.0',
      },
      body: JSON.stringify({
        url,
        videoQuality: videoQuality || '720',
        audioFormat: audioFormat || 'mp3',
        downloadMode: downloadMode || 'auto',
        filenamePattern: 'basic',
        youtubeVideoCodec: 'h264',
      }),
    });

    const data = await r.json();

    // Handle picker (YouTube DASH — separate audio/video streams)
    if (data.status === 'picker' && Array.isArray(data.picker)) {
      const pick = downloadMode === 'audio'
        ? data.picker.find(p => p.type === 'audio') || data.picker[0]
        : data.picker[0];
      return res.json({ status: 'redirect', url: pick.url });
    }

    return res.json(data);
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
}
