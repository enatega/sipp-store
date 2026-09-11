import React, { useEffect, useMemo, useState } from "react";
import { View, Pressable, ActivityIndicator, Linking } from "react-native";
import { useTranslations } from "../../../localization/LocalizationProvider";
import Text from "../../Text";
import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import Svg from "../../Svg";
import CountdownTimer from "../../CountdownTimer";
import { styles } from "./styles";
import { getReadableRiderStatus } from "./riderStatusLabel";

type Props = {
    orderId: string;
    riderArrived: boolean;
    riderStatus: string | null;
    riderStatusLabel: string | null;
    riderName: string | null;
    riderPhone: string | null;
    riderVehicle: string | null;
    unreadMessagesCount?: number;
    onOpenChat?: () => void;
    preparingTimeInMinutes: number;
    remainingSeconds?: number | null;
    startTime: number | null;
    onMarkReady: (orderId: string) => void;
    onUpdatePreparingTime: (orderId: string, minutes: number) => void;
    canMarkReady: boolean;
    theme: any;
    isMarkingReady?: boolean;
    isUpdatingTime?: boolean;
};

export default function InProgressSection({
    orderId,
    riderArrived,
    riderStatus,
    riderStatusLabel,
    riderName,
    riderPhone,
    riderVehicle,
    unreadMessagesCount = 0,
    onOpenChat,
    preparingTimeInMinutes,
    remainingSeconds,
    startTime,
    onMarkReady,
    onUpdatePreparingTime,
    canMarkReady,
    isMarkingReady,
    isUpdatingTime,
    theme,
}: Props) {
    const { t } = useTranslations("app");
    const formattedRiderStatus = getReadableRiderStatus(null, riderStatus, riderStatusLabel);
    const initialRemainingSeconds = useMemo(() => {
        if (
            typeof remainingSeconds === "number" &&
            (remainingSeconds > 0 || preparingTimeInMinutes <= 0)
        ) {
            return Math.max(0, remainingSeconds);
        }

        return Math.max(0, preparingTimeInMinutes * 60);
    }, [preparingTimeInMinutes, remainingSeconds]);
    const [liveRemainingSeconds, setLiveRemainingSeconds] = useState(initialRemainingSeconds);
    const handleCallRider = () => {
        if (!riderPhone) return;
        Linking.openURL(`tel:${riderPhone}`);
    };

    useEffect(() => {
        setLiveRemainingSeconds(initialRemainingSeconds);
    }, [initialRemainingSeconds, orderId]);

    return (
        <>
            <View style={[styles.divider, { backgroundColor: theme.colors.gray200, marginVertical: 12 }]} />
            <View style={{ gap: 10 }}>
                {formattedRiderStatus && (
                    <View style={styles.riderStatusBadge}>
                        <Feather name="navigation" size={14} color="#1D4ED8" />
                        <Text style={[styles.riderStatusText, { color: "#1D4ED8" }]}>
                            {formattedRiderStatus}
                        </Text>
                    </View>
                )}
                {riderArrived && (
                    <View style={[styles.riderStatusBadge, styles.riderArrivedBadge]}>
                        <Feather name="check-circle" size={14} color="#059669" />
                        <Text style={[styles.riderStatusText, { color: "#059669" }]}>{t("order_card_rider_arrived")}</Text>
                    </View>
                )}
                {riderName && (
                    <View style={styles.riderDetailsBox}>
                        <View style={styles.riderAssignedCompact}>
                            <Text style={styles.riderNameText} weight="semiBold">
                                {riderName}
                            </Text>
                            <View style={styles.actionButtonsRow}>
                                <Pressable
                                    style={[styles.iconBtn, !riderPhone && styles.iconBtnDisabled]}
                                    onPress={handleCallRider}
                                    disabled={!riderPhone}
                                >
                                    <Feather name="phone" size={20} color="#374151" />
                                </Pressable>
                                <Pressable style={styles.iconBtn} onPress={onOpenChat}>
                                    <Feather name="message-circle" size={20} color="#374151" />
                                    {unreadMessagesCount > 0 ? (
                                        <View style={styles.badge}>
                                            <Text style={styles.badgeText}>{unreadMessagesCount}</Text>
                                        </View>
                                    ) : null}
                                </Pressable>
                            </View>
                        </View>
                        <View style={styles.riderVehicleRow}>
                            <MaterialCommunityIcons name="bike" size={16} color="#4B5563" />
                            <Text style={styles.riderVehicleText}>
                                {riderVehicle || "-"}
                            </Text>
                        </View>
                    </View>
                )}
                <View style={[styles.preparingStatusBox, { backgroundColor: theme.colors.green50 }]}>
                    <View style={styles.preparingLeft}>
                        <Svg name="timer" width={40} height={40} />
                        <Text style={styles.preparingText}>{t("order_card_preparing")}</Text>
                    </View>
                    <CountdownTimer
                        startTimeMs={startTime}
                        totalMinutes={preparingTimeInMinutes}
                        remainingSecondsOverride={liveRemainingSeconds}
                        style={styles.timerText}
                    />
                </View>
            </View>

            <View style={styles.inProgressActions}>
                <Pressable
                    style={[styles.btnPlusTime, isUpdatingTime && { opacity: 0.6 }]}
                    onPress={() => {
                        const nextMinutes = (preparingTimeInMinutes || 0) + 5;
                        setLiveRemainingSeconds((prev) => Math.max(0, prev) + 5 * 60);
                        console.log("[InProgressSection] +5m tapped", {
                            orderId,
                            currentPreparingTimeInMinutes: preparingTimeInMinutes,
                            nextPreparingTimeInMinutes: nextMinutes,
                        });
                        onUpdatePreparingTime(orderId, nextMinutes);
                    }}
                    disabled={isUpdatingTime}
                >
                    {isUpdatingTime ? (
                        <ActivityIndicator size="small" color="#374151" />
                    ) : (
                        <Text style={styles.btnPlusTimeText}>+5m</Text>
                    )}
                </Pressable>
                <Pressable
                    style={[
                      styles.btnMarkReady,
                      { backgroundColor: canMarkReady ? theme.colors.primary : theme.colors.gray300 },
                      (isMarkingReady || !canMarkReady) && { opacity: 0.6 },
                    ]}
                    onPress={() => {
                      if (!canMarkReady) return;
                      onMarkReady(orderId);
                    }}
                    disabled={isMarkingReady || !canMarkReady}
                >
                    {isMarkingReady ? (
                        <ActivityIndicator size="small" color={theme.colors.buttonText} />
                    ) : (
                        <Text style={[styles.btnMarkReadyText, { color: theme.colors.buttonText }]}>
                            {t("order_card_mark_ready")}
                        </Text>
                    )}
                </Pressable>
            </View>
        </>
    );
}
