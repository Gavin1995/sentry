import {Box, Flex} from 'grid-emotion';
import PropTypes from 'prop-types';
import React from 'react';
import moment from 'moment';
import styled from 'react-emotion';

import {TableChart} from 'app/components/charts/tableChart';
import {t} from 'app/locale';
import AreaChart from 'app/components/charts/areaChart';
import Count from 'app/components/count';
import IdBadge from 'app/components/idBadge';
import PanelChart from 'app/components/charts/panelChart';
import PieChart from 'app/components/charts/pieChart';
import overflowEllipsis from 'app/styles/overflowEllipsis';
import space from 'app/styles/space';
import theme from 'app/utils/theme';
import withApi from 'app/utils/withApi';
import withOrganization from 'app/utils/withOrganization';

import HealthContext from './util/healthContext';
import HealthRequest from './util/healthRequest';

function GIVE_DATA(size) {
  return [...Array(size)].map(() => (Math.random() * 1000) % 1000);
}
const TMPSIZE = 7;
const START_DATE = moment().subtract(TMPSIZE, 'days');
const ERROR_TYPE_DATA = [
  ['TypeError', 50, 40, 30],
  ['SyntaxError', 40, 30, 20],
  ['NameError', 30, 20, 10],
  ['ZeroDivisionError', 20, 10, 0],
];

const OrganizationHealthErrors = styled(
  class extends React.Component {
    render() {
      let {className} = this.props;
      return (
        <div className={className}>
          <Flex justify="space-between">
            <Header>
              Errors
              <SubduedCount>
                (<Count value={12198} />)
              </SubduedCount>
            </Header>
          </Flex>

          <Flex>
            <StyledPanelChart
              height={200}
              startDate={START_DATE}
              title={t('Errors')}
              series={[
                {
                  name: 'Crash',
                  data: GIVE_DATA(TMPSIZE),
                },
                {
                  name: 'Handled',
                  data: GIVE_DATA(TMPSIZE),
                },
              ]}
              lines={[
                {
                  name: 'Previous Period',
                  data: GIVE_DATA(TMPSIZE),
                },
              ]}
            >
              <AreaChart />
            </StyledPanelChart>

            <HealthRequest tag="user" timeseries={true}>
              {({data, loading}) => (
                <StyledPanelChart
                  height={200}
                  startDate={START_DATE}
                  title={t('Users')}
                  series={[
                    {
                      name: 'User Session',
                      data: GIVE_DATA(TMPSIZE),
                    },
                    {
                      name: 'Affected',
                      data: GIVE_DATA(TMPSIZE),
                    },
                  ]}
                  lines={[
                    {
                      name: 'Previous Period',
                      data: GIVE_DATA(TMPSIZE),
                    },
                  ]}
                >
                  <AreaChart />
                </StyledPanelChart>
              )}
            </HealthRequest>
          </Flex>

          <Flex>
            <StyledTableChart
              title="Error Type"
              headers={['Error type', 'Test', 'Another Test', 'What', 'Total']}
              data={ERROR_TYPE_DATA}
              widths={[null, 60, 60, 60, 60]}
              showRowTotal
              showColumnTotal
              shadeRowPercentage
            />
            <HealthRequest tag="user" timeseries={false}>
              {({data, loading}) => (
                <React.Fragment>
                  {!loading && (
                    <StyledTableChart
                      headers={[t('Most Impacted')]}
                      data={data.map(row => [row, row])}
                      widths={[null, 120]}
                      getValue={item =>
                        typeof item === 'number' ? item : item && item.count}
                      renderHeaderCell={({getValue, value, columnIndex}) => {
                        return typeof value === 'string' ? (
                          value
                        ) : (
                          <IdBadge user={value.user} />
                        );
                      }}
                      renderDataCell={({getValue, value, columnIndex}) => {
                        return <Count value={getValue(value)} />;
                      }}
                      showRowTotal={false}
                      showColumnTotal={false}
                      shadeRowPercentage
                    />
                  )}
                </React.Fragment>
              )}
            </HealthRequest>
          </Flex>

          <Flex>
            <HealthRequest tag="release" timeseries={false} topk={5}>
              {({data, loading}) => (
                <React.Fragment>
                  {!loading && (
                    <React.Fragment>
                      <StyledTableChart
                        headers={[t('Errors by Release')]}
                        data={data.map(row => [row, row])}
                        widths={[null, 120]}
                        getValue={item =>
                          typeof item === 'number' ? item : item && item.count}
                        renderHeaderCell={({getValue, value, columnIndex}) => {
                          return (
                            <Flex justify="space-between">
                              <ReleaseName>{value.release.version}</ReleaseName>
                              <Project>
                                {value.topProjects.map(p => (
                                  <IdBadge key={p.slug} project={p} />
                                ))}
                              </Project>
                            </Flex>
                          );
                        }}
                        renderDataCell={({getValue, value, columnIndex}) => {
                          return <Count value={getValue(value)} />;
                        }}
                        showRowTotal={false}
                        showColumnTotal={false}
                        shadeRowPercentage
                      />
                      <StyledPanelChart
                        height={200}
                        title={t('Errors By Release')}
                        showLegend={false}
                        data={data.map(row => ({
                          name: row.release.version,
                          value: row.count,
                        }))}
                      >
                        <Flex>
                          <LegendWrapper>
                            <Legend
                              data={data.map(row => ({
                                name: row.release.version,
                                value: row.count,
                              }))}
                            />
                          </LegendWrapper>
                          <PieChartWrapper>
                            <PieChart
                              data={data.map(row => ({
                                name: row.release.version,
                                value: row.count,
                              }))}
                            />
                          </PieChartWrapper>
                        </Flex>
                      </StyledPanelChart>
                    </React.Fragment>
                  )}
                </React.Fragment>
              )}
            </HealthRequest>
          </Flex>
        </div>
      );
    }
  }
)``;

