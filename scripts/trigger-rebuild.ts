#!/usr/bin/env node
/**
 * Trigger Portfolio Rebuild
 *
 * Calls Vercel deploy hook to rebuild nino-chavez-website when blog posts are updated.
 * This ensures the portfolio site displays the latest blog posts without manual intervention.
 *
 * Usage:
 * - Automatically called during build process (npm run build)
 * - Can be run manually: npm run trigger-rebuild
 *
 * Environment Variables:
 * - PORTFOLIO_REBUILD_WEBHOOK_URL: Vercel deploy hook URL for nino-chavez-website
 *
 * Setup:
 * See /docs/WEBHOOK-SETUP.md in nino-chavez-website repo for complete setup instructions
 */

const WEBHOOK_URL = process.env.PORTFOLIO_REBUILD_WEBHOOK_URL;

async function triggerRebuild() {
  // Skip if webhook not configured (local dev, CI without webhook)
  if (!WEBHOOK_URL) {
    console.log('[trigger-rebuild] ⚠️  PORTFOLIO_REBUILD_WEBHOOK_URL not set, skipping portfolio rebuild');
    console.log('[trigger-rebuild] This is normal for local development');
    return;
  }

  // Validate webhook URL format
  if (!WEBHOOK_URL.startsWith('https://api.vercel.com/v1/integrations/deploy/')) {
    console.error('[trigger-rebuild] ❌ Invalid webhook URL format');
    console.error('[trigger-rebuild] Expected: https://api.vercel.com/v1/integrations/deploy/...');
    console.error('[trigger-rebuild] Got:', WEBHOOK_URL.substring(0, 50) + '...');
    // Don't fail the build for webhook issues
    return;
  }

  console.log('[trigger-rebuild] 🔄 Triggering portfolio rebuild...');

  try {
    const response = await fetch(WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();

    console.log('[trigger-rebuild] ✅ Portfolio rebuild triggered successfully');
    console.log('[trigger-rebuild] Job ID:', data.job?.id || 'N/A');
    console.log('[trigger-rebuild] Status:', data.job?.state || 'N/A');

  } catch (error) {
    console.error('[trigger-rebuild] ❌ Failed to trigger rebuild:', error instanceof Error ? error.message : error);
    console.error('[trigger-rebuild] This is not critical - the blog build will continue');
    // Don't fail the build if webhook fails
    // The portfolio can be manually rebuilt if needed
  }
}

// Run the function
triggerRebuild();
