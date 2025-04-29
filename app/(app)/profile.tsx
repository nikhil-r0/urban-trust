import React, { Component } from "react";
import { StyleSheet, Text, View, Image, ImageBackground } from "react-native";
import { auth, db } from "@/firebaseConfig";
import { doc, getDoc } from "firebase/firestore";
// Import background image
import image from "@/assets/images/profile-background.jpg";

export default class UserProfileView extends Component {
  constructor(props: {}) {
    super(props);
    this.state = {
      userName: "",       // ← hold the fetched name
      loading: true,      // ← you can use this to show a spinner if you want
    };
  }

  async componentDidMount() {
    try {
      const userId = auth.currentUser?.uid;
      if (userId) {
        const userDocRef = doc(db, "users", userId);
        const userSnap = await getDoc(userDocRef);

        if (userSnap.exists()) {
          const data = userSnap.data();
          this.setState({
            userName: data.name,  // ← adjust field name if it’s e.g. data.fullName
            loading: false,
          });
        } else {
          console.warn("No user document found!");
          this.setState({ loading: false });
        }
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
      this.setState({ loading: false });
    }
  }

  render() {
    const { userName, loading } = this.state;

    return (
      <View style={styles.container}>
        <ImageBackground style={styles.header} source={image}>
          <View style={styles.headerContent}>
            <View style={{ flex: 1 }}>
              <Text style={styles.name}>Welcome</Text>
              {
                loading
                  ? <Text style={styles.userInfo}>Loading…</Text>
                  : <Text style={styles.userInfo}>{userName || "Anonymous"}</Text>
              }
            </View>
            <Image
              style={styles.avatar}
              source={require("@/assets/images/profile.jpeg")}
            />
          </View>
        </ImageBackground>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    width: "auto",
    height: 300,
    justifyContent: "center",
    padding: 30,
    opacity: 0.9,
  },
  headerContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 2,
    borderColor: "white",
    marginBottom: 10,
  },
  name: {
    fontSize: 22,
    color: "black",
    fontWeight: "600",
    fontFamily: "Helvetica",
  },
  userInfo: {
    fontSize: 30,
    color: "black",
    fontWeight: "800",
  },
});
