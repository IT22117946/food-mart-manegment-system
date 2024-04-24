import React, { useState } from 'react';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Link from '@mui/material/Link';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container';
import { useNavigate } from 'react-router-dom';
import { Grid, Paper } from "@mui/material";
import { toast } from 'react-toastify';
import axios from 'axios';
import { apiUrl } from '../../utils/Constants';

const Signup = () => {


    const navigate = useNavigate();

    const handleSubmit = async (event) => {
        event.preventDefault();
        const data = new FormData(event.currentTarget);
        const payload = {
            email: data.get('email'),
            password: data.get('password'),
            contactNo: data.get('contactNo'),
            firstName: data.get('firstName'),
            lastName: data.get('lastName'),
            role: 'customer',
        };
        console.log(payload);
        try {
            const isLoggedin = await axios.post(`${apiUrl}/user/create`, payload);
            if (isLoggedin) {
                toast.success('Account Creation Successful!')
                navigate('/login');
            }
        } catch (error) {
            if (error.message) {
                toast.error(error.message);
            }
            toast.error(error.response.data.message);
        }
    };

    return (

        <Container component="main" maxWidth="lg">
      <Box
        sx={{
          marginTop: 5,
        }}
      >
        <Grid container >
          <Grid
            item
            xs={12}
            sm={8}
            md={5}
            mx={'auto'}
            component={Paper}
            elevation={6}
            square
          >
            <Box
              sx={{
                my: 8,
                mx: 4,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
              }}
            >
              <Typography component="h1" variant="h4">
                        Sign up
                    </Typography>
                    <Box component="form" noValidate onSubmit={handleSubmit} sx={{ mt: 3 }}>
                        <Grid container spacing={2}>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    autoComplete="given-name"
                                    name="firstName"
                                    required
                                    fullWidth
                                    id="firstName"
                                    label="First Name"
                                    autoFocus
                                />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    required
                                    fullWidth
                                    id="lastName"
                                    label="Last Name"
                                    name="lastName"
                                    autoComplete="family-name"
                                />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    name="contactNo"
                                    required
                                    fullWidth
                                    id="contactNo"
                                    label="Phone"
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <TextField
                                    required
                                    fullWidth
                                    id="email"
                                    label="Email Address"
                                    name="email"
                                    autoComplete="email"
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <TextField
                                    required
                                    fullWidth
                                    name="password"
                                    label="Password"
                                    type="password"
                                    id="password"
                                    autoComplete="new-password"
                                />
                            </Grid>
                        </Grid>
                        <Button
                            type="submit"
                            fullWidth
                            variant="contained"
                            sx={{ mt: 3, mb: 2 }}
                        >
                            Sign Up
                        </Button>
                        <Grid container justifyContent="flex-end"
                            sx={{ mb: 2 }}>
                            <Grid item>
                                <Link
                                    component="button"
                                    variant="body2"
                                    onClick={() => {
                                        navigate('/login');
                                    }}>
                                    {"Already have an account? Sign in"}
                                </Link>
                            </Grid>
                        </Grid>
                    </Box>
                </Box>
          </Grid>
        </Grid>
      </Box>
    </Container>
    );
};

export default Signup;
