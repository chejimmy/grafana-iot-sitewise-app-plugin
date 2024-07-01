import { PanelPlugin } from '@grafana/data';
import { SimpleOptions } from './types';
import { SimplePanel } from './components/SimplePanel';

export const plugin = new PanelPlugin<SimpleOptions>(SimplePanel).setPanelOptions((builder) => {
  return builder
    // .addTextInput({
    //   path: 'text',
    //   name: 'Simple text option',
    //   description: 'Description of panel option',
    //   defaultValue: 'Default value of text input option',
    // })
    // .addBooleanSwitch({
    //   path: 'showSeriesCount',
    //   name: 'Show series counter',
    //   defaultValue: false,
    // })
    .addRadio({
      category: ['Tooltip'],
      path: 'tooltipSort',
      name: 'Tooltip sort by',
      settings: {
        options: [
          {
            value: 'value',
            label: 'Value',
          },
          {
            value: 'alphabetical',
            label: 'Alphabetical',
          },
        ],
      },
      defaultValue: 'value',
    })
    .addSliderInput({
      category: ['Tooltip'],
      path: 'decimalPlaces',
      name: 'Decimal places',
      settings: {
        min: 0,
        max: 5,
        step: 1,
      },
      defaultValue: 2,
    })
    .addBooleanSwitch({
      category: ['Axis'],
      path: 'axis.showX',
      name: 'Show x-axis',
      defaultValue: true,
    })
    .addBooleanSwitch({
      category: ['Axis'],
      path: 'axis.showY',
      name: 'Show y-axis',
      defaultValue: true,
    });
});
