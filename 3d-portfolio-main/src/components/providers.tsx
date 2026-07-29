import SocketContextProvider from "@/contexts/socketio";
import Preloader from "./preloader";
import { ThemeProvider } from "./theme-provider";
import { Toaster } from "./ui/toaster";

import { TooltipProvider } from "./ui/tooltip";
import { YoutubeWindowProvider } from "@/contexts/youtube-windows";
import { YoutubeWindowManager } from "./ui/youtube-window-manager";

export const Providers = ({ children }: { children: React.ReactNode }) => {
  return <ThemeProvider
    attribute="class"
    defaultTheme="dark"
    disableTransitionOnChange
  >
    <Preloader>
      <SocketContextProvider>
        <YoutubeWindowProvider>
          <TooltipProvider>
            {children}
          </TooltipProvider>
          <YoutubeWindowManager />
          <Toaster />
        </YoutubeWindowProvider>
      </SocketContextProvider>
    </Preloader>
  </ThemeProvider>;
};
