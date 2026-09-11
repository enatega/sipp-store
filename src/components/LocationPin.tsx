import { View, StyleSheet } from "react-native";

export default function LocationPin({ color }: { color: string }) {
  return (
    <View style={pinStyles.wrapper}>
      <View style={[pinStyles.circle, { borderColor: color }]} />
      <View style={[pinStyles.tail, { backgroundColor: color }]} />
    </View>
  );
}

const pinStyles = StyleSheet.create({
  wrapper: {
    width: 12,
    height: 16,
    alignItems: "center",
    marginTop: 1,
  },
  circle: {
    width: 10,
    height: 10,
    borderRadius: 5,
    borderWidth: 1.5,
  },
  tail: {
    width: 1.5,
    height: 5,
    borderRadius: 1,
    marginTop: -1,
  },
});
