/**
 * Shared YouTube URL helper to extract the 11-character video ID
 * Supports standard watch URLs, short URLs (youtu.be), embed URLs, and shorts.
 */
export const extractYouTubeId = (url) => {
  if (!url || typeof url !== 'string') return null;
  const trimmed = url.trim();
  const match = trimmed.match(
    /^(?:https?:\/\/)?(?:www\.|m\.)?(?:youtube\.com\/(?:watch\?(?:.*&)?v=|embed\/|shorts\/)|youtu\.be\/)([\w-]{11})(?:[?#&].*)?$/i
  );
  return match ? match[1] : null;
};
