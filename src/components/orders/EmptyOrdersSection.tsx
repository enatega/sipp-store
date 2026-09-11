import React from "react";
import { StyleSheet, View } from "react-native";
import Text from "../Text";
import Svg, { type SvgName } from "../Svg";
import { useTranslations } from "../../localization/LocalizationProvider";

type Props = {
  message?: string;
  svgName?: SvgName;
};

const EmptyOrdersSection = ({
  message = "no_orders_here",
  svgName = "emptyCart",
}: Props) => {
  const { t } = useTranslations("app");

  return (
    <View style={styles.container}>
      <View style={styles.illustrationContainer}>
        <Svg name={svgName} width={200} height={200} />
      </View>
      <View style={styles.content}>
        <Text variant="subtitle" weight="semiBold" style={[styles.title]}>
          {t(message)}
        </Text>
      </View>
    </View>
  );
};

export default EmptyOrdersSection;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    height: "100%",
    width: "100%",
  },
  illustrationContainer: {
    marginBottom: 8,
  },
  content: {
    width: "100%",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 8,
  },
  title: {
    textAlign: "center",
    marginBottom: 12,
    letterSpacing: -0.48,
  },
});
