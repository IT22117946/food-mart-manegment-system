import React, { useEffect, useState } from 'react';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Button, Paper, Dialog, DialogTitle, DialogContent, DialogActions, TextField } from '@mui/material'; // Import MUI components
import { Delete } from '@mui/icons-material'; // Import MUI Delete icon
import { apiUrl } from '../../utils/Constants';
import authAxios from '../../utils/authAxios';
import { toast } from 'react-toastify';
import Loader from '../../components/Loader/Loader';
import { RadioGroup, FormLabel, Radio, FormControlLabel, FormGroup } from '@mui/material';
import jsPDF from 'jspdf';

export default function ManageUsers() {

  const [users, setUsers] = useState([]);
  const [openSignupDialog, setOpenSignupDialog] = useState(false);
  const [openUpdateDialog, setOpenUpdateDialog] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    contactNo: '',
    role: 'customer',
  });

  const [updateFormData, setUpdateFormData] = useState({
    _id: '',
    firstName: '',
    lastName: '',
    email: '',
    contactNo: '',
  });

  const handleUpdateUser = (row) => {
    setOpenUpdateDialog(true);
    setUpdateFormData({
      _id: row._id,
      firstName: row.firstName,
      lastName: row.lastName,
      email: row.email,
      contactNo: row.contactNo,
    });
  };

  // Function to handle opening dialog for signup
  const handleSignupDialogOpen = () => {
    setOpenSignupDialog(true);
  };

  const handleCreateUser = (field, value) => {
    setFormData((prevData) => ({ ...prevData, [field]: value }));
  };

  // Use this function to handle changes in checkboxes
  const handleCheckboxChange = (field, value) => {
    setFormData((prevData) => ({ ...prevData, [field]: value }));
  };

  // Function to handle closing dialogs
  const handleDialogClose = () => {
    setOpenSignupDialog(false);
    setOpenUpdateDialog(false);
    setFormData({
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      contactNo: '',
    });
  };

  const handleGeneratePDF = () => {
    const doc = new jsPDF();
    // Header
    const header = [['First Name', 'Last Name', 'Email', 'Contact No']];
    // Data
    const data = users.filter(user => user.role == 'customer').map((users, index) => [
      users.firstName,
      users.lastName,
      users.email,
      users.contactNo,
    ]);
    // Set font size and align center in width
    doc.setFontSize(12);
    doc.text("Detailed Report of Customers", doc.internal.pageSize.width / 2, 10, { align: 'center' });
    // Add header and data to the table
    doc.autoTable({
      head: header,
      body: data,
      startY: 20,
      margin: { top: 20 },
    });

    doc.save("users.pdf");
  }

  const handleSubmit = async () => {
    try {
      const result = await authAxios.post(`${apiUrl}/user/create`, formData);
      if (result) {
        toast.success(result.data.message);
      }
      getUsers();
      setOpenSignupDialog(false);
    } catch (error) {
      //console.log(error);
      toast.error(error.response.data.message);
    }
  };

  const handleUpdate = async () => {
    try {
      const result = await authAxios.put(`${apiUrl}/user/update-account/${updateFormData._id}`, updateFormData);
      if (result) {
        getUsers();
        toast.success('User Updated Successfully');
        handleDialogClose();
      }
    } catch (error) {
      toast.error(error.response.data.message);
    }
  };

  const handleDeleteUser = async (id) => {
    try {
      const result = await authAxios.delete(`${apiUrl}/user/delete-account/${id}`);

      if (result) {
        getUsers();
        toast.warning('User Deleted Successfully');
      }
    } catch (error) {
      toast.error(error.response.data.message);
    } finally {
      refreshPage();
    }
  };

  const getUsers = async (roleFilter) => {
    try {
      const res = await authAxios.get(`${apiUrl}/user/all`);
      if (roleFilter) {
        setUsers(res.data.filter(user => user.email === roleFilter)
      );
      } else {
        setUsers(res.data);
      }
      setIsLoading(false);
    } catch (error) {
      console.error(error);
      if (error.response && error.response.status === 404) {
        toast.error('Products not found');
      } else {
        toast.error(error.response?.data?.message || 'An error occurred');
      }
    }
  };

  useEffect(() => {
    getUsers();
  }, []);

  return (
    <div>
      <h1 className="text-2xl text-center font-bold mb-4">Customer Details</h1>

      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        
        <Button variant="contained" color="primary" style={{ marginBottom: '20px' }} onClick={handleGeneratePDF}>Generate PDF</Button>
        <Button variant="contained" color="primary" style={{ marginBottom: '20px' }} onClick={handleSignupDialogOpen}>Add New User</Button>
        <TextField id="search" label="Search by Email" variant="outlined" size="small" onChange={(e) => getUsers(e.target.value)} />
      </div>

      {
        !isLoading ? <>
          <TableContainer component={Paper} className="max-w-4xl mx-auto" >
            <Table>
              <TableHead className="bg-blue-200">
                <TableRow>
                  <TableCell>First Name</TableCell>
                  <TableCell>Last Name</TableCell>
                  <TableCell>Email</TableCell>
                  <TableCell>Contact No</TableCell>
                  <TableCell>Role</TableCell>
                  <TableCell>Action</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {users.filter(user => user.role == 'customer').map(user => (
                  <TableRow key={user._id}>
                    <TableCell>{user.firstName}</TableCell>
                    <TableCell>{user.lastName}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>{user.contactNo}</TableCell>
                    <TableCell>{user.role}</TableCell>
                    <TableCell>
                      
                      <Button variant="outlined" color="error" startIcon={<Delete />} onClick={() => handleDeleteUser(user._id)}></Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </> : <Loader />}
      {/* Signup Dialog */}
      <Dialog open={openSignupDialog} onClose={handleDialogClose}>
        <DialogTitle>Add New User</DialogTitle>
        <DialogContent>
          <form>
            <TextField required label="First Name" margin="normal" name="firstName" value={formData.firstName} onChange={(e) => handleCreateUser('firstName', e.target.value)} fullWidth />
            <TextField required label="Last Name" margin="normal" name="lastName" value={formData.lastName} onChange={(e) => handleCreateUser('lastName', e.target.value)} fullWidth />
            <TextField required label="Contact No" margin="normal" name="contactNo" value={formData.contactNo} onChange={(e) => handleCreateUser('contactNo', e.target.value)} fullWidth />
            <TextField required label="Email" margin="normal" name="email" value={formData.email} onChange={(e) => handleCreateUser('email', e.target.value)} fullWidth />
            <TextField required label="Password" margin="normal" name="password" value={formData.password} onChange={(e) => handleCreateUser('password', e.target.value)} fullWidth />
          </form>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleSubmit} color="primary">Submit</Button>
          <Button onClick={handleDialogClose} color="secondary">Cancel</Button>
        </DialogActions>
      </Dialog>
      {/* Update Dialog */}
      <Dialog open={openUpdateDialog} onClose={handleDialogClose}>
        <DialogTitle>Update User</DialogTitle>
        <DialogContent>
          <TextField
            required
            id="outlined-read-only-input"
            label="First Name"
            fullWidth
            margin="normal"
            variant="outlined"
            onChange={(e) => setUpdateFormData({ ...updateFormData, firstName: e.target.value })}
            value={updateFormData.firstName}
          />
          <TextField
            required
            id="outlined-read-only-input"
            label="Last Name"
            fullWidth
            margin="normal"
            variant="outlined"
            onChange={(e) => setUpdateFormData({ ...updateFormData, lastName: e.target.value })}
            value={updateFormData.lastName}
          />
          <TextField
            required
            id="outlined-read-only-input"
            label="Contact No"
            fullWidth
            margin="normal"
            variant="outlined"
            onChange={(e) => setUpdateFormData({ ...updateFormData, contactNo: e.target.value })}
            value={updateFormData.contactNo}
          />
          <TextField
            required
            id="outlined-read-only-input"
            label="Email"
            fullWidth
            margin="normal"
            variant="outlined"
            onChange={(e) => setUpdateFormData({ ...updateFormData, email: e.target.value })}
            value={updateFormData.email}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleUpdate} color="primary">Submit</Button>
          <Button onClick={handleDialogClose} color="secondary">Cancel</Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}
