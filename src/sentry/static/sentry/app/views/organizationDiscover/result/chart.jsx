import React from 'react';
import moment from 'moment';
import PropTypes from 'prop-types';

import BarChart from 'app/components/charts/barChart.jsx';
import LineChart from '../lineChart';

export default class Result extends React.Component {
  static propTypes = {
    data: PropTypes.object.isRequired,
    query: PropTypes.object.isRequired,
  };

  // Converts a value to a string for the chart label. This could
  // potentially cause incorrect grouping, e.g. if the value null and string
  // 'null' are both present in the same series they will be merged into 1 value
  getLabel(value) {
    if (typeof value === 'object') {
      try {
        value = JSON.stringify(value);
      } catch (err) {
        // eslint-disable-next-line no-console
        console.error(err);
      }
    }

    return value;
  }

  getDataForChart(queryData, groupbyFields) {
    const {aggregations} = this.props.query;
    const aggregate = aggregations[0][2];

    const rawDates = [...new Set(queryData.map(entry => entry.time))];

    const formattedDates = rawDates.map(time => moment(time * 1000).format('MM-DD'));

    const output = {};
    queryData.forEach(data => {
      const key = groupbyFields.map(field => this.getLabel(data[field])).join(',');
      const val = this.getLabel(data[aggregate]);
      const idx = rawDates.indexOf(data.time);

      if (!(key in output)) {
        output[key] = {};
      }
      output[key][idx] = val;
    });

    // If there is no data for that series in that time period, fill it with null
    const data = {};
    Object.entries(output).forEach(([line, val]) => {
      data[line] = new Array(rawDates.length).fill(null);
      Object.entries(val).forEach(([idx, count]) => {
        data[line][idx] = count;
      });
    });

    return {
      chartData: data,
      dates: formattedDates,
    };
  }

  getBarDataForChart(queryData, groupbyFields) {
    //TODO: this is ugly i will fix it later promise
    const {aggregations} = this.props.query;
    const aggregate = aggregations[0][2];

    const output = {};
    queryData.forEach(data => {
      const key = groupbyFields.map(field => this.getLabel(data[field])).join(',');
      if (key in output) {
        output[key].data.push({
          value: data[aggregate],
          category: moment(data.time).format('MMM Do'),
        });
        //TODO: investigate if we need to handle duplicate "category" dates within data field
      } else {
        output[key] = {
          data: [{value: data[aggregate], category: moment(data.time).format('MMM Do')}],
        };
      }
    });
    const result = [];
    for (let key in output) {
      result.push({seriesName: key, data: output[key].data});
    }
    return result;
  }

  render() {
    const {fields} = this.props.query;
    const {data} = this.props.data;

    console.log('data is: ', data);
    console.log('ChartData: ', this.getDataForChart(data, fields));
    console.log('Fields:', fields);

    const {chartData, dates} = this.getDataForChart(data, fields);

    const barData = this.getBarDataForChart(data, fields);
    console.log('bar data', barData);
    return (
      <div>
        <LineChart dates={dates} chartData={chartData} style={{height: 200}} />
        <BarChart series={barData} stacked={true} style={{height: 400}} />
      </div>
    );
  }
}
