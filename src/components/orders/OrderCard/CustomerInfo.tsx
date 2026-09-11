import React from "react";
import { Alert, Image, Linking, Platform, Pressable, View } from "react-native";
import { useTranslations } from "../../../localization/LocalizationProvider";
import Text from "../../Text";
import { styles } from "./styles";
import { Feather } from "@expo/vector-icons";

type Props = {
    customerName: string;
    customerProfileImage: string | null;
    orderType: "delivery" | "pickup";
    address: string | null;
    theme: any;
};

export default function CustomerInfo({
    customerName,
    customerProfileImage,
    orderType,
    address,
    theme,
}: Props) {
    const { t } = useTranslations("app");
    const mapQuery = address?.trim();

    const handleViewOnMap = async () => {
        if (!mapQuery) return;

        const encodedQuery = encodeURIComponent(mapQuery);
        const mapUrls = Platform.select({
            ios: [
                `maps://?q=${encodedQuery}`,
                `https://maps.apple.com/?q=${encodedQuery}`,
                `https://www.google.com/maps/search/?api=1&query=${encodedQuery}`,
            ],
            android: [
                `geo:0,0?q=${encodedQuery}`,
                `https://www.google.com/maps/search/?api=1&query=${encodedQuery}`,
            ],
            default: [`https://www.google.com/maps/search/?api=1&query=${encodedQuery}`],
        }) as string[];

        try {
            for (const url of mapUrls) {
                try {
                    await Linking.openURL(url);
                    return;
                } catch {
                    // Try the next URL fallback.
                }
            }
        } catch {
            // Fall through to alert below.
        }

        try {
            const webFallback = `https://www.google.com/maps/search/?api=1&query=${encodedQuery}`;
            await Linking.openURL(webFallback);
            return;
        } catch {
            Alert.alert(t("order_card_map_open_failed"));
        }
    };

    return (
        <>
            <View style={[styles.divider, { backgroundColor: theme.colors.gray200 }]} />
            <View style={styles.customerRow}>
                {customerProfileImage ? (
                    <Image source={{ uri: customerProfileImage }} style={styles.customerAvatarImage} />
                ) : (
                    <View style={styles.customerAvatar} />
                )}
                <View style={styles.customerTextWrap}>
                    <Text style={styles.customerLabel}>{t("order_card_customer_name")}</Text>
                    <Text style={styles.customerName} weight="medium">
                        {customerName}
                    </Text>
                </View>
            </View>
            {address ? (
                <>
                    <View style={[styles.divider, { backgroundColor: theme.colors.gray200 }]} />
                    <View style={styles.addressRow}>
                        <View style={[styles.rowIconWrap, { backgroundColor: theme.colors.tertiary }]}>
                            <Feather name="map-pin" size={16} color={theme.colors.primary} />
                        </View>
                        <View style={styles.addressTextWrap}>
                            <Text style={styles.addressLabel}>{t("order_card_address")}</Text>
                            <Text style={styles.address} numberOfLines={2} weight="medium">
                                {address}
                            </Text>
                        </View>
                        {orderType === "delivery" ? (
                            <Pressable style={styles.viewMapButton} onPress={handleViewOnMap}>
                                <Feather name="map" size={14} color="#4B5563" />
                                <Text style={styles.viewMapText}>{t("order_card_view_map")}</Text>
                            </Pressable>
                        ) : null}
                    </View>
                </>
            ) : null}
        </>
    );
}
