import { supabase } from '../lib/supabase';

export async function uploadFile(
  file: File,
  path: string,
  onProgress?: (progress: number) => void,
  bucket: string = 'public_content'
): Promise<string> {
  if (!file) {
    throw new Error('No file provided');
  }

  if (onProgress) onProgress(10);

  try {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
    
    // If path is provided and doesn't end with slash, add it. If not, just use fileName
    const filePath = path ? (path.endsWith('/') ? `${path}${fileName}` : `${path}/${fileName}`) : fileName;

    if (onProgress) onProgress(30);

    const { data, error: uploadError } = await supabase.storage
      .from(bucket)
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (uploadError) {
      console.error('Supabase upload error details:', uploadError);
      throw new Error(`Upload failed: ${uploadError.message || 'Unknown error'}`);
    }

    if (onProgress) onProgress(80);

    const { data: publicUrlData } = supabase.storage
      .from(bucket)
      .getPublicUrl(filePath);

    if (onProgress) onProgress(100);

    return publicUrlData.publicUrl;
  } catch (error: any) {
    console.error('Error in uploadFile utility:', error);
    throw new Error(error.message || 'Failed to upload file');
  }
}
