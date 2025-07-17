"use client";

import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Area, AreaChart, XAxis } from "recharts";
import { Badge } from "@/components/ui/badge";
import { TrendingUp } from "lucide-react";
import { useTheme } from "next-themes";

const chartConfig = {
	commits: {
		label: "Commits",
		color: "hsl(var(--primary))",
	},
} satisfies ChartConfig;

interface Data {
	month: string;
	commits: number;
}

export function ActivityChart({ data }: { data: Data[] }) {
	return (
		<Card className="from-background via-background to-muted/10 relative overflow-hidden rounded-lg border-dashed bg-gradient-to-br">
			<div className="from-primary/5 absolute top-0 right-0 h-32 w-32 rounded-full bg-gradient-to-br to-transparent blur-2xl" />
			<div className="from-secondary/5 absolute bottom-0 left-0 h-24 w-24 rounded-full bg-gradient-to-tr to-transparent blur-xl" />

			<CardHeader className="relative">
				<div className="flex items-center justify-between">
					<div className="flex items-center gap-3">
						<div className="from-primary/10 to-primary/20 mt-10 rounded-xl bg-gradient-to-br p-2">
							<TrendingUp className="text-primary h-5 w-5" />
						</div>
						<div>
							<CardTitle className="mt-10 text-lg font-semibold">Commit Activity</CardTitle>
							<CardDescription className="text-sm opacity-80">Monthly contributions trend</CardDescription>
						</div>
					</div>
					<Badge variant="secondary" className="mt-10 border-dashed">
						Last 6 months
					</Badge>
				</div>
			</CardHeader>
			<CardContent className="relative">
				<ChartContainer config={chartConfig}>
					<AreaChart
						accessibilityLayer
						data={data}
						margin={{
							left: 12,
							right: 12,
							top: 12,
							bottom: 12,
						}}
					>
						<XAxis
							dataKey="month"
							tickLine={false}
							axisLine={false}
							tickMargin={8}
							tickFormatter={value => value.slice(0, 3)}
						/>
						<ChartTooltip cursor={false} content={<ChartTooltipContent indicator="line" />} />
						<Area
							dataKey="commits"
							type="monotone"
							fill="transparent"
							fillOpacity={1}
							stroke={useTheme().theme === "dark" ? "#e5e5e5" : "#262626"}
							strokeWidth={2}
						/>
					</AreaChart>
				</ChartContainer>
			</CardContent>
		</Card>
	);
}
