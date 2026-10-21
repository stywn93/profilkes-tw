import type { ApexOptions } from "apexcharts";
import ReactApexChart from "react-apexcharts";
import type { PopulationAgeGroupData } from "./populationApi";

interface PopulationPyramidProps {
  data: PopulationAgeGroupData[];
  isLoading: boolean;
  error: string | null;
}

function getChartOptions(data: PopulationAgeGroupData[]): ApexOptions {
  const largestValue = Math.max(
    ...data.flatMap(({ male, female }) => [male, female]),
    1,
  );
  const axisMax = Math.ceil(largestValue / 5000) * 5000;

  return {
    chart: {
      fontFamily: "Outfit, sans-serif",
      type: "bar",
      stacked: true,
      height: 360,
      toolbar: {
        show: false,
      },
    },
    colors: ["#465fff", "#9b8afb"],
    plotOptions: {
      bar: {
        horizontal: true,
        barHeight: "75%",
      },
    },
    dataLabels: {
      enabled: false,
    },
    grid: {
      borderColor: "#e5e7eb",
      xaxis: {
        lines: {
          show: true,
        },
      },
    },
    legend: {
      position: "top",
      horizontalAlign: "left",
      fontFamily: "Outfit",
    },
    xaxis: {
      categories: data.map(({ ageGroup }) => ageGroup),
      min: -axisMax,
      max: axisMax,
      tickAmount: 4,
      labels: {
        formatter: (value: string) => `${Math.abs(Number(value))}`,
      },
      axisBorder: {
        show: false,
      },
      axisTicks: {
        show: false,
      },
    },
    yaxis: {
      labels: {
        style: {
          colors: "#6b7280",
          fontFamily: "Outfit, sans-serif",
        },
      },
    },
    tooltip: {
      shared: false,
      y: {
        formatter: (value: number) => `${Math.abs(value).toLocaleString()} people`,
      },
    },
  };
}

function getChartSeries(data: PopulationAgeGroupData[]) {
  return [
    {
      name: "Male",
      data: data.map(({ male }) => -male),
    },
    {
      name: "Female",
      data: data.map(({ female }) => female),
    },
  ];
}

export default function PopulationPyramidChart({
  data,
  isLoading,
  error,
}: PopulationPyramidProps) {
  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white px-5 pt-5 sm:px-6 sm:pt-6 dark:border-gray-800 dark:bg-white/3">
      <div>
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
          Population Pyramid
        </h3>
        <p className="mt-1 text-theme-sm text-gray-500 dark:text-gray-400">
          Population by age group and gender
        </p>
      </div>

      {isLoading && (
        <p className="py-20 text-center text-theme-sm text-gray-500 dark:text-gray-400">
          Loading population data...
        </p>
      )}

      {error && (
        <p className="py-20 text-center text-theme-sm text-error-500" role="alert">
          {error}
        </p>
      )}

      {!isLoading && !error && data.length === 0 && (
        <p className="py-20 text-center text-theme-sm text-gray-500 dark:text-gray-400">
          No population data available.
        </p>
      )}

      {!isLoading && !error && data.length > 0 && (
        <div className="custom-scrollbar max-w-full overflow-x-auto">
          <div className="min-w-150 xl:min-w-full">
            <ReactApexChart
              options={getChartOptions(data)}
              series={getChartSeries(data)}
              type="bar"
              height={360}
            />
          </div>
        </div>
      )}
    </div>
  );
}

export function PopulationPyramidTable({
  data,
  isLoading,
  error,
}: PopulationPyramidProps) {
  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white px-5 pt-5 sm:px-6 sm:pt-6 dark:border-gray-800 dark:bg-white/3">
      <div>
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
          Population Data
        </h3>
        <p className="mt-1 text-theme-sm text-gray-500 dark:text-gray-400">
          Population counts by age group
        </p>
      </div>

      {isLoading && (
        <p className="py-20 text-center text-theme-sm text-gray-500 dark:text-gray-400">
          Loading population data...
        </p>
      )}

      {error && (
        <p className="py-20 text-center text-theme-sm text-error-500" role="alert">
          {error}
        </p>
      )}

      {!isLoading && !error && data.length === 0 && (
        <p className="py-20 text-center text-theme-sm text-gray-500 dark:text-gray-400">
          No population data available.
        </p>
      )}

      {!isLoading && !error && data.length > 0 && (
        <div className="custom-scrollbar mt-5 max-h-90 overflow-auto">
          <table className="w-full min-w-75 text-left text-theme-sm">
            <thead className="sticky top-0 border-b border-gray-100 bg-white text-gray-500 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-400">
              <tr>
                <th className="pb-3 font-medium">Age</th>
                <th className="pb-3 text-right font-medium">Male</th>
                <th className="pb-3 text-right font-medium">Female</th>
                <th className="pb-3 text-right font-medium">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {data.map(({ ageGroup, male, female, total }) => (
                <tr key={ageGroup} className="text-gray-700 dark:text-gray-300">
                  <td className="py-3 font-medium">{ageGroup}</td>
                  <td className="py-3 text-right">{male.toLocaleString()}</td>
                  <td className="py-3 text-right">{female.toLocaleString()}</td>
                  <td className="py-3 text-right">{total.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
