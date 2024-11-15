import { useCallback, useRef } from "react";

export const useMutableRefState = <S>(state: S) => {
   const ref = useRef(state);
   const setRef = useCallback((value: S | ((prevState: S) => S)) => {
      ref.current =
         typeof value === "function"
            ? (value as (prevState: S) => S)(ref.current)
            : value;
   }, []);

   return [ref, setRef] as const;
};
