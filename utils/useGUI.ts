import { useCallback, useEffect, useState } from "react";
import GUI from "lil-gui";

export const useGUI = (setupGUI: (gui: GUI) => void, title?: string) => {
   const [gui, setGUIState] = useState<GUI | null>(null);

   useEffect(() => {
      if (!gui) {
         const newGui = new GUI({
            closeFolders: true,
            width: 240,
            title,
         });
         setGUIState(newGui);
         setupGUI(newGui);
      }
      return () => {
         if (gui) {
            gui?.destroy();
            setGUIState(null);
         }
      };
   }, [gui, setupGUI, title]);

   const updateDisplays = useCallback(() => {
      gui?.folders.forEach((folder) =>
         folder.controllers.forEach((controller) => controller.updateDisplay())
      );
   }, [gui]);
   return updateDisplays;
};
