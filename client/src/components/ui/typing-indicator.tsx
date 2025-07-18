import { motion } from 'framer-motion';

interface TypingIndicatorProps {
  userNames: string[];
}

export function TypingIndicator({ userNames }: TypingIndicatorProps) {
  if (userNames.length === 0) return null;

  const displayText = userNames.length === 1 
    ? `${userNames[0]} is typing...`
    : `${userNames.slice(0, -1).join(', ')} and ${userNames[userNames.length - 1]} are typing...`;

  return (
    <div className="flex items-center space-x-2 text-sm text-gray-500 px-3 py-2">
      <div className="flex space-x-1">
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            className="w-2 h-2 bg-gray-400 rounded-full"
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.5, 1, 0.5],
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              delay: i * 0.2,
            }}
          />
        ))}
      </div>
      <span>{displayText}</span>
    </div>
  );
}
