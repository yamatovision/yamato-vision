export const getMuxVideoMetadata = async (playbackId: string) => {
  const tokenId = "e6f825b0-d358-4023-a4ba-af1cecfdaf2d";
  const tokenSecret = "Ih2+GsysNVp8B60/0N+xUpecQdFu0pBkU0OyAxBCHcHGH4nMrOFeffKO/6jkp716Ui+OpYICJf/";

  try {
    const assetResponse = await fetch(
      `https://api.mux.com/video/v1/assets/GSds00NiAEPJ1cyOs5mDXIh56VboM7y02aifmRYsMrWUw`,
      {
        headers: {
          'Authorization': `Basic ${btoa(`${tokenId}:${tokenSecret}`)}`,
          'Content-Type': 'application/json',
        }
      }
    );

    if (!assetResponse.ok) {
      throw new Error('Failed to fetch asset data');
    }

    const assetData = await assetResponse.json();

    return {
      duration: Math.floor(assetData.data.duration), // 秒単位で切り捨て
      aspectRatio: assetData.data.aspect_ratio,
      resolution: assetData.data.max_resolution_tier,
      status: assetData.data.status,
      createdAt: assetData.data.created_at
    };
  } catch (error) {
    console.error('Error fetching Mux asset data:', error);
    return null;
  }
};