import { AIProvider } from "./AIProvider";

// FINAL FIX: Using a model name confirmed to be in your available list.
const API_ENDPOINT =
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-pro-latest:generateContent";

export class GeminiAPIProvider implements AIProvider {
  private responseCallback: ((response: string) => void) | null = null;
  private apiKey: string | null = null;

  public getId(): string {
    return "gemini-api";
  }

  public getName(): string {
    return "Gemini (Official API)";
  }

  public async initialize(): Promise<void> {
    const result = await chrome.storage.local.get(["geminiApiKey"]);
    if (result.geminiApiKey) {
      this.apiKey = result.geminiApiKey;
      console.log("Gemini API Provider initialized with a stored API key.");
    } else {
      console.error("Gemini API key not found in storage.");
      throw new Error(
        "API Key is not set. Please set it in the extension options.",
      );
    }
  }

  public async sendMessage(message: string): Promise<void> {
    if (!this.apiKey) {
      throw new Error("Provider not initialized or API key is missing.");
    }

    try {
      const response = await fetch(`${API_ENDPOINT}?key=${this.apiKey}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [{ text: message }],
            },
          ],
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error("Gemini API request failed:", errorData);
        throw new Error(`API Error: ${errorData.error.message}`);
      }

      const responseData = await response.json();
      const text = responseData.candidates[0]?.content.parts[0]?.text;

      if (text && this.responseCallback) {
        this.responseCallback(text);
      } else {
        console.error(
          "Could not extract text from Gemini API response:",
          responseData,
        );
        if (this.responseCallback) {
          this.responseCallback(
            "[Error: Received an empty or invalid response from the API.]",
          );
        }
      }
    } catch (error) {
      console.error("Failed to send message via Gemini API:", error);
      if (this.responseCallback) {
        this.responseCallback(`[Error: ${(error as Error).message}]`);
      }
    }
  }

  public onResponse(callback: (response: string) => void): void {
    this.responseCallback = callback;
  }

  public async cleanup(): Promise<void> {
    this.apiKey = null;
    return Promise.resolve();
  }
}
