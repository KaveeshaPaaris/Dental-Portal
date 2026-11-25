// Local images in /public were converted to smaller .webp files. Service image paths
// still come from the database with their old names (e.g. "/implant.png"), so this maps
// them to the .webp file when one exists. Remote URLs and unknown paths pass through unchanged.
const WEBP_STEMS = new Set([
  '/about-clinic-v2', '/crown and bridges', '/dental_clinic_interior_portrait', '/dentures 2',
  '/dnetures', '/doctor_croped', '/extraction 2', '/filling', '/general 2', '/gum disease',
  '/hero-bg', '/implant 2', '/implant', '/logo', '/logo_dark', '/orthodentic 2',
  '/periodic dentistry', '/rootcanal 2', '/rootcanal', '/scaling', '/teeth whitning', '/toot_filling',
  '/services/Gemini_Generated_Image_kqvinlkqvinlkqvi', '/services/Gemini_Generated_Image_sdvylwsdvylwsdvy',
  '/services/aesthetic dentistry', '/services/orthodontic treatment',
  '/services/photo-1593022356769-11f762e25ed9-800',
]);

export function toWebp<T extends string | null | undefined>(src: T): T {
  if (typeof src !== 'string' || !src.startsWith('/')) return src;
  const m = src.match(/^(.*?)\s*\.(png|jpe?g)$/i);
  if (!m) return src;
  return (WEBP_STEMS.has(m[1]) ? `${m[1]}.webp` : src) as T;
}
