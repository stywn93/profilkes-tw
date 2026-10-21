import PageMeta from "@/components/common/PageMeta";
import DemographicCard from "@/components/ecommerce/DemographicCard";
import EcommerceMetrics from "@/components/ecommerce/EcommerceMetrics";
import MonthlySalesChart from "@/components/ecommerce/MonthlySalesChart";
import MonthlyTarget from "@/components/ecommerce/MonthlyTarget";
import {
  fetchEducationData,
  type EducationData,
} from "@/components/ecommerce/literacyEducationApi";
import {
  PopulationGenderPieChart,
  PopulationGenderTable,
} from "@/components/ecommerce/PopulationGenderChart";
import PopulationPyramidChart, {
  PopulationPyramidTable,
} from "@/components/ecommerce/PopulationPyramidChart";
import {
  fetchPopulationAgeGroups,
  type PopulationAgeGroupData,
} from "@/components/ecommerce/populationApi";
import RecentOrders from "@/components/ecommerce/RecentOrders";
import StatisticsChart from "@/components/ecommerce/StatisticsChart";
import { useEffect, useState } from "react";

export default function Ecommerce() {
  const [populationData, setPopulationData] = useState<PopulationAgeGroupData[]>([]);
  const [populationIsLoading, setPopulationIsLoading] = useState(true);
  const [populationError, setPopulationError] = useState<string | null>(null);
  const [educationData, setEducationData] = useState<EducationData[]>([]);
  const [educationIsLoading, setEducationIsLoading] = useState(true);
  const [educationError, setEducationError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    let isActive = true;

    fetchPopulationAgeGroups(controller.signal)
      .then((data) => {
        if (isActive) {
          setPopulationData(data);
          setPopulationError(null);
        }
      })
      .catch((error: unknown) => {
        if (!isActive || (error instanceof Error && error.name === "AbortError")) {
          return;
        }

        setPopulationError(
          error instanceof Error
            ? error.message
            : "Unable to load population data.",
        );
      })
      .finally(() => {
        if (isActive) {
          setPopulationIsLoading(false);
        }
      });

    return () => {
      isActive = false;
      controller.abort();
    };
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    let isActive = true;

    fetchEducationData(controller.signal)
      .then((data) => {
        if (isActive) {
          setEducationData(data);
          setEducationError(null);
        }
      })
      .catch((error: unknown) => {
        if (!isActive || (error instanceof Error && error.name === "AbortError")) {
          return;
        }

        setEducationError(
          error instanceof Error
            ? error.message
            : "Unable to load education data.",
        );
      })
      .finally(() => {
        if (isActive) {
          setEducationIsLoading(false);
        }
      });

    return () => {
      isActive = false;
      controller.abort();
    };
  }, []);

  return (
    <>
      <PageMeta
        title="React.js Ecommerce Dashboard | TailAdmin - React.js Admin Dashboard Template"
        description="This is React.js Ecommerce Dashboard page for TailAdmin - React.js Tailwind CSS Admin Dashboard Template"
      />
      <div className="grid grid-cols-12 gap-4 md:gap-6">
        <div className="col-span-12 xl:col-span-8">
          <PopulationPyramidChart
            data={populationData}
            isLoading={populationIsLoading}
            error={populationError}
          />
        </div>

        <div className="col-span-12 xl:col-span-4">
          <PopulationPyramidTable
            data={populationData}
            isLoading={populationIsLoading}
            error={populationError}
          />
        </div>

        <div className="col-span-12 xl:col-span-6">
          <PopulationGenderPieChart
            data={educationData}
            isLoading={educationIsLoading}
            error={educationError}
          />
        </div>

        <div className="col-span-12 xl:col-span-6">
          <PopulationGenderTable
            data={educationData}
            isLoading={educationIsLoading}
            error={educationError}
          />
        </div>

        <div className="col-span-12 space-y-6 xl:col-span-7">
          <EcommerceMetrics />

          <MonthlySalesChart />
        </div>

        <div className="col-span-12 xl:col-span-5">
          <MonthlyTarget />
        </div>

        <div className="col-span-12">
          <StatisticsChart />
        </div>

        <div className="col-span-12 xl:col-span-5">
          <DemographicCard />
        </div>

        <div className="col-span-12 xl:col-span-7">
          <RecentOrders />
        </div>
      </div>
    </>
  );
}
