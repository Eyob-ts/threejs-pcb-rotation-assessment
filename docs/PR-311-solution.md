# PR-311 – Root Cause Analysis (RCA)
### Topic: Incorrect PCB Component Rotation Behavior in 3D Scene

---

## 🧩 1. Problem Summary
A PCB component in the 3D visualization environment was not rotating correctly.  
Instead of spinning around its own center, it **orbited around the world origin (0,0,0)**.  
This caused visual inaccuracy and incorrect spatial behavior for all components offset from the origin.

---

## 🧠 2. Symptoms & Impact
| Symptom | Description |
|----------|-------------|
| Visual offset | Component appears to rotate in a large circular path instead of spinning in place. |
| Local axes misalignment | The component’s local axes (X, Y, Z) drift relative to world axes during rotation. |
| Physics mismatch | In simulation or assembly scenes, the incorrect rotation could affect positioning logic. |

Impact:
- Misleading representation of part orientation.
- Downstream calculations (e.g., collisions or transformations) would inherit wrong matrices.

---

## 🔍 3. Investigation Process
The debugging process involved observing the 3D scene step by step:

1. **Reproduced the issue**: Created a minimal Three.js scene replicating the orbiting behavior.  
2. **Checked transformation hierarchy**: Verified whether rotation was applied at mesh or parent level.  
3. **Inspected object position**: Found the PCB mesh positioned at `(3, 1, 0)` — offset from world origin.  
4. **Logged rotation behavior**: Confirmed that rotation was being applied directly to the mesh without a local pivot.  
5. **Analyzed coordinate space**: Identified that rotations were being applied in **world space** rather than **local space**.

---

## 🧩 4. Root Cause Identified
The root cause was a **misapplied rotation transform**.

When an object is offset from the origin, rotating it directly (`mesh.rotateY`) applies the transformation relative to the **world coordinate system**, not its local center.

This results in the object orbiting around the world origin instead of spinning in place.

**In short:**
> The rotation pivot was incorrectly assumed to be at the object’s center rather than at world origin.

---

## 🔧 5. Corrective Fix
### Implemented Solution (in PR-668)
A **pivot Object3D** was introduced as a parent container for the PCB mesh:

```js
const pivot = new THREE.Object3D()
pivot.position.copy(pcb.position)
pivot.add(pcb)
pivot.rotateY(0.02)
