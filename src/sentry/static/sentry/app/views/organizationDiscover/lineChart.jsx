import PropTypes from 'prop-types';
import React from 'react';

import theme from 'app/utils/theme';

import BaseChart from 'app/components/charts/baseChart';
import Tooltip from 'app/components/charts/components/tooltip';
import XAxis from 'app/components/charts/components/xAxis';
import YAxis from 'app/components/charts/components/yAxis';
import LineSeries from '../../components/charts/series/lineSeries';

export default class lineChart extends React.Component {
  static propTypes = {
    chartData: PropTypes.object,
    dates: PropTypes.array,
  };

  defineSeries = ([key, value], idx) => {
    return LineSeries({
      name: key,
      type: 'line',
      data: value,
      // data: value.map(entry => entry.count),
      color: theme.charts.colors[idx],
    });
  };

  render() {
    const {chartData, dates, ...props} = this.props;

    // const series = Object.entries(this.getLineSeries(data.data, groupBy)).map(this.defineSeries);
    const series = Object.entries(chartData).map(this.defineSeries);

    console.log('dates', dates);
    console.log('series', series);

    if (
      !series.length ||
      (series.length === 1 && (!series[0].data || series[0].data.length <= 1))
    ) {
      return null; // if no data or only one data point.
    }

    return (
      <BaseChart
        {...props}
        options={{
          tooltip: Tooltip(),
          title: {},
          legend: {},
          grid: {
            top: 24,
            bottom: 40,
            left: '10%',
            right: '10%',
          },
          xAxis: XAxis({
            type: 'category',
            data: dates,
            boundaryGap: false,
          }),
          yAxis: YAxis({}),
          series,
        }}
      />
    );
  }
}
