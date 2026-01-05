import React from 'react';

interface MarkdownTextProps {
  content: string;
}

const MarkdownText: React.FC<MarkdownTextProps> = ({ content }) => {
  // A very simple formatter to handle bolding and paragraphs often returned by Gemini
  const formatText = (text: string) => {
    return text.split('\n').map((line, index) => {
      // Basic bold parsing for **text**
      const parts = line.split(/(\*\*.*?\*\*)/g);
      
      const formattedLine = parts.map((part, i) => {
        if (part.startsWith('**') && part.endsWith('**')) {
          return <strong key={i} className="font-semibold text-gray-900">{part.slice(2, -2)}</strong>;
        }
        return part;
      });

      if (line.trim() === '') return <br key={index} />;
      
      return (
        <p key={index} className="mb-2 text-gray-700 leading-relaxed">
          {formattedLine}
        </p>
      );
    });
  };

  return <div className="prose prose-blue max-w-none">{formatText(content)}</div>;
};

export default MarkdownText;