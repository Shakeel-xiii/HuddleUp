import React, { useState } from "react";
import { StyleSheet, View, TouchableOpacity, Pressable } from "react-native";
import { MultiSelect } from "react-native-element-dropdown";
import AntDesign from "@expo/vector-icons/AntDesign";
import { Searchbar, Text, List } from "react-native-paper";
import { Locations, Category } from "../helpers/constData";
import Button from "./Button";
function sort() {}

export const Search = ({ searchQuery, setSearchQuery }) => {
  return (
    <View>
      <Searchbar
        placeholder="Search"
        onChangeText={setSearchQuery}
        value={searchQuery}
        style={{
          marginTop: 8,
          maxHeight: 40,
          marginHorizontal: 5,
        }}
        inputStyle={{
          minHeight: 0, // Add this
        }}
      />
    </View>
  );
};

const SortingLocations = Locations.map((value, index) => {
  return { label: value, value: value };
});

const SortingCategory = Category.map((value, index) => {
  return { label: value, value: value };
});
export const Sort = ({
  selectedLocation,
  setSelectedLocation,
  selectedCategory,
  setSelectedCategory,
}) => {
  const [expanded, setExpanded] = useState(false);
  const handlePress = () => setExpanded(!expanded);
  const Screen = () => {
    return expanded ? (
      <>
        <SortItem
          selected={selectedLocation}
          setSelected={setSelectedLocation}
          data={SortingLocations}
        />
        <SortItem
          selected={selectedCategory}
          setSelected={setSelectedCategory}
          data={SortingCategory}
        />
        <View
          style={{
            width: "95%",
            alignSelf: "center",
          }}
        >
          <Button
            mode="outlined"
            onPress={() => {
              setExpanded(false);
              sort;
            }}
            labelStyle={{ fontWeight: "Normal" }}
          >
            Sort
          </Button>
        </View>
      </>
    ) : (
      <></>
    );
  };
  return (
    <>
      <Pressable
        style={[
          {
            backgroundColor: "transparent",
            height: 30,

            padding: 5,
            paddingHorizontal: 15,
          },
          styles.wrapperCustom,
        ]}
        onPress={handlePress}
      >
        <View
          style={{
            flex: 1,
            flexDirection: "row",
            justifyContent: "space-between",
            // backgroundColor: "red",
            alignItems: "center",
          }}
        >
          <Text>Sort By</Text>
          <List.Icon icon="sort" />
        </View>
      </Pressable>
      <View>{Screen()}</View>
    </>
  );
};

const SortItem = ({ setSelected, selected, data }) => {
  const renderItem = (item) => {
    return (
      <View style={styles.item}>
        <Text style={styles.selectedTextStyle}>{item.label}</Text>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <MultiSelect
        style={styles.dropdown}
        placeholderStyle={styles.placeholderStyle}
        selectedTextStyle={styles.selectedTextStyle}
        inputSearchStyle={styles.inputSearchStyle}
        iconStyle={styles.iconStyle}
        data={data}
        labelField="label"
        activeColor="#99b3ff"
        valueField="value"
        placeholder="Select"
        value={selected}
        search
        searchPlaceholder="Search..."
        onChange={(item) => {
          setSelected(item);
        }}
        renderItem={renderItem}
        renderSelectedItem={(item, unSelect) => (
          <TouchableOpacity
            style={{
              width: "45%",
              marginHorizontal: 1,
            }}
            onPress={() => unSelect && unSelect(item)}
          >
            <View style={styles.selectedStyle}>
              <Text style={styles.textSelectedStyle}>{item.label}</Text>
              <AntDesign color="black" name="delete" size={14} />
            </View>
          </TouchableOpacity>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { padding: 5, width: "100%" },
  dropdown: {
    height: 40,
    backgroundColor: "white",
    borderRadius: 12,
    padding: 12,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,

    elevation: 2,
  },
  placeholderStyle: {
    fontSize: 16,
  },
  selectedTextStyle: {
    fontSize: 16,
  },
  iconStyle: {
    width: 20,
    height: 20,
  },
  inputSearchStyle: {
    height: 40,
    fontSize: 16,
  },
  icon: {
    marginRight: 5,
  },
  item: {
    padding: 8,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  selectedStyle: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    flexWrap: "wrap",
    borderRadius: 14,
    backgroundColor: "white",
    shadowColor: "#000",
    marginTop: 4,
    paddingHorizontal: 6,
    paddingVertical: 6,
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,

    elevation: 2,
  },
  textSelectedStyle: {
    marginRight: 5,
    fontSize: 14,
  },
});
