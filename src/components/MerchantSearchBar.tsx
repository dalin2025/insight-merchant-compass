
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";

interface MerchantSearchBarProps {
  onSearch: (term: string) => void;
  searchTerm: string;
}

const MerchantSearchBar = ({ onSearch, searchTerm }: MerchantSearchBarProps) => {
  return (
    <div className="relative w-full max-w-md">
      <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
        <Search className="h-4 w-4 text-gray-500" />
      </div>
      <Input 
        type="search" 
        placeholder="Search by MID" 
        className="pl-10 py-2 bg-white"
        value={searchTerm}
        onChange={(e) => onSearch(e.target.value)}
      />
    </div>
  );
};

export default MerchantSearchBar;
