import type { ApexOptions } from "apexcharts";
import ReactApexChart from "react-apexcharts";
import { populationData } from "./populationData";

const genderTotals = [
  populationData.reduce((total, { male }) => total + male, 0),
  populationData.reduce((total, { female }) => total + female, 0),
];

const genderLabels = ["Male", "Female"];

const options: ApexOptions = {
  chart: {
    fontFamily: "Outfit, sans-serif",
    type: "pie",
    toolbar: {
      show: false,
    },
  },
  colors: ["#465fff", "#9b8afb"],
  labels: genderLabels,
  legend: {
    position: "bottom",
    fontFamily: "Outfit",
  },
  dataLabels: {
    enabled: true,
  },
  tooltip: {
    y: {
      formatter: (value: number) => `${value.toLocaleString()} people`,
    },
  },
};

export function PopulationGenderPieChart() {
  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white px-5 pt-5 sm:px-6 sm:pt-6 dark:border-gray-800 dark:bg-white/3">
      <div>
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
          Population by Gender
        </h3>
        <p className="mt-1 text-theme-sm text-gray-500 dark:text-gray-400">
          Dummy population composition
        </p>
      </div>

      <ReactApexChart
        options={options}
        series={genderTotals}
        type="pie"
        height={320}
      />
    </div>
  );
}

export function PopulationGenderTable() {
  const total = genderTotals.reduce((sum, value) => sum + value, 0);

  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white px-5 pt-5 sm:px-6 sm:pt-6 dark:border-gray-800 dark:bg-white/3">
      <div>
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
          Gender Data
        </h3>
        <p className="mt-1 text-theme-sm text-gray-500 dark:text-gray-400">
          Dummy population totals
        </p>
      </div>

      <div className="custom-scrollbar mt-5 overflow-x-auto">
        <table className="w-full min-w-65 text-left text-theme-sm">
          <thead className="border-b border-gray-100 text-gray-500 dark:border-gray-800 dark:text-gray-400">
            <tr>
              <th className="pb-3 font-medium">Gender</th>
              <th className="pb-3 text-right font-medium">People</th>
              <th className="pb-3 text-right font-medium">Share</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
            {genderLabels.map((label, index) => (
              <tr key={label} className="text-gray-700 dark:text-gray-300">
                <td className="py-3 font-medium">{label}</td>
                <td className="py-3 text-right">
                  {genderTotals[index].toLocaleString()}
                </td>
                <td className="py-3 text-right">
                  {((genderTotals[index] / total) * 100).toFixed(1)}%
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
