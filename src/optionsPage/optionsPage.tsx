import { useState, useEffect } from "react"; // FIX: 'React' has been removed from this line.

function OptionsPage() {
  const [apiKey, setApiKey] = useState("");
  const [status, setStatus] = useState("");

  // Load the saved API key when the component mounts
  useEffect(() => {
    chrome.storage.local.get(["geminiApiKey"], (result) => {
      if (result.geminiApiKey) {
        setApiKey(result.geminiApiKey);
      }
    });
  }, []);

  const handleSave = () => {
    if (!apiKey.trim()) {
      setStatus("API Key cannot be empty.");
      return;
    }
    chrome.storage.local.set({ geminiApiKey: apiKey }, () => {
      setStatus("API Key saved successfully!");
      setTimeout(() => setStatus(""), 2000); // Clear status after 2 seconds
    });
  };

  return (
    <div className="p-8 min-h-screen bg-gray-50">
      <div className="max-w-xl mx-auto bg-white p-6 rounded-lg shadow-md">
        <h1 className="text-2xl font-bold text-gray-800 mb-4">
          3000World Settings
        </h1>

        <div className="mb-6">
          <label
            htmlFor="apiKey"
            className="block text-lg font-medium text-gray-700 mb-2"
          >
            Gemini API Key
          </label>
          <p className="text-sm text-gray-500 mb-2">
            You can get a free API key from{" "}
            <a
              href="https://makersuite.google.com/app/apikey"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline"
            >
              Google AI Studio
            </a>
            .
          </p>
          <input
            type="password"
            id="apiKey"
            className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            placeholder="Enter your Gemini API Key"
          />
        </div>

        <div className="flex items-center">
          <button
            onClick={handleSave}
            className="bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Save Key
          </button>
          {status && <p className="ml-4 text-sm text-green-600">{status}</p>}
        </div>
      </div>
    </div>
  );
}

export default OptionsPage;
