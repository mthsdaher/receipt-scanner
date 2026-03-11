import React, { useMemo, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  LabelList,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import Layout from "../../components/Layout";
import {
  ChartCard,
  ChartGrid,
  ChartTitle,
  ChartWrapper,
  Container,
  ErrorCard,
  FilterBar,
  FilterButton,
  FilterLabel,
  FullWidthChartCard,
  FullWidthChartWrapper,
  MessageCard,
  Section,
  StatCard,
  StatLabel,
  StatValue,
  StatsGrid,
  Subtitle,
  Title,
} from "./styles";
import { useDashboardController } from "./controller";

const chartPalette = ["#0B666A", "#35A29F", "#7DD3D0", "#99F6E4", "#115E59", "#2DD4BF"];

const currencyFormatter = (value: number): string => `$${Number(value).toFixed(2)}`;
const tooltipCurrencyFormatter = (value: unknown): string =>
  currencyFormatter(Number(value ?? 0));
const chartLabelFormatter = (value: unknown): string =>
  currencyFormatter(Number(value ?? 0));
const pieLabelFormatter = (entry: { category: string; total: number }): string =>
  `${entry.category}: ${currencyFormatter(entry.total)}`;

type ChartKey = "overTime" | "monthly" | "category" | "topPurchases";

const chartFilterOptions: { key: ChartKey; label: string }[] = [
  { key: "overTime", label: "Spending Over Time" },
  { key: "monthly", label: "Monthly Spending" },
  { key: "category", label: "By Category" },
  { key: "topPurchases", label: "Top Purchases" },
];

const Dashboard: React.FC = () => {
  const [selectedCharts, setSelectedCharts] = useState<ChartKey[]>([
    "overTime",
    "monthly",
    "category",
    "topPurchases",
  ]);

  const {
    loading,
    error,
    stats,
    spendingOverTime,
    monthlySpending,
    categoryDistribution,
    topPurchases,
  } = useDashboardController();

  const chartVisibility = useMemo(
    () => ({
      overTime: selectedCharts.includes("overTime"),
      monthly: selectedCharts.includes("monthly"),
      category: selectedCharts.includes("category"),
      topPurchases: selectedCharts.includes("topPurchases"),
    }),
    [selectedCharts]
  );

  const toggleChart = (key: ChartKey) => {
    setSelectedCharts((current) => {
      if (current.includes(key)) {
        return current.filter((item) => item !== key);
      }
      return [...current, key];
    });
  };

  const showAllCharts = () => {
    setSelectedCharts(["overTime", "monthly", "category", "topPurchases"]);
  };

  return (
    <Layout>
      <Container>
        <Title>Financial Analytics Dashboard</Title>
        <Subtitle>
          Track spending patterns, category distribution, and top-value purchases from scanned receipts.
        </Subtitle>

        <FilterBar>
          <FilterLabel>Visible charts:</FilterLabel>
          {chartFilterOptions.map((chart) => (
            <FilterButton
              key={chart.key}
              type="button"
              $active={selectedCharts.includes(chart.key)}
              onClick={() => toggleChart(chart.key)}
            >
              {chart.label}
            </FilterButton>
          ))}
          <FilterButton type="button" $active={selectedCharts.length === 4} onClick={showAllCharts}>
            Show all
          </FilterButton>
        </FilterBar>

        <Section>
          <StatsGrid>
            <StatCard>
              <StatLabel>Total receipts</StatLabel>
              <StatValue>{stats.totalReceipts}</StatValue>
            </StatCard>
            <StatCard>
              <StatLabel>Total money spent</StatLabel>
              <StatValue>{currencyFormatter(stats.totalSpent)}</StatValue>
            </StatCard>
            <StatCard>
              <StatLabel>Average receipt value</StatLabel>
              <StatValue>{currencyFormatter(stats.averageReceiptValue)}</StatValue>
            </StatCard>
            <StatCard>
              <StatLabel>Highest receipt value</StatLabel>
              <StatValue>{currencyFormatter(stats.highestReceiptValue)}</StatValue>
            </StatCard>
          </StatsGrid>
        </Section>

        {loading && <MessageCard>Loading dashboard analytics...</MessageCard>}
        {!loading && error && <ErrorCard>{error}</ErrorCard>}

        {!loading && !error && (
          <>
            {chartVisibility.overTime && (
              <Section>
              <ChartCard>
                <ChartTitle>Spending Over Time</ChartTitle>
                <ChartWrapper>
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={spendingOverTime}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip formatter={tooltipCurrencyFormatter} />
                      <Legend />
                      <Line
                        type="monotone"
                        dataKey="total"
                        name="Spend"
                        stroke="#0B666A"
                        strokeWidth={3}
                        dot={{ r: 3 }}
                        activeDot={{ r: 5 }}
                      >
                        <LabelList
                          dataKey="total"
                          position="top"
                          fill="#0f172a"
                          fontSize={11}
                          formatter={chartLabelFormatter}
                        />
                      </Line>
                    </LineChart>
                  </ResponsiveContainer>
                </ChartWrapper>
              </ChartCard>
              </Section>
            )}

            {chartVisibility.monthly && (
              <Section>
              <ChartCard>
                <ChartTitle>Monthly Spending</ChartTitle>
                <ChartWrapper>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={monthlySpending}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip formatter={tooltipCurrencyFormatter} />
                      <Legend />
                      <Bar dataKey="total" name="Monthly spend" fill="#35A29F" radius={[8, 8, 0, 0]}>
                        <LabelList
                          dataKey="total"
                          position="insideTop"
                          fill="#0f172a"
                          fontSize={11}
                          formatter={chartLabelFormatter}
                        />
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </ChartWrapper>
              </ChartCard>
              </Section>
            )}

            {(chartVisibility.category || chartVisibility.topPurchases) && (
              <Section>
              <ChartGrid>
                {chartVisibility.category && (
                  <ChartCard>
                  <ChartTitle>Spending by Category</ChartTitle>
                  <ChartWrapper>
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={categoryDistribution}
                          dataKey="total"
                          nameKey="category"
                          cx="50%"
                          cy="50%"
                          outerRadius={100}
                          innerRadius={55}
                          paddingAngle={2}
                          label={pieLabelFormatter}
                          labelLine
                        >
                          {categoryDistribution.map((entry, index) => (
                            <Cell
                              key={`${entry.category}-${index}`}
                              fill={chartPalette[index % chartPalette.length]}
                            />
                          ))}
                        </Pie>
                        <Tooltip formatter={tooltipCurrencyFormatter} />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </ChartWrapper>
                  </ChartCard>
                )}

                {chartVisibility.topPurchases && (
                  <ChartCard>
                  <ChartTitle>Top Purchases</ChartTitle>
                  <ChartWrapper>
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={topPurchases}
                        layout="vertical"
                        margin={{ top: 5, right: 15, left: 20, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                        <XAxis type="number" />
                        <YAxis
                          type="category"
                          dataKey="description"
                          width={140}
                          tick={{ fontSize: 12 }}
                        />
                        <Tooltip formatter={tooltipCurrencyFormatter} />
                        <Legend />
                        <Bar dataKey="total" name="Top value" fill="#0B666A" radius={[0, 8, 8, 0]}>
                          <LabelList
                            dataKey="total"
                            position="insideRight"
                            fill="#ffffff"
                            fontSize={11}
                            formatter={chartLabelFormatter}
                          />
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </ChartWrapper>
                  </ChartCard>
                )}
              </ChartGrid>
              </Section>
            )}

            {selectedCharts.length === 0 && (
              <MessageCard>
                No chart selected. Choose at least one chart filter above.
              </MessageCard>
            )}

            {stats.totalReceipts === 0 && (
              <FullWidthChartCard>
                <ChartTitle>No analytics data yet</ChartTitle>
                <FullWidthChartWrapper>
                  <MessageCard>
                    Add receipts in the insert page to populate your financial dashboard charts.
                  </MessageCard>
                </FullWidthChartWrapper>
              </FullWidthChartCard>
            )}
          </>
        )}
      </Container>
    </Layout>
  );
};

export default Dashboard;
