import React from "react";
import { View, Pressable, ActivityIndicator, Linking } from "react-native";
import { useTranslations } from "../../../localization/LocalizationProvider";
import Text from "../../Text";
import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import { OrderStatus } from "../../../api/orderServicesTypes";
import { styles } from "./styles";

type Props = {
    status: OrderStatus;
    orderId: string;
    riderArrived: boolean;
    riderStatus: string | null;
    riderStatusLabel: string | null;
    riderName: string | null;
    riderVehicle: string | null;
    riderPhone: string | null;
    unreadMessagesCount?: number;
    onOpenChat?: () => void;
    onConfirmPickup?: (orderId: string) => void;
    showConfirmButton?: boolean;
    isConfirmingPickup?: boolean;
    theme: any;
};

export default function ReadyPickupSection({
    status,
    orderId,
    riderArrived,
    riderStatus,
    riderStatusLabel,
    riderName,
    riderVehicle,
    riderPhone,
    unreadMessagesCount = 0,
    onOpenChat,
    onConfirmPickup,
    showConfirmButton = false,
    isConfirmingPickup,
    theme,
}: Props) {
    const { t } = useTranslations("app");
    const isReady = status === OrderStatus.READY;
    const isPickedUp = status === OrderStatus.PICKED_UP;
    const handleCallRider = () => {
        if (!riderPhone) return;
        Linking.openURL(`tel:${riderPhone}`);
    };

    return (
        <>
            <View style={[styles.divider, { backgroundColor: theme.colors.gray200, marginVertical: 8 }]} />
            {!!riderName && (
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

            {showConfirmButton && (isReady || isPickedUp) && (
                <Pressable
                    style={[styles.btnConfirmPickup, { backgroundColor: theme.colors.primary }, isConfirmingPickup && { opacity: 0.6 }]}
                    onPress={() => onConfirmPickup?.(orderId)}
                    disabled={isConfirmingPickup}
                >
                    {isConfirmingPickup ? (
                        <ActivityIndicator size="small" color={theme.colors.buttonText} />
                    ) : (
                        <View style={styles.confirmPickupContent}>
                            <View style={[styles.confirmPickupIconCircle, { borderColor: theme.colors.buttonText }]}>
                                <Feather name="check" size={12} color={theme.colors.buttonText} />
                            </View>
                            <Text style={[styles.btnConfirmPickupText, { color: theme.colors.buttonText }]}>
                                {t(isPickedUp ? "order_card_mark_delivered" : "order_card_confirm_pickup")}
                            </Text>
                        </View>
                    )}
                </Pressable>
            )}
        </>
    );
}
