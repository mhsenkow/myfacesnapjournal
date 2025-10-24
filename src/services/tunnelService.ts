/**
 * Tunnel Service - Provides tunneling capabilities for local Ollama server
 * 
 * This service helps expose your local Ollama server to the internet
 * using various tunneling methods.
 */

export interface TunnelConfig {
  method: 'ngrok' | 'cloudflare' | 'manual';
  status: 'disconnected' | 'connecting' | 'connected' | 'error';
  publicUrl?: string;
  error?: string;
}

export interface TunnelService {
  startTunnel(config: Partial<TunnelConfig>): Promise<TunnelConfig>;
  stopTunnel(): Promise<void>;
  getStatus(): TunnelConfig;
  checkTunnelHealth(url: string): Promise<boolean>;
}

class TunnelServiceImpl implements TunnelService {
  private config: TunnelConfig = {
    method: 'ngrok',
    status: 'disconnected'
  };

  async startTunnel(config: Partial<TunnelConfig>): Promise<TunnelConfig> {
    this.config = { ...this.config, ...config, status: 'connecting' };
    
    try {
      switch (this.config.method) {
        case 'ngrok':
          return await this.startNgrokTunnel();
        case 'cloudflare':
          return await this.startCloudflareTunnel();
        case 'manual':
          return await this.startManualTunnel();
        default:
          throw new Error(`Unsupported tunnel method: ${this.config.method}`);
      }
    } catch (error) {
      this.config.status = 'error';
      this.config.error = error instanceof Error ? error.message : 'Unknown error';
      throw error;
    }
  }

  private async startNgrokTunnel(): Promise<TunnelConfig> {
    // Check if ngrok is available
    try {
      // Try to detect if ngrok is running
      const response = await fetch('http://localhost:4040/api/tunnels', {
        method: 'GET',
        signal: AbortSignal.timeout(3000)
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.tunnels && data.tunnels.length > 0) {
          const tunnel = data.tunnels.find((t: any) => t.config.addr === 'http://localhost:11434');
          if (tunnel) {
            this.config.status = 'connected';
            this.config.publicUrl = tunnel.public_url;
            this.config.error = undefined;
            return this.config;
          }
        }
      }
    } catch (error) {
      // ngrok not running or not accessible
    }
    
    // Provide instructions for starting ngrok
    this.config.status = 'connected';
    this.config.publicUrl = 'https://your-ngrok-url.ngrok.io'; // Placeholder
    this.config.error = 'Please run: ngrok http 11434';
    
    return this.config;
  }

  private async startCloudflareTunnel(): Promise<TunnelConfig> {
    // Similar to ngrok, provide instructions
    this.config.status = 'connected';
    this.config.publicUrl = 'https://your-tunnel.trycloudflare.com'; // Placeholder
    this.config.error = 'Please run: cloudflared tunnel --url http://localhost:11434';
    
    return this.config;
  }

  private async startManualTunnel(): Promise<TunnelConfig> {
    // For manual configuration - this would open a dialog for URL input
    this.config.status = 'connected';
    this.config.publicUrl = 'https://your-manual-url.com'; // Placeholder
    this.config.error = 'Please enter your tunnel URL manually';
    
    return this.config;
  }

  async stopTunnel(): Promise<void> {
    this.config.status = 'disconnected';
    this.config.publicUrl = undefined;
    this.config.error = undefined;
  }

  getStatus(): TunnelConfig {
    return { ...this.config };
  }

  async checkTunnelHealth(url: string): Promise<boolean> {
    try {
      const response = await fetch(`${url}/api/tags`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        signal: AbortSignal.timeout(10000) // 10 second timeout
      });
      return response.ok;
    } catch (error) {
      console.warn('Tunnel health check failed:', error);
      return false;
    }
  }
}

export const tunnelService = new TunnelServiceImpl();
