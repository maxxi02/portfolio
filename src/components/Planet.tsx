import { useGLTF } from "@react-three/drei";
import type { GLTF } from "three-stdlib";
import * as THREE from "three";
import { useRef, type JSX } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";

// Define the structure of your GLTF model
type GLTFResult = GLTF & {
  nodes: {
    Sphere: THREE.Mesh;
    Ring: THREE.Mesh;
    Sphere2: THREE.Mesh;
  };
  materials: {
    "Material.001": THREE.MeshStandardMaterial;
    "Material.002": THREE.MeshStandardMaterial;
  };
};

// Props type for the component
type ModelProps = JSX.IntrinsicElements["group"];

export function Planet(props: ModelProps) {
  const shapeContainer = useRef<THREE.Group<THREE.Object3DEventMap> | null>(
    null
  );
  const spheresContainer = useRef<THREE.Group<THREE.Object3DEventMap> | null>(
    null
  );
  const ringContainer = useRef<THREE.Group<THREE.Object3DEventMap> | null>(
    null
  );
  const { nodes, materials } = useGLTF(
    "/models/Planet.glb"
  ) as unknown as GLTFResult;

  useGSAP(() => {
    if (!shapeContainer.current || !ringContainer.current || !spheresContainer)
      return;

    const tl = gsap.timeline();

    tl.from(shapeContainer.current.position, {
      y: 5,
      duration: 3,
      ease: "circ.out",
    });

    tl.from(
      shapeContainer.current.rotation,
      {
        x: 0,
        y: Math.PI,
        z: -Math.PI,
        duration: 10,
        ease: "power1.inOut",
      },
      "-=25%"
    );
    tl.from(
      ringContainer.current.rotation,
      {
        x: 0.8,
        y: 0,
        z: 0,
        duration: 10,
        ease: "power1.inOut",
      },
      "<"
    );
  }, []);

  return (
    <group ref={shapeContainer} {...props} dispose={null}>
      <group ref={spheresContainer}>
        <mesh
          castShadow
          receiveShadow
          geometry={nodes.Sphere.geometry}
          material={materials["Material.002"]}
          rotation={[0, 0, 0.741]}
        />

        <mesh
          castShadow
          receiveShadow
          geometry={nodes.Sphere2.geometry}
          material={materials["Material.001"]}
          position={[0.647, 1.03, -0.724]}
          rotation={[0, 0, 0.741]}
          scale={0.223}
        />
      </group>
      <mesh
        ref={ringContainer}
        castShadow
        receiveShadow
        geometry={nodes.Ring.geometry}
        material={materials["Material.001"]}
        rotation={[-0.124, 0.123, -0.778]}
        scale={2}
      />
    </group>
  );
}

useGLTF.preload("/models/Planet.glb");
