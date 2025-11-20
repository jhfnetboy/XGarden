/**
 * Defines the standard interface for any AI service provider.
 * This allows the application to interact with different AIs (Gemini, Claude, etc.)
 * or different methods (DOM manipulation, API calls) in a uniform way.
 */
export interface AIProvider {
  /**
   * A unique identifier for the provider (e.g., 'gemini-dom', 'claude-api').
   */
  getId(): string;

  /**
   * A user-friendly name for the provider (e.g., 'Gemini (Web)', 'Claude API').
   */
  getName(): string;

  /**
   * Initializes the provider, performing any necessary setup,
   * like opening a tab or verifying an API key.
   */
  initialize(): Promise<void>;

  /**
   * Sends a message or prompt to the AI service.
   * @param message The text content to send.
   */
  sendMessage(message: string): Promise<void>;

  /**
   * Registers a callback function to be invoked when a new response is received from the AI.
   * @param callback The function that will handle the AI's response text.
   */
  onResponse(callback: (response: string) => void): void;

  /**
   * Tears down the provider, cleaning up any resources like closing tabs or aborting connections.
   */
  cleanup(): Promise<void>;
}
