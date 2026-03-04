/**
 * Cloudflare Images URL Builder
 *
 * Variant Reference (configured in CF Dashboard):
 * - thumbnail: 150px  (blur placeholders)
 * - grid:      400px  (gallery cards)
 * - medium:    800px  (album covers)
 * - large:     1600px (hero, full-width images)
 * - public:    original (downloads, q=90 jpeg)
 */

export const CF_ACCOUNT_HASH = 'wg34HB28-JkySWVm5fW4kA';

export type CFVariant = 'thumbnail' | 'grid' | 'medium' | 'large' | 'public';

export function cfImageUrl(id: string, variant: CFVariant): string {
	return `https://imagedelivery.net/${CF_ACCOUNT_HASH}/${id}/${variant}`;
}

export function cfSrcSet(id: string): string {
	return [
		`${cfImageUrl(id, 'grid')} 400w`,
		`${cfImageUrl(id, 'medium')} 800w`,
		`${cfImageUrl(id, 'large')} 1600w`
	].join(', ');
}
