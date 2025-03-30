import { appName } from "@/constants/version";
import Footer from "@/components/Footer";
import { SignUp } from "@clerk/nextjs";
import { dark } from "@clerk/themes";
import Link from "next/link";
import { useTheme } from "next-themes";

export default function Page() {
  const { theme } = useTheme();
  return (
    <div className="flex flex-col h-screen">
      <div className="container mx-auto p-4">
        <Link href="/" className="text-xl font-bold text-primary hover:opacity-80 transition-opacity">
          {appName}
        </Link>
      </div>
      <div className="flex-1 flex justify-center items-center">
        <SignUp
          appearance={{
            baseTheme: theme === "dark" ? dark : undefined,
          }}
        />
      </div>
      <Footer />
    </div>
  );
}
