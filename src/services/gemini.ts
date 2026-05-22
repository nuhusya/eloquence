export async function askGemini(prompt: string, systemInstruction?: string) {
  try {
    const response = await fetch("/api/gemini", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ prompt, systemInstruction }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data.text;
  } catch (error: any) {
    console.error("Gemini Service Error:", error);
    if (error.message?.includes("API Key is missing")) {
      return "Error: Gemini API Key is not configured on the server. Please check environment variables.";
    }
    return "An error occurred while communicating with the AI. Please try again later.";
  }
}
