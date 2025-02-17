"use client";

import * as THREE from "three";
import { useEffect, useRef, useState } from "react";
import { useFrame, useThree, extend, createPortal } from "@react-three/fiber";
import {
   useNoise,
   NoiseValues,
   useSingleFBO,
   createFxMaterialImpl,
   createBasicFxMaterialImpl,
   FxMaterialImplValues,
   BasicFxMaterialImplValues,
   useFluid,
} from "@/packages/use-shader-fx/src";
import {
   Float,
   OrbitControls,
   useTexture,
   useVideoTexture,
} from "@react-three/drei";

/*===============================================
idea of useGrid

セルカラーの可能性
- カラフル
- テクスチャ
- spriteテクスチャ
- 単純なカラー指定
- マッピングに使うテクスチャのカラーをそのままレンダリング
===============================================*/

const FxMaterialImpl = createFxMaterialImpl({
   uniforms: {
      celltxture: { value: null },
      spriteTexture: { value: null },
      time: { value: 0 },
   },
   fragmentShader: `
	uniform sampler2D src;
	uniform sampler2D celltxture;
	uniform sampler2D spriteTexture;

	uniform float time;
	
	float rand(vec2 n) {
		return fract(sin(dot(n ,vec2(12.9898,78.233))) * 43758.5453);
	}

	vec3 randomColor(float time) {
		return 0.5 + 0.5 * sin(vec3(12.9898, 78.233, 45.164) * time);
	}

	// 2次元のセル座標からランダムな float を生成するハッシュ関数
	float hash(vec2 p) {
		return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453);
	}

	void main() {
		float u_lineWidth = .01; // 0.01 ~
		vec2 u_gridCount = vec2(50.);
		vec2 u_target = vec2(450., 500.);
		vec3 u_fillColor = vec3(.0, 1.0, 0.0);
		vec3 u_backgroundColor = vec3(0.0, 0.0, 0.0);
		vec3 u_gridColor = vec3(0., 0., 0.);

		// 現在のセルのインデックスを計算（例：(3, 5) など）
		u_gridCount.x *= aspectRatio;
		vec2 cellIndex = floor(vUv * u_gridCount);
		// セル毎に一意のhashを生成
		float cellHash = hash(cellIndex);

		// 各セルの中心座標を計算
		vec2 cellCenterUV = (cellIndex + 0.5) / u_gridCount;
		
		// セル内の位置 (0～1) AKA cellUV
		vec2 cellPos = fract(vUv * u_gridCount);
		
		// セルの中心でテクスチャをサンプリング
		vec4 texColor = texture2D(src, cellCenterUV);
		vec2 vel = texColor.rg;
		float len = length(vel);
		
		// --- セルカラー ---
		// 1 セル毎のカラフル セル毎に一意のhashを生成しtimeに乗算する。
		// vec3 fillColor = (len >= 0.8) ? randomColor((time * cellHash) * .1) : u_backgroundColor;
		// 2 セル毎のテクスチャ
		// vec3 fillColor = (len >= 0.8) ? texture2D(celltxture,cellPos).rgb : u_backgroundColor;
		// 3. spriteテクスチャ
		float spriteCount = 10.0;
		float spritePos = fract(cellHash + time * 0.4);
		float spriteIndex = floor(spritePos * spriteCount);
		float spriteSize = 1.0 / spriteCount;
		float spriteOffset = spriteIndex * spriteSize;
		float spriteU = spriteOffset + cellPos.x * spriteSize;
		vec2 spriteUV = vec2(spriteU, cellPos.y);
		vec3 fillColor = (len >= 0.1) ? texture2D(spriteTexture, spriteUV).rgb : u_backgroundColor;
		// 4. マッピングに使うテクスチャのカラーをそのままレンダリング
		// vec3 fillColor = (len >= 0.8) ? texColor.rgb : u_backgroundColor;

		// --- グリッド線描画の処理 ---
		// 各辺の境界までの距離を求める
		float distToEdgeX = min(cellPos.x, 1.0 - cellPos.x);
		float distToEdgeY = min(cellPos.y, 1.0 - cellPos.y);
		
		// 微小なマージン
		float margin = u_lineWidth;
		
		// smoothstep により、境界付近で 1.0、境界から離れると 0.0
		float edgeX = 1.0 - smoothstep(u_lineWidth, u_lineWidth + margin, distToEdgeX);
		float edgeY = 1.0 - smoothstep(u_lineWidth, u_lineWidth + margin, distToEdgeY);
		
		// X, Y のうちどちらかがエッジなら検出（両方の場合も 1.0 になる）
		float edge = max(edgeX, edgeY);
		
		// グリッド線部分は u_gridColor、そうでなければ fillColor
		vec3 finalColor = mix(fillColor, u_gridColor, edge);
		
		gl_FragColor = vec4(finalColor, 1.0);

	}
`,
});
const BasicFxMaterialImpl = createBasicFxMaterialImpl();

extend({ FxMaterialImpl, BasicFxMaterialImpl });

export const Playground = () => {
   const { size, viewport, camera } = useThree();

   const [funkun, sprite] = useTexture(["/momo.jpg", "/sprite.jpg"]);
   const funkunVideo = useVideoTexture("/FT_Ch02.mp4", {
      width: 1280,
      height: 720,
   });

   const fluid = useFluid({
      size,
      dpr: 0.3,
   });

   const material = useRef<any>();
   useEffect(() => {
      material.current?.updateResolution(size);
   }, [size]);

   useFrame((state) => {
      fluid.render(state);
      material.current.uniforms.time.value = state.clock.getElapsedTime();
   });

   return (
      <mesh>
         <planeGeometry args={[2, 2]} />
         <fxMaterialImpl
            ref={material}
            key={FxMaterialImpl.key}
            src={funkunVideo}
            celltxture={funkun}
            spriteTexture={sprite}
         />
      </mesh>
   );
};
