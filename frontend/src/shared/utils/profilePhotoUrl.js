import { BASE_URL } from "@/api/axiosInstance";

/**
 * Returns the full URL for a user's profile photo.
 *
 * Caching strategy:
 *  - The backend serves profile photos with Cache-Control: max-age=86400 (1 day) + ETag.
 *  - Each upload generates a new UUID filename, so a changed photo automatically
 *    produces a different URL → browser fetches fresh without any manual cache busting.
 *  - Same filename = same URL = browser serves from disk cache, zero network traffic.
 *
 * @param {string|null|undefined} fileName - The UUID filename stored in the user profile.
 * @returns {string|null} Full URL to the photo, or null if no photo is set.
 */
export function getProfilePhotoUrl(fileName) {
    if (!fileName) return null;
    return `${BASE_URL}/photos/profile/${fileName}`;
}
