"use client";

import { Suspense, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { Perf } from "r3f-perf";
import { PerformanceMonitor } from "@react-three/drei";

const Loading = () => {
   return (
      <div
         style={{
            fontSize: "18px",
            color: "white",
            position: "fixed",
            bottom: "16px",
            left: "16px",
         }}>
         Loading...
      </div>
   );
};

export const ShaderFx = ({
   children,
   preserveDrawingBuffer = false,
   shadows = false,
   isDprUpdate = true,
   eventSource,
}: {
   children: React.ReactNode;
   preserveDrawingBuffer?: boolean;
   shadows?: boolean;
   isDprUpdate?: boolean;
   eventSource?: HTMLElement | React.MutableRefObject<HTMLElement> | undefined;
}) => {
   const [dpr, setDpr] = useState(1.5);
   return (
      <Suspense fallback={<Loading />}>
         <Canvas
            eventSource={eventSource}
            eventPrefix={eventSource ? "client" : "offset"}
            dpr={dpr}
            gl={{ preserveDrawingBuffer: preserveDrawingBuffer }}
            shadows={shadows}
            linear>
            <PerformanceMonitor
               onChange={({ factor }) => {
                  if (preserveDrawingBuffer) {
                     return;
                  }
                  if (!isDprUpdate) {
                     return;
                  }
                  console.log(`dpr:${dpr}`);
                  setDpr(Math.round((0.5 + 1.5 * factor) * 10) / 10);
               }}>
               {children}
               <Perf position={"bottom-left"} minimal={false} />
            </PerformanceMonitor>
         </Canvas>
      </Suspense>
   );
};
