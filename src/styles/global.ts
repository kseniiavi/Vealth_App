import { StyleSheet } from 'react-native';

export const colors = {
  background: '#F4EDC3',
  bar: '#f4edc3',
  header: '#A7C48A',
  surface: '#D9A15B',
  primary: '#6F8F81',
  text: '#B56A5A',
  textSecondary: '#799186',
  alert: '#b34c35',
};

export const globalStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    paddingTop: 20,
    paddingHorizontal: 20,
    alignContent: 'center',
  },
  scrollContainer: {
    flexGrow: 1,
    backgroundColor: colors.background,
    paddingTop: 20,
    paddingHorizontal: 20,
    alignContent: 'center',

  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.text,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.textSecondary,
    marginTop: 10,
    marginBottom: 16,
  },
  empty: {
    color: colors.textSecondary,
    fontSize: 14,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.background,
    borderBottomColor: colors.surface,
    borderBottomWidth: 1,
  },
  button: {
    backgroundColor: colors.primary,
    padding: 10,
    borderRadius: 15,
  },
  buttonText: {
    color: colors.background,
    fontSize: 16,
    fontWeight: 'bold',
  },
  classes: {
    fontSize: 12,
    marginTop: 4,
    color: colors.textSecondary,
    textAlign: 'center',
  },
});