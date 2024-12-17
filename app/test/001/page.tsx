import { ShaderFx } from "../../ShaderFx";
import { Playground } from "./Playground";

export default function Page() {
   return (
      <div
         style={{
            position: "fixed",
            width: "100%",
            height: "100svh",
            pointerEvents: "none",
         }}>
         <ShaderFx isDprUpdate={false}>
            <Playground />
         </ShaderFx>
      </div>
   );
}
