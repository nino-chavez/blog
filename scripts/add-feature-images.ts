import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

interface BlogPost {
  slug: string;
  title: string;
  publishedAt: string;
  excerpt?: string;
  category?: string;
  tags?: string[];
  featured: boolean;
  author: string;
  readTime: string;
  featureImage?: string;
  source?: string;
  linkedinUrl?: string;
  externalUrl?: string;
}

interface Manifest {
  posts: BlogPost[];
  categories: string[];
  tags: string[];
  categoryCounts: Record<string, number>;
  tagCounts: Record<string, number>;
  totalPosts: number;
  lastGenerated: string;
}

// Category-based Unsplash search terms and image collections
const categoryImageMap: Record<string, string[]> = {
  'AI & Automation': [
    'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=2000&q=80', // AI/Tech
    'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=2000&q=80', // AI patterns
    'https://images.unsplash.com/photo-1635322966219-b75ed372eb01?w=2000&q=80', // Neural network
    'https://images.unsplash.com/photo-1655720033654-a4239dd42d10?w=2000&q=80', // Code/AI
    'https://images.unsplash.com/photo-1531746790731-6c087fecd65a?w=2000&q=80', // Abstract tech
    'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=2000&q=80', // Digital tech
    'https://images.unsplash.com/photo-1518770660439-4636190af475?w=2000&q=80', // Tech blue
    'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=2000&q=80', // Abstract data
    'https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=2000&q=80', // AI abstract
    'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=2000&q=80', // Tech workspace
  ],
  'Leadership': [
    'https://images.unsplash.com/photo-1552664730-d307ca884978?w=2000&q=80', // Team collaboration
    'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=2000&q=80', // Leadership meeting
    'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=2000&q=80', // Strategy
    'https://images.unsplash.com/photo-1556761175-b413da4baf72?w=2000&q=80', // Team work
    'https://images.unsplash.com/photo-1521791136064-7986c2920216?w=2000&q=80', // Direction
    'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=2000&q=80', // Team office
    'https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=2000&q=80', // Leader
    'https://images.unsplash.com/photo-1559136555-9303baea8ebd?w=2000&q=80', // Teamwork
    'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=2000&q=80', // Business team
    'https://images.unsplash.com/photo-1573164713714-d95e436ab8d6?w=2000&q=80', // Professional
  ],
  'Commerce': [
    'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=2000&q=80', // Commerce/business
    'https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=2000&q=80', // Online shopping
    'https://images.unsplash.com/photo-1556740738-b6a63e27c4df?w=2000&q=80', // Strategy/planning
    'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=2000&q=80', // Analytics
    'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=2000&q=80', // Data
    'https://images.unsplash.com/photo-1556742111-a301076d9d18?w=2000&q=80', // Shopping
    'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=2000&q=80', // E-commerce
    'https://images.unsplash.com/photo-1534452203293-494d7ddbf7e0?w=2000&q=80', // Business growth
    'https://images.unsplash.com/photo-1579532537598-459ecdaf39cc?w=2000&q=80', // Commerce tech
    'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=2000&q=80', // Storefront
  ],
  'Reflections': [
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=2000&q=80', // Contemplation
    'https://images.unsplash.com/photo-1519834785169-98be25ec3f84?w=2000&q=80', // Reflection
    'https://images.unsplash.com/photo-1502139214982-d0ad755818d8?w=2000&q=80', // Introspection
    'https://images.unsplash.com/photo-1544027993-37dbfe43562a?w=2000&q=80', // Mirror/reflection
    'https://images.unsplash.com/photo-1542435503-956c469947f6?w=2000&q=80', // Thinking
    'https://images.unsplash.com/photo-1494059980473-813e73ee784b?w=2000&q=80', // Solitude
    'https://images.unsplash.com/photo-1517842645767-c639042777db?w=2000&q=80', // Nature reflection
    'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=2000&q=80', // Mountain perspective
    'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=2000&q=80', // Nature calm
    'https://images.unsplash.com/photo-1511593358241-7eea1f3c84e5?w=2000&q=80', // Peaceful
  ],
  'Meta': [
    'https://images.unsplash.com/photo-1455849318743-b2233052fcff?w=2000&q=80', // Writing
    'https://images.unsplash.com/photo-1471107340929-a87cd0f5b5f3?w=2000&q=80', // Notebook
    'https://images.unsplash.com/photo-1501504905252-473c47e087f8?w=2000&q=80', // Desk work
    'https://images.unsplash.com/photo-1484480974693-6ca0a78fb36b?w=2000&q=80', // Ideas
    'https://images.unsplash.com/photo-1499951360447-b19be8fe80f5?w=2000&q=80', // Creative process
    'https://images.unsplash.com/photo-1488190211105-8b0e65b80b4e?w=2000&q=80', // Writing desk
    'https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=2000&q=80', // Planning
    'https://images.unsplash.com/photo-1432821596592-e2c18b78144f?w=2000&q=80', // Notes
    'https://images.unsplash.com/photo-1517842645767-c639042777db?w=2000&q=80', // Journal
    'https://images.unsplash.com/photo-1586075010923-2dd4570fb338?w=2000&q=80', // Brainstorm
  ],
  'Philosophy': [
    'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=2000&q=80', // Abstract thought
    'https://images.unsplash.com/photo-1518186285589-2f7649de83e0?w=2000&q=80', // Contemplative
    'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=2000&q=80', // Mountain/perspective
    'https://images.unsplash.com/photo-1501139083538-0139583c060f?w=2000&q=80', // Minimal/zen
    'https://images.unsplash.com/photo-1508615070457-7baeba4003ab?w=2000&q=80', // Philosophy/thought
    'https://images.unsplash.com/photo-1519681393784-d120267933ba?w=2000&q=80', // Mountain vista
    'https://images.unsplash.com/photo-1470252649378-9c29740c9fa8?w=2000&q=80', // Horizon
    'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=2000&q=80', // Forest path
    'https://images.unsplash.com/photo-1511593358241-7eea1f3c84e5?w=2000&q=80', // Minimal nature
    'https://images.unsplash.com/photo-1447752875215-b2761acb3c5d?w=2000&q=80', // Sunset thought
  ],
  'Consulting': [
    'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=2000&q=80', // Business strategy
    'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=2000&q=80', // Consulting work
    'https://images.unsplash.com/photo-1553877522-43269d4ea984?w=2000&q=80', // Professional
    'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=2000&q=80', // Office work
    'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=2000&q=80', // Teamwork
  ],
  'Field Notes': [
    'https://images.unsplash.com/photo-1471107340929-a87cd0f5b5f3?w=2000&q=80', // Notes/journal
    'https://images.unsplash.com/photo-1517842645767-c639042777db?w=2000&q=80', // Field work
    'https://images.unsplash.com/photo-1484480974693-6ca0a78fb36b?w=2000&q=80', // Notebook
    'https://images.unsplash.com/photo-1455849318743-b2233052fcff?w=2000&q=80', // Writing
    'https://images.unsplash.com/photo-1502139214982-d0ad755818d8?w=2000&q=80', // Documentation
  ],
  'Insights': [
    'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=2000&q=80', // Data/insights
    'https://images.unsplash.com/photo-1504868584819-f8e8b4b6d7e3?w=2000&q=80', // Analysis
    'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=2000&q=80', // Charts
    'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=2000&q=80', // Analytics
    'https://images.unsplash.com/photo-1518186285589-2f7649de83e0?w=2000&q=80', // Vision
  ],
};

