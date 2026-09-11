import React from "react";
import { View } from "react-native";
import { useTranslations } from "../../../localization/LocalizationProvider";
import Text from "../../Text";
import { OrderStatus } from "../../../api/orderServicesTypes";
import { styles } from "./styles";
import { Feather } from "@expo/vector-icons";
import { useAppTheme } from "../../../theme/ThemeProvider";

type Props = {
    orderCode: string;
    status: OrderStatus;
    createdAt: string;
    deliveredBadgeLabel?: string;
    headerStatusLabel?: string | null;
    headerStatusTone?: "blue" | "green" | "amber";
};

export default function OrderHeader({
    orderCode,
    status,
    createdAt,
    deliveredBadgeLabel,
    headerStatusLabel,
    headerStatusTone = "blue",
}: Props) {
    const { t } = useTranslations("app");
    const { theme } = useAppTheme();
    const createdDate = new Date(createdAt);
    const formattedDate = createdDate.toLocaleDateString(undefined, {
        day: "2-digit",
        month: "short",
        year: "numeric",
    });
    const formattedTime = createdDate.toLocaleTimeString(undefined, {
        hour: "2-digit",
        minute: "2-digit",
    });

    return (
        <>
            {headerStatusLabel ? (
                <>
                    <View style={styles.headerStatusRow}>
                        <Text style={styles.headerStatusLabel}>{t("order_card_order_status")}</Text>
                        <View
                            style={[
                                styles.headerStatusBadge,
                                headerStatusTone === "green" && styles.headerStatusBadgeGreen,
                                headerStatusTone === "amber" && styles.headerStatusBadgeAmber,
                            ]}
                        >
                            <Feather
                                name="navigation"
                                size={13}
                                color={
                                    headerStatusTone === "green"
                                        ? "#047857"
                                        : headerStatusTone === "amber"
                                            ? "#B45309"
                                            : "#1D4ED8"
                                }
                            />
                            <Text
                                style={[
                                    styles.headerStatusText,
                                    headerStatusTone === "green" && styles.headerStatusTextGreen,
                                    headerStatusTone === "amber" && styles.headerStatusTextAmber,
                                ]}
                            >
                                {headerStatusLabel}
                            </Text>
                        </View>
                    </View>
                    <View style={[styles.divider, { backgroundColor: "#E5E7EB" }]} />
                </>
            ) : null}
            <View style={styles.headerTopGrid}>
                <View style={styles.headerInfoItem}>
                    <View style={[styles.headerIconWrap, { backgroundColor: theme.colors.tertiary }]}>
                        <Feather name="list" size={16} color={theme.colors.primary} />
                    </View>
                    <View style={styles.headerInfoTextWrap}>
                        <Text style={styles.headerLabel}>{t("order_card_id_label")}</Text>
                        <Text style={styles.headerValue} weight="medium">
                            {orderCode}
                        </Text>
                    </View>
                </View>
                <View style={styles.headerInfoItem}>
                    <View style={[styles.headerIconWrap, { backgroundColor: theme.colors.tertiary }]}>
                        <Feather name="calendar" size={16} color={theme.colors.primary} />
                    </View>
                    <View style={styles.headerInfoTextWrap}>
                        <Text style={styles.headerLabel}>{t("order_card_placed_on")}</Text>
                        <Text style={styles.headerValue} weight="medium">
                            {formattedDate}
                        </Text>
                        <Text style={styles.headerValue} weight="medium">
                            {formattedTime}
                        </Text>
                    </View>
                </View>
            </View>

        </>
    );
}
