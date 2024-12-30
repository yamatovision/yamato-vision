export async function uploadToCloudinary(
  file: File, 
  folder: string = 'course-thumbnails',
  onProgress?: (progress: number) => void
): Promise<string> {
  const formData = new FormData();
  formData.append('file', file);
  
  // 注意: upload_presetはCloudinaryのダッシュボードで設定した値を使用する必要があります
  const cloudName = 'dr9g8wsag';
  const uploadPreset = 'yamato_vision'; // ここを適切なプリセット名に変更

  formData.append('upload_preset', uploadPreset);
  formData.append('folder', folder);

  const url = `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`;

  try {
    const response = await fetch(url, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error?.message || 'アップロードに失敗しました');
    }

    const data = await response.json();
    return data.secure_url;
  } catch (error) {
    console.error('アップロードエラー:', error);
    throw new Error('画像のアップロードに失敗しました');
  }
}