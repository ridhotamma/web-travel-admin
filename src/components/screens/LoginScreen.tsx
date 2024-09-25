import { useState, ChangeEvent, FormEvent } from 'react';
import {
  Container,
  Box,
  TextField,
  Button,
  Typography,
  Avatar,
  CssBaseline,
} from '@mui/material';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import Cookies from 'js-cookie';

const theme = createTheme();

interface FormState {
  email: string;
  password: string;
}

interface FormErrors {
  email: string;
  password: string;
}

export default function LoginPage(): JSX.Element {
  const [formState, setFormState] = useState<FormState>({
    email: '',
    password: '',
  });
  const [formErrors, setFormErrors] = useState<FormErrors>({
    email: '',
    password: '',
  });
  
  const navigate = useNavigate()

  const validateEmail = (email: string): boolean => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(String(email).toLowerCase());
  };

  const handleInputChange = (event: ChangeEvent<HTMLInputElement>): void => {
    const { name, value } = event.target;
    setFormState((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleSubmit = async (
    event: FormEvent<HTMLFormElement>
  ): Promise<void> => {
    event.preventDefault();
    const newErrors: FormErrors = {
      email: '',
      password: '',
    };

    if (!validateEmail(formState.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (formState.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters long';
    }

    setFormErrors(newErrors);

    if (!newErrors.email && !newErrors.password) {
      try {
        const auth = getAuth();
        const userCredential = await signInWithEmailAndPassword(
          auth,
          formState.email,
          formState.password
        );
        const user = userCredential.user;
        const token = await user.getIdToken();

        Cookies.set('authToken', token, {
          expires: 7,
          secure: true,
          sameSite: 'strict',
        });

        console.log('User logged in successfully');
        navigate('/')

      } catch (error: any) {
        console.error('Login error:', error.message);
        setFormErrors({
          email: 'Invalid email or password',
          password: 'Invalid email or password',
        });
      }
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <Container component='main' maxWidth='xs'>
        <CssBaseline />
        <Box
          sx={{
            marginTop: 8,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}
        >
          <Avatar sx={{ bgcolor: 'primary.main', m: 1, width: 60, height: 60 }}>
            <LockOutlinedIcon sx={{ width: 30, height: 30 }} />
          </Avatar>
          <Typography component='h1' variant='h5'>
            Web Travel Login
          </Typography>
          <Box
            component='form'
            onSubmit={handleSubmit}
            noValidate
            sx={{ mt: 1 }}
          >
            <TextField
              margin='normal'
              required
              fullWidth
              id='email'
              label='Email Address'
              name='email'
              autoComplete='email'
              autoFocus
              value={formState.email}
              onChange={handleInputChange}
              error={!!formErrors.email}
              helperText={formErrors.email}
            />
            <TextField
              margin='normal'
              required
              fullWidth
              name='password'
              label='Password'
              type='password'
              id='password'
              autoComplete='current-password'
              value={formState.password}
              onChange={handleInputChange}
              error={!!formErrors.password}
              helperText={formErrors.password}
            />
            <Button
              type='submit'
              fullWidth
              variant='contained'
              sx={{ mt: 3, mb: 2 }}
            >
              Sign In
            </Button>
          </Box>
        </Box>
      </Container>
    </ThemeProvider>
  );
}
