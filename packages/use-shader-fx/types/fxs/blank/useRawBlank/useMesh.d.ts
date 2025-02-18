import * as THREE from "three";
import { MaterialProps, Size } from "../../types";
export declare class RawBlankMaterial extends THREE.ShaderMaterial {
    uniforms: {
        uResolution: {
            value: THREE.Vector2;
        };
    };
}
export declare const useMesh: ({ scene, size, dpr, onBeforeInit, }: {
    scene: THREE.Scene;
    size: Size;
    dpr: number | false;
} & MaterialProps) => {
    material: RawBlankMaterial;
    mesh: THREE.Mesh<THREE.BufferGeometry<THREE.NormalBufferAttributes>, RawBlankMaterial, THREE.Object3DEventMap>;
};
