import React, { createRef, useState } from "react";
import {
  FlatList,
  StyleSheet,
  TouchableOpacity,
  View,
  Text,
  Pressable,
} from "react-native";
import dateFormat from "dateformat";

const enumerateDaysBetweenDates = (startDate, endDate) => {
  const dateArray = [];
  let currentDate = new Date(startDate);
  while (currentDate <= endDate) {
    dateArray.push(currentDate.toISOString().slice(0, 10));
    currentDate.setDate(currentDate.getDate() + 1);
  }
  return dateArray;
};

const SelectedDate = ({
  text,
  selectedItemWidth = 170,
  selectedItemTextStyle = styles.selectedDateText,
  selectedItemBackgroundColor = "#16213e",
  itemRadius,
  itemHeight,
}) => {
  return (
    <View
      style={[
        styles.selectedDateContainer,
        {
          width: selectedItemWidth,
          backgroundColor: selectedItemBackgroundColor,
          borderRadius: itemRadius,
          height: itemHeight,
        },
      ]}
    >
      <Text style={[selectedItemTextStyle, styles.selectedDateText]}>
        {text}
      </Text>
    </View>
  );
};

const UnSelectedDate = ({
  text,
  unselectedItemWidth = 38,
  unselectedItemTextStyle = styles.unSelectedDateText,
  unselectedItemBackgroundColor = "#fff",
  itemRadius,
  itemHeight,
}) => {
  return (
    <View
      style={[
        styles.unSelectedDateContainer,
        {
          width: unselectedItemWidth,
          backgroundColor: unselectedItemBackgroundColor,
          borderRadius: itemRadius,
          height: itemHeight,
        },
      ]}
    >
      <Text style={[styles.unSelectedDateText, unselectedItemTextStyle]}>
        {text}
      </Text>
    </View>
  );
};
const HorizontalDatepicker = ({
  startDate,
  endDate,
  onSelectedDateChange,
  initialSelectedDate,
  selectedItemWidth = 170,
  unselectedItemWidth = 38,
  itemHeight = 38,
  itemRadius = 10,
  selectedItemTextStyle,
  unselectedItemTextStyle,
  selectedItemBackgroundColor,
  unselectedItemBackgroundColor,
  flatListContainerStyle,
}) => {
  const [selectedDate, setSelectedDate] = useState(
    new Date(initialSelectedDate).toISOString().slice(0, 10)
  );
  // Ref used to handle scroll to specific index
  const listRef = createRef();
  // get dates between startDate and endDate
  const results = enumerateDaysBetweenDates(startDate, endDate);
  // handle press on date item, set selectedDate and call onSelectedDateChange with Date constractor
  const onDateItemPress = (item, index) => {
    setSelectedDate(item);
    onSelectedDateChange(new Date(item));
    listRef.current?.scrollToIndex({
      animated: true,
      index: index,
      viewPosition: 0.5,
    });
  };
  // render Date items here
  const renderItem = ({ item, index }) => (
    <Pressable onPress={() => onDateItemPress(item, index)}>
      {selectedDate === item ? (
        <SelectedDate
          text={dateFormat(item, "dddd, mmm d")}
          selectedItemWidth={selectedItemWidth}
          selectedItemTextStyle={selectedItemTextStyle}
          selectedItemBackgroundColor={selectedItemBackgroundColor}
          itemRadius={itemRadius}
          itemHeight={itemHeight}
        />
      ) : (
        <UnSelectedDate
          text={dateFormat(item, "dd")}
          unselectedItemBackgroundColor={unselectedItemBackgroundColor}
          unselectedItemTextStyle={unselectedItemTextStyle}
          unselectedItemWidth={unselectedItemWidth}
          itemRadius={itemRadius}
          itemHeight={itemHeight}
        />
      )}
    </Pressable>
  );
  return (
    <View
      style={{
        minHeight: 45,
        flexDirection: "row",
      }}
    >
      <Pressable
        onPress={() => {
          setSelectedDate(null);
          onSelectedDateChange(null);
        }}
        style={[
          { flex: 0.35, backgroundColor: selectedDate ? "#ececec" : "#03045e" },
          styles.allEventsContainer,
        ]}
      >
        <Text
          style={[
            styles.allEventsText,
            { color: selectedDate ? "#000" : "#fff" },
          ]}
        >
          All Events
        </Text>
      </Pressable>
      <View
        style={{
          minHeight: 45,
          flex: 1,
        }}
      >
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={results}
          scrollEventThrottle={16}
          keyExtractor={(date, index) => `${date + index}`}
          contentContainerStyle={[styles.flatListStyle, flatListContainerStyle]}
          initialScrollIndex={0}
          inverted={false}
          ref={listRef}
          renderItem={renderItem}
          getItemLayout={(_, index) => ({
            length: itemHeight,
            offset: (unselectedItemWidth + 20) * index + selectedItemWidth - 70,
            index,
          })}
        />
      </View>
    </View>
  );
};
const styles = StyleSheet.create({
  selectedDateContainer: {
    width: 170,
    backgroundColor: "#16213e",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",

    marginHorizontal: 10,
  },
  selectedDateText: {
    fontSize: 16,
    color: "#fff",
  },
  unSelectedDateContainer: {
    width: 38,
    backgroundColor: "#fff",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    marginHorizontal: 10,
  },
  unSelectedDateText: {
    fontSize: 16,
    color: "#16213e",
  },
  flatListStyle: {
    backgroundColor: "transparent",
    alignItems: "start",
  },
  allEventsContainer: {
    width: 170,
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    marginHorizontal: 10,
    borderRadius: 10,
    height: 39,
  },
  allEventsText: {
    fontSize: 16,
  },
});

export default DateSelector = ({ selectedDate, setSelectedDate }) => {
  const today = new Date();

  return (
    <HorizontalDatepicker
      startDate={today}
      endDate={
        new Date(
          `${today.getFullYear()}-${today.getMonth() + 1}-${
            today.getDate() + 17
          }`
        )
      }
      initialSelectedDate={today}
      onSelectedDateChange={(date) => setSelectedDate(date)}
      selectedItemWidth={170}
      unselectedItemWidth={38}
      itemHeight={38}
      itemRadius={10}
      selectedItemBackgroundColor="#03045e"
      unselectedItemBackgroundColor="#ececec"
    />
  );
};
