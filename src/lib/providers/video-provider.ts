// =============================================================================
// Video Provider Abstraction
// Currently supports Cloudflare Stream; swap implementations later
// =============================================================================

export interface VideoUploadInput {
  file?: File;
  url?: string;
  title: string;
  meta?: Record<string, string>;
}

export interface VideoInfo {
  id: string;
  playbackUrl: string;
  thumbnailUrl: string;
  duration: number;
  status: 'queued' | 'processing' | 'ready' | 'error';
  size?: number;
}

export interface LiveStreamInput {
  title: string;
  mode?: 'automatic' | 'manual';
}

export interface LiveStreamInfo {
  id: string;
  streamKey: string;
  rtmpsUrl: string;
  playbackUrl: string;
  status: 'connected' | 'disconnected';
}

export interface VideoProvider {
  uploadVideo(input: VideoUploadInput): Promise<VideoInfo>;
  getVideo(videoId: string): Promise<VideoInfo>;
  deleteVideo(videoId: string): Promise<void>;
  createLiveStream(input: LiveStreamInput): Promise<LiveStreamInfo>;
  getLiveStream(streamId: string): Promise<LiveStreamInfo>;
  getPlaybackUrl(videoId: string, options?: { signed?: boolean; expiresIn?: number }): string;
}

// =============================================================================
// Cloudflare Stream Implementation
// =============================================================================

export class CloudflareStreamProvider implements VideoProvider {
  private accountId: string;
  private apiToken: string;
  private baseUrl: string;

  constructor(accountId: string, apiToken: string) {
    this.accountId = accountId;
    this.apiToken = apiToken;
    this.baseUrl = `https://api.cloudflare.com/client/v4/accounts/${accountId}/stream`;
  }

  async uploadVideo(input: VideoUploadInput): Promise<VideoInfo> {
    let response: Response;

    if (input.url) {
      response = await fetch(`${this.baseUrl}/copy`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${this.apiToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          url: input.url,
          meta: { name: input.title, ...input.meta },
        }),
      });
    } else {
      throw new Error('Direct file upload requires TUS protocol. Use URL-based upload or signed upload URLs.');
    }

    if (!response.ok) {
      throw new Error(`Cloudflare Stream upload error: ${response.status}`);
    }

    const data = await response.json();
    const video = data.result;

    return {
      id: video.uid,
      playbackUrl: `https://customer-${this.accountId}.cloudflarestream.com/${video.uid}/manifest/video.m3u8`,
      thumbnailUrl: `https://customer-${this.accountId}.cloudflarestream.com/${video.uid}/thumbnails/thumbnail.jpg`,
      duration: video.duration || 0,
      status: video.status?.state === 'ready' ? 'ready' : 'processing',
      size: video.size,
    };
  }

  async getVideo(videoId: string): Promise<VideoInfo> {
    const response = await fetch(`${this.baseUrl}/${videoId}`, {
      headers: { Authorization: `Bearer ${this.apiToken}` },
    });

    if (!response.ok) throw new Error(`Video not found: ${videoId}`);

    const data = await response.json();
    const video = data.result;

    return {
      id: video.uid,
      playbackUrl: `https://customer-${this.accountId}.cloudflarestream.com/${video.uid}/manifest/video.m3u8`,
      thumbnailUrl: `https://customer-${this.accountId}.cloudflarestream.com/${video.uid}/thumbnails/thumbnail.jpg`,
      duration: video.duration || 0,
      status: video.status?.state === 'ready' ? 'ready' : 'processing',
      size: video.size,
    };
  }

  async deleteVideo(videoId: string): Promise<void> {
    const response = await fetch(`${this.baseUrl}/${videoId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${this.apiToken}` },
    });

    if (!response.ok) throw new Error(`Failed to delete video: ${videoId}`);
  }

  async createLiveStream(input: LiveStreamInput): Promise<LiveStreamInfo> {
    const response = await fetch(`${this.baseUrl}/live_inputs`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.apiToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        meta: { name: input.title },
        recording: { mode: input.mode || 'automatic' },
      }),
    });

    if (!response.ok) throw new Error(`Failed to create live stream: ${response.status}`);

    const data = await response.json();
    const stream = data.result;

    return {
      id: stream.uid,
      streamKey: stream.rtmps?.streamKey || '',
      rtmpsUrl: stream.rtmps?.url || '',
      playbackUrl: `https://customer-${this.accountId}.cloudflarestream.com/${stream.uid}/manifest/video.m3u8`,
      status: 'disconnected',
    };
  }

  async getLiveStream(streamId: string): Promise<LiveStreamInfo> {
    const response = await fetch(`${this.baseUrl}/live_inputs/${streamId}`, {
      headers: { Authorization: `Bearer ${this.apiToken}` },
    });

    if (!response.ok) throw new Error(`Live stream not found: ${streamId}`);

    const data = await response.json();
    const stream = data.result;

    return {
      id: stream.uid,
      streamKey: stream.rtmps?.streamKey || '',
      rtmpsUrl: stream.rtmps?.url || '',
      playbackUrl: `https://customer-${this.accountId}.cloudflarestream.com/${stream.uid}/manifest/video.m3u8`,
      status: stream.status?.current?.state === 'connected' ? 'connected' : 'disconnected',
    };
  }

  getPlaybackUrl(videoId: string): string {
    return `https://customer-${this.accountId}.cloudflarestream.com/${videoId}/manifest/video.m3u8`;
  }
}

// =============================================================================
// Factory
// =============================================================================

let videoProviderInstance: VideoProvider | null = null;

export function getVideoProvider(): VideoProvider {
  if (!videoProviderInstance) {
    const accountId = process.env.CLOUDFLARE_ACCOUNT_ID;
    const apiToken = process.env.CLOUDFLARE_STREAM_API_TOKEN;

    if (!accountId || !apiToken || accountId === 'placeholder') {
      videoProviderInstance = new MockVideoProvider();
    } else {
      videoProviderInstance = new CloudflareStreamProvider(accountId, apiToken);
    }
  }
  return videoProviderInstance;
}

// =============================================================================
// Mock Provider
// =============================================================================

class MockVideoProvider implements VideoProvider {
  async uploadVideo(input: VideoUploadInput): Promise<VideoInfo> {
    return {
      id: `mock-${Date.now()}`,
      playbackUrl: '',
      thumbnailUrl: '',
      duration: 0,
      status: 'ready',
    };
  }

  async getVideo(videoId: string): Promise<VideoInfo> {
    return {
      id: videoId,
      playbackUrl: '',
      thumbnailUrl: '',
      duration: 600,
      status: 'ready',
    };
  }

  async deleteVideo(): Promise<void> {}

  async createLiveStream(input: LiveStreamInput): Promise<LiveStreamInfo> {
    return {
      id: `mock-live-${Date.now()}`,
      streamKey: 'mock-stream-key',
      rtmpsUrl: 'rtmps://mock.stream/live',
      playbackUrl: '',
      status: 'disconnected',
    };
  }

  async getLiveStream(streamId: string): Promise<LiveStreamInfo> {
    return {
      id: streamId,
      streamKey: 'mock-stream-key',
      rtmpsUrl: 'rtmps://mock.stream/live',
      playbackUrl: '',
      status: 'disconnected',
    };
  }

  getPlaybackUrl(videoId: string): string {
    return `https://mock-stream.example.com/${videoId}`;
  }
}
