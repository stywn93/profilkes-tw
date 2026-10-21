import type { ApexOptions } from "apexcharts";
import ReactApexChart from "react-apexcharts";
import { populationData } from "./populationData";

const series = [
  {
    name: "Male",
    data: populationData.map(({ male }) => -male),
  },
  {
    name: "Female",
    data: populationData.map(({ female }) => female),
  },
];

const options: ApexOptions = {
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
    categories: populationData.map(({ ageGroup }) => ageGroup),
    min: -2000,
    max: 2000,
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

export default function PopulationPyramidChart() {
  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white px-5 pt-5 sm:px-6 sm:pt-6 dark:border-gray-800 dark:bg-white/3">
      <div>
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
          Population Pyramid
        </h3>
        <p className="mt-1 text-theme-sm text-gray-500 dark:text-gray-400">
          Dummy population by age group and gender
        </p>
      </div>

      <div className="custom-scrollbar max-w-full overflow-x-auto">
        <div className="min-w-150 xl:min-w-full">
          <ReactApexChart options={options} series={series} type="bar" height={360} />
        </div>
      </div>
    </div>
  );
}

export function PopulationPyramidTable() {
  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white px-5 pt-5 sm:px-6 sm:pt-6 dark:border-gray-800 dark:bg-white/3">
      <div>
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
          Population Data
        </h3>
        <p className="mt-1 text-theme-sm text-gray-500 dark:text-gray-400">
          Dummy population by age group
        </p>
      </div>

      <div className="custom-scrollbar mt-5 overflow-x-auto">
        <table className="w-full min-w-65 text-left text-theme-sm">
          <thead className="border-b border-gray-100 text-gray-500 dark:border-gray-800 dark:text-gray-400">
            <tr>
              <th className="pb-3 font-medium">Age</th>
              <th className="pb-3 text-right font-medium">Male</th>
              <th className="pb-3 text-right font-medium">Female</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
            {populationData.map(({ ageGroup, male, female }) => (
              <tr key={ageGroup} className="text-gray-700 dark:text-gray-300">
                <td className="py-3 font-medium">{ageGroup}</td>
                <td className="py-3 text-right">{male.toLocaleString()}</td>
                <td className="py-3 text-right">{female.toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
