import { useState, useCallback } from "react";
import { calculateDatesForPreset } from "@/aplicacion/utilidades/dateUtils";

/**
 * @filePurpose useDateFilters.js
 * @description Hook personalizado para gestionar los filtros de rango de fechas en AnalyticsPage.
 */
export const useDateFilters = () => {
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [selectedPresetRange, setSelectedPresetRange] = useState("global"); // 'global', 'custom', or a preset key

  const handlePresetRangeChange = useCallback((event) => {
    const preset = event.target.value;
    setSelectedPresetRange(preset);

    if (preset === "custom" || preset === "global") {
      // If custom or global, let individual date pickers or null handle it
      setStartDate(null);
      setEndDate(null);
      return;
    }
    const [newStart, newEnd] = calculateDatesForPreset(preset);
    setStartDate(newStart);
    setEndDate(newEnd);
  }, []);

  const resetDateFilters = useCallback(() => {
    setStartDate(null);
    setEndDate(null);
    setSelectedPresetRange("global");
  }, []);

  return {
    startDate,
    setStartDate,
    endDate,
    setEndDate,
    selectedPresetRange,
    handlePresetRangeChange,
    resetDateFilters,
  };
};
