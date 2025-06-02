import { useState, useEffect } from "react";

const DARK_READER_ATTRIBUTE = "data-darkreader-scheme";

export const useDarkReader = () => {
  const [isDarkReader, setIsDarkReader] = useState<boolean>(false);

  useEffect(() => {
    // check initial state
    const checkDarkReader = () => {
      const isDark =
        document.documentElement.getAttribute(DARK_READER_ATTRIBUTE) === "dark";
      setIsDarkReader(isDark);
    };

    // check immediately
    checkDarkReader();

    try {
      // set up mutation observer to watch for changes
      const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
          if (mutation.attributeName === DARK_READER_ATTRIBUTE) {
            checkDarkReader();
          }
        });
      });

      // start observing
      observer.observe(document.documentElement, {
        attributes: true,
        attributeFilter: [DARK_READER_ATTRIBUTE],
      });

      // cleanup
      return () => observer.disconnect();
    } catch (error) {
      console.error(
        "An error occurred while setting up DarkReader observer:",
        error
      );

      checkDarkReader();
    }
  }, []);

  return isDarkReader;
};