// Default fallback images for posts without category
const defaultImages = [
  'https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?w=2000&q=80', // Tech abstract
  'https://images.unsplash.com/photo-1518770660439-4636190af475?w=2000&q=80', // Tech blue
  'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=2000&q=80', // Digital
  'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=2000&q=80', // Data viz
  'https://images.unsplash.com/photo-1504868584819-f8e8b4b6d7e3?w=2000&q=80', // Abstract analysis
];

// Simple hash function to generate consistent index from string
function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return Math.abs(hash);
}

function getDeterministicImage(category: string | undefined, slug: string): string {
  if (!category || !categoryImageMap[category]) {
    const images = defaultImages;
    const index = hashString(slug) % images.length;
    return images[index];
  }
  
  const images = categoryImageMap[category];
  const index = hashString(slug) % images.length;
  return images[index];
}

async function addFeatureImages() {
  const manifestPath = path.join(__dirname, '../src/data/blog-manifest.json');
  const publicManifestPath = path.join(__dirname, '../public/manifest.json');

  // Read the manifest
  const manifestContent = fs.readFileSync(manifestPath, 'utf-8');
  const manifest: Manifest = JSON.parse(manifestContent);

  let updatedCount = 0;

  // Process each post
  manifest.posts.forEach((post) => {
    if (!post.featureImage) {
      post.featureImage = getDeterministicImage(post.category, post.slug);
      updatedCount++;
      console.log(`✓ Added image to: ${post.slug} (${post.category || 'no category'})`);
    }
  });

  // Update lastGenerated timestamp
  manifest.lastGenerated = new Date().toISOString();

  // Write back to BOTH files (src/data and public)
  fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2), 'utf-8');
  fs.writeFileSync(publicManifestPath, JSON.stringify(manifest, null, 2), 'utf-8');

  console.log(`\n✅ Updated ${updatedCount} posts with feature images`);
  console.log(`📝 Total posts: ${manifest.posts.length}`);
  console.log(`🖼️  Posts with images: ${manifest.posts.filter(p => p.featureImage).length}`);
  console.log(`💾 Updated: src/data/blog-manifest.json`);
  console.log(`🌐 Updated: public/manifest.json`);
}

// Run the script
addFeatureImages().catch(console.error);