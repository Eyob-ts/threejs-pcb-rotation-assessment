# PR-668 – PCB Component Rotation Visualization

### 🎯 Objective
To demonstrate and fix the incorrect rotation behavior of a PCB component in a 3D environment.  
The goal is to show the difference between:
- **❌ Broken mode:** rotation around the **world origin**
- **✅ Fixed mode:** rotation around the **component’s own local center**

This visualization helps clarify the concept of **local vs world space transforms** — a common issue when implementing 3D manipulations or object hierarchies.

---

## 🧠 Problem Summary
In many 3D systems (like CAD or simulation apps), components must rotate around their *own center*.  
However, if rotation is applied directly to a mesh that’s offset from the world origin, the component appears to **orbit around the origin** — as if spinning in space instead of rotating in place.

This is caused by applying the rotation in **world coordinates** instead of creating a **local pivot point** for the component.

---

## 🧩 Root Cause (Why it happens)
When a mesh is placed away from the origin (e.g. `position.set(3, 1, 0)`), rotating it directly changes its orientation relative to the world axes — not relative to its own center.

**World rotation (broken):**
```js
mesh.rotateY(0.02)
