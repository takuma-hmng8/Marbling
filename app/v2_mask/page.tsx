import { ShaderFx } from "../ShaderFx";
import { Playground } from "./Playground";
import Image from "next/image";

export default function Page() {
   return (
      <div
         style={{
            position: "fixed",
            width: "100%",
            height: "100svh",
            pointerEvents: "none",
            backgroundColor: "white",
         }}>
         <div
            style={{
               position: "absolute",
               width: "100%",
               height: "100svh",
               fontSize: "40px",
            }}>
            くぁwせdrftgyふじこlpくぁwせdrftgyふじこlpくぁwせdrftgyふじこlpくぁwせdrftgyふじこlpくぁwせdrftgyふじこlpくぁwせdrftgyふじこlpくぁwせdrftgyふじこlpくぁwせdrftgyふじこlpくぁwせdrftgyふじこlpくぁwせdrftgyふじこlp
            くぁwせdrftgyふじこlpくぁwせdrftgyふじこlpくぁwせdrftgyふじこlpくぁwせdrftgyふじこlpくぁwせdrftgyふじこlpくぁwせdrftgyふじこlpくぁwせdrftgyふじこlpくぁwせdrftgyふじこlpくぁwせdrftgyふじこlpくぁwせdrftgyふじこlp
            くぁwせdrftgyふじこlpくぁwせdrftgyふじこlpくぁwせdrftgyふじこlpくぁwせdrftgyふじこlpくぁwせdrftgyふじこlpくぁwせdrftgyふじこlpくぁwせdrftgyふじこlpくぁwせdrftgyふじこlpくぁwせdrftgyふじこlpくぁwせdrftgyふじこlp
            くぁwせdrftgyふじこlpくぁwせdrftgyふじこlpくぁwせdrftgyふじこlpくぁwせdrftgyふじこlpくぁwせdrftgyふじこlpくぁwせdrftgyふじこlpくぁwせdrftgyふじこlpくぁwせdrftgyふじこlpくぁwせdrftgyふじこlpくぁwせdrftgyふじこlp
            くぁwせdrftgyふじこlpくぁwせdrftgyふじこlpくぁwせdrftgyふじこlpくぁwせdrftgyふじこlpくぁwせdrftgyふじこlpくぁwせdrftgyふじこlpくぁwせdrftgyふじこlpくぁwせdrftgyふじこlpくぁwせdrftgyふじこlpくぁwせdrftgyふじこlp
            くぁwせdrftgyふじこlpくぁwせdrftgyふじこlpくぁwせdrftgyふじこlpくぁwせdrftgyふじこlpくぁwせdrftgyふじこlpくぁwせdrftgyふじこlpくぁwせdrftgyふじこlpくぁwせdrftgyふじこlpくぁwせdrftgyふじこlpくぁwせdrftgyふじこlp
         </div>
         <ShaderFx isDprUpdate={false}>
            <Playground />
         </ShaderFx>
      </div>
   );
}
