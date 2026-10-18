import type { Question } from "../domain/types";

// Versioned diagram identities keep the illustrated givens stable in saved attempts.
export const physicsDiagrams: Record<string, NonNullable<Question["diagram"]>> = {
  "mini01-p04": { id: "projectile-v1", title: "Projectile launch", alt: "A projectile is launched from level ground at 20 metres per second, 30 degrees above the horizontal, and lands at the same height." },
  "mini01-p11": { id: "connected-blocks-v1", title: "Two connected blocks", alt: "A 2 kilogram block on the left is joined by a light horizontal string to a 3 kilogram block on the right. A 10 newton horizontal force pulls the 3 kilogram block to the right on a smooth surface." },
  "mini01-p12": { id: "rough-pulley-v1", title: "Rough table and hanging mass", alt: "A 5 kilogram block rests on a rough horizontal table. A string passes over a smooth pulley at the table edge to a hanging 3 kilogram mass. The kinetic friction coefficient on the table is 0.20." },
  "mini01-p15": { id: "incline-v1", title: "Block on an incline", alt: "A block is at limiting equilibrium on a plane sloping upward to the right. The angle with the horizontal is theta, with tangent theta equal to 0.5. The block is about to slide down the plane." },
  "mini01-p16": { id: "angled-pull-v1", title: "Angled pull on a rough floor", alt: "A 5 kilogram block slides to the right on a rough horizontal floor. A 25 newton force pulls to the right at 37 degrees above the horizontal. The kinetic friction coefficient is 0.20." },
  "mini01-p20": { id: "vertical-circle-v1", title: "Vertical circular path", alt: "A small mass attached to a string moves around a vertical circle of radius R. The centre, highest point and lowest point are marked. No speed or tension value is supplied." },
  "mini01-p28": { id: "disc-hole-v1", title: "Disc with an off-centre circular hole", alt: "An original disc has radius R and centre O at x equals zero. A circular hole of radius R over 2 has centre C at x equals R over 2 and is internally tangent to the original disc on the positive x side. The hole is marked as removed." },
  "mini01-p35": { id: "parallel-axes-v1", title: "Parallel axes through a disc", alt: "Viewed along the axes, a disc has centre O and a point P on its rim separated by radius R. The two marked axes are perpendicular to the disc, one through O and the other through P." },
  "mini01-p38": { id: "pipe-area-v1", title: "Pipe narrowing in cross-sectional area", alt: "Water flows to the right through a horizontal pipe. The wide section has cross-sectional area A and the narrow section has area A over 2. Flow arrows show direction only, not relative speed." },
  "mini01-p39": { id: "pipe-speed-v1", title: "Horizontal pipe flow speeds", alt: "Ideal water flows to the right in a horizontal pipe. At the wide section the speed is 2 metres per second and pressure is P1; at the narrower section the speed is 4 metres per second and pressure is P2. Pressures are not given." },
};
