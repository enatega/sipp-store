import React from 'react';
import { StyleSheet, View } from 'react-native';
import Text from './Text';
import { useAppTheme } from '../theme/ThemeProvider';

export type BarChartDataPoint = {
  label: string;   // x-axis label e.g. "23 Jan-\n29 Jan"
  value: number;   // raw value
  displayValue: string; // e.g. "$200"
};

type Props = {
  data: BarChartDataPoint[];
  height?: number;
};

/**
 * Simple vertical bar chart — no external library.
 * Bars scale relative to the max value in the dataset.
 */
export default function BarChart({ data, height = 180 }: Props) {
  const { theme } = useAppTheme();

  const max = Math.max(...data.map((d) => d.value), 1);

  return (
    <View style={styles.container}>
      {/* Bars + value labels */}
      <View style={[styles.barsRow, { height }]}>
        {data.map((point, idx) => {
          const barHeightPct = point.value / max;
          const barHeight = Math.max(barHeightPct * (height - 24), 4); // 24px reserved for value label

          return (
            <View key={idx} style={styles.barColumn}>
              {/* Value label above bar */}
              <Text
                variant="caption"
                color={theme.colors.gray500}
                style={styles.valueLabel}
              >
                {point.displayValue}
              </Text>

              {/* Bar */}
              <View style={styles.barWrapper}>
                <View
                  style={[
                    styles.bar,
                    {
                      height: barHeight,
                      backgroundColor: theme.colors.primary,
                    },
                  ]}
                />
              </View>
            </View>
          );
        })}
      </View>

      {/* X-axis labels */}
      <View style={styles.labelsRow}>
        {data.map((point, idx) => (
          <Text
            key={idx}
            variant="caption"
            color={theme.colors.gray500}
            style={styles.xLabel}
          >
            {point.label}
          </Text>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  barsRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 12,
    paddingHorizontal: 8,
  },
  barColumn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-end',
    height: '100%',
  },
  valueLabel: {
    fontSize: 12,
    marginBottom: 4,
    textAlign: 'center',
  },
  barWrapper: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  bar: {
    width: '100%',
    borderRadius: 4,
  },
  labelsRow: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 8,
    marginTop: 8,
  },
  xLabel: {
    flex: 1,
    fontSize: 11,
    textAlign: 'center',
  },
});
