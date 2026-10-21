import type { ApexOptions } from "apexcharts";
import ReactApexChart from "react-apexcharts";

const ageGroups = ["75+", "65–74", "55–64", "45–54", "35–44", "25–34", "15–24", "0–14"];

const series = [
  {
    name: "Male",
    data: [-320, -540, -760, -980, -1180, -1320, -1480, -1720],
  },
  {
    name: "Female",
    data: [460, 680, 850, 1040, 1250, 1390, 1510, 1650],
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
    categories: ageGroups,
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
