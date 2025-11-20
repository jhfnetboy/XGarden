console.log("3000World content script loaded. Version 4.");

// FIX: Added the missing interface definition
interface ChatElements {
  inputArea: HTMLElement | null;
  sendButton: HTMLElement | null;
  responseContainer: HTMLElement | null;
}

function findChatElements(): ChatElements {
  console.log("Attempting to find real chat elements on the page...");
  const inputArea: HTMLElement | null = document.querySelector(
    'rich-textarea [contenteditable="true"]',
  );
  const sendButton: HTMLElement | null = document.querySelector(
    'button[aria-label*="Send message"]',
  );
  const responseContainer: HTMLElement | null = document.querySelector(
    ".chat-history .message-list",
  ); // This is a guess
  const elements: ChatElements = { inputArea, sendButton, responseContainer };
  if (!elements.inputArea)
    console.warn("Dynamic search failed to find input area.");
  if (!elements.sendButton)
    console.warn("Dynamic search failed to find send button.");
  if (!elements.responseContainer)
    console.warn("Dynamic search failed to find response container.");
  console.log("Found elements:", elements);
  return elements;
}

function sendMessageToPage(elements: ChatElements, message: string): void {
  if (elements.inputArea && elements.sendButton) {
    console.log(`Attempting to input message: "${message}"`);
    elements.inputArea.innerText = message;
    if (!(elements.sendButton as HTMLButtonElement).disabled) {
      elements.sendButton.click();
    } else {
      console.error("Send button is disabled.");
    }
  } else {
    console.error(
      "Cannot send message: could not find input area or send button.",
    );
  }
}

function observeResponses(elements: ChatElements) {
  if (elements.responseContainer) {
    console.log(
      "Setting up MutationObserver for responses on:",
      elements.responseContainer,
    );
    const observer = new MutationObserver((_mutations) => {
      const newResponseText = "AI response scraped from DOM (placeholder)";
      console.log(`Scraped new response: "${newResponseText}"`);
      chrome.runtime.sendMessage({
        type: "AI_RESPONSE",
        data: newResponseText,
      });
    });
    observer.observe(elements.responseContainer, {
      childList: true,
      subtree: true,
    });
    console.log("MutationObserver is now active.");
  } else {
    console.error(
      "Cannot observe responses: could not find response container.",
    );
  }
}

// Main listener for messages from the background script
chrome.runtime.onMessage.addListener((request, _sender, sendResponse) => {
  if (request.type === "SEND_MESSAGE_TO_PAGE") {
    console.log("Received SEND_MESSAGE_TO_PAGE request", request);
    const elements = findChatElements();
    if (elements.inputArea) {
      sendMessageToPage(elements, request.message);
      observeResponses(elements);
      sendResponse({ status: "Message sent to page." });
    } else {
      sendResponse({ status: "Failed to find chat elements on page." });
    }
  } else if (request.type === "PING") {
    console.log("Received PING, sending PONG.");
    sendResponse({ status: "PONG" });
  }
  return true; // Indicates an async response.
});

// Initial setup when the script is injected
console.log("Performing initial setup of content script.");
const initialElements = findChatElements();
observeResponses(initialElements);
