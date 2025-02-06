import axios from 'axios';

interface GenerateAvatarOptions {
  prompt: string;
  modelId: string;
  styleUUID?: string;
  num_images?: number;
  width?: number;
  height?: number;
}

interface GenerateAvatarResponse {
  generationId: string;
  imageUrl: string;
}

export class AvatarService {
  private readonly apiKey: string;
  private readonly baseUrl = 'https://cloud.leonardo.ai/api/rest/v1';

  constructor() {
    const apiKey = process.env.LEONARDO_API_KEY;
    if (!apiKey) {
      throw new Error('LEONARDO_API_KEY is not set in environment variables');
    }
    this.apiKey = apiKey;  // remove the replace() call
  }

  async generateAvatar(options: GenerateAvatarOptions): Promise<GenerateAvatarResponse> {
    try {
      console.log('Initiating generation request...');
      
      const generationResponse = await axios.post(
        `${this.baseUrl}/generations`,
        {
          ...options,
          num_images: options.num_images || 1,
          width: options.width || 512,
          height: options.height || 512,
        },
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          }
        }
      );

      console.log('Generation initiated:', generationResponse.data);

      if (!generationResponse.data.sdGenerationJob?.generationId) {
        throw new Error('Generation ID not found in response');
      }

      const generationId = generationResponse.data.sdGenerationJob.generationId;

      // 生成完了を待機
      let completed = false;
      let attempts = 0;
      const maxAttempts = 30; // 最大30回試行
      
      while (!completed && attempts < maxAttempts) {
        console.log(`Checking generation status: attempt ${attempts + 1}`);
        
        const statusResponse = await axios.get(
          `${this.baseUrl}/generations/${generationId}`,
          {
            headers: {
              'Authorization': `Bearer ${this.apiKey}`,
              'Accept': 'application/json'
            }
          }
        );

        const generation = statusResponse.data.generations_by_pk;
        if (!generation) {
          throw new Error('Generation not found');
        }

        const status = generation.status;
        console.log('Generation status:', status);

        if (status === 'COMPLETE') {
          if (!generation.generated_images?.[0]?.url) {
            throw new Error('Generated image URL not found');
          }
          return {
            generationId,
            imageUrl: generation.generated_images[0].url
          };
        }

        if (status === 'FAILED') {
          throw new Error('Image generation failed');
        }

        // 3秒待機
        await new Promise(resolve => setTimeout(resolve, 3000));
        attempts++;
      }

      throw new Error('Generation timeout');

    } catch (error) {
      console.error('Leonardo API error:', error);
      throw error;
    }
  }
}