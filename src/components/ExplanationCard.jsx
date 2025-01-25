import React from "react";
import { motion } from "framer-motion";
import { Crown, BookOpen, Lightbulb } from "lucide-react";

const ExplanationCard = ({ node, explanation }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="relative bg-white/30 backdrop-blur-md rounded-xl border border-white/40 shadow-lg w-full overflow-hidden"
    >
      <div className="p-4 bg-gradient-to-r from-purple-500/10 to-pink-500/10 border-b border-white/30">
        <div className="flex items-center gap-3">
          <Crown className="w-5 h-5 text-purple-600 flex-shrink-0" />
          <h3 className="font-semibold text-gray-800 truncate break-words whitespace-pre-wrap flex-1">
            {node}
          </h3>
        </div>
      </div>

      <div className="p-4 space-y-4">
        <div className="flex gap-3">
          <BookOpen className="w-5 h-5 text-blue-600 mt-1 flex-shrink-0" />
          <div className="text-sm text-gray-700 break-words whitespace-pre-wrap flex-1">
            {explanation.briefExplanation}
          </div>
        </div>

        <div className="flex gap-3">
          <Lightbulb className="w-5 h-5 text-purple-600 mt-1 flex-shrink-0" />
          <div className="flex-1">
            <div className="text-sm text-gray-700 break-words whitespace-pre-wrap">
              <strong className="text-purple-600 font-medium">Example: </strong>
              {explanation.example}
            </div>
          </div>
        </div>

        <div className="text-sm bg-blue-500/10 backdrop-blur-sm p-3 rounded-lg border-l-2 border-blue-400">
          <div className="break-words whitespace-pre-wrap">
            <strong className="text-blue-600 font-medium">
              Key Takeaway:{" "}
            </strong>
            {explanation.keyTakeaway}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default ExplanationCard;
