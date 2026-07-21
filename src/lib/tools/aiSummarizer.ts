export function generateAISummary(title: string, description: string = '', url: string = ''): string {
  const text = `${title} ${description} ${url}`.toLowerCase();
  
  let coreTech = "Modern Web / Developer Tool";
  if (text.includes("ai") || text.includes("llm") || text.includes("gpt") || text.includes("vector") || text.includes("ml")) {
    coreTech = "AI / Machine Learning Infrastructure";
  } else if (text.includes("github") || text.includes("open source") || text.includes("repo") || text.includes("framework")) {
    coreTech = "Open Source Framework & Repository";
  } else if (text.includes("iot") || text.includes("esp32") || text.includes("arduino") || text.includes("embedded")) {
    coreTech = "Embedded IoT & Hardware Project";
  } else if (text.includes("ui") || text.includes("design") || text.includes("css") || text.includes("figma") || text.includes("tailwind")) {
    coreTech = "Design System & Frontend Inspiration";
  } else if (text.includes("reels") || text.includes("video") || text.includes("youtube") || text.includes("shorts")) {
    coreTech = "Video & Media Content";
  }

  const highlight1 = description 
    ? `💡 **Core Concept:** ${description.slice(0, 120)}${description.length > 120 ? '...' : ''}` 
    : `💡 **Core Concept:** Resource focused on ${coreTech}.`;

  const highlight2 = `⚡ **Key Highlight:** High productivity utility with streamlined zero-friction implementation.`;
  const highlight3 = `🛠️ **Best Use Case:** Recommended for ${coreTech} workflows.`;

  return [highlight1, highlight2, highlight3].join('\n');
}

export function autoClassifyCategoryAndTags(title: string, description: string = '', url: string = ''): {
  category: 'AI/ML Tools' | 'Open Source' | 'Embedded/IoT' | 'Design Inspiration' | 'Reels/Shorts' | 'Reads/Threads';
  tags: string[];
} {
  const combined = `${title} ${description} ${url}`.toLowerCase();
  const tagsSet = new Set<string>();

  let category: 'AI/ML Tools' | 'Open Source' | 'Embedded/IoT' | 'Design Inspiration' | 'Reels/Shorts' | 'Reads/Threads' = 'Open Source';

  if (combined.includes('github.com')) {
    tagsSet.add('github');
    tagsSet.add('open-source');
  }

  if (combined.includes('ai') || combined.includes('llm') || combined.includes('gpt') || combined.includes('model') || combined.includes('agent')) {
    category = 'AI/ML Tools';
    tagsSet.add('ai');
    tagsSet.add('machine-learning');
  } else if (combined.includes('iot') || combined.includes('embedded') || combined.includes('arduino') || combined.includes('esp32') || combined.includes('sensor')) {
    category = 'Embedded/IoT';
    tagsSet.add('iot');
    tagsSet.add('hardware');
  } else if (combined.includes('ui') || combined.includes('design') || combined.includes('css') || combined.includes('figma') || combined.includes('tailwind') || combined.includes('shadcn')) {
    category = 'Design Inspiration';
    tagsSet.add('ui-ux');
    tagsSet.add('frontend');
  } else if (combined.includes('youtube.com') || combined.includes('youtu.be') || combined.includes('instagram.com/reel') || combined.includes('shorts')) {
    category = 'Reels/Shorts';
    tagsSet.add('video');
    tagsSet.add('media');
  } else if (combined.includes('threads.net') || combined.includes('blog') || combined.includes('medium.com') || combined.includes('article')) {
    category = 'Reads/Threads';
    tagsSet.add('reading');
    tagsSet.add('threads');
  } else if (combined.includes('github.com') || combined.includes('open source')) {
    category = 'Open Source';
  }

  // Add domain/language tag hints
  if (combined.includes('python')) tagsSet.add('python');
  if (combined.includes('typescript') || combined.includes('ts')) tagsSet.add('typescript');
  if (combined.includes('react') || combined.includes('next')) tagsSet.add('react');
  if (combined.includes('rust')) tagsSet.add('rust');
  if (combined.includes('go') || combined.includes('golang')) tagsSet.add('go');

  return {
    category,
    tags: Array.from(tagsSet).slice(0, 5),
  };
}
