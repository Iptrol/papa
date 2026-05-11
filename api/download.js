import ytdl from '@distube/ytdl-core';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).end();

  const { url, videoQuality, downloadMode } = req.body || {};
  if (!url) return res.status(400).json({ error: 'no url' });

  try {
    const info = await ytdl.getInfo(url);
    const title = info.videoDetails.title;

    if (downloadMode === 'audio') {
      const formats = ytdl.filterFormats(info.formats, 'audioonly');
      const best = formats.sort((a, b) => (b.audioBitrate || 0) - (a.audioBitrate || 0))[0];
      if (!best) return res.status(404).json({ error: 'Аудио поток не найден' });
      return res.json({ status: 'redirect', url: best.url, ext: best.container || 'm4a', title });
    }

    // Video — try combined (audio+video in one file) first
    const combined = ytdl.filterFormats(info.formats, 'videoandaudio')
      .sort((a, b) => (b.height || 0) - (a.height || 0));

    const q = parseInt(videoQuality) || 720;
    const match = combined.find(f => f.height <= q) || combined[combined.length - 1];

    if (match) {
      return res.json({ status: 'redirect', url: match.url, ext: match.container || 'mp4', quality: match.qualityLabel, title });
    }

    // Fallback: separate streams (needs client-side merge)
    const videoFmt = ytdl.filterFormats(info.formats, 'videoonly')
      .filter(f => f.height <= q)
      .sort((a, b) => (b.height || 0) - (a.height || 0))[0];
    const audioFmt = ytdl.filterFormats(info.formats, 'audioonly')
      .sort((a, b) => (b.audioBitrate || 0) - (a.audioBitrate || 0))[0];

    if (videoFmt && audioFmt) {
      return res.json({ status: 'multi', videoUrl: videoFmt.url, audioUrl: audioFmt.url, ext: 'mp4', quality: videoFmt.qualityLabel, title });
    }

    return res.status(404).json({ error: 'Формат не найден' });
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
}
