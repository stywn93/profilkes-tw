import type { ApexOptions } from "apexcharts";
import ReactApexChart from "react-apexcharts";
import type { EducationData } from "./literacyEducationApi";

interface EducationChartProps {
  data: EducationData[];
  isLoading: boolean;
  error: string | null;
}

const colors = [
  "#465fff",
  "#9b8afb",
  "#12b76a",
  "#f79009",
  "#f04438",
  "#06aed4",
  "#7f56d9",
  "#667085",
  "#ee46bc",
  "#32d583",
];

function getChartOptions(data: EducationData[]): ApexOptions {
  return {
    chart: {
      fontFamily: "Outfit, sans-serif",
      type: "pie",
      toolbar: {
        show: false,
      },
    },
    colors,
    labels: data.map(({ metricName }) => metricName),
    legend: {
      position: "bottom",
      fontFamily: "Outfit",
    },
    dataLabels: {
      enabled: false,
    },
    tooltip: {
      y: {
        formatter: (value: number) => `${Math.round(value).toLocaleString()} people`,
      },
    },
  };
}

function formatPeople(value: number) {
  return Math.round(value).toLocaleString();
}

function DataState({
  isLoading,
  error,
  hasData,
}: EducationChartProps & { hasData: boolean }) {
  if (isLoading) {
    return (
      <p className="py-20 text-center text-theme-sm text-gray-500 dark:text-gray-400">
        Loading education data...
      </p>
    );
  }

  if (error) {
    return (
      <p className="py-20 text-center text-theme-sm text-error-500" role="alert">
        {error}
      </p>
    );
  }

  if (!hasData) {
    return (
      <p className="py-20 text-center text-theme-sm text-gray-500 dark:text-gray-400">
        No education data available.
      </p>
    );
  }

  return null;
}

export function PopulationGenderPieChart({
  data,
  isLoading,
  error,
}: EducationChartProps) {
  const state = <DataState data={data} isLoading={isLoading} error={error} hasData={data.length > 0} />;

  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white px-5 pt-5 sm:px-6 sm:pt-6 dark:border-gray-800 dark:bg-white/3">
      <div>
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
          Education Proportion
        </h3>
        <p className="mt-1 text-theme-sm text-gray-500 dark:text-gray-400">
          Population distribution by education level
        </p>
      </div>

      {state}
      {!isLoading && !error && data.length > 0 && (
        <ReactApexChart
          options={getChartOptions(data)}
          series={data.map(({ total }) => total)}
          type="pie"
          height={320}
        />
      )}
    </div>
  );
}

export function PopulationGenderTable({
  data,
  isLoading,
  error,
}: EducationChartProps) {
  const state = <DataState data={data} isLoading={isLoading} error={error} hasData={data.length > 0} />;

  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white px-5 pt-5 sm:px-6 sm:pt-6 dark:border-gray-800 dark:bg-white/3">
      <div>
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
          Education Data
        </h3>
        <p className="mt-1 text-theme-sm text-gray-500 dark:text-gray-400">
          Population counts by education level
        </p>
      </div>

      {state}
      {!isLoading && !error && data.length > 0 && (
        <div className="custom-scrollbar mt-5 max-h-90 overflow-auto">
          <table className="w-full min-w-75 text-left text-theme-sm">
            <thead className="sticky top-0 border-b border-gray-100 bg-white text-gray-500 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-400">
              <tr>
                <th className="pb-3 font-medium">Education</th>
                <th className="pb-3 text-right font-medium">People</th>
                <th className="pb-3 text-right font-medium">Share</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {data.map(({ metricCode, metricName, total, totalPercentage }) => (
                <tr key={metricCode} className="text-gray-700 dark:text-gray-300">
                  <td className="py-3 font-medium">{metricName}</td>
                  <td className="py-3 text-right">{formatPeople(total)}</td>
                  <td className="py-3 text-right">
                    {totalPercentage === null
                      ? "—"
                      : `${totalPercentage.toFixed(1)}%`}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