const PieChartWrapper = styled(Box)`
  flex: 1;
  flex-shrink: 0;
`;
const LegendWrapper = styled(Box)`
  flex: 1;
  padding: ${space(2)};
  overflow: hidden;
`;

class OrganizationHealthErrorsContainer extends React.Component {
  render() {
    return (
      <HealthContext.Consumer>
        {({projects, environments, period}) => (
          <OrganizationHealthErrors
            projects={projects}
            environments={environments}
            period={period}
            {...this.props}
          />
        )}
      </HealthContext.Consumer>
    );
  }
}

export default withApi(withOrganization(OrganizationHealthErrorsContainer));

const Header = styled(Flex)`
  font-size: 18px;
  margin-bottom: ${space(2)};
`;

const SubduedCount = styled('span')`
  color: ${p => p.theme.gray1};
  margin-left: ${space(0.5)};
`;

const getChartMargin = () => `
  margin-right: ${space(2)};
  &:last-child {
    margin-right: 0;
  }
`;

const StyledPanelChart = styled(PanelChart)`
  ${getChartMargin};
  flex-shrink: 0;
  overflow: hidden;
`;

const StyledTableChart = styled(TableChart)`
  ${getChartMargin};
  flex-shrink: 0;
  overflow: hidden;
`;

const ReleaseName = styled(Box)`
  ${overflowEllipsis};
`;

const Project = styled(Box)`
  margin-left: ${space(1)};
  flex-shrink: 0;
`;
class Legend extends React.Component {
  static propTypes = {
    data: PropTypes.array,
  };

  render() {
    let {data} = this.props;
    return (
      <Flex direction="column">
        {data.map((item, i) => {
          return (
            <LegendRow key={i}>
              <Square
                size={16}
                color={theme.charts.colors[i % theme.charts.colors.length]}
              />
              <ReleaseName>{item.name}</ReleaseName>
            </LegendRow>
          );
        })}
      </Flex>
    );
  }
}

const Square = styled('div')`
  width: ${p => p.size}px;
  height: ${p => p.size}px;
  border-radius: ${p => p.theme.borderRadius};
  background-color: ${p => p.color};
  margin-right: ${space(1)};
  flex-shrink: 0;
`;

const LegendRow = styled(Flex)`
  margin: ${space(1)};
  align-items: center;
`;
