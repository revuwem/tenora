import type { Unit } from "@tenora/contracts";

export function UnitsList({ units }: { units: Unit[] }) {
	if (units.length === 0) {
		return <p className="text-sm text-muted-foreground">No Units yet.</p>;
	}
	return (
		<table className="w-full text-left text-sm">
			<thead>
				<tr className="border-b text-muted-foreground">
					<th className="py-2 pr-4 font-medium">Name</th>
					<th className="py-2 pr-4 font-medium">Address</th>
					<th className="py-2 font-medium">Building</th>
				</tr>
			</thead>
			<tbody>
				{units.map((unit) => (
					<tr key={unit.id} className="border-b">
						<td className="py-2 pr-4">{unit.name}</td>
						<td className="py-2 pr-4">{unit.address}</td>
						<td className="py-2">{unit.buildingLabel ?? "—"}</td>
					</tr>
				))}
			</tbody>
		</table>
	);
}
