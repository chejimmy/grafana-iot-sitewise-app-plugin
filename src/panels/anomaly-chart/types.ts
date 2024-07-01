import { AnomalyChartOptions } from "@iot-app-kit/react-components/dist/es/components/anomaly-chart/types";

export interface SimpleOptions {
  axis: AnomalyChartOptions['axis'];
  frameIndex: number;
  decimalPlaces: AnomalyChartOptions['decimalPlaces'];
  tooltipSort: AnomalyChartOptions['tooltipSort'];
}
