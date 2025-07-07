import { useQuery } from "@tanstack/react-query";
import axios from "axios";

type WeekData = {
	week: number;
	total: number;
};

export default function useContributors() {
	const {
		isPending: repoLoading,
		error: repoError,
		data: repoStats,
	} = useQuery({
		queryKey: ["repoStats"],
		queryFn: async () => {
			const response = await axios.get("https://api.github.com/repos/nimbusdotstorage/Nimbus");
			return response.data;
		},
	});

	const {
		isPending: prLoading,
		error: prError,
		data: prCount,
	} = useQuery({
		queryKey: ["pullRequest"],
		queryFn: async () => {
			const response = await axios.get("https://api.github.com/search/issues", {
				params: {
					q: "repo:nimbusdotstorage/Nimbus type:pr",
					per_page: 1,
				},
			});
			return response.data.total_count;
		},
	});

	const {
		isPending: activityLoading,
		error: activityError,
		data: activityData,
	} = useQuery({
		queryKey: ["activityData"],
		queryFn: async () => {
			const response = await axios.get("https://api.github.com/repos/nimbusdotstorage/Nimbus/stats/commit_activity");

			const data: WeekData[] = response.data;
			if (!data || data.length === 0) return [];

			const commitsByMonth: Record<string, number> = {};
			const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

			data.forEach(week => {
				const weekDate = new Date(week.week * 1000);
				const key = `${weekDate.getFullYear()}-${weekDate.getMonth()}`;
				commitsByMonth[key] = (commitsByMonth[key] || 0) + week.total;
			});

			const allKeys = Object.keys(commitsByMonth)
				.map(key => {
					const parts = key.split("-");
					const year = Number(parts[0]);
					const month = Number(parts[1]);
					return new Date(year, month, 1);
				})
				.sort((a, b) => a.getTime() - b.getTime());

			const result = allKeys.map(date => {
				const key = `${date.getFullYear()}-${date.getMonth()}`;
				return {
					month: `${monthNames[date.getMonth()]} ${date.getFullYear()}`,
					commits: commitsByMonth[key] || 0,
				};
			});

			return result;
		},
	});

	const {
		isPending: contributorsLoading,
		error: contributorsError,
		data: contributors,
	} = useQuery({
		queryKey: ["contributorsData"],
		queryFn: async () => {
			const response = await axios.get("https://api.github.com/repos/nimbusdotstorage/Nimbus/contributors");
			return response.data;
		},
	});

	return {
		repoStats,
		repoLoading,
		repoError,
		prCount,
		prLoading,
		prError,
		activityData,
		activityLoading,
		activityError,
		contributors,
		contributorsLoading,
		contributorsError,
	};
}
