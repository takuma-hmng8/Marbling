// "use client";

// import { ShaderFx } from "../ShaderFx";
// import { Playground } from "./Playground";
// import { useRef, useState } from "react";
// import { EasingTypes } from "@/packages/use-shader-fx/src";
// import Image from "next/image";
// import s from "./index.module.scss";

// const Install = () => {
//    const [copied, setIsCopied] = useState(false);
//    return (
//       <button
//          onClick={(e) => {
//             const target = e.target as HTMLButtonElement;
//             navigator?.clipboard?.writeText(target.innerText).then(() => {
//                setIsCopied(true);
//             });
//          }}
//          className={`${s.install} ${copied ? s.copied : ""}`}>
//          npm install @funtech-inc/use-shader-fx
//          <Image src="copy.svg" alt="Copy" width={12} height={12} />
//       </button>
//    );
// };

// export default function Page() {
//    const wrapper = useRef<HTMLDivElement>(
//       null
//    ) as React.MutableRefObject<HTMLDivElement>;
//    const [bpm, setBpm] = useState(120);
//    const [easing, setEasing] = useState<EasingTypes>("easeInOutBack");

//    const easingTypes: EasingTypes[] = [
//       "easeInSine",
//       "easeOutSine",
//       "easeInOutSine",
//       "easeInQuad",
//       "easeOutQuad",
//       "easeInOutQuad",
//       "easeInCubic",
//       "easeOutCubic",
//       "easeInOutCubic",
//       "easeInQuart",
//       "easeOutQuart",
//       "easeInOutQuart",
//       "easeInQuint",
//       "easeOutQuint",
//       "easeInOutQuint",
//       "easeInExpo",
//       "easeOutExpo",
//       "easeInOutExpo",
//       "easeInCirc",
//       "easeOutCirc",
//       "easeInOutCirc",
//       "easeInBack",
//       "easeOutBack",
//       "easeInOutBack",
//       "easeInElastic",
//       "easeOutElastic",
//       "easeInOutElastic",
//       "easeInBounce",
//       "easeOutBounce",
//       "easeInOutBounce",
//    ];

//    return (
//       <>
//          <div className={s.canvas}>
//             <ShaderFx eventSource={wrapper} isDprUpdate={false}>
//                <Playground bpm={bpm} easing={easing} />
//             </ShaderFx>
//          </div>
//          <div ref={wrapper} className={s.wrapper}>
//             <div className={s.container}>
//                <h1 className={s.title}>⚡️ More FXs, Less GLSL</h1>
//                <Install />
//                <div className={s.input}>
//                   <p>BPM:</p>
//                   <input
//                      type="number"
//                      value={bpm}
//                      onChange={(e) => {
//                         setBpm(+e.target.value);
//                      }}
//                   />
//                </div>
//                <div className={s.input}>
//                   <p>Easing:</p>
//                   <select
//                      value={easing}
//                      onChange={(e) => {
//                         setEasing(e.target.value as EasingTypes);
//                      }}>
//                      {easingTypes.map((type) => (
//                         <option
//                            style={{ color: "black" }}
//                            key={type}
//                            value={type}>
//                            {type}
//                         </option>
//                      ))}
//                   </select>
//                </div>
//             </div>
//          </div>
//       </>
//    );
// }

export default function Page() {
   return null;
}
