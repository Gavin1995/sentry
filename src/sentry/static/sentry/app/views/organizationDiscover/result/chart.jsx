import React from 'react';
import PropTypes from 'prop-types';
import LineChart from '../lineChart';

export default class Result extends React.Component {
  static propTypes = {
    data: PropTypes.object.isRequired,
    query: PropTypes.object.isRequired,
  };

  getDataForChart(queryData, groupbyFields) {
    const {aggregations} = this.props.query;
    const aggregate = aggregations[0][2];

    const output = {};
    queryData.forEach(data => {
      const key = groupbyFields.map(field => data[field]).join(',');
      if (key in output) {
        output[key].count.push(data.count);
      } else {
        output[key] = {[aggregate]: [data[aggregate]]};
      }
    });
    return output;
  }

  render() {
    const {fields} = this.props.query;
    const {data} = this.props.data;


    console.log("data is: ", data);
    console.log("parsed data is: ", this.getDataForChart(data, fields));
    console.log("Fields:", fields);

    const chartData = this.getDataForChart(data, fields);

    return (
      <div>
        {/*{`data for charts: ${JSON.stringify(this.props.data)}`}*/}
        <LineChart data={this.props.data} chartData={chartData} style={{height: 200}} />
      </div>
    );
  }
}
