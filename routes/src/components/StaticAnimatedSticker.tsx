import { useState, useEffect } from "react";

interface AnimatedStickerProps {
  mainText: string;
  subText: string;
  additionalInfo: string[];
}

export function StaticAnimatedSticker({
  mainText,
  subText,
  additionalInfo,
}: AnimatedStickerProps) {
  const [isAnimated, setIsAnimated] = useState(true);

  useEffect(() => {
    try {
      const storedPreference = localStorage.getItem("animationPreference");
      if (storedPreference !== null) {
        setIsAnimated(storedPreference === "true");
      }
    } catch (error) {
      setIsAnimated(false);
    }
  }, []);

  const toggleAnimation = () => {
    const newState = !isAnimated;
    setIsAnimated(newState);
    localStorage.setItem("animationPreference", newState.toString());
  };

  return (
    <>
      <div
        className={`bg-yellow-300 text-black font-bold py-6 px-10 rounded-lg transform md:rotate-6 shadow-lg  mb-4 md:mb-0 ${
          isAnimated ? "animate-bob" : ""
        }`}
      >
        <p className="text-xl mb-1">{mainText}</p>
        <p className="text-3xl mb-2">{subText}</p>
        <ul className="text-sm">
          {additionalInfo.map((info, index) => (
            <li key={index} className="flex items-center mb-1">
              <svg
                className="w-4 h-4 mr-1 text-green-600"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path d="M5 13l4 4L19 7"></path>
              </svg>
              {info}
            </li>
          ))}
        </ul>
      </div>
      <button
        onClick={(e) => {
          e.preventDefault();
          toggleAnimation();
        }}
        className="hidden md:mt-4 md:block text-blue-500 hover:text-blue-700 transition-colors text-sm text-right"
        aria-label={isAnimated ? "Stop animation" : "Start animation"}
      >
        {isAnimated ? "Stop" : "Start"} Animation
      </button>
      <style>{`
        @keyframes bob {
          0%, 100% { transform: translateY(0) rotate(6deg); }
          50% { transform: translateY(-10px) rotate(6deg); }
        }
        .animate-bob {
          animation: bob 2s ease-in-out infinite;
        }
        @media (prefers-reduced-motion: reduce) {
          .animate-bob {
            animation: none;
          }
        }

        @media (max-width: 768px) {
          .animate-bob {
            animation: none;
          }
        }
      `}</style>
    </>
  );
}
