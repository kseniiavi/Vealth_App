import { globalStyles } from '@/styles/global';
import { ScrollView, Text } from 'react-native';
import HomeHeader from '../../components/HomeHeader';
import NewsCard from '../../components/NewsBlock';

export default function HomeScreen() {
  return (
    <ScrollView style={globalStyles.container}>
      <Text style={globalStyles.sectionTitle}>Our news for you</Text>
      <HomeHeader />
      <NewsCard label="Horse dental care tips" text="Learn about proper horse dental care and maintenance." />
      
      <NewsCard label="Horse dental care tips" text="Learn about proper horse dental care and maintenance."  />

      <NewsCard label="Horse dental care tips" text="Learn about proper horse dental care and maintenance." />
      
      <NewsCard label="Horse dental care tips" text="Learn about proper horse dental care and maintenance."  />
      <Text style={[globalStyles.classes, { marginBottom: 40 }]}>Thank you for choosing our app!</Text>
    </ScrollView>
  );
}