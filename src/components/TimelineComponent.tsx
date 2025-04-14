
import { cn } from "@/lib/utils";

type TimelineStatus = "completed" | "current" | "pending";

type TimelineStep = {
  id: number;
  name: string;
  status: TimelineStatus;
  date?: string;
};

type TimelineComponentProps = {
  steps: TimelineStep[];
};

const TimelineComponent = ({ steps }: TimelineComponentProps) => {
  return (
    <div className="flex items-center space-x-2 py-4">
      {steps.map((step, index) => (
        <div key={step.id} className="flex flex-col items-center">
          <div className="flex items-center">
            <div
              className={cn(
                "timeline-dot",
                {
                  "timeline-dot-completed": step.status === "completed",
                  "timeline-dot-current": step.status === "current",
                  "timeline-dot-pending": step.status === "pending",
                }
              )}
            />
            {index < steps.length - 1 && (
              <div className={cn(
                "h-[2px] w-16", 
                step.status === "completed" ? "bg-razorpay-green" : "bg-gray-200"
              )} />
            )}
          </div>
          <div className="mt-2 text-center">
            <p className={cn(
              "text-xs font-medium",
              {
                "text-razorpay-green": step.status === "completed",
                "text-razorpay-blue": step.status === "current",
                "text-gray-400": step.status === "pending",
              }
            )}>
              {step.name}
            </p>
            {step.date && (
              <p className="text-xs text-gray-400 mt-1">{step.date}</p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default TimelineComponent;
