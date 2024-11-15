import { useCallback, useRef } from "react";

type SetConfigAction<C> = C | ((prevConfig: C) => C);

export const useMutableConfig = <C extends Record<string, any>>(config: C) => {
   const _config = useRef(config);

   const updateConfig = useCallback((nextConfig: Partial<C>) => {
      for (const [key, value] of Object.entries(nextConfig)) {
         if (value !== undefined && key in _config.current) {
            _config.current[key as keyof C] = value as C[keyof C];
         }
      }
   }, []);

   const setConfig = useCallback(
      (value: SetConfigAction<C>) => {
         typeof value === "function"
            ? updateConfig(value(_config.current))
            : updateConfig(value);
      },
      [updateConfig]
   );

   return [_config, setConfig] as const;
};
