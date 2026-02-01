/**
 * To extract text content from an HTML element for VoiceOver reading.
 * Usage: const textToRead = extractTextContent(event.currentTarget);
 */
export const extractTextContent = (element) => {
  if (!element) return '';
  
  // Use textContent which gets all visible text
  let text = element.textContent || element.innerText || '';
  
  // Clean the text (remove multiple spaces, line breaks)
  text = text.replace(/\s+/g, ' ').trim();
  
  // Limitation of the length to avoid overly long speeches
  if (text.length > 200) {
    text = text.substring(0, 200) + '...';
  }
  
  return text;
};

/**
 * Helper to create VoiceOver handlers for focus and mouse enter events.
 * Usage: <button {...createVoiceOverHandlers(speak, "Text to read")}>
 * Or: <button {...createVoiceOverHandlers(speak)}>Automatically extracted text</button>
 */
export const createVoiceOverHandlers = (speak, textOverride = null) => ({
  onFocus: (e) => {
    const text = textOverride || extractTextContent(e.currentTarget);
    if (text) speak(text);
  },
  onMouseEnter: (e) => {
    const text = textOverride || extractTextContent(e.currentTarget);
    if (text) speak(text);
  }
});

export default { extractTextContent, createVoiceOverHandlers };
