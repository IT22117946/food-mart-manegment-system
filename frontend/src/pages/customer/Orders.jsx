import { Delete } from "@material-ui/icons";
import { useState, useEffect } from "react";
import { apiUrl } from "../../utils/Constants";
import authAxios from "../../utils/authAxios";
import { toast } from "react-toastify";
import jsPDF from "jspdf";
import { Button, Dialog, DialogTitle } from "@material-ui/core";
import { DialogActions, DialogContent, Rating } from "@mui/material";
import "jspdf-autotable"; // Ensure to import this for autoTable to work

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    driverId: "",
    rate: "",
  });
  const [selectedMonth, setSelectedMonth] = useState("");

  const handleClickOpen = (driverId) => {
    setOpen(true);
    setFormData({
      driverId: driverId,
      rate: "",
    });
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleCreateReview = (field, value) => {
    setFormData((prevData) => ({ ...prevData, [field]: value }));
  };

  const handleSubmit = async () => {
    try {
      const result = await authAxios.post(`${apiUrl}/review/driver`, formData);
      if (result) {
        toast.success("Review submitted successfully");
      }
      getOrders();
      setOpen(false);
    } catch (error) {
      toast.error(error.response?.data?.message || "An error occurred");
    }
  };

  const getOrders = async () => {
    try {
      const res = await authAxios.get(`${apiUrl}/order`);
      let filteredOrders = res.data;
      if (selectedMonth !== "") {
        filteredOrders = res.data.filter(
          (order) =>
            new Date(order.createdAt).getMonth() === parseInt(selectedMonth) - 1
        );
      }
      setOrders(filteredOrders);
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || "An error occurred");
    }
  };

  const removeOrder = async (itemId) => {
    try {
      const result = await authAxios.delete(`${apiUrl}/order/${itemId}`);
      if (result) {
        toast.success("Order removed successfully");
        getOrders();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "An error occurred");
    }
  };

  useEffect(() => {
    getOrders();
  }, [selectedMonth]);

  const handleGeneratePDF = () => {
    const doc = new jsPDF();
    const header = [["No", "Id", "Date", "Driver", "Status"]];
    const data = orders.map((order, index) => [
      index + 1,
      order._id,
      new Date(order.createdAt).toLocaleDateString(),
      order.driverId
        ? `${order.driverId.firstName} ${order.driverId.lastName}`
        : "N/A",
      order.status,
    ]);

    doc.setFontSize(12);
    doc.text("Order Details", doc.internal.pageSize.width / 2, 10, {
      align: "center",
    });
    doc.autoTable({
      head: header,
      body: data,
      startY: 20,
      margin: { top: 20 },
    });

    doc.save("cus_orders.pdf");
  };

  const handleMonthChange = (event) => {
    setSelectedMonth(event.target.value);
  };

  return (
    <div className="bg-white p-8 rounded-md w-full">
      <div className="flex items-center justify-between pb-6">
        <div>
          <h2 className="text-gray-600 font-semibold">Products Order</h2>
          <span className="text-xs">All product items</span>
        </div>
        <div className="flex items-center justify-between">
          <select
            className="bg-gray-50 outline-none ml-1 block"
            onChange={handleMonthChange}
            value={selectedMonth}
          >
            <option value="">All Months</option>
            {Array.from({ length: 12 }, (_, i) => (
              <option key={i} value={i + 1}>
                {new Date(0, i).toLocaleString("default", { month: "long" })}
              </option>
            ))}
          </select>
          <Button
            variant="contained"
            color="primary"
            className="ml-2"
            onClick={handleGeneratePDF}
          >
            My Order Details
          </Button>
        </div>
      </div>
      <div>
        <div className="-mx-4 sm:-mx-8 px-4 sm:px-8 py-4 overflow-x-auto">
          <div className="inline-block min-w-full shadow rounded-lg overflow-hidden">
            <table className="min-w-full leading-normal">
              <thead>
                <tr>
                  {["No", "Id", "Date", "Driver", "Status", "Actions"].map(
                    (header) => (
                      <th
                        key={header}
                        className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider"
                      >
                        {header}
                      </th>
                    )
                  )}
                </tr>
              </thead>
              {orders.length > 0 ? (
                <tbody>
                  {orders.map((order, index) => (
                    <tr key={order._id}>
                      <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                        <div className="flex items-center">
                          <div className="ml-3">
                            <p className="text-gray-900 whitespace-no-wrap">
                              {index + 1}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                        <div className="flex items-center">
                          <div className="ml-3">
                            <p className="text-gray-900 whitespace-no-wrap">
                              {order._id}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                        <p className="text-gray-900 whitespace-no-wrap">
                          {new Date(order.createdAt).toLocaleDateString()}
                        </p>
                      </td>
                      <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                        <p className="text-gray-900 whitespace-no-wrap">
                          {order.driverId
                            ? `${order.driverId.firstName} ${order.driverId.lastName}`
                            : "N/A"}
                        </p>
                      </td>
                      <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                        <span className="relative inline-block px-3 py-1 font-semibold text-green-900 leading-tight">
                          <span
                            aria-hidden
                            className="absolute inset-0 bg-green-200 opacity-50 rounded-full"
                          ></span>
                          <span className="relative">{order.status}</span>
                        </span>
                      </td>
                      <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                        {order.status !== "completed" ? (
                          <span
                            className="relative inline-block px-3 py-1 font-semibold text-red-600 leading-tight cursor-pointer"
                            onClick={() => removeOrder(order._id)}
                          >
                            <span
                              aria-hidden
                              className="absolute inset-0 bg-red-200 opacity-50 rounded-full"
                            ></span>
                            <span className="relative">
                              <Delete fontSize="small" />
                            </span>
                          </span>
                        ) : order.driverId ? (
                          <Button
                            onClick={() => handleClickOpen(order.driverId._id)}
                          >
                            Rate Driver
                          </Button>
                        ) : (
                          "N/A"
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              ) : (
                <tbody>
                  <tr>
                    <td
                      colSpan="6"
                      className="px-5 py-5 border-b border-gray-200 bg-white text-sm text-center"
                    >
                      No orders found.
                    </td>
                  </tr>
                </tbody>
              )}
            </table>
          </div>
        </div>
      </div>
      <Dialog
        open={open}
        onClose={handleClose}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
        PaperProps={{
          style: {
            width: "33%",
            minWidth: "200px",
            maxWidth: "500px",
          },
        }}
      >
        <DialogTitle id="alert-dialog-title">Rate Driver</DialogTitle>
        <DialogContent>
          <Rating
            name="simple-controlled"
            value={formData.rate}
            onChange={(e) => handleCreateReview("rate", e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button
            onClick={handleSubmit}
          >
            Publish
          </Button>
          <Button onClick={handleClose} autoFocus>
            Cancel
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}
