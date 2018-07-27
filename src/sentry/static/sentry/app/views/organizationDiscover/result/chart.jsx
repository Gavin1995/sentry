import React from 'react';
import PropTypes from 'prop-types';
import LineChart from '../lineChart';
// import BarChart from 'app/components/charts/barChart.jsx';

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

    const output = {};
    queryData.forEach(data => {
      const key = groupbyFields.map(field => this.getLabel(data[field])).join(',');
      if (key in output) {
        output[key].aggregate.push(data[aggregate]);
        output[key].time.push(data.time);
      } else {
        output[key] = {aggregate: [data[aggregate]], time: [data.time]};
      }
    });
    return output;
  }

  render() {
    const {fields} = this.props.query;
    const {data} = this.props.data;

    console.log('data is: ', data);
    console.log('ChartData: ', this.getDataForChart(data, fields));
    console.log('Fields:', fields);

    const chartData = this.getDataForChart(data, fields);

    return (
      <div>
        {/*{`data for charts: ${JSON.stringify(this.props.data)}`}*/}
        <LineChart data={this.props.data} chartData={chartData} style={{height: 200}} />
      </div>
    );
  }
}
