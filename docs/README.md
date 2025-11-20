# 3000World - AI-Powered Chrome Extension Game

## Development Plan

This document outlines the development plan for "3000World", a Chrome extension that functions as a web game, leveraging the user's currently logged-in AI service session (like Google Gemini or Claude) to drive dynamic, AI-powered game narratives.

---

### 1. Core Architecture

The core of this project is to enable a Chrome extension to communicate with an AI chat service without requiring an API key, by programmatically interacting with the service's web interface.

-   **Visible Interaction Page**: The extension will explicitly open and interact with a visible AI service tab (e.g., `gemini.google.com`, `claude.ai`). This provides transparency and aids in debugging.
-   **Communication Flow**: The interaction follows a clear path:
    1.  **UI (Popup/Side Panel)**: Captures user's game input.
    2.  **Background Script**: Manages game state and orchestrates communication. It instructs the content script what to do.
    3.  **Content Script**: Injected into the AI service's page, it performs the actions.
-   **Dynamic DOM Analysis (Key Innovation)**: To avoid breaking when the AI service updates its UI, the content script will not use hardcoded CSS selectors. Instead, it will **dynamically analyze the page's DOM** to locate the necessary elements (e.g., input text areas, send buttons, response containers) based on attributes like `aria-label`, element roles, or structural relationships. This makes the extension significantly more robust.
-   **Modular Provider Model**: To support multiple AI services, the architecture will use a provider pattern.
    -   A `BaseProvider` interface will define common methods (`initialize`, `sendMessage`, `getResponse`).
    -   Concrete implementations (`GeminiDOMProvider`, `ClaudeDOMProvider`) will handle the specific DOM manipulation logic for each service.
    -   This allows for easy expansion to new AI services or different interaction methods (like API-based providers).

---

### 2. Development Phases

#### Phase 1: Foundation & Project Setup

-   **[In Progress] Task**: Find and select a modern Chrome extension template.
    -   **Criteria**: Vite, React, TypeScript.
-   **Task**: Initialize the project using the chosen template within the `3000World/extension` directory.
-   **Task**: Define the `BaseProvider` TypeScript interface.

#### Phase 2: Gemini DOM Provider Implementation

-   **Task**: Implement the `GeminiDOMProvider`.
-   **Task**: Develop the logic for the background script to manage the `gemini.google.com` tab.
-   **Task**: Build the content script with the **dynamic DOM analysis** logic to find and interact with Gemini's chat interface.
-   **Task**: Create a basic UI (popup) to send a test message and display the AI's response, proving the core communication channel works.

#### Phase 3: Game Logic & Core Features

-   **Task**: Design and implement a simple text-based RPG game loop.
-   **Task**: Use `chrome.storage.local` to persist game state (dialogue history, character stats).
-   **Task**: Integrate `chrome.identity` to fetch the user's Google profile information for in-game identity.
-   **Task**: Implement the "Upload Script" feature, allowing users to load a `.txt` or `.md` file as the initial game prompt/world setting.

#### Phase 4: Expansion & Refinement

-   **Task**: Implement a `ClaudeDOMProvider` to support `claude.ai`.
-   **Task**: Create a settings page where users can select their desired AI Provider.
-   **Task**: Enhance UI/UX with features like loading indicators, error messages, and a more immersive design.
-   **Task**: Thoroughly test and handle edge cases (e.g., AI page not loading, network errors).

---

### 3. Alternative (Stable) Plan: API-Based Providers

As a parallel or future enhancement, we will also implement API-based providers (`GeminiAPIProvider`, `ClaudeAPIProvider`).

-   **Method**: These providers will use official APIs, requiring the user to enter their own (often free-tier) API key in the extension's settings.
-   **Benefits**:
    -   **Maximum Stability**: Not affected by website UI changes.
    -   **Higher Performance**: Faster and more efficient than DOM manipulation.
    -   **Simpler Logic**: Less complex code than dynamic DOM analysis.

This dual approach allows users to choose between the session-based method (no key required) and the more stable API-based method.
