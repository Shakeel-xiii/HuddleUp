import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  Animated,
} from "react-native";
import { AntDesign } from "@expo/vector-icons";
import { theme } from "../core/theme";
import { resetChatSession, sendMessage } from "../ai/system";

const Chatbot = ({ onClose, sportType }) => {
  const [messages, setMessages] = useState([
    {
      text: `Hello! I am your ${sportType} Virtual Inctructor, How can I help you?`,
      sender: "bot",
    },
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const flatListRef = useRef(null);

  useEffect(() => {
    flatListRef.current.scrollToEnd({ animated: true });
  }, [messages, isTyping]);

  const sendMessageLocal = async () => {
    if (!input.trim()) return;

    const newMessage = {
      text: input,
      sender: "user",
    };
    setMessages((prev) => [...prev, newMessage]);

    setIsTyping(true);
    const userMessage = input;
    setInput("");
    const reply = await sendMessage(userMessage);
    setMessages((prev) => [
      ...prev,
      {
        text: reply,
        sender: "bot",
      },
    ]);
    setIsTyping(false);
  };

  const simulateBotReply = async () => {
    setIsTyping(true);
    // Animated.loop(
    //   Animated.sequence([
    //     Animated.timing(typingAnim, {
    //       toValue: 1,
    //       duration: 500,
    //       useNativeDriver: false,
    //       easing: Easing.linear,
    //     }),
    //     Animated.timing(typingAnim, {
    //       toValue: 0,
    //       duration: 500,
    //       useNativeDriver: false,
    //       easing: Easing.linear,
    //     }),
    //   ])
    // ).start();

    setTimeout(() => {}, 2000);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerText}>Chatbot</Text>
        <TouchableOpacity
          onPress={() => {
            resetChatSession();
            onClose();
          }}
        >
          <AntDesign name="close" size={24} color="white" />
        </TouchableOpacity>
      </View>
      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={(item, index) => index.toString()}
        ListFooterComponent={
          isTyping && (
            <Text
              style={{
                color: "black",
                fontStyle: "italic",
                padding: 10,
              }}
            >
              Typing...
            </Text>
          )
        }
        renderItem={({ item }) => (
          <View
            style={[
              styles.message,
              item.sender === "user" ? styles.userMessage : styles.botMessage,
            ]}
          >
            <Text
              style={{
                color: item.sender === "user" ? "white" : "black",
              }}
            >
              {item.text}
            </Text>
          </View>
        )}
      />
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Type a message..."
          value={input}
          onChangeText={setInput}
        />
        <TouchableOpacity style={styles.sendButton} onPress={sendMessageLocal}>
          <AntDesign name="arrowup" size={24} color="white" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = {
  container: {
    position: "absolute",
    bottom: 20,
    right: 20,
    width: "85%",
    height: "70%",
    backgroundColor: "#fff",
    borderRadius: 10,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 10,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: theme.colors.primary,
    padding: 10,
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
  },
  headerText: { color: "white", fontSize: 18, fontWeight: "bold" },
  message: { padding: 10, margin: 5, borderRadius: 10, maxWidth: "80%" },
  userMessage: { backgroundColor: theme.colors.primary, alignSelf: "flex-end" },
  botMessage: { backgroundColor: "#E5E5EA", alignSelf: "flex-start" },
  typing: {
    padding: 10,
    fontStyle: "italic",
    color: "black",
    width: "5%",
    height: 20,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
    borderTopWidth: 1,
    borderColor: "#ddd",
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 20,
    padding: 10,
  },
  sendButton: {
    backgroundColor: theme.colors.primary,
    padding: 10,
    borderRadius: 20,
    marginLeft: 5,
  },
};

export default Chatbot;
