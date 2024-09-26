import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Paper,
  Grid,
  Button,
  CircularProgress,
  Box,
} from '@mui/material';
import { ArrowBack, Download } from '@mui/icons-material';
import { getDocument } from '../../service/firebase';
import { getDownloadURL, getStorage, ref } from 'firebase/storage';

interface JamaahSubmission {
  id: string;
  alamat: string;
  bukuNikah: string;
  email: string;
  foto: string;
  fotoPassport: string;
  jenisKelamin: string;
  kartuBpjs: string;
  kk: string;
  kota: string;
  ktp: string;
  nama: string;
  noHp: string;
  noKtpSim: string;
  paketUmroh: string;
  pekerjaan: string;
  suratVaksin: string;
  ttl: string;
}

interface DocumentInfo {
  key: string;
  label: string;
  url: string;
}

const RequestDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [jamaah, setJamaah] = useState<JamaahSubmission | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [documents, setDocuments] = useState<DocumentInfo[]>([]);

  useEffect(() => {
    const fetchJamaahDetail = async () => {
      try {
        if (id) {
          const data = await getDocument<JamaahSubmission>(
            'jamaah_submissions',
            id
          );
          setJamaah(data);
          await fetchDocumentURLs(data);
        }
        setLoading(false);
      } catch (err: any) {
        setError(err.toString());
        setLoading(false);
      }
    };

    fetchJamaahDetail();
  }, [id]);

  const fetchDocumentURLs = async (data: JamaahSubmission) => {
    const storage = getStorage();
    const documentList: DocumentInfo[] = [
      { key: 'ktp', label: 'KTP', url: data.ktp },
      { key: 'foto', label: 'Foto', url: data.foto },
      { key: 'fotoPassport', label: 'Foto Passport', url: data.fotoPassport },
      { key: 'bukuNikah', label: 'Buku Nikah', url: data.bukuNikah },
      { key: 'kk', label: 'Kartu Keluarga', url: data.kk },
      { key: 'kartuBpjs', label: 'Kartu BPJS', url: data.kartuBpjs },
      { key: 'suratVaksin', label: 'Surat Vaksin', url: data.suratVaksin },
    ];

    const updatedDocuments: DocumentInfo[] = await Promise.all(
      documentList.map(async (doc) => {
        try {
          const fileRef = ref(storage, doc.url);
          const downloadURL = await getDownloadURL(fileRef);
          return { ...doc, url: downloadURL };
        } catch (error) {
          console.error(`Error fetching URL for ${doc.key}:`, error);
          return doc;
        }
      })
    );

    setDocuments(updatedDocuments);
  };

  const renderDocumentPreview = (doc: DocumentInfo) => {
    return (
      <Box
        sx={{
          border: '1px solid #ccc',
          borderRadius: 1,
          overflow: 'hidden',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <Typography variant='subtitle2' sx={{ p: 1, bgcolor: '#f5f5f5' }}>
          {doc.label}
        </Typography>
        <Box
          sx={{
            flexGrow: 1,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            p: 2,
          }}
        >
          <img
            src={doc.url}
            alt={doc.label}
            style={{
              maxWidth: '100%',
              maxHeight: '200px',
              objectFit: 'contain',
            }}
          />
        </Box>
        <Button
          variant='contained'
          startIcon={<Download />}
          onClick={() => window.open(doc.url, '_blank')}
          fullWidth
          sx={{ mt: 'auto' }}
        >
          Download
        </Button>
      </Box>
    );
  };

  if (loading) {
    return (
      <Box
        display='flex'
        justifyContent='center'
        alignItems='center'
        minHeight='100vh'
      >
        <CircularProgress />
      </Box>
    );
  }

  if (error || !jamaah) {
    return (
      <Container maxWidth='sm'>
        <Typography color='error' variant='h6' align='center' gutterBottom>
          {error || 'Jamaah not found'}
        </Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth='lg'>
      <Button
        startIcon={<ArrowBack />}
        onClick={() => navigate(-1)}
        sx={{ my: 2 }}
      >
        Back to List
      </Button>
      <Paper elevation={3} sx={{ p: 3, my: 2 }}>
        <Typography variant='h4' gutterBottom>
          {jamaah.nama}
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <Typography variant='subtitle1'>Email: {jamaah.email}</Typography>
            <Typography variant='subtitle1'>Phone: {jamaah.noHp}</Typography>
            <Typography variant='subtitle1'>
              Gender: {jamaah.jenisKelamin}
            </Typography>
            <Typography variant='subtitle1'>
              Date of Birth: {jamaah.ttl}
            </Typography>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Typography variant='subtitle1'>City: {jamaah.kota}</Typography>
            <Typography variant='subtitle1'>
              Address: {jamaah.alamat}
            </Typography>
            <Typography variant='subtitle1'>
              Occupation: {jamaah.pekerjaan}
            </Typography>
            <Typography variant='subtitle1'>
              Package: {jamaah.paketUmroh}
            </Typography>
          </Grid>
        </Grid>
        <Typography variant='h6' sx={{ mt: 3, mb: 2 }}>
          Documents
        </Typography>
        <Grid container spacing={2}>
          {documents.map((doc, index) => (
            <Grid item xs={12} sm={6} md={4} key={index}>
              {renderDocumentPreview(doc)}
            </Grid>
          ))}
        </Grid>
      </Paper>
    </Container>
  );
};

export default RequestDetail;
