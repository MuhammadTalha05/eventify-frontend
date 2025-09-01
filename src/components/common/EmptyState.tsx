import { FC } from "react";
import { FiAlertCircle } from "react-icons/fi";

interface EmptyStateProps {
  message?: string;
}

const EmptyState: FC<EmptyStateProps> = ({ message = "Oops! Nothing found." }) => (
  <div className="flex flex-col items-center justify-center py-20">
    <FiAlertCircle className="text-6xl text-gray-400 mb-4" />
    <p className="text-gray-500 text-lg text-center">{message}</p>
  </div>
);

export default EmptyState;