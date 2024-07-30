import React, { createContext, useCallback, useContext, useEffect } from 'react';
import { ErrorBarsSettings } from '../state/graphicalItemsSlice';
import { SetCartesianGraphicalItem } from '../state/SetCartesianGraphicalItem';
import { ChartData } from '../state/chartDataSlice';
import { AxisId } from '../state/axisMapSlice';
import { DataKey } from '../util/types';
import { StackId } from '../util/ChartUtils';
import { ErrorBarDataPointFormatter } from '../cartesian/ErrorBar';

const noop = () => {};

type DispatchPayload = {
  addErrorBar: (errorBar: ErrorBarsSettings) => void;
  removeErrorBar: (errorBar: ErrorBarsSettings) => void;
};

const ErrorBarDirectionDispatchContext = createContext<DispatchPayload>({
  addErrorBar: noop,
  removeErrorBar: noop,
});

type ErrorBarContextType<T> = {
  data: ReadonlyArray<T>;
  xAxisId: AxisId;
  yAxisId: AxisId;
  dataPointFormatter: ErrorBarDataPointFormatter;
  errorBarOffset: number;
};

const initialContextState: ErrorBarContextType<any> = {
  data: [],
  xAxisId: 'xAxis-0',
  yAxisId: 'yAxis-0',
  dataPointFormatter: () => ({ x: 0, y: 0, value: 0 }),
  errorBarOffset: 0,
};

const ErrorBarContext = createContext(initialContextState);

export const useErrorBarContext = () => useContext(ErrorBarContext);

type GraphicalItemContextProps<T> = {
  data: ChartData;
  xAxisId: AxisId;
  yAxisId: AxisId;
  zAxisId: AxisId;
  dataKey: DataKey<any>;
  children: React.ReactNode;
  stackId: StackId | undefined;
  hide: boolean;
  errorBarData: ReadonlyArray<T>;
  dataPointFormatter: ErrorBarDataPointFormatter;
  errorBarOffset: number;
};

export const CartesianGraphicalItemContext = ({
  children,
  xAxisId,
  yAxisId,
  zAxisId,
  dataKey,
  data,
  stackId,
  hide,
  errorBarData,
  dataPointFormatter,
  errorBarOffset,
}: GraphicalItemContextProps<any>) => {
  const [errorBars, updateErrorBars] = React.useState<ReadonlyArray<ErrorBarsSettings>>([]);
  // useCallback is necessary in these two because without it, the new function reference causes an infinite render loop
  const addErrorBar = useCallback(
    (errorBar: ErrorBarsSettings) => {
      updateErrorBars(prev => [...prev, errorBar]);
    },
    [updateErrorBars],
  );
  const removeErrorBar = useCallback(
    (errorBar: ErrorBarsSettings) => {
      updateErrorBars(prev => prev.filter(eb => eb !== errorBar));
    },
    [updateErrorBars],
  );
  return (
    <ErrorBarContext.Provider
      value={{
        data: errorBarData,
        xAxisId,
        yAxisId,
        dataPointFormatter,
        errorBarOffset,
      }}
    >
      <ErrorBarDirectionDispatchContext.Provider value={{ addErrorBar, removeErrorBar }}>
        <SetCartesianGraphicalItem
          data={data}
          xAxisId={xAxisId}
          yAxisId={yAxisId}
          zAxisId={zAxisId}
          dataKey={dataKey}
          errorBars={errorBars}
          stackId={stackId}
          hide={hide}
        />
        {children}
      </ErrorBarDirectionDispatchContext.Provider>
    </ErrorBarContext.Provider>
  );
};

export function ReportErrorBarSettings(props: ErrorBarsSettings): null {
  const { addErrorBar, removeErrorBar } = useContext(ErrorBarDirectionDispatchContext);
  useEffect(() => {
    addErrorBar(props);
    return () => {
      removeErrorBar(props);
    };
  }, [addErrorBar, removeErrorBar, props]);
  return null;
}
