import React from "react";
import { useQuery } from "@tanstack/react-query";
import { fileService } from "../services/fileService"; // adjust path

export const FileStorageStats: React.FC = () => {
  const { data: stats, isLoading, error } = useQuery({
    queryKey: ["stats"],
    queryFn: () => fileService.getStats(),
    placeholderData: undefined,
  });

  if (isLoading) {
    return <p className="text-gray-500">Loading stats...</p>;
  }

  if (error) {
    return (
      <p className="text-red-500">
        Failed to load stats. Please try again later.
      </p>
    );
  }

  if (!stats) {
    return null;
  }

  const metrics = [
    { label: "Actual Space Used", value: stats.actual_space },
    { label: "Space without avoiding duplicates", value: stats.would_be_space },
    { label: "Space Saved", value: stats.space_saved },
    { label: "Savings %", value: stats.savings_percentage },
    { label: "Total Files", value: stats.total_files },
    { label: "Total Entries", value: stats.total_entries },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {metrics.map((metric) => (
        <div
          key={metric.label}
          className="rounded-2xl bg-white p-5 shadow-sm border border-gray-200"
        >
          <p className="text-sm font-medium text-gray-500">{metric.label}</p>
          <p className="mt-2 text-xl font-semibold text-gray-900">
            {metric.value}
          </p>
        </div>
      ))}
    </div>
  );
};
