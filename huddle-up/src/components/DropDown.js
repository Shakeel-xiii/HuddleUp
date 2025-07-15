import { useActionSheet } from "@expo/react-native-action-sheet";
import Button from "./Button";
export default function Menu({ data, setValue, value, placeHolder, error }) {
  const { showActionSheetWithOptions } = useActionSheet();
  const onPress = () => {
    const options = data;
    const cancelButtonIndex = data.indexOf(value);

    showActionSheetWithOptions(
      {
        options,
        cancelButtonIndex,
        containerStyle: {
          maxHeight: "80%",
        },
      },
      (selectedIndex) => {
        if (selectedIndex < 0) setValue(placeHolder);
        setValue(data[selectedIndex]);
      }
    );
  };

  return (
    <Button
      mode={"outlined"}
      onPress={onPress}
      labelStyle={error && { color: "red" }}
      style={error && { borderColor: "red" }}
    >
      {value ?? placeHolder}
    </Button>
  );
}
