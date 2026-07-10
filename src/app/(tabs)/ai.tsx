import AsyncStorage from '@react-native-async-storage/async-storage';
import * as FileSystem from 'expo-file-system/legacy';
import * as ImagePicker from 'expo-image-picker';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Button,
  FlatList,
  Image,
  ScrollView, StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

const API_URL = "http://192.168.178.54:8000";
const HISTORY_KEY = "detectionHistory";
const RESULTS_DIR = FileSystem.documentDirectory + "results/";

// --- Types ---------------------------------------------------------------

interface Detection {
  class_id: number;
  class_name: string;
  confidence: number;
  bbox: number[];
}

interface DetectionResponse {
  detections: Detection[];
  counts: Record<string, number>;
  total_count: number;
  image: string; // base64
}

interface HistoryEntry {
  id: string;
  localUri: string;          // permanent file path on device
  counts: Record<string, number>;
  totalCount: number;
  timestamp: number;
}

export default function AiScreen() {
  const [screen, setScreen] = useState<'home' | 'result'>('home');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [currentResult, setCurrentResult] = useState<HistoryEntry | null>(null);
  const [history, setHistory] = useState<HistoryEntry[]>([]);

  // Load saved history once when the screen first mounts
  useEffect(() => {
    loadHistory();
    ensureResultsDirExists();
  }, []);

  const ensureResultsDirExists = async () => {
    const dirInfo = await FileSystem.getInfoAsync(RESULTS_DIR);
    if (!dirInfo.exists) {
      await FileSystem.makeDirectoryAsync(RESULTS_DIR, { intermediates: true });
    }
  };

  const loadHistory = async () => {
    const raw = await AsyncStorage.getItem(HISTORY_KEY);
    if (raw) {
      setHistory(JSON.parse(raw));
    }
  };

  const saveHistory = async (updated: HistoryEntry[]) => {
    setHistory(updated);
    await AsyncStorage.setItem(HISTORY_KEY, JSON.stringify(updated));
  };

  // ---- Pick from gallery ----
  const pickFromGallery = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      setErrorMsg("Gallery permission is required.");
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.8,
    });
    if (!result.canceled) {
      runDetection(result.assets[0].uri);
    }
  };

  // ---- Take a new photo ----
  const takePhoto = async () => {
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (!permission.granted) {
      setErrorMsg("Camera permission is required.");
      return;
    }
    const result = await ImagePicker.launchCameraAsync({ quality: 0.8 });
    if (!result.canceled) {
      runDetection(result.assets[0].uri);
    }
  };

  // ---- Send image to FastAPI, save result permanently, show result screen ----
  const runDetection = async (uri: string) => {
    setLoading(true);
    setErrorMsg(null);

    try {
      const formData = new FormData();
      formData.append("file", {
        uri,
        name: "photo.jpg",
        type: "image/jpeg",
      } as any);

      const response = await fetch(`${API_URL}/predict`, {
        method: "POST",
        body: formData,
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (!response.ok) {
        throw new Error(`Server responded with status ${response.status}`);
      }

      const data: DetectionResponse = await response.json();

      // Write the base64 image to a REAL file on the device, permanently.
      const filename = `result_${Date.now()}.jpg`;
      const localUri = RESULTS_DIR + filename;
      await FileSystem.writeAsStringAsync(localUri, data.image, {
        encoding: FileSystem.EncodingType.Base64,
      });

      const entry: HistoryEntry = {
        id: filename,
        localUri,
        counts: data.counts,
        totalCount: data.total_count,
        timestamp: Date.now(),
      };

      // Add to history and persist the updated list
      const updated = [entry, ...history];
      await saveHistory(updated);

      setCurrentResult(entry);
      setScreen('result'); // <-- immediately show the result screen
    } catch (error) {
      console.error("Detection failed:", error);
      setErrorMsg("Could not reach the server. Check that it's running and your phone is on the same Wi-Fi.");
    } finally {
      setLoading(false);
    }
  };

  const goHome = () => {
    setScreen('home');
    setCurrentResult(null);
  };

  // ---- RESULT SCREEN ----
  if (screen === 'result' && currentResult) {
    return (
      <ScrollView contentContainerStyle={styles.container}>
        <Image
          source={{ uri: currentResult.localUri }}
          style={styles.resultImage}
          resizeMode="contain"
        />
        <Text style={styles.total}>Total detected: {currentResult.totalCount}</Text>
        {Object.entries(currentResult.counts).map(([className, count]) => (
          <Text key={className} style={styles.countLine}>{className}: {count}</Text>
        ))}
        <View style={{ marginTop: 20 }}>
          <Button title="Back" onPress={goHome} />
        </View>
      </ScrollView>
    );
  }

  // ---- HOME SCREEN ----
  return (
    <View style={styles.container}>
      <Text style={styles.introText}>
        You take pictures of your horses front upper and lower teeth.
        {'\n\n'}
        If its hard to do, watch our tutorial on “how to make your horse smile?”.
        {'\n\n'}
        Our AI analyses them.
        {'\n\n'}
        We give you a horse age estimation with scientific explanation and reasoning for results.
      </Text>

      <View style={styles.buttonRow}>
        <Button title="Pick from Gallery" onPress={pickFromGallery} />
        <Button title="Take Photo" onPress={takePhoto} />
      </View>

      {loading && <ActivityIndicator size="large" style={{ marginTop: 20 }} />}
      {errorMsg && <Text style={styles.error}>{errorMsg}</Text>}

      <Text style={styles.historyTitle}>Past Results</Text>
      <FlatList
        style={{ flex: 1 }}
        data={history}
        keyExtractor={(item) => item.id}
        numColumns={2}
        contentContainerStyle={{ paddingBottom: 24 }}
        renderItem={({ item }) => (
          <TouchableOpacity
            onPress={() => { setCurrentResult(item); setScreen('result'); }}
            style={styles.historyItem}
          >
            <Image source={{ uri: item.localUri }} style={styles.thumbnail} />

            <Text style={styles.timestamp}>
              {item.timestamp ? new Date(item.timestamp).toLocaleDateString() : ''}
            </Text>

            <Text style={styles.timestamp}>
              {item.timestamp
                ? new Date(item.timestamp).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                    hour12: true,
                  })
                : ''}
            </Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 50, alignItems: 'center' },
  buttonRow: { flexDirection: 'row', gap: 12, marginBottom: 10 },
  resultImage: { width: '100%', height: 400, marginTop: -50, borderRadius: 8 },
  total: { fontSize: 18, fontWeight: '600', marginTop: 16 },
  countLine: { fontSize: 16, marginTop: 4 },
  error: { color: 'red', marginTop: 12, textAlign: 'center' },
  historyTitle: { fontSize: 16, fontWeight: '600', marginTop: 24, marginBottom: 8, alignSelf: 'flex-start' },
  thumbnail: { width: 100, height: 100, margin: 4, borderRadius: 6 },
});