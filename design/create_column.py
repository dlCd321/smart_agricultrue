"""
Blender script: create a glass-like column for the agriculture dashboard.
Uses pure Principled BSDF so the GLTF exporter can write
KHR_materials_transmission + KHR_materials_emissive_strength.
Three.js GLTFLoader will auto-create MeshPhysicalMaterial from those.

Run headless:
  blender --background --python design/create_column.py

Output: apps/web/public/assets/column-blue.glb
"""
import bpy, math, os

OUTPUT_PATH = os.path.join(
    os.path.dirname(os.path.dirname(os.path.abspath(__file__))),
    "apps", "web", "public", "assets", "column-blue.glb",
)

# ── 1. CLEAR SCENE ──────────────────────────────────────────────────────────
bpy.ops.object.select_all(action="SELECT")
bpy.ops.object.delete(use_global=False)
for blk in (bpy.data.meshes, bpy.data.materials, bpy.data.lights, bpy.data.cameras):
    for item in blk:
        blk.remove(item)

# ── 2. GEOMETRY ──────────────────────────────────────────────────────────────
# Unit cube, base at Z=0, top at Z=1.  Three.js scales height at runtime.
bpy.ops.mesh.primitive_cube_add(size=1.0, location=(0.0, 0.0, 0.5))
obj = bpy.context.active_object
obj.name = "ColumnBlue"

# Bevel: gives the clean chamfered-glass edge of the reference image
bv = obj.modifiers.new("Bevel", "BEVEL")
bv.width          = 0.05
bv.segments       = 3
bv.profile        = 0.7
bv.limit_method   = "ANGLE"
bv.angle_limit    = math.radians(60)
bpy.ops.object.modifier_apply(modifier="Bevel")
bpy.ops.object.shade_smooth()

# ── 3. MATERIAL ──────────────────────────────────────────────────────────────
# Pure Principled BSDF -> maps to glTF KHR_materials_transmission + emissive
mat = bpy.data.materials.new("GlassColumnBlue")
mat.use_nodes = True

nodes = mat.node_tree.nodes
links = mat.node_tree.links
for n in list(nodes):
    nodes.remove(n)

out   = nodes.new("ShaderNodeOutputMaterial"); out.location   = (400, 0)
bsdf  = nodes.new("ShaderNodeBsdfPrincipled"); bsdf.location  = (0,   0)
links.new(bsdf.outputs["BSDF"], out.inputs["Surface"])

# ── color: sky blue #42BAFF (sRGB -> linear via Blender) ──────────────────
bsdf.inputs["Base Color"].default_value = (0.196, 0.635, 1.0, 1.0)

# ── glossy glass surface ──────────────────────────────────────────────────
bsdf.inputs["Roughness"].default_value  = 0.08
bsdf.inputs["IOR"].default_value        = 1.50

# transmission (Blender 4+: "Transmission Weight", older: "Transmission")
for key in ("Transmission Weight", "Transmission"):
    if key in bsdf.inputs:
        bsdf.inputs[key].default_value = 0.38
        break

# specular (Blender 4+: "Specular IOR Level", older: "Specular")
for key in ("Specular IOR Level", "Specular"):
    if key in bsdf.inputs:
        bsdf.inputs[key].default_value = 0.80
        break

# ── inner blue glow (matches the luminescent highlight in the reference) ──
for key in ("Emission Color", "Emission"):
    if key in bsdf.inputs:
        bsdf.inputs[key].default_value = (0.50, 0.83, 1.0, 1.0)
        break
for key in ("Emission Strength",):
    if key in bsdf.inputs:
        bsdf.inputs[key].default_value = 0.40
        break

# ── alpha: mostly opaque (glass tint, not air) ───────────────────────────
if "Alpha" in bsdf.inputs:
    bsdf.inputs["Alpha"].default_value = 0.82

# ── material blend mode (guard for API changes across Blender versions) ───
if hasattr(mat, "blend_method"):
    mat.blend_method = "BLEND"
if hasattr(mat, "use_backface_culling"):
    mat.use_backface_culling = False

obj.data.materials.clear()
obj.data.materials.append(mat)

# ── 4. EXPORT ────────────────────────────────────────────────────────────────
os.makedirs(os.path.dirname(OUTPUT_PATH), exist_ok=True)

bpy.ops.export_scene.gltf(
    filepath         = OUTPUT_PATH,
    export_format    = "GLB",
    export_materials = "EXPORT",
    use_selection    = False,
    export_apply     = True,
)

print(f"\n-> Exported -> {OUTPUT_PATH}\n")
