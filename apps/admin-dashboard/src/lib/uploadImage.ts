import { supabase } from './supabaseClient';

/**
 * Uploads a File to a Supabase Storage bucket and returns the permanent public URL.
 *
 * @param file   - The File object from a file input
 * @param bucket - The bucket name (e.g. 'inventory-images', 'blog-images')
 * @returns      - The full public URL of the uploaded file
 */
export async function uploadImage(file: File, bucket: string): Promise<string> {
  // Generate a unique filename to avoid collisions: timestamp + original name
  const ext = file.name.split('.').pop();
  const filename = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

  const { data, error } = await supabase.storage
    .from(bucket)
    .upload(filename, file, {
      cacheControl: '3600',
      upsert: false,
      contentType: file.type,
    });

  if (error) {
    throw new Error(`Upload failed: ${error.message}`);
  }

  // Get the permanent public URL
  const { data: urlData } = supabase.storage.from(bucket).getPublicUrl(data.path);
  return urlData.publicUrl;
}

/**
 * Deletes a file from Supabase Storage by its full public URL.
 * Safe to call even if the URL doesn't match (will silently fail).
 */
export async function deleteImageByUrl(url: string, bucket: string): Promise<void> {
  try {
    // Extract the path portion after the bucket name in the URL
    const marker = `/storage/v1/object/public/${bucket}/`;
    const idx = url.indexOf(marker);
    if (idx === -1) return;
    const path = url.slice(idx + marker.length);
    await supabase.storage.from(bucket).remove([path]);
  } catch {
    // Non-critical — don't throw, just ignore
  }
}
