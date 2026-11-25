export const ASSET_VERSION = __ASSET_VERSION__;

export const assetUrl = (path: string, version = ASSET_VERSION): string => `${import.meta.env.BASE_URL}assets/${path}?v=${version}`;

export function versioned(url: URL, version = ASSET_VERSION): URL {
  const out = new URL(url);
  out.searchParams.set('v', version);
  return out;
}
