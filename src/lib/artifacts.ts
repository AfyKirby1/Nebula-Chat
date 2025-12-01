import { Message } from "@/types/chat";
import { Artifact } from "@/contexts/ArtifactContext";

export const extractArtifactsFromMessages = (messages: Message[]): Artifact[] => {
  const artifacts: Artifact[] = [];
  
  messages.forEach((msg) => {
    if (msg.role === 'assistant' && msg.content) {
      // Regex to find code blocks
      const codeBlockRegex = /```(\w+)?\n([\s\S]*?)```/g;
      let match;
      
      while ((match = codeBlockRegex.exec(msg.content)) !== null) {
        const language = match[1] || 'text';
        const content = match[2];
        
        // Filter for relevant languages
        if (['html', 'css', 'js', 'javascript', 'jsx', 'tsx', 'react', 'typescript', 'ts'].includes(language.toLowerCase())) {
          // Generate a title based on content or generic
          let title = "Untitled Artifact";
          const titleMatch = content.match(/<title>(.*?)<\/title>/);
          if (titleMatch) {
            title = titleMatch[1];
          } else if (language === 'html') {
             title = "HTML Page";
          } else if (language === 'css') {
             title = "Style Sheet";
          } else {
             title = "Code Snippet";
          }
          
          // Try to find a better title from previous lines in message? Too complex for now.
          
          artifacts.push({
            id: `${msg.id}-${match.index}`, // Unique ID
            title,
            content,
            language,
            type: language === 'html' ? 'html' : 'code',
            createdAt: msg.createdAt || Date.now() // Assuming message has timestamp or use now
          });
        }
      }
    }
  });
  
  return artifacts.reverse(); // Newest first
};
