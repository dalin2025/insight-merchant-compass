
import { cn } from "@/lib/utils";

type StatusType = "success" | "error" | "warning" | "info" | "neutral";

type StatusBadgeProps = {
  status: string;
  type: StatusType;
  className?: string;
};

const StatusBadge = ({ status, type, className }: StatusBadgeProps) => {
  const badgeClasses = {
    success: "badge-success",
    error: "badge-error",
    warning: "badge-warning",
    info: "badge-info",
    neutral: "bg-gray-100 text-gray-600",
  };

  return (
    <span className={cn(badgeClasses[type], className)}>
      {status}
    </span>
  );
};

export default StatusBadge;
