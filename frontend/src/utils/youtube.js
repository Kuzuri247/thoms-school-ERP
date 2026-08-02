/**
 * Shared YouTube URL helper to extract the 11-character video ID
 * Supports standard watch URLs, short URLs (youtu.be), embed URLs, and shorts.
 */
export const extractYouTubeId = (url) => {
  if (!url || typeof url !== 'string') return null;
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|shorts\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.trim().match(regExp);
  return match && match[2].length === 11 ? match[2] : null;
};
