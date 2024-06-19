type SeriesSize = 'sm' | 'md' | 'lg';

export interface SimpleOptions {
  frameIndex: number;
  text: string;
  showSeriesCount: boolean;
  seriesCountSize: SeriesSize;
}
