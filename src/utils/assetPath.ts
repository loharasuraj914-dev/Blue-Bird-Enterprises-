export const GH_PAGES_BASE = '/Blue-Bird-Enterprises-/';

/**
 * Resolves public asset URLs across all deployment environments:
 * 1. GitHub Pages project site ('/Blue-Bird-Enterprises-/assets/...')
 * 2. GitHub Pages raw branch root fallback ('/Blue-Bird-Enterprises-/public/assets/...')
 * 3. Root domain or Node.js test environment ('/assets/...')
 */
export function resolvePublicAsset(assetPath: string): string {
  if (!assetPath) return assetPath;
  const cleanPath = assetPath.replace(/^(\.\/|\/)+/, '');

  if (typeof window !== 'undefined') {
    const pathname = window.location?.pathname || '/';
    const hasRepoPrefix = pathname.startsWith('/Blue-Bird-Enterprises-');

    if ((window as any).__RAW_GH_PAGES__) {
      return hasRepoPrefix
        ? `${GH_PAGES_BASE}public/${cleanPath}`
        : `./public/${cleanPath}`;
    }

    if (hasRepoPrefix || window.location?.hostname?.endsWith('.github.io')) {
      return `${GH_PAGES_BASE}${cleanPath}`;
    }
  }

  return `/${cleanPath}`;
}
