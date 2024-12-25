export async function uploadToCloudinary(
  file: File, 
  folder: string = 'courses',
  onProgress?: (progress: number) => void
): Promise<string> {
  const formData = new FormData();
  formData.append('file', file);
  
  const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || '';
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || '';
  
  console.log('Upload preset:', uploadPreset); // 追加
  console.log('Cloud name:', cloudName); // 追加
  
  formData.append('upload_preset', uploadPreset);
  formData.append('folder', folder);

  const url = `https://api.cloudinary.com/v1_1/${cloudName}/auto/upload`;
  console.log('Upload URL:', url); // 追加

  try {
    const response = await fetch(url, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Cloudinary error:', errorData); // 追加
      throw new Error(`Failed to upload file to Cloudinary: ${errorData.error?.message || 'Unknown error'}`);
    }

    const data = await response.json();
    return data.secure_url;
  } catch (error) {
    console.error('Upload error details:', error); // 追加
    throw error;
  }
}