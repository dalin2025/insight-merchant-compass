
import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

const DashboardHeader = () => {
  return (
    <header className="bg-white border-b border-border p-4 flex justify-between items-center">
      <div className="flex items-center space-x-4">
        <h1 className="text-2xl font-bold text-razorpay-dark">RazorInsights</h1>
        <span className="text-xs py-0.5 px-2 bg-razorpay-blue/10 text-razorpay-blue rounded">Beta</span>
      </div>

      <div className="flex items-center space-x-4">
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          <span className="absolute -top-1 -right-1 w-2 h-2 bg-razorpay-red rounded-full"></span>
        </Button>
        <Avatar className="h-8 w-8">
          <AvatarFallback className="bg-razorpay-blue text-white text-sm">AM</AvatarFallback>
        </Avatar>
      </div>
    </header>
  );
};

export default DashboardHeader;
