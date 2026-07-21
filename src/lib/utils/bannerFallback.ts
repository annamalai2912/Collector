export function getFallbackBannerImage(platform?: string, category?: string, repoFullName?: string): string {
  if (repoFullName) {
    return `https://opengraph.githubassets.com/1/${repoFullName}`;
  }
  if (platform === 'instagram') {
    return 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=800&auto=format&fit=crop&q=80';
  }
  switch (category) {
    case 'AI/ML Tools':
      return 'https://images.unsplash.com/photo-1677442136019-21780efad99a?w=800&auto=format&fit=crop&q=80';
    case 'Embedded/IoT':
      return 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&auto=format&fit=crop&q=80';
    case 'Design Inspiration':
      return 'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?w=800&auto=format&fit=crop&q=80';
    case 'Reels/Shorts':
      return 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=800&auto=format&fit=crop&q=80';
    default:
      return 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=80';
  }
}
