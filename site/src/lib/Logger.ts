class LoggerClass {
	Info(message: string, ...args: unknown[]): void {
		console.log(`[INFO] ${message}`, ...args);
	}

	Debug(message: string, ...args: unknown[]): void {
		if (import.meta.env.DEV) {
			console.debug(`[DEBUG] ${message}`, ...args);
		}
	}

	Warn(message: string, ...args: unknown[]): void {
		console.warn(`[WARN] ${message}`, ...args);
	}

	Error(message: string, error?: unknown): void {
		console.error(`[ERROR] ${message}`, error);
	}
}

export const Logger = new LoggerClass();
