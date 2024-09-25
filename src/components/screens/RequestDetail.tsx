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
import { ArrowBack } from '@mui/icons-material';
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

const RequestDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [jamaah, setJamaah] = useState<JamaahSubmission | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [documentURLs, setDocumentURLs] = useState<{ [key: string]: string }>(
    {}
  );

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
    const urls: { [key: string]: string } = {};
    const documents = [
      { key: 'ktp', url: data.ktp },
      { key: 'foto', url: data.foto },
      { key: 'fotoPassport', url: data.fotoPassport },
      { key: 'bukuNikah', url: data.bukuNikah },
      { key: 'kk', url: data.kk },
      { key: 'kartuBpjs', url: data.kartuBpjs },
      { key: 'suratVaksin', url: data.suratVaksin },
    ];

    for (const doc of documents) {
      try {
        const fileRef = ref(storage, doc.url);
        const downloadURL = await getDownloadURL(fileRef);
        urls[doc.key] = downloadURL;
      } catch (error) {
        console.error(`Error fetching URL for ${doc.key}:`, error);
      }
    }

    setDocumentURLs(urls);
  };

  const renderDocumentPreview = (url: string, label: string) => {
    return (
      <Box
        sx={{
          mt: 2,
          border: '1px solid #ccc',
          borderRadius: 1,
          overflow: 'hidden',
        }}
      >
        <Typography variant='subtitle2' sx={{ p: 1, bgcolor: '#f5f5f5' }}>
          {label}
        </Typography>
        <img
          src={url}
          alt={label}
          style={{ width: '100%', maxHeight: '300px', objectFit: 'contain' }}
        />
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
    <Container maxWidth='md'>
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
          {Object.entries(documentURLs).map(([key, url], index) => (
            <Grid item xs={12} key={index}>
              {renderDocumentPreview(url, key)}
            </Grid>
          ))}
        </Grid>
      </Paper>
    </Container>
  );
};

export default RequestDetail;
