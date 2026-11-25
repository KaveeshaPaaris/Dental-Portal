/** Single source of truth for the public site's address and name. */
export const SITE_URL = 'https://charmingdental.com';
export const SITE_NAME = 'Charming Dental Clinic';

/**
 * Search-engine indexing switch. Only the exact value "true" turns indexing ON, so a missing or
 * misspelled variable keeps the site hidden (fails safe). Set ALLOW_INDEXING=true when going live.
 * It is read at BUILD time, so it must be set in the build environment and the site rebuilt.
 */
export const ALLOW_INDEXING = process.env.ALLOW_INDEXING === 'true';
