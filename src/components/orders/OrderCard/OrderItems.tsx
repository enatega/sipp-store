import React, { useState } from "react";
import { Image, Pressable, View } from "react-native";
import { useTranslations } from "../../../localization/LocalizationProvider";
import Text from "../../Text";
import { OrderItem, OrderSummary } from "../../../api/orderServicesTypes";
import { styles } from "./styles";
import { useCurrencyFormatter } from "../../../hooks/useCurrency";
import { Feather } from "@expo/vector-icons";

type Props = {
  items: OrderItem[];
  totalAmount: number;
  orderSummary?: OrderSummary | null;
  theme: any;
};

type ParsedOption = {
  label: string;
  price?: number;
};

function toNumberOrUndefined(value: unknown): number | undefined {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === "string") {
    const normalized = Number(value.replace(/[^\d.-]/g, ""));
    if (Number.isFinite(normalized)) {
      return normalized;
    }
  }

  return undefined;
}

function parseSelectedOptions(selectedOptions: unknown): ParsedOption[] {
  if (selectedOptions == null) return [];

  if (Array.isArray(selectedOptions)) {
    return selectedOptions
      .map((entry) => {
        if (typeof entry === "string") {
          const label = entry.trim();
          return label ? { label } : null;
        }

        if (entry && typeof entry === "object") {
          const option = entry as {
            title?: unknown;
            name?: unknown;
            label?: unknown;
            price?: unknown;
            amount?: unknown;
            totalPrice?: unknown;
          };

          const labelValue = [option.title, option.name, option.label].find(
            (value) => typeof value === "string" && value.trim().length > 0,
          ) as string | undefined;

          const priceValue = [option.price, option.amount, option.totalPrice]
            .map(toNumberOrUndefined)
            .find((value) => typeof value === "number");

          if (!labelValue) return null;
          return { label: labelValue.trim(), price: priceValue };
        }

        return null;
      })
      .filter((entry): entry is ParsedOption => Boolean(entry));
  }

  if (typeof selectedOptions === "object") {
    try {
      const rawJson = JSON.stringify(selectedOptions);
      if (!rawJson) return [];
      return parseSelectedOptions(rawJson);
    } catch {
      return [];
    }
  }

  if (typeof selectedOptions !== "string") return [];

  const raw = selectedOptions.trim();
  if (!raw) return [];

  try {
    const parsed = JSON.parse(raw) as unknown;

    if (Array.isArray(parsed)) {
      return parsed
        .map((entry) => {
          if (typeof entry === "string") {
            return { label: entry.trim() };
          }

          if (entry && typeof entry === "object") {
            const option = entry as {
              title?: unknown;
              name?: unknown;
              label?: unknown;
              price?: unknown;
              amount?: unknown;
              totalPrice?: unknown;
            };

            const labelValue = [option.title, option.name, option.label].find(
              (value) => typeof value === "string" && value.trim().length > 0,
            ) as string | undefined;

            const priceValue = [option.price, option.amount, option.totalPrice]
              .map(toNumberOrUndefined)
              .find((value) => typeof value === "number");

            if (!labelValue) return null;

            return { label: labelValue.trim(), price: priceValue };
          }

          return null;
        })
        .filter((entry): entry is ParsedOption => Boolean(entry));
    }
  } catch {
    // Keep fallback behavior for plain string values.
  }

  return raw
    .split(",")
    .map((entry) => entry.trim())
    .filter(Boolean)
    .map((label) => ({ label }));
}

