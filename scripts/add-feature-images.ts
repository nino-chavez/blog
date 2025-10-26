import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
import * as crypto from 'crypto';
import * as dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

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

const unsplashCache: Record<string, any> = JSON.parse(fs.readFileSync(path.join(__dirname, '../.unsplash-cache.json'), 'utf-8'));

async function getRelevantImage(query: string): Promise<string | undefined> {
  if (unsplashCache[query] && unsplashCache[query].results.length > 0) {
    const results = unsplashCache[query].results;
    const randomIndex = crypto.randomInt(0, results.length);
    return results[randomIndex].urls.regular;
  }

  const url = `https://api.unsplash.com/search/photos?query=${encodeURIComponent(query)}&client_id=${process.env.UNSPLASH_ACCESS_KEY}`;
  try {
    const response = await fetch(url);
    const data = await response.json();
    unsplashCache[query] = data;
    fs.writeFileSync(path.join(__dirname, '../.unsplash-cache.json'), JSON.stringify(unsplashCache, null, 2));
    if (data.results.length > 0) {
      const randomIndex = crypto.randomInt(0, data.results.length);
      return data.results[randomIndex].urls.regular;
    }
  } catch (error) {
    console.error('Error fetching image from Unsplash:', error);
  }
  return undefined;
}

async function addFeatureImages() {
  const manifestPath = path.join(__dirname, '../src/data/blog-manifest.json');
  const publicManifestPath = path.join(__dirname, '../public/manifest.json');

  // Read the manifest
  const manifestContent = fs.readFileSync(manifestPath, 'utf-8');
  const manifest: Manifest = JSON.parse(manifestContent);

  let updatedCount = 0;

  // Process each post
  for (const post of manifest.posts) {
    if (!post.featureImage) {
      const query = `${post.title} ${post.category} ${post.tags?.join(' ')}`;
      let imageUrl = await getRelevantImage(query);
      if (!imageUrl) {
        console.log(`Falling back to default image for ${post.slug}`);
      }
      if (imageUrl) {
        post.featureImage = imageUrl;
        updatedCount++;
        console.log(`✓ Added image to: ${post.slug} (${post.category || 'no category'})`);
      }
    }
  }

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
