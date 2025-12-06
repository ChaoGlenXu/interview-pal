import { useEffect } from 'react';

interface GradientChatbotProps {
  agentId?: string;
  chatbotId?: string;
  primaryColor?: string;
  secondaryColor?: string;
  buttonBackgroundColor?: string;
  startingMessage?: string;
}

const GradientChatbot = ({
  agentId = "5175f240-d2a2-11f0-b074-4e013e2ddde4",
  chatbotId = "RlitwnxzqC921uSkdOr_EHemgjyrMSDK",
  primaryColor = "#031B4E",
  secondaryColor = "#E5E8ED",
  buttonBackgroundColor = "#0061EB",
  startingMessage = "Hello! I'm your AI career coach. Ask me about interview tips, resume feedback, or practice questions!"
}: GradientChatbotProps) => {
  useEffect(() => {
    // Check if script already exists
    const existingScript = document.querySelector('script[data-chatbot-id]');
    if (existingScript) return;

    const script = document.createElement('script');
    script.async = true;
    script.src = "https://fniauf5cqrhxslq46r4ech3e.agents.do-ai.run/static/chatbot/widget.js";
    script.setAttribute('data-agent-id', agentId);
    script.setAttribute('data-chatbot-id', chatbotId);
    script.setAttribute('data-name', 'InterviewAI Coach');
    script.setAttribute('data-primary-color', primaryColor);
    script.setAttribute('data-secondary-color', secondaryColor);
    script.setAttribute('data-button-background-color', buttonBackgroundColor);
    script.setAttribute('data-starting-message', startingMessage);
    script.setAttribute('data-logo', '/static/chatbot/icons/default-agent.svg');

    document.body.appendChild(script);

    return () => {
      // Cleanup on unmount
      const scriptToRemove = document.querySelector('script[data-chatbot-id]');
      if (scriptToRemove) {
        document.body.removeChild(scriptToRemove);
      }
      // Remove the chatbot widget if it exists
      const widget = document.querySelector('[class*="do-chatbot"]');
      if (widget) {
        widget.remove();
      }
    };
  }, [agentId, chatbotId, primaryColor, secondaryColor, buttonBackgroundColor, startingMessage]);

  return null; // This component only loads the script
};

export default GradientChatbot;
