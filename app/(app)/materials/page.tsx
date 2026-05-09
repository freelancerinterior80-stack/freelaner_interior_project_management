import { getProjectOptions } from "@/features/boq/queries";
import { MaterialsScreen } from "@/features/materials/components/materials-screen";
import { getMaterialMovements, getMaterials, getSuppliers } from "@/features/materials/queries";

export default async function MaterialsPage() {
  const [materials, movements, suppliers, projects] = await Promise.all([
    getMaterials(),
    getMaterialMovements(),
    getSuppliers(),
    getProjectOptions()
  ]);

  return (
    <MaterialsScreen
      materials={materials}
      movements={movements}
      suppliers={suppliers}
      projects={projects}
    />
  );
}
