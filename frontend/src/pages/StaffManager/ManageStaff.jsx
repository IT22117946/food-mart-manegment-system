import React, { useEffect, useState } from 'react';
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, TextField } from '@mui/material'; // Importing Material-UI components
import { Delete } from '@mui/icons-material'; // Icon component
import { apiUrl } from '../../utils/Constants'; // API URL constant
import authAxios from '../../utils/authAxios'; // Axios instance with authentication
import { toast } from 'react-toastify'; // Toast notification library
import Loader from '../../components/Loader/Loader'; // Loading spinner component
import { RadioGroup, FormLabel, Radio, FormControlLabel, FormGroup } from '@mui/material'; // Radio button components
import jsPDF from 'jspdf'; // Library for generating PDFs
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper } from '@mui/material'; // Table components

// Functional component for managing staff
export default function ManageStaff() {

  // State variables
  const [users, setUsers] = useState([]); // Store the list of users
  const [openSignupDialog, setOpenSignupDialog] = useState(false); // State for opening/closing the signup dialog
  const [openUpdateDialog, setOpenUpdateDialog] = useState(false); // State for opening/closing the update dialog
  const [isLoading, setIsLoading] = useState(true); // State for loading indicator
  const [formData, setFormData] = useState({ // Form data for creating a new user
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    contactNo: '',
    role: '',
  });

  const [updateFormData, setUpdateFormData] = useState({ // Form data for updating a user
    _id: '',
    firstName: '',
    lastName: '',
    email: '',
    contactNo: '',
    role: '',
  });

  // Function to handle updating a user
  const handleUpdateUser = (row) => {
    setOpenUpdateDialog(true); // Open the update dialog
    setUpdateFormData({ // Set form data for updating the selected user
      _id: row._id,
      firstName: row.firstName,
      lastName: row.lastName,
      email: row.email,
      contactNo: row.contactNo,
      role: row.role,
    });
  };

  // Function to handle opening the signup dialog
  const handleSignupDialogOpen = () => {
    setOpenSignupDialog(true); // Open the signup dialog
  };

  // Function to update the form data when creating a user
  const handleCreateUser = (field, value) => {
    setFormData((prevData) => ({ ...prevData, [field]: value }));
  };

  // Function to handle checkbox change (role selection)
  const handleCheckboxChange = (field, value) => {
    setFormData((prevData) => ({ ...prevData, [field]: value }));
  };

  // Function to handle closing the dialog
  const handleDialogClose = () => {
    setOpenSignupDialog(false); // Close the signup dialog
    setOpenUpdateDialog(false); // Close the update dialog
    setFormData({ // Clear form data
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      contactNo: '',
      role: '',
    });
  };

  // Function to handle form submission when creating a user
  const handleSubmit = async () => {
    // Phone number validation
    if (formData.contactNo.length !== 10) {
      toast.error('Phone number must be exactly 10 digits!');
      return;
    }

    // Email validation
    if (!formData.email.includes('@gmail.com')) {
      toast.error('Email must be a valid Gmail address!');
      return;
    }

    try {
      const result = await authAxios.post(`${apiUrl}/user/create`, formData); // Send POST request to create user
      if (result) {
        toast.success('Staff Member Account Created Successfully!'); // Display success message
      }
      getUsers(); // Refresh the list of users
      setOpenSignupDialog(false); // Close the signup dialog
    } catch (error) {
      toast.error(error.response.data.message); // Display error message
    }
  };

  // Function to handle updating a user
  const handleUpdate = async () => {
    try {
      const result = await authAxios.put(`${apiUrl}/user/update-account/${updateFormData._id}`, updateFormData); // Send PUT request to update user
      if (result) {
        getUsers(); // Refresh the list of users
        toast.success('Staff Member Updated Successfully!'); // Display success message
        handleDialogClose(); // Close the update dialog
      }
    } catch (error) {
      toast.error(error.response.data.message); // Display error message
    }
  };

  // Function to handle deleting a user
  const handleDeleteUser = async (id) => {
    try {
      const result = await authAxios.delete(`${apiUrl}/user/delete-account/${id}`); // Send DELETE request to delete user

      if (result) {
        getUsers(); // Refresh the list of users
        toast.warning('Staff Member Deleted Successfully!'); // Display success message
      }
    } catch (error) {
      toast.error(error.response.data.message); // Display error message
    } finally {
      refreshPage(); // Refresh the page (if needed)
    }
  };

  // Function to fetch users from the server
  const getUsers = async (roleFilter) => {
    try {
      const res = await authAxios.get(`${apiUrl}/user/all`); // Send GET request to fetch all users
      if (roleFilter) {
        setUsers(res.data.filter(user => user.role === roleFilter)); // Filter users by role if specified
      } else {
        setUsers(res.data); // Set the list of users
      }
      setIsLoading(false); // Disable loading indicator
    } catch (error) {
      console.error(error);
      if (error.response && error.response.status === 404) {
        toast.error('Staff Members not found'); // Display error message if users not found
      } else {
        toast.error(error.response?.data?.message || 'An error occurred while getting all staff members!'); // Display generic error message
      }
    }
  };

  // Function to generate a PDF with the list of staff members
  const handleGeneratePDF = () => {
    const doc = new jsPDF(); // Create a new PDF document

    // Header
    const header = [['First Name', 'Last Name', 'Email', 'Contact No', 'Role']];
    // Data
    const data = users.filter(user => user.role !== 'customer' && user.role !=='driver').map(user => [user.firstName, user.lastName, user.email, user.contactNo, user.role]);
    // Set font size and align center in width
    doc.setFontSize(12);
    doc.text("Our Staff Members", doc.internal.pageSize.width / 2, 10, { align: 'center' });
    // Add header and data to the table

    doc.autoTable({
      head: header,
      body: data,
      startY: 20,
      margin: { top: 20 },
    });

    doc.save("staff_members.pdf"); // Save the PDF file
  };

  // Fetch users when component mounts
  useEffect(() => {
    getUsers(); // Fetch all users
  }, []);

  return (
    <div className="container mx-auto p-4" style={{ backgroundColor: '#C1E1C1' }}>
      <h2 className="text-2xl text-center my-4">Manage Staff</h2>
      <div className="flex justify-between items-center mb-4">
        <div>
          <Button variant="contained" color="primary" style={{ backgroundColor: '#2E8B57', color: '#000' }} onClick={handleSignupDialogOpen}>Add New Staff</Button>
        </div>
        <div>
          <TextField id="search" label="Search by Role" variant="outlined" size="small" onChange={(e) => getUsers(e.target.value)} />
          <Button variant="contained" color="primary" style={{ backgroundColor: '#2E8B57', color: '#000' }} className="ml-2" onClick={handleGeneratePDF}>Generate PDF</Button>
        </div>
      </div>

      {!isLoading ? ( // If loading is complete
        <TableContainer component={Paper}>
          <Table style={{ border: '2px solid #2E8B57' }}>
            <TableHead>
              {/* Table header */}
              <TableRow style={{ backgroundColor: '#2E8B57' }}>
                <TableCell style={{ color: '#fff', fontWeight: 'bold', fontSize: '16px', border: '1px solid #2E8B57' }}>First Name</TableCell>
                <TableCell style={{ color: '#fff', fontWeight: 'bold', fontSize: '16px', border: '1px solid #2E8B57' }}>Last Name</TableCell>
                <TableCell style={{ color: '#fff', fontWeight: 'bold', fontSize: '16px', border: '1px solid #2E8B57' }}>Email</TableCell>
                <TableCell style={{ color: '#fff', fontWeight: 'bold', fontSize: '16px', border: '1px solid #2E8B57' }}>Contact No</TableCell>
                <TableCell style={{ color: '#fff', fontWeight: 'bold', fontSize: '16px', border: '1px solid #2E8B57' }}>Role</TableCell>
                <TableCell style={{ color: '#fff', fontWeight: 'bold', fontSize: '16px', border: '1px solid #2E8B57' }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {/* Table rows */}
              {users.filter(user => user.role !== 'customer' && user.role !=='driver').map(user => (
                <TableRow key={user._id} style={{ border: '1px solid #2E8B57' }}>
                  <TableCell style={{ fontWeight: 'bold', fontSize: '14px', border: '1px solid #2E8B57' }}>{user.firstName}</TableCell>
                  <TableCell style={{ fontWeight: 'bold', fontSize: '14px', border: '1px solid #2E8B57' }}>{user.lastName}</TableCell>
                  <TableCell style={{ fontWeight: 'bold', fontSize: '14px', border: '1px solid #2E8B57' }}>{user.email}</TableCell>
                  <TableCell style={{ fontWeight: 'bold', fontSize: '14px', border: '1px solid #2E8B57' }}>{user.contactNo}</TableCell>
                  <TableCell style={{ fontWeight: 'bold', fontSize: '14px', border: '1px solid #2E8B57' }}>{user.role}</TableCell>
                  <TableCell style={{ fontWeight: 'bold', fontSize: '14px', border: '1px solid #2E8B57' }}>
                    {/* Action buttons */}
                    <Button variant="contained" color="primary" style={{ backgroundColor: '#4CBB17', color: '#000', marginRight: 10 }} onClick={() => handleUpdateUser(user)}>Update</Button>
                    <Button variant="contained" color="error" startIcon={<Delete />} onClick={() => handleDeleteUser(user._id)}>Delete</Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      ) : (
        <Loader /> // Show loading spinner while fetching data
      )}

      {/* Signup dialog */}
      <Dialog open={openSignupDialog} onClose={handleDialogClose}>
        <DialogTitle>Add New Staff</DialogTitle>
        <DialogContent>
          <form>
            {/* Form fields for creating a new user */}
          </form>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleSubmit} color="primary">Submit</Button>
          <Button onClick={handleDialogClose} color="secondary">Cancel</Button>
        </DialogActions>
      </Dialog>

      {/* Update dialog */}
      <Dialog open={openUpdateDialog} onClose={handleDialogClose}>
        <DialogTitle>Update Staff</DialogTitle>
        <DialogContent>
          {/* Form fields for updating a user */}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleUpdate} color="primary">Submit</Button>
          <Button onClick={handleDialogClose} color="secondary">Cancel</Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}
