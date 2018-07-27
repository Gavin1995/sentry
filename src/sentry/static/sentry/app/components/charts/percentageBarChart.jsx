import PropTypes from 'prop-types';
import React from 'react';

import BarSeries from './series/barSeries.jsx';
import BaseChart from './baseChart';
import Tooltip from './components/tooltip';
import XAxis from './components/xAxis';
import YAxis from './components/yAxis';

export default class PercentageBarChart extends React.Component {
  static propTypes = {
    ...BaseChart.propTypes,

    series: PropTypes.arrayOf(
      PropTypes.arrayOf(
        PropTypes.shape({
          name: PropTypes.string,
          category: PropTypes.string,
          value: PropTypes.number,
        })
      )
    ),
  };

  generateData(series) {
    let xAxisLabels = new Set();

    console.log(series);
    const barData = series.map(s => {
      let tempSeries = {};
      s.data.forEach(({category, value}) => {
        xAxisLabels.add(category);
        tempSeries[category] = value;
      });
      return tempSeries;
    });
    return [barData, Array.from(xAxisLabels)];
  }

  render() {
    const {series} = this.props;
    const [seriesData, xAxisLabels] = this.generateData(series);

    return (
      <BaseChart
        {...this.props}
        options={{
          tooltip: Tooltip({
            // Make sure tooltip is inside of chart (because of overflow: hidden)
            confine: true,
          }),
          xAxis: XAxis({
            type: 'category',
            data: xAxisLabels,
          }),
          yAxis: YAxis({
            type: 'value',
            interval: 25,
            splitNumber: 4,
            data: [0, 25, 50, 100],
          }),
          series: series.map((s, i) => {
            let data = xAxisLabels.map(label => {
              return seriesData[i].hasOwnProperty(label) ? seriesData[i][label] : 0;
            });
            return BarSeries({
              name: s.seriesName,
              stack: 'percentageBarChartStack',
              data,
            });
          }),
        }}
      />
    );
  }
}
