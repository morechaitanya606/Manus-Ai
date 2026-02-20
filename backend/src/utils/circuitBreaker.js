const STATES = {
  CLOSED: 'closed',
  OPEN: 'open',
  HALF_OPEN: 'half_open'
};

class CircuitBreaker {
  constructor({
    name = 'external-service',
    enabled = false,
    failureThreshold = 5,
    resetTimeoutMs = 30000
  } = {}) {
    this.name = name;
    this.enabled = Boolean(enabled);
    this.failureThreshold = Math.max(1, Number(failureThreshold) || 5);
    this.resetTimeoutMs = Math.max(1000, Number(resetTimeoutMs) || 30000);

    this.state = STATES.CLOSED;
    this.failureCount = 0;
    this.openUntil = 0;
  }

  isOpen() {
    if (!this.enabled) return false;
    if (this.state !== STATES.OPEN) return false;

    if (Date.now() >= this.openUntil) {
      this.state = STATES.HALF_OPEN;
      return false;
    }

    return true;
  }

  onSuccess() {
    this.failureCount = 0;
    this.state = STATES.CLOSED;
    this.openUntil = 0;
  }

  onFailure() {
    if (!this.enabled) return;

    this.failureCount += 1;

    if (this.state === STATES.HALF_OPEN || this.failureCount >= this.failureThreshold) {
      this.state = STATES.OPEN;
      this.openUntil = Date.now() + this.resetTimeoutMs;
    }
  }

  getSnapshot() {
    return {
      name: this.name,
      enabled: this.enabled,
      state: this.state,
      failureCount: this.failureCount,
      openUntil: this.openUntil || null
    };
  }

  async fire(operation) {
    if (this.isOpen()) {
      const error = new Error(`Circuit is open for ${this.name}`);
      error.statusCode = 503;
      error.code = 'CIRCUIT_OPEN';
      throw error;
    }

    try {
      const result = await operation();
      this.onSuccess();
      return result;
    } catch (error) {
      this.onFailure();
      throw error;
    }
  }
}

module.exports = {
  CircuitBreaker,
  STATES
};
