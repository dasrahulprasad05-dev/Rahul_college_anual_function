import { Document, Page, Text, View, StyleSheet, Image } from '@react-pdf/renderer';

// Register fonts if needed (optional)
// Font.register({ family: 'Inter', src: 'https://fonts.gstatic.com/s/inter/v12/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuLyfAZJhjp-Ek-_EeA.woff2' });

const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: '#ffffff',
    padding: 30,
    color: '#000000',
    fontFamily: 'Helvetica',
  },
  card: {
    border: '2pt solid #000000',
    borderRadius: 12,
    padding: 30,
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
  },
  header: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#000000',
    textAlign: 'center',
    marginBottom: 10,
    textTransform: 'uppercase',
  },
  subHeader: {
    fontSize: 14,
    color: '#333333',
    textAlign: 'center',
    marginBottom: 40,
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  photoContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  photo: {
    width: 200,
    height: 200,
    borderRadius: 10,
    border: '4pt solid #000000',
    objectFit: 'cover',
  },
  details: {
    alignItems: 'center',
  },
  email: {
    fontSize: 18,
    marginBottom: 10,
  },
  passId: {
    fontSize: 12,
    color: '#333333',
    fontFamily: 'Courier',
  },
  footer: {
    marginTop: 'auto',
    textAlign: 'center',
    fontSize: 12,
    color: '#333333',
  }
});

interface GatePassPDFProps {
  passId: string;
  userEmail: string;
  photoUrl: string;
}

export function GatePassPDF({ passId, userEmail, photoUrl }: GatePassPDFProps) {
  return (
    <Document>
      <Page size="A5" style={styles.page}>
        <View style={styles.card}>
          <View>
            <Text style={styles.header}>Festa 2026</Text>
            <Text style={styles.subHeader}>Official Gate Pass</Text>
            
            <View style={styles.photoContainer}>
              <Image src={photoUrl} style={styles.photo} />
            </View>

            <View style={styles.details}>
              <Text style={styles.email}>{userEmail}</Text>
              <Text style={styles.passId}>PASS ID: {passId}</Text>
            </View>
          </View>

          <Text style={styles.footer}>Valid for entry to all general events.</Text>
        </View>
      </Page>
    </Document>
  );
}
