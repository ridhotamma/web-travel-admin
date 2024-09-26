import React, { useState, useEffect } from 'react';
import { getDocuments } from '../../service/firebase';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
  CircularProgress,
  Container,
  Box,
  Chip,
  IconButton,
  Tooltip,
  useTheme,
  useMediaQuery,
  TextField,
  InputAdornment,
} from '@mui/material';
import { Visibility, Search } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { JamaahSubmission } from '../../interface/JamaahSubmission';

const ListRequest: React.FC = () => {
  const [submissions, setSubmissions] = useState<JamaahSubmission[]>([]);
  const [filteredSubmissions, setFilteredSubmissions] = useState<
    JamaahSubmission[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const navigate = useNavigate();

  const handleViewDetails = (id: string) => {
    navigate(`/jamaah/${id}`);
  };

  const fetchSubmissions = async () => {
    try {
      const data = await getDocuments<JamaahSubmission>('jamaah_submissions')
      setSubmissions(data);
      setFilteredSubmissions(data);
      setLoading(false);
    } catch (err: any) {
      setError(err.toString());
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubmissions();
  }, []);

  useEffect(() => {
    const filtered = submissions.filter(
      (submission) =>
        submission.nama.toLowerCase().includes(searchTerm.toLowerCase()) ||
        submission.email.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredSubmissions(filtered);
  }, [searchTerm, submissions]);

  if (loading)
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

  if (error)
    return (
      <Container maxWidth='sm'>
        <Typography color='error' variant='h6' align='center' gutterBottom>
          Error: {error}
        </Typography>
      </Container>
    );

  const getGenderColor = (gender: string) => {
    return gender?.toLowerCase() === 'laki-laki' ? 'primary' : 'secondary';
  };

  const renderDocumentChips = () => (
    <Box display='flex' flexWrap='wrap' gap={0.5}>
      <Chip label='KTP' size='small' />
      <Chip label='Foto' size='small' />
      <Chip label='Passport' size='small' />
      <Chip label='Buku Nikah' size='small' />
      <Chip label='KK' size='small' />
      <Chip label='BPJS' size='small' />
      <Chip label='Vaksin' size='small' />
    </Box>
  );

  return (
    <Container maxWidth='lg'>
      <Box my={4}>
        <Typography
          variant='h5'
          fontWeight='bold'
          component='p'
          gutterBottom
          align='left'
        >
          Jamaah Submissions
        </Typography>
        <TextField
          fullWidth
          variant='outlined'
          placeholder='Search by name or email'
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          sx={{ mb: 2 }}
          InputProps={{
            startAdornment: (
              <InputAdornment position='start'>
                <Search sx={{ width: '20' }} />
              </InputAdornment>
            ),
          }}
        />
        <TableContainer component={Paper} elevation={3}>
          <Table sx={{ minWidth: 650 }} aria-label='jamaah submissions table'>
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                {!isMobile && (
                  <>
                    <TableCell>Email</TableCell>
                    <TableCell>City</TableCell>
                  </>
                )}
                <TableCell>Gender</TableCell>
                <TableCell>Package</TableCell>
                {!isMobile && <TableCell>Documents</TableCell>}
                <TableCell align='center'>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredSubmissions.map((submission) => (
                <TableRow key={submission.id} hover>
                  <TableCell>{submission.nama}</TableCell>
                  {!isMobile && (
                    <>
                      <TableCell>{submission.email}</TableCell>
                      <TableCell>{submission.kota}</TableCell>
                    </>
                  )}
                  <TableCell>
                    <Chip
                      label={submission.jenisKelamin}
                      color={getGenderColor(submission.jenisKelamin)}
                      size='small'
                    />
                  </TableCell>
                  <TableCell>{submission.paketUmroh}</TableCell>
                  {!isMobile && <TableCell>{renderDocumentChips()}</TableCell>}
                  <TableCell align='center'>
                    <Tooltip title='View Details'>
                      <IconButton
                        size='small'
                        color='primary'
                        onClick={() => handleViewDetails(submission.id)}
                      >
                        <Visibility />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
    </Container>
  );
};

export default ListRequest;
