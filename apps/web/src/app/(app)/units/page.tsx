import { CreateUnitForm } from "@/components/create-unit-form";
import { UnitsList } from "@/components/units-list";
import { getMe } from "@/lib/me";
import { can } from "@/lib/permissions";
import { listUnits } from "@/lib/units";

export default async function UnitsPage() {
	const result = await getMe();
	// The layout has already sent anyone else away; this only narrows the type.
	if (result.status !== "ok") return null;
	const { me } = result;

	if (!can(me, "units:view")) {
		return <p className="text-sm text-muted-foreground">You do not have access to Units.</p>;
	}

	const units = await listUnits();
	return (
		<div className="mx-auto flex max-w-3xl flex-col gap-8">
			<h1 className="text-2xl font-semibold">Units</h1>
			<UnitsList units={units} />
			{can(me, "units:create") && <CreateUnitForm />}
		</div>
	);
}
