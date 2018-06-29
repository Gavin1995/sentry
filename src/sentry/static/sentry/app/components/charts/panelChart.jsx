import {Flex} from 'grid-emotion';
import PropTypes from 'prop-types';
import React from 'react';
import styled from 'react-emotion';

import {Panel, PanelHeader} from 'app/components/panels';
import CircleIndicator from 'app/components/circleIndicator';
import space from 'app/styles/space';
import theme from 'app/utils/theme';

const PanelChart = styled(
  class extends React.Component {
    static propTypes = {
      showLegend: PropTypes.bool,
      title: PropTypes.node,
      series: PropTypes.arrayOf(
        PropTypes.shape({
          name: PropTypes.string,
          data: PropTypes.arrayOf(PropTypes.number),
        })
      ),

      /**
     * Other line series to display
     */
      lines: PropTypes.arrayOf(
        PropTypes.shape({
          name: PropTypes.string,
          data: PropTypes.arrayOf(PropTypes.number),
        })
      ),
    };

    static defaultProps = {
      showLegend: true,
    };

    constructor(props) {
      super(props);
    }

    render() {
      // Don't destructure `height` so that we can pass to children
      const {title, children, className, showLegend, ...props} = this.props;

      return (
        <Panel className={className}>
          {title && (
            <PanelHeader>
              {title}
              {showLegend && <Legend {...this.props} />}
            </PanelHeader>
          )}
          <ChartWrapper>{React.cloneElement(children, props)}</ChartWrapper>
        </Panel>
      );
    }
  }
)`
  flex: 1;
  overflow: hidden;
`;

export default PanelChart;

const ChartWrapper = styled('div')`
  overflow: hidden;
`;

const Legend = styled(
  class extends React.Component {
    static propTypes = {
      series: PropTypes.arrayOf(
        PropTypes.shape({
          name: PropTypes.string,
          data: PropTypes.arrayOf(PropTypes.number),
        })
      ),
      lines: PropTypes.arrayOf(
        PropTypes.shape({
          name: PropTypes.string,
          data: PropTypes.arrayOf(PropTypes.number),
        })
      ),
    };

    render() {
      let {className, series, lines} = this.props;

      return (
        <Flex className={className}>
          {lines &&
            lines.length && (
              <SeriesGroup>
                <DottedLineIndicator />
                <SeriesName>{lines[0].name}</SeriesName>
              </SeriesGroup>
            )}

          {series &&
            series.map((serie, i) => {
              return (
                <SeriesGroup key={serie.name}>
                  <CircleIndicator color={theme.charts.colors[i]} />
                  <SeriesName>{serie.name}</SeriesName>
                </SeriesGroup>
              );
            })}
        </Flex>
      );
    }
  }
)`
  flex: 1;
  justify-content: flex-end;
  align-items: center;
`;

const SeriesGroup = styled(Flex)`
  margin-left: ${space(1)};
  align-items: center;
`;

const SeriesName = styled('span')`
  margin-left: ${space(0.5)};
  text-transform: none;
  font-weight: 400;
`;

const DottedLineIndicator = styled('span')`
  display: flex;
  width: 20px;
  border: 1px dashed ${p => p.theme.charts.previousPeriod};
  align-items: center;
`;