export default function OrderItems({ items, totalAmount, orderSummary, theme }: Props) {
  const { t } = useTranslations("app");
  const { formatAmount } = useCurrencyFormatter();
  const [expandedAddons, setExpandedAddons] = useState<Record<string, boolean>>({});
  const [isBillExpanded, setIsBillExpanded] = useState(true);

  if (!items || items.length === 0) return null;

  const subtotalValue =
    typeof orderSummary?.itemSubtotal === "number" && Math.abs(orderSummary.itemSubtotal) > 0
      ? orderSummary.itemSubtotal
      : null;

  const summaryRows = [
    { key: "discountAmount", label: t("order_card_bill_discount"), value: orderSummary?.discountAmount },
    { key: "taxAmount", label: t("order_card_bill_tax"), value: orderSummary?.taxAmount },
    { key: "packingCharges", label: t("order_card_bill_packing"), value: orderSummary?.packingCharges },
    { key: "deliveryFee", label: t("order_card_bill_delivery_fee"), value: orderSummary?.deliveryFee },
    { key: "courierTip", label: t("order_card_bill_tip"), value: orderSummary?.courierTip },
  ].filter((row) => typeof row.value === "number" && Math.abs(row.value ?? 0) > 0);

  const resolvedTotal =
    typeof orderSummary?.totalAmount === "number" ? orderSummary.totalAmount : totalAmount;

  return (
    <>
      <View style={styles.itemsHeader}>
        <Text style={styles.colHeader}>{t("order_card_col_order")}</Text>
        <Text style={styles.colHeaderRight}>{t("order_card_col_price")}</Text>
      </View>
      {items.map((item, idx) => {
        const parsedOptions = parseSelectedOptions(item.selectedOptions);
        const itemKey = `${item.productId || item.name}-${idx}`;
        const isExpanded = Boolean(expandedAddons[itemKey]);

        return (
          <View key={idx} style={styles.itemRow}>
            <View
              style={[
                styles.foodImageBox,
                {
                  backgroundColor: theme.colors.gray200,
                  borderColor: theme.colors.gray200,
                },
              ]}
            >
              {item.image ? (
                <Image
                  source={{ uri: encodeURI(item.image) }}
                  style={styles.foodImage}
                  resizeMode="cover"
                  onError={(error) => {
                    console.log("[OrderItems] image load failed", {
                      productId: item.productId,
                      name: item.name,
                      image: item.image,
                      error: error.nativeEvent?.error,
                    });
                  }}
                />
              ) : (
                <View
                  style={[
                    styles.foodImagePlaceholder,
                    { backgroundColor: theme.colors.gray200 },
                  ]}
                />
              )}
            </View>
            <View style={styles.itemInfo}>
              <Text style={styles.itemName} weight="semiBold">
                {item.name}
              </Text>
              {parsedOptions.length > 0 ? (
                <>
                  <Pressable
                    style={styles.addOnToggle}
                    onPress={() =>
                      setExpandedAddons((prev) => ({
                        ...prev,
                        [itemKey]: !prev[itemKey],
                      }))
                    }
                  >
                    <Text style={[styles.addOnToggleText, { color: theme.colors.gray600 }]}>
                      {t("order_card_add_ons")} ({parsedOptions.length})
                    </Text>
                    <Feather
                      name={isExpanded ? "chevron-up" : "chevron-down"}
                      size={14}
                      color={theme.colors.gray600}
                    />
                  </Pressable>
                  {isExpanded ? (
                    <View style={styles.itemOptionsWrap}>
                      {parsedOptions.map((option, optionIndex) => (
                        <View key={`${item.productId}-${optionIndex}`} style={styles.itemOptionRow}>
                          <Text
                            style={[
                              styles.itemOptionText,
                              { color: theme.colors.gray500 },
                            ]}
                          >
                            {option.label}
                          </Text>
                        </View>
                      ))}
                    </View>
                  ) : null}
                </>
              ) : null}
              <Text style={[styles.itemQty, { backgroundColor: theme.colors.gray100 }]}>
                x{item.quantity}
              </Text>
            </View>
            <View style={styles.itemPriceColumn}>
              <Text style={styles.itemPrice} weight="semiBold">
                {formatAmount(item.totalPrice, 2)}
              </Text>
              {parsedOptions.length > 0 && isExpanded ? (
                <View style={styles.itemOptionPricesWrap}>
                  {parsedOptions.map((option, optionIndex) =>
                    typeof option.price === "number" ? (
                      <Text
                        key={`${item.productId}-price-${optionIndex}`}
                        style={[
                          styles.itemOptionPrice,
                          { color: theme.colors.gray500 },
                        ]}
                      >
                        {formatAmount(option.price, 2)}
                      </Text>
                    ) : (
                      <View key={`${item.productId}-price-${optionIndex}`} style={styles.itemOptionPriceGap} />
                    ),
                  )}
                </View>
              ) : null}
            </View>
          </View>
        );
      })}
      <View style={[styles.divider, { backgroundColor: theme.colors.gray200 }]} />
      {summaryRows.length > 0 || subtotalValue !== null ? (
        <View style={styles.billDetailsWrap}>
          <Pressable
            style={styles.billHeaderRow}
            onPress={() => setIsBillExpanded((prev) => !prev)}
          >
            <Text style={styles.billHeaderTitle} weight="semiBold" color={theme.colors.gray900}>
              {t("order_card_bill_details")}
            </Text>
            <Feather
              name={isBillExpanded ? "chevron-up" : "chevron-down"}
              size={16}
              color={theme.colors.gray600}
            />
          </Pressable>
          {!isBillExpanded ? (
            <View style={[styles.divider, { backgroundColor: theme.colors.gray200 }]} />
          ) : null}
          {subtotalValue !== null ? (
            <View style={styles.billRow}>
              <Text style={styles.billRowLabel} color={theme.colors.gray600}>
                {t("order_card_bill_subtotal")}
              </Text>
              <Text style={styles.billRowValue} color={theme.colors.gray900}>
                {formatAmount(subtotalValue, 2)}
              </Text>
            </View>
          ) : null}
          {isBillExpanded ? (
            <>
              {summaryRows.map((row) => (
                <View key={row.key} style={styles.billRow}>
                  <Text style={styles.billRowLabel} color={theme.colors.gray600}>
                    {row.label}
                  </Text>
                  <Text style={styles.billRowValue} color={theme.colors.gray900}>
                    {formatAmount(row.value ?? 0, 2)}
                  </Text>
                </View>
              ))}
              {orderSummary?.note ? (
                <Text style={styles.billNoteText} color={theme.colors.gray500}>
                  {orderSummary.note}
                </Text>
              ) : null}
              <View style={[styles.divider, { backgroundColor: theme.colors.gray200 }]} />
            </>
          ) : null}
        </View>
      ) : null}
      <View style={styles.totalRow}>
        <Text style={styles.totalLabel} weight="semiBold">
          {t("order_card_total")}
        </Text>
        <Text style={styles.totalValue} weight="semiBold">
          {formatAmount(resolvedTotal, 2)}
        </Text>
      </View>
    </>
  );
}
