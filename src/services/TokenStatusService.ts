// TokenStatusService - Persistent token validation monitoring
export interface TokenValidationStatus {
  lastValidation: Date | null;
  isTokenValid: boolean | null;
  nextValidation: Date | null;
}

type TokenStatusListener = (status: TokenValidationStatus) => void;

class TokenStatusService {
  private listeners: Set<TokenStatusListener> = new Set();
  private status: TokenValidationStatus = {
    lastValidation: null,
    isTokenValid: null,
    nextValidation: null,
  };
  private updateTimer: NodeJS.Timeout | null = null;
  private originalConsoleLog: typeof console.log | null = null;
  private isMonitoring = false;

  // Initialize monitoring when first listener is added
  private startMonitoring() {
    if (this.isMonitoring) return;
    this.isMonitoring = true;

    // Set up console.log monitoring
    this.originalConsoleLog = console.log;
    console.log = (...args: unknown[]) => {
      const message = args.join(' ');

      if (message.includes('🔍 Validating token')) {
        this.updateStatus({
          lastValidation: new Date(),
          isTokenValid: null, // Validating
          nextValidation: this.status.nextValidation,
        });
      } else if (message.includes('✅ Token is still valid')) {
        this.updateStatus({
          ...this.status,
          isTokenValid: true,
        });
      } else if (message.includes('✅ Token refreshed successfully')) {
        this.updateStatus({
          lastValidation: new Date(),
          isTokenValid: true,
          nextValidation: this.status.nextValidation,
        });
      } else if (message.includes('❌ Token refresh failed')) {
        this.updateStatus({
          ...this.status,
          isTokenValid: false,
        });
      }

      // Call original console.log
      if (this.originalConsoleLog) {
        this.originalConsoleLog(...args);
      }
    };

    // Start timer for next validation updates
    this.startUpdateTimer();
  }

  private startUpdateTimer() {
    if (this.updateTimer) {
      clearInterval(this.updateTimer);
    }

    this.updateTimer = setInterval(() => {
      if (this.status.lastValidation) {
        const next = new Date(this.status.lastValidation.getTime() + 5 * 60 * 1000); // 5 minutes after last validation
        this.updateStatus({
          ...this.status,
          nextValidation: next,
        });
      }
    }, 1000);
  }

  private stopMonitoring() {
    if (!this.isMonitoring) return;
    this.isMonitoring = false;

    // Restore original console.log
    if (this.originalConsoleLog) {
      console.log = this.originalConsoleLog;
      this.originalConsoleLog = null;
    }

    // Clear timer
    if (this.updateTimer) {
      clearInterval(this.updateTimer);
      this.updateTimer = null;
    }
  }

  private updateStatus(newStatus: TokenValidationStatus) {
    this.status = newStatus;
    this.notifyListeners();
  }

  private notifyListeners() {
    this.listeners.forEach(listener => listener(this.status));
  }

  // Public methods
  public addListener(listener: TokenStatusListener): () => void {
    this.listeners.add(listener);
    
    // Start monitoring when first listener is added
    if (this.listeners.size === 1) {
      this.startMonitoring();
    }

    // Send current status immediately
    listener(this.status);

    // Return cleanup function
    return () => {
      this.listeners.delete(listener);
      
      // Stop monitoring when last listener is removed
      if (this.listeners.size === 0) {
        this.stopMonitoring();
      }
    };
  }

  public getStatus(): TokenValidationStatus {
    return { ...this.status };
  }

  public getTimeUntilNext(): string {
    if (!this.status.nextValidation) return "Unknown";
    
    const now = new Date();
    const diff = this.status.nextValidation.getTime() - now.getTime();
    
    if (diff <= 0) return "Any moment now...";
    
    const minutes = Math.floor(diff / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);
    
    if (minutes > 0) {
      return `${minutes}m ${seconds}s`;
    }
    return `${seconds}s`;
  }
}

// Export singleton instance
export const tokenStatusService = new TokenStatusService();
