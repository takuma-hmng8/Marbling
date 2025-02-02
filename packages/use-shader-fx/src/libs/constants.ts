import * as THREE from "three";

export const ISDEV = process.env.NODE_ENV === "development";

export const MATERIAL_BASIC_PARAMS = {
   transparent: false,
   depthTest: false,
   depthWrite: false,
};

export const DEFAULT_TEXTURE = new THREE.DataTexture(
   new Uint8Array([0, 0, 0, 0]),
   1,
   1,
   THREE.RGBAFormat
);

export const APP_NAME = "use-shader-fx";

export const THREE_TYPES = new Set([
   THREE.Color,
   THREE.Matrix3,
   THREE.Matrix4,
   THREE.Vector2,
   THREE.Vector3,
   THREE.Vector4,
   THREE.Texture,
   THREE.Quaternion,
   THREE.WebGLRenderTarget,
   THREE.Euler,
   THREE.BufferGeometry,
   THREE.Material,
   THREE.Camera,
   THREE.Light,
   THREE.Object3D,
   THREE.Bone,
   THREE.VideoTexture,
]);
