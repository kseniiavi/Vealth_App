import { StyledButton } from '@/components/StyledButton';
import { colors, globalStyles } from '@/styles/global';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as FileSystem from 'expo-file-system/legacy';
import * as ImagePicker from 'expo-image-picker';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Image,
  ScrollView, StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import ImageViewing from 'react-native-image-viewing';

const API_URL = "http://your ip adress:8000";
const HISTORY_KEY = "detectionHistory";
const RESULTS_DIR = FileSystem.documentDirectory + "results/";

// --- Types ---------------------------------------------------------------

interface DetectionResponse {
  total_count: number;
  all_counts: Record<string, number>;
  image: string; // base64 (segmented)
}

interface HistoryEntry {
  id: string;
  originalUri?: string;      // photo before segmentation (optional for old entries)
  localUri: string;          // segmented photo
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

  // Zoom viewer state
  const [viewerVisible, setViewerVisible] = useState(false);
  const [viewerIndex, setViewerIndex] = useState(0);

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

      const timestamp = Date.now();

      // 1) Save the segmented image (from the server) permanently
      const segFilename = `result_${timestamp}.jpg`;
      const localUri = RESULTS_DIR + segFilename;
      await FileSystem.writeAsStringAsync(localUri, data.image, {
        encoding: FileSystem.EncodingType.Base64,
      });

      // 2) Copy the original photo permanently too
      //    (the picker/camera uri is a temporary cache file)
      const originalUri = RESULTS_DIR + `original_${timestamp}.jpg`;
      await FileSystem.copyAsync({ from: uri, to: originalUri });

      const entry: HistoryEntry = {
        id: segFilename,
        originalUri,
        localUri,
        counts: data.all_counts,
        totalCount: data.total_count,
        timestamp,
      };

      const updated = [entry, ...history];
      await saveHistory(updated);

      setCurrentResult(entry);
      setScreen('result');
    } catch (error) {
      console.error("Detection failed:", error);
      setErrorMsg("Could not reach the server. Check that it's running and your phone is on the same Wi-Fi.");
    } finally {
      setLoading(false);
    }
  };

  const goHome = () => {
    setViewerVisible(false);
    setScreen('home');
    setCurrentResult(null);
  };

  const openViewer = (index: number) => {
    setViewerIndex(index);
    setViewerVisible(true);
  };

  // ---- RESULT SCREEN ----
  if (screen === 'result' && currentResult) {
    // Build the list of zoomable images: [before, after]
    // Old history entries have no original, so they only show the segmented one.
    const viewerImages = currentResult.originalUri
      ? [{ uri: currentResult.originalUri }, { uri: currentResult.localUri }]
      : [{ uri: currentResult.localUri }];

    return (
      <>
        <ScrollView contentContainerStyle={globalStyles.container}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <Text style={globalStyles.sectionTitle}>Result</Text>
            <StyledButton title="Back" onPress={goHome} />
          </View>

          <View style={styles.imagesRow}>
            {currentResult.originalUri && (
              <TouchableOpacity style={styles.imageBox} onPress={() => openViewer(0)} activeOpacity={0.8}>
                <Image
                  source={{ uri: currentResult.originalUri }}
                  style={styles.resultImage}
                  resizeMode="contain"
                />
                <Text style={styles.imageLabel}>Before</Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity
              style={styles.imageBox}
              onPress={() => openViewer(viewerImages.length - 1)}
              activeOpacity={0.8}
            >
              <Image
                source={{ uri: currentResult.localUri }}
                style={styles.resultImage}
                resizeMode="contain"
              />
              <Text style={styles.imageLabel}>After</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.tapHint}>Tap an image to zoom</Text>

          <Text style={[globalStyles.sectionTitle, { alignSelf: 'center' }]}>
            Total detected teeth: {currentResult.totalCount}
          </Text>
          {Object.entries(currentResult.counts).map(([className, count]) => (
            <Text key={className} style={[globalStyles.classes, { alignSelf: 'center' }]}>
              {className}: {count}
            </Text>
          ))}
        </ScrollView>

        {/* Fullscreen zoom viewer: pinch/double-tap to zoom, swipe to switch before/after */}
        <ImageViewing
          images={viewerImages}
          imageIndex={viewerIndex}
          visible={viewerVisible}
          onRequestClose={() => setViewerVisible(false)}
        />
      </>
    );
  }

  // ---- HOME SCREEN ----
  return (
    <View style={globalStyles.container}>
      <Text style={globalStyles.sectionTitle}>Teeth Analysis</Text>
      <Text style={styles.introText}>
        You take pictures of your horses front upper and lower teeth.
        {'\n\n'}
        If its hard to do, watch our tutorial on “how to make your horse smile?”.
        {'\n\n'}
        Our program analyses them.
        {'\n\n'}
        We give you a horse age estimation with scientific explanation and reasoning for results.
      </Text>

      <View style={styles.buttonRow}>
        <StyledButton title="Pick from Gallery" onPress={pickFromGallery} />
        <StyledButton title="Take Photo" onPress={takePhoto} />
      </View>

      {loading && <ActivityIndicator size="large" style={{ marginTop: 20 }} />}
      {errorMsg && <Text style={styles.error}>{errorMsg}</Text>}

      <Text style={styles.historyTitle}>Past Results</Text>
      <FlatList
        style={{ flex: 1 }}
        data={history}
        keyExtractor={(item) => item.id}
        numColumns={3}
        contentContainerStyle={{ paddingBottom: 24, paddingHorizontal: 4 }}
        renderItem={({ item }) => (
          <TouchableOpacity
            onPress={() => { setCurrentResult(item); setScreen('result'); }}
            style={styles.historyItem}
          >
            {/* localUri is the segmented image, so the preview shows the segmented photo */}
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
  introText: { fontSize: 14, marginBottom: 20, color: colors.textSecondary, textAlign: 'justify' },
  buttonRow: { flexDirection: 'row', gap: 12, marginBottom: 10, alignSelf: 'center', marginTop: 20 },

  // Side-by-side images
  imagesRow: { flexDirection: 'row', gap: 10, marginTop: 20, justifyContent: 'center' },
  imageBox: { flex: 1, alignItems: 'center' },
  resultImage: { width: '100%', aspectRatio: 3 / 4, borderRadius: 16 },
  imageLabel: { marginTop: 6, fontSize: 14, fontWeight: '600', color: colors.textSecondary },
  tapHint: { alignSelf: 'center', fontSize: 12, color: colors.textSecondary, marginTop: 4, marginBottom: 16 },

  error: { color: 'red', marginTop: 12, textAlign: 'center' },
  historyTitle: { fontSize: 18, fontWeight: '600', marginTop: 20, marginBottom: 10, alignSelf: 'center', color: colors.textSecondary },
  historyItem: { flex: 1, margin: 4, alignItems: 'center' },
  timestamp: { fontSize: 12, color: colors.textSecondary, marginTop: 2 },
  thumbnail: { width: 100, height: 100, margin: 4, borderRadius: 6 },
});