import type { ForwardRefExoticComponent, RefAttributes } from "react";
import { Card, CardContent } from "@/components/ui/card";
import type { LucideProps } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export function StatCard({
	title,
	value,
	description,
	icon: Icon,
	color,
	gradient,
}: {
	title: string;
	value: number;
	description: string;
	icon: ForwardRefExoticComponent<Omit<LucideProps, "ref"> & RefAttributes<SVGSVGElement>>;
	color: string;
	gradient?: string;
}) {
	return (
		<Card className="group from-background via-background to-muted/20 relative overflow-hidden border-0 bg-gradient-to-br transition-all duration-300 hover:scale-[1.02] hover:shadow-lg">
			<div
				className={`absolute inset-0 bg-gradient-to-br ${gradient || "from-primary/5 to-primary/10"} opacity-0 transition-opacity duration-300 group-hover:opacity-100`}
			/>

			<div
				className={`absolute -top-4 -right-4 h-16 w-16 rounded-full bg-gradient-to-br ${gradient || "from-primary/10 to-primary/20"} opacity-60 blur-xl`}
			/>

			<CardContent className="relative space-y-3 p-4">
				<div className="flex items-center justify-between">
					<div
						className={`rounded-xl bg-gradient-to-br p-2.5 ${gradient || "from-primary/10 to-primary/20"} transition-transform duration-300 group-hover:scale-110`}
					>
						<Icon className={`h-4 w-4 ${color}`} />
					</div>
					<Badge
						variant="outline"
						className="border-dashed text-xs opacity-60 transition-opacity group-hover:opacity-100"
					>
						{title}
					</Badge>
				</div>

				<div className="space-y-1">
					<div className="from-foreground to-foreground/80 bg-gradient-to-r bg-clip-text text-2xl font-bold text-transparent">
						{value.toLocaleString()}
					</div>
					<p className="text-muted-foreground/80 text-xs">{description}</p>
				</div>
			</CardContent>
		</Card>
	);
}
