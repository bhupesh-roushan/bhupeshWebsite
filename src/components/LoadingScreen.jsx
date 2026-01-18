import { useEffect, useState } from "react";
import icon from "./../assets/icon.svg";
export const LoadingScreen = ({ onComplete }) => {
  const [text, setText] = useState("");
  const fullText = "<Hi,There!🤖 I'm Bhupesh/>";

  useEffect(() => {
    let index = 0;
    const interval = setInterval(() => {
      setText(fullText.substring(0, index));
      index++;

      if (index > fullText.length) {
        clearInterval(interval);

        setTimeout(() => {
          onComplete();
        }, 1000);
      }
    }, 100);

    return () => clearInterval(interval);
  }, [onComplete]);

  return (
    <div className="fixed inset-0 z-50 bg-black text-gray-100 flex flex-col items-center justify-center">
      <div className="my-10  ">
        <img src={icon} alt="" />
      </div>
      <div className="mb-4 text-4xl font-mono font-bold bg-gradient-to-r from-blue-600 to-orange-500 bg-clip-text text-transparent">
        {text} <span className="animate-blink ml-1"> | </span>
      </div>

      <div className="w-[200px] h-[2px] bg-gray-800 rounded relative overflow-hidden">

        <div className="w-[40%] h-full bg-gradient-to-r from-orange-500 to-blue-500 shadow-[0_0_15px_#3b82f6] animate-loading-bar"></div>

      </div>
    </div>
  );
};
