import {
  FileText,
  PenToolIcon as Tool,
  XCircle,
  Upload,
  LockIcon,
  ArrowDown,
} from "lucide-react";
import { useDarkReader } from "@/hooks/useDarkReader";
import { cn } from "@/lib/utils";

export default function PrivateSecureFinancialAnalysis() {
  const isDarkReader = useDarkReader();
  return (
    <div className="container mx-auto px-4 md:py-12 relative">
      <div>
        <Eyebrow />
        <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl mb-6">
          Private & Secure{" "}
          <span
            className={cn(
              "bg-clip-text text-transparent bg-gradient-to-r from-red-500 via-yellow-500 via-green-500 via-blue-500 to-purple-500",
              // the gradient is not visible in dark reader mode, this is a workaround
              isDarkReader && "text-white"
            )}
          >
            Financial Analysis
          </span>
        </h1>
        <p className="mt-4 text-xl text-gray-600">
          Your privacy comes first. Here's how it works:
        </p>
      </div>

      <ul className="mt-8 space-y-6">
        {[
          {
            icon: Upload,
            text: "Upload your financial document (PDF format)",
            color: "text-blue-500",
          },
          {
            icon: FileText,
            text: "Select specific pages from your financial documents",
            color: "text-blue-500",
          },
          {
            icon: Tool,
            text: "Use our Privacy Tool to redact sensitive information",
            color: "text-blue-500",
          },
          {
            icon: XCircle,
            text: "Automatic rejection of documents containing sensitive data",
            color: "text-rose-500",
          },
          {
            icon: ArrowDown,
            text: "Export to CSV and be on your way",
            color: "text-blue-500",
          },
        ].map((item, index) => (
          <li key={index} className="flex items-center space-x-3">
            <div className="flex-shrink-0">
              <item.icon className={cn("h-6 w-6", item.color)} />
            </div>

            <p className="text-lg text-gray-700">{item.text}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}

const Eyebrow: React.FC = () => {
  return (
    <div className="mb-6 inline-block rounded-full bg-blue-100 px-4 py-2 w-full md:w-auto border border-blue-300">
      <div className="flex items-center space-x-2 text-blue-700">
        <LockIcon className="h-5 w-5" />
        <div className="flex flex-col md:flex-row md:items-center md:space-x-2">
          <p className="text-sm font-semibold">
            AI-driven insights, zero data storage
          </p>
        </div>
      </div>
    </div>
  );
};
