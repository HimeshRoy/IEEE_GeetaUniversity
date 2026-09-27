import { cache } from "react";

export interface MaintenanceStatus {
  enabled: boolean;
  title: string | null;
  message: string | null;
  updatedAt: string;
}

interface MaintenanceResponse {
  success: boolean;
  message: string;
  data: MaintenanceStatus;
}

export const getMaintenanceStatus = cache(
  async (): Promise<MaintenanceStatus | null> => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/maintenance/status`,
        {
          cache: "no-store",
        },
      );

      if (!response.ok) {
        return null;
      }

      const result: MaintenanceResponse = await response.json();

      if (!result.success || !result.data) {
        return null;
      }

      return result.data;
    } catch {
      return null;
    }
  },
);