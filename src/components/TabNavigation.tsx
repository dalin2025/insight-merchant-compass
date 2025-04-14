
import { useState } from "react";
import { cn } from "@/lib/utils";

type Tab = {
  id: string;
  label: string;
};

type TabNavigationProps = {
  tabs: Tab[];
  activeTab: string;
  onTabChange: (tabId: string) => void;
};

const TabNavigation = ({ tabs, activeTab, onTabChange }: TabNavigationProps) => {
  return (
    <div className="border-b border-border">
      <nav className="flex px-6">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={cn(
              "px-4 py-3 font-medium text-sm transition-colors relative",
              activeTab === tab.id
                ? "text-razorpay-blue"
                : "text-razorpay-gray hover:text-razorpay-dark"
            )}
          >
            {tab.label}
            {activeTab === tab.id && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-razorpay-blue" />
            )}
          </button>
        ))}
      </nav>
    </div>
  );
};

export default TabNavigation;
