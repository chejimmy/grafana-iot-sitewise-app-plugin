import { css } from '@emotion/css';
import React from 'react';

import { DataFrame, PanelProps, SelectableValue, getFrameDisplayName } from '@grafana/data';
import { SimpleOptions } from '../types';
import { Select, useTheme2 } from '@grafana/ui';
import { PanelDataErrorView } from '@grafana/runtime';
import { AnomalyChart } from '@iot-app-kit/react-components';
import { AnomalyObjectDataInput } from '@iot-app-kit/react-components/dist/es/data/transformers/anomaly/object/input';

interface Props extends PanelProps<SimpleOptions> {};

export const SimplePanel: React.FC<Props> = (props: Props) => {
  const { data, fieldConfig, id, timeRange, options } = props;
  const { axis, decimalPlaces, tooltipSort } = options;
  const frames = data.series;

  const theme = useTheme2();
  const appkitTheme = theme.isLight
    ? 'light'
    : 'dark';

  if (frames.length === 0) {
    return <PanelDataErrorView fieldConfig={fieldConfig} panelId={id} data={data} needsStringField />;
  }

  const names = frames.map((frame, index) => {
    return {
      label: getFrameDisplayName(frame),
      value: index,
    };
  });

  const currentIndex = getCurrentFrameIndex(frames, options);

  // Parse query data into AnomalyObjectDataInput
  const l4eData = frames[currentIndex];

  // TODO: remove this validation logic
  const firstLength = l4eData.fields[0].values.length
  const problem = l4eData.fields.some(({values: {length}}) => length !== firstLength);
  if (problem) {
    console.log("there's a problem");
  }

  // TODO: relies on the data transformer in AppKit
  let parsedData: AnomalyObjectDataInput = parseAnomalyData(l4eData);
  const dataData = {
    state: 'success' as const,
    value: {
      data: parsedData,
    },
  };

  const chart = (
    <AnomalyChart
      viewport={ { start: timeRange.from.toDate(), end: timeRange.to.toDate() } }
      data={[dataData]}
      mode={appkitTheme}
      showTimestamp={false}
      axis={axis}
      decimalPlaces={decimalPlaces}
      tooltipSort={tooltipSort}
    />
  );

  if (frames.length === 1) {
    return chart;
  }

  return (
    <div className={chartStyles.wrapper}>
      {chart}
      <div className={chartStyles.selectWrapper}>
        <Select options={names} value={names[currentIndex]} onChange={(val) => onChangeTableSelection(val, props)} />
      </div>
    </div>
  );
};

function getCurrentFrameIndex(frames: DataFrame[], options: SimpleOptions) {
  return options.frameIndex > 0 && options.frameIndex < frames.length ? options.frameIndex : 0;
}

function onChangeTableSelection(val: SelectableValue<number>, props: Props) {
  props.onOptionsChange({
    ...props.options,
    frameIndex: val.value || 0,
  });
}

// TODO: relies on the data transformer in AppKit
function parseAnomalyData(l4eData: DataFrame) {
  const notDia = new Set(['time', 'quality', 'anomaly_score', 'prediction_reason']);

  // parse timestamp
  const timeField = l4eData.fields.find((field) => field.name === 'time');
  if (timeField == null) {
    // FIXME: return empty array
    throw new Error('No time field found');
  }

  // parse prediction
  // FIXME: should this be the prediction_reason?
  const predictionField = l4eData.fields.find((field) => field.name === 'anomaly_score');
  if (predictionField == null) {
    // FIXME: return empty array
    throw new Error('No time field found');
  }

  let parsedData: AnomalyObjectDataInput = timeField?.values.map((value, index) => {
    return {
      timestamp: value,
      prediction: predictionField.values[index],
      diagnostics: [],
    };
  });

  // Parse query data into AnomalyObjectDataInput
  const diaFields = l4eData.fields.filter((field) => !notDia.has(field.name));
  for (let field of diaFields) {
    for (let i = 0; i < field.values.length; i++) {
      const diagnostics = parsedData[i].diagnostics;
      diagnostics.push({
        name: field.name,
        value: field.values[i],
      });
    }
  }

  parsedData = parsedData.filter((data) => data.prediction === 1);
  return parsedData;
}

const chartStyles = {
  wrapper: css`
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    height: 100%;
  `,
  selectWrapper: css`
    padding: 8px 8px 0px 8px;
  `,
};
