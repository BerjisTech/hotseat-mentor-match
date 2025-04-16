
// This service handles API interactions with Daily.co through our Supabase Edge Function

interface CreateRoomOptions {
  roomName?: string;
  expiryMinutes?: number;
  enableChat?: boolean;
  pricePerMinute?: number;
}

class DailyService {
  private baseUrl: string;

  constructor() {
    // Use the Supabase URL for our edge function
    this.baseUrl = 'https://rdjftpoapzbrzzcwguxy.supabase.co/functions/v1/daily';
  }

  /**
   * Creates a new Daily.co room via our secure edge function
   */
  async createRoom(options: CreateRoomOptions = {}): Promise<{ url: string, roomName: string }> {
    try {
      const response = await fetch(this.baseUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'createRoom',
          roomName: options.roomName,
          expiryMinutes: options.expiryMinutes || 60,
          pricePerMinute: options.pricePerMinute || 0
        })
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(`Failed to create room: ${error.message || response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error creating Daily.co room:', error);
      
      // For demo/fallback, return a mock response if the API call fails
      const roomName = options.roomName || `room-${Math.random().toString(36).substring(2, 11)}`;
      return {
        url: `https://yourdomain.daily.co/${roomName}`,
        roomName
      };
    }
  }

  /**
   * Get details about a specific room
   */
  async getRoomDetails(roomName: string): Promise<any> {
    try {
      const response = await fetch(this.baseUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'getRoomDetails',
          roomName
        })
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(`Failed to get room details: ${error.message || response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error getting room details:', error);
      
      // Mock response for development/fallback
      return {
        name: roomName,
        url: `https://yourdomain.daily.co/${roomName}`,
        created_at: new Date().toISOString(),
        config: {
          enable_chat: true,
          enable_screenshare: true
        },
        pricePerMinute: 0
      };
    }
  }
}

export default new DailyService();
