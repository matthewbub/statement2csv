import { useAuthStore } from "@/stores/auth";
import { useAuthCheck } from "@/components/Authorized";

export function PublicLayout({
  children,
  noRegister,
}: {
  children: React.ReactNode;
  noRegister?: boolean;
}) {
  const { isAuthenticated } = useAuthStore();
  useAuthCheck();

  return (
    <div className="flex flex-col min-h-screen mx-auto">
      {/* <header className="px-4 md:px-6 lg:px-12 h-24 flex items-center">
        <a className="flex items-center justify-center" href="/">
          <span className="ml-2 text-lg font-semibold">ZCauldron</span>
        </a>
        <nav className="ml-auto flex gap-8">
          {!isAuthenticated && !noRegister && (
            <>
              <Link
                className="text-[16px] font-medium hover:underline underline-offset-4 h-9 px-4 py-2"
                href="/login"
              >
                Login
              </Link>

              <Button
                variant="outline"
                className="text-[16px] font-medium"
                asChild
              >
                <Link to="/sign-up">Sign up</Link>
              </Button>
            </>
          )}
          {isAuthenticated && (
            <>
              <a
                className="text-[16px] font-medium hover:underline underline-offset-4 h-9 px-4 py-2"
                href="/me"
              >
                Me
              </a>
              <Button
                variant="outline"
                className="text-[16px] font-medium hover:underline underline-offset-4"
                onClick={() => {
                  useAuthStore.getState().useLogout();
                }}
              >
                Logout
              </Button>
            </>
          )}
        </nav>
      </header> */}
      <main className="flex-1 mx-auto">{children}</main>
      <footer className="flex flex-col gap-2 sm:flex-row py-6 w-full shrink-0 items-center px-4 md:px-6 border-t">
        <p className="text-xs text-gray-500 dark:text-gray-400">
          ZCauldron (Self Hosted) © 2025 |
          <a
            className="text-xs hover:underline underline-offset-4"
            href="https://creativecommons.org/licenses/by-nc/4.0/"
          >
            &nbsp;CC BY-NC 4.0
          </a>
          .
        </p>
        <nav className="sm:ml-auto flex gap-4 sm:gap-6">
          <a
            className="text-xs hover:underline underline-offset-4"
            href="https://github.com/matthewbub/zcauldron"
          >
            Repository
          </a>
        </nav>
      </footer>
    </div>
  );
}
