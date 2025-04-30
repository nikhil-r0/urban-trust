import React, { Component } from "react";
import {
  StyleSheet,
  Text,
  View,
  Image,
  ImageBackground,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { auth, db } from "@/firebaseConfig";
import { doc, getDoc, collection, query, where, getDocs } from "firebase/firestore";
import profileBg from "@/assets/images/profile-background.jpg";
import profileImg from "@/assets/images/profile.jpeg";
import translations from "@/constants/translations";

export default class UserProfileView extends Component {
  constructor(props: {}) {
    super(props);
    this.state = {
      userName: "",
      loading: true,
      issues: [],
      language: "en",
    };
  }

  async componentDidMount() {
    await this.fetchUserData();
  }

  fetchUserData = async () => {
    try {
      const userId = auth.currentUser?.uid;
      if (!userId) throw new Error("User not logged in");

      const userSnap = await getDoc(doc(db, "users", userId));
      const userName = userSnap.exists() ? userSnap.data().name || "Anonymous" : "Anonymous";

      const issuesSnap = await getDocs(
        query(collection(db, "issues"), where("user_id", "==", userId))
      );
      const issues = issuesSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));

      this.setState({ userName, issues, loading: false });
    } catch (error) {
      console.error("Error fetching user data or issues:", error);
      this.setState({ loading: false });
    }
  };

  toggleLanguage = () => {
    this.setState(prevState => ({
      language: prevState.language === "en" ? "kn" : "en",
    }));
  };

  renderIssue = ({ item }) => {
    const { language } = this.state;
    const t = translations[language] || translations["en"];

    return (
      <View style={styles.issueCard}>
        <Text style={styles.issueText}>
          📝 {language === "kn" ? item.kannada_description || t.noDescription : item.description || t.noDescription}
        </Text>
        <Text>{t.status}: {item.status || t.unknown}</Text>
        <Text>{t.category}: {language === "kn" ? item.kannada_category || t.general : item.category || t.general}</Text>
      </View>
    );
  };

  render() {
    const { userName, loading, issues, language } = this.state;
    const t = translations[language] || translations["en"];

    return (
      <View style={styles.container}>
        <ImageBackground style={styles.header} source={profileBg}>
          <View style={styles.headerContent}>
            <View style={{ flex: 1 }}>
              <Text style={styles.name}>{t.welcome}</Text>
              <Text style={styles.userInfo}>
                {loading ? <ActivityIndicator color="#000" /> : userName}
              </Text>
            </View>
            <Image style={styles.avatar} source={profileImg} />
          </View>

          <TouchableOpacity style={styles.langToggle} onPress={this.toggleLanguage}>
            <Text style={styles.langText}>
              {language === "en" ? "ಕನ್ನಡ" : "English"}
            </Text>
          </TouchableOpacity>
        </ImageBackground>

        <View style={styles.issueListContainer}>
          <Text style={styles.issueHeader}>{t.yourIssues}</Text>
          {loading ? (
            <ActivityIndicator size="large" color="#888" />
          ) : issues.length === 0 ? (
            <Text style={styles.noIssues}>{t.noIssues}</Text>
          ) : (
            <FlatList
              data={issues}
              keyExtractor={item => item.id}
              renderItem={this.renderIssue}
            />
          )}
        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
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
  },
  name: {
    fontSize: 22,
    color: "black",
    fontWeight: "600",
  },
  userInfo: {
    fontSize: 30,
    color: "black",
    fontWeight: "800",
    marginTop: 5,
  },
  issueListContainer: {
    padding: 20,
    flex: 1,
  },
  issueHeader: {
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 10,
  },
  issueCard: {
    backgroundColor: "#f0f0f0",
    padding: 15,
    marginBottom: 10,
    borderRadius: 10,
  },
  issueText: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 4,
  },
  noIssues: {
    fontStyle: "italic",
    color: "#888",
    textAlign: "center",
    marginTop: 20,
  },
  langToggle: {
    position: "absolute",
    top: 30,
    right: 30,
    backgroundColor: "#facc15",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
  },
  langText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#1e293b",
  },
});
