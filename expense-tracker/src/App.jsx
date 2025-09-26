import { useEffect, useState } from "react";
import { FaBell, FaTrash, FaEdit, FaWindowClose } from "react-icons/fa";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Notification from './components/Notification';
import { PieChart } from "@mui/x-charts/PieChart";
import { publicRequest } from "./requestMethods";
import Login from './components/Login';
import Register from './components/Register';
import { logout } from "./services/authService";
import Dashboard from './components/Dashboard';
import { exportToExcel } from './services/exportService';

function App() {
  const [isLogin, setIsLogin] = useState(true);
  const [user, setUser] = useState(JSON.parse(localStorage.getItem("user")) || null);
  const [isLoading, setIsLoading] = useState(false);
  const [connectionError, setConnectionError] = useState(false);

  const [addExpense, setAddExpense] = useState(false);
  const [showChats, setShowChats] = useState(false);
  const [update, setUpdate] = useState(false);
  const [expenses, setExpenses] = useState([]);
  const [label, setLabel] = useState("");
  const [amount, setValue] = useState(0);
  const [date, setDate] = useState("");
  const [category, setCategory] = useState("other"); // Add this line
  const [updatedId, setUpdatedID] = useState(null);
  const [updatedLabel, setUpdatedLabel] = useState("");
  const [updatedAmount, setUpdatedAmount] = useState("");
  const [updatedDate, setUpdatedDate] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [dateFilter, setDateFilter] = useState("all");
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [userBudget, setUserBudget] = useState(10000);

  const handleLogout = () => {
    logout();
    setUser(null);
  };

  const handleAddExpense = () => {
    setAddExpense(!addExpense);
  };

  const handleShowChart = () => {
    setShowChats(!showChats);
  };

  const handleUpdate = (id) => {
    setUpdatedID(id);
    setUpdate(!update);
  };

  const handleExpense = async () => {
    try {
      if (!label || !date || !amount) {
        toast.error("Please fill all fields");
        return;
      }

      setIsLoading(true);

      const response = await publicRequest.post("/expenses", {
        label,
        date: new Date(date).toISOString(),
        value: Number(amount),
        userId: user.id,
        category: category || 'other',
        email: user.email
      });

      if (response.data) {
        setExpenses([response.data, ...expenses]);
        setLabel("");
        setValue(0);
        setDate("");
        setCategory("other");
        setAddExpense(false);
        setConnectionError(false);

        toast.success(`Expense "${label}" added successfully!`);
      }
    } catch (error) {
      console.error("Error adding expense:", error);

      if (error.code === 'ERR_NETWORK') {
        toast.error("Unable to connect to server. Please check your connection.");
        setConnectionError(true);
      } else if (error.response?.status >= 500) {
        toast.error("Server error. Please try again later.");
      } else {
        toast.error(error.response?.data?.message || "Error adding expense");
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const getExpenses = async () => {
      if (user) {
        try {
          setIsLoading(true);
          setConnectionError(false);

          const res = await publicRequest.get(`/expenses/${user.id}`);
          setExpenses(res.data);
        } catch (error) {
          console.error('Failed to load expenses:', error);
          setConnectionError(true);

          if (error.code === 'ERR_NETWORK') {
            toast.error('Unable to connect to server. Please check your connection and try again.');
          } else if (error.response?.status >= 500) {
            toast.error('Server is temporarily unavailable. Please try again later.');
          } else {
            toast.error('Failed to load expenses. Please refresh the page.');
          }
        } finally {
          setIsLoading(false);
        }
      }
    };

    getExpenses();
  }, [user]);

  const handleDelete = async (id) => {
    try {
      // Find the expense before deleting to get its label
      const expenseToDelete = expenses.find(exp => exp._id === id);

      await publicRequest.delete(`/expenses/${id}`);

      // Show success toast in red
      toast.error(`Expense "${expenseToDelete.label}" deleted successfully!`, {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progressStyle: { background: '#ef4444' }
      });

      // Update expenses list
      setExpenses(expenses.filter(exp => exp._id !== id));
    } catch (error) {
      console.log(error);
      toast.error("Error deleting expense", {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
    }
  };

  const updateExpense = async () => {
    if (updatedId) {
      try {
        await publicRequest.put(`/expenses/${updatedId}`, {
          value: updatedAmount,
          label: updatedLabel,
          date: updatedDate,
        });
        window.location.reload();
      } catch (error) {
        console.log(error);
      }
    }
  };

  const filterExpensesByDate = (expenses, filter) => {
    const currentDate = new Date();
    const filteredExpenses = expenses.filter((expense) => {
      const expenseDate = new Date(expense.date);
      switch (filter) {
        case "week":
          const weekAgo = new Date(
            currentDate.getTime() - 7 * 24 * 60 * 60 * 1000
          );
          return expenseDate >= weekAgo;
        case "month":
          return (
            expenseDate.getMonth() === currentDate.getMonth() &&
            expenseDate.getFullYear() === currentDate.getFullYear()
          );
        case "year":
          return expenseDate.getFullYear() === currentDate.getFullYear();
        default:
          return true;
      }
    });
    return filteredExpenses;
  };

  const filteredExpenses = expenses
    .filter((expense) =>
      expense.label.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .filter((expense) => filterExpensesByDate([expense], dateFilter).length > 0);

  const totalSum = filteredExpenses.reduce((acc, curr) => acc + curr.value, 0);

  const handleLoginSuccess = (userData) => {
    setUser(userData);
  };

  const handleBudgetChange = (newBudget) => {
    setUserBudget(newBudget);
    // Save to localStorage for persistence
    localStorage.setItem('userBudget', newBudget.toString());
  };

  // Add useEffect to load saved budget
  useEffect(() => {
    const savedBudget = localStorage.getItem('userBudget');
    if (savedBudget) {
      setUserBudget(Number(savedBudget));
    }
  }, []);

  useEffect(() => {
    // Check expense limit
    const checkExpenseLimit = () => {
      const totalExpenses = expenses.reduce((sum, exp) => sum + exp.value, 0);
      const percentageUsed = (totalExpenses / userBudget) * 100;
      const remaining = userBudget - totalExpenses;

      // Update balance alert messages
      if (percentageUsed >= 80 && percentageUsed < 100) {
        import('react-toastify').then(({ toast }) => {
          toast.warning(`Low Balance Alert! Only ₹${remaining.toFixed(2)} remaining`, {
            position: "top-right",
            autoClose: 5000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
          });
        });
      } else if (percentageUsed >= 100) {
        import('react-toastify').then(({ toast }) => {
          toast.error(`Budget Exceeded! Over by ₹${Math.abs(remaining).toFixed(2)}`, {
            position: "top-right",
            autoClose: 5000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
          });
        });
      }
    };

    checkExpenseLimit();

    // Check for month end and generate report
    const today = new Date();
    const isLastDayOfMonth = today.getDate() === new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();

    if (isLastDayOfMonth) {
      const monthlyTotal = expenses.reduce((sum, exp) => sum + exp.value, 0);
      addNotification({
        title: "Monthly Report",
        message: `Monthly spending: ₹${monthlyTotal}. Budget: ₹${userBudget}. Remaining: ₹${userBudget - monthlyTotal}`,
        type: "info",
        category: "Monthly Report"
      });
    }
  }, [expenses, userBudget]);

  const addNotification = (notification) => {
    // Add unique ID and budget warning flag to notification
    const newNotification = {
      ...notification,
      id: Date.now(),
      isBudgetWarning: notification.title.includes('Budget'),
      timestamp: new Date().toISOString()
    };

    // Check if notification was already seen
    const seenNotifications = JSON.parse(localStorage.getItem('seenNotifications') || '[]');
    if (!seenNotifications.includes(newNotification.id)) {
      setNotifications(prev => {
        // Filter out old budget warnings if this is a new budget warning
        const filteredPrev = newNotification.isBudgetWarning
          ? prev.filter(n => !n.isBudgetWarning)
          : prev;

        const updatedNotifications = [...filteredPrev, newNotification];
        localStorage.setItem('notifications', JSON.stringify(updatedNotifications));
        return updatedNotifications;
      });
    }
  };

  useEffect(() => {
    // Load saved notifications on mount
    const savedNotifications = JSON.parse(localStorage.getItem('notifications') || '[]');
    if (savedNotifications.length > 0) {
      setNotifications(savedNotifications);
    }
  }, []);

  const removeNotification = (index) => {
    setNotifications(prev => {
      const updated = prev.filter((_, i) => i !== index);
      localStorage.setItem('notifications', JSON.stringify(updated));
      return updated;
    });
  };

  useEffect(() => {
    // Listen for budget warnings
    const handleBudgetWarning = (event) => {
      const notification = event.detail;
      if (!notifications.some(n => n.message === notification.message)) {
        setNotifications(prev => [...prev, notification]);
      }
    };

    window.addEventListener('budgetWarning', handleBudgetWarning);

    return () => {
      window.removeEventListener('budgetWarning', handleBudgetWarning);
    };
  }, [notifications]);

  // Add this function to format data for PieChart
  const formatChartData = () => {
    const categoryTotals = expenses.reduce((acc, expense) => {
      const category = expense.category || 'other';
      acc[category] = (acc[category] || 0) + expense.value;
      return acc;
    }, {});

    return Object.entries(categoryTotals).map(([category, value]) => ({
      id: category,
      value: value,
      label: category.charAt(0).toUpperCase() + category.slice(1)
    }));
  };

  const handleExportData = () => {
    try {
      exportToExcel(filteredExpenses);
      toast.success('Expense report exported successfully!');
    } catch (error) {
      toast.error('Failed to export expenses: ' + error.message);
    }
  };

  // Show loading indicator during initial load
  if (isLoading && !user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="spinner-border animate-spin inline-block w-8 h-8 border-4 rounded-full border-blue-500 border-t-transparent"></div>
          <p className="mt-4">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
      {!user ? (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
          {connectionError && (
            <div className="mb-4 p-4 bg-yellow-100 border border-yellow-400 text-yellow-700 rounded">
              <p>Connection issues detected. Server may be starting up.</p>
            </div>
          )}
          {isLogin ? (
            <Login
              onToggleForm={() => setIsLogin(false)}
              onLoginSuccess={handleLoginSuccess}
            />
          ) : (
            <Register
              onToggleForm={() => setIsLogin(true)}
            />
          )}
        </div>
      ) : (
        <div className="flex flex-col justify-center items-center mt-[3%] w-[80%] mr-[5%] ml-[5%]">
          {/* Existing header */}
          <div className="w-full flex justify-between items-center mb-4 p-4 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300">
            <h1 className="text-2xl font-medium text-[#555] hover:text-[#af8978] transition-colors duration-300">
              Expense Tracker
            </h1>
            <div className="flex items-center gap-4">
              <div className="relative">
                <button
                  onClick={() => setShowNotifications(!showNotifications)}
                  className="p-2 hover:bg-gray-100 rounded-full relative"
                >
                  <FaBell className="text-[#af8978] text-xl" />
                  {notifications.length > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-5 h-5 text-xs flex items-center justify-center">
                      {notifications.length}
                    </span>
                  )}
                </button>
                {showNotifications && (
                  <Notification
                    notifications={notifications}
                    onClose={(index) => {
                      removeNotification(index);
                      setShowNotifications(true); // Keep notifications open after closing one
                    }}
                    budgetLimit={userBudget}
                  />
                )}
              </div>
              <span className="text-gray-600">Welcome, {user.email}</span>
              <button
                onClick={handleLogout}
                className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transform hover:scale-105 transition-all duration-300 active:scale-95"
              >
                Logout
              </button>
            </div>
          </div>

          {/* Add Dashboard */}
          <Dashboard
            expenses={filteredExpenses}
            notifications={notifications}
            onBudgetChange={handleBudgetChange}
          />

          <div className="flex items-center justify-between mt-5 w-[100%]">
            <div className="relative flex justify-between w-[300px]">
              <button
                className="bg-[#af8978] p-[10px] border-none outline-none cursor-pointer text-[#fff] text-medium rounded-lg hover:bg-[#97756b] transform hover:scale-105 transition-all duration-300 active:scale-95 shadow-md"
                onClick={handleAddExpense}
              >
                Add Expense
              </button>
              <button
                className="bg-blue-300 cursor-pointer p-[10px] text-[#fff] rounded-lg hover:bg-blue-400 transform hover:scale-105 transition-all duration-300 active:scale-95 shadow-md"
                onClick={handleShowChart}
              >
                Expense Report
              </button>
              <button
                className="bg-green-500 cursor-pointer p-[10px] text-[#fff] rounded-lg hover:bg-green-600 transform hover:scale-105 transition-all duration-300 active:scale-95 shadow-md"
                onClick={handleExportData}
              >
                Export Excel
              </button>

              {addExpense && (
                <div className="absolute z-[999] flex flex-col p-[10px] top-[20px] left-0 h-[500px] w-[500px] bg-white shadow-xl">
                  <FaWindowClose
                    className="flex justify-end items-end text-2xl text-red-500 cursor-pointer"
                    onClick={handleAddExpense}
                  />
                  <label htmlFor="" className="mt-[10px]font-semibold text-[18px]">
                    Expense Name
                  </label>
                  <input
                    type="text"
                    value={label}
                    placeholder="Snacks"
                    className="border-[#444] p-[10px] outline-none"
                    onChange={(e) => setLabel(e.target.value)}
                  />

                  {/* Add category select field */}
                  <label htmlFor="" className="mt-[10px]font-semibold text-[18px]">
                    Category
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="p-[10px] outline-none border-[#444]"
                  >
                    <option value="food">Food</option>
                    <option value="transport">Transport</option>
                    <option value="utilities">Utilities</option>
                    <option value="entertainment">Entertainment</option>
                    <option value="other">Other</option>
                  </select>

                  <label
                    htmlFor=""
                    className="mt-[10px] font-semibold text-[18px]"
                  >
                    Expense Amount
                  </label>
                  <input
                    type="Number"
                    value={amount}
                    placeholder="Snacks"
                    className="p-[10px] outline-none"
                    onChange={(e) => setValue(e.target.value)}
                  />
                  <label
                    htmlFor=""
                    className="mt-[10px] font-semibold text-[18px]"
                  >
                    Expense Date
                  </label>
                  <input
                    type="date"
                    value={date}
                    placeholder="Snacks"
                    className="p-[10px] outline-none"
                    onChange={(e) => setDate(e.target.value)}
                  />

                  <button
                    className="bg-[#af8978] text-white p-[10px] border-none cursor-pointer my-10"
                    onClick={handleExpense}
                  >
                    Add Expense
                  </button>
                </div>
              )}

              {showChats && (
                <div className="absolute z-[999] flex flex-col p-[10px] top-[20px] left-[100px] h-[500px] w-[500px] bg-white shadow-xl">
                  <FaWindowClose
                    className="flex justify-end items-end text-2xl text-red-500 cursor-pointer"
                    onClick={handleShowChart}
                  />
                  <PieChart
                    series={[
                      {
                        data: formatChartData(),
                        innerRadius: 30,
                        outerRadius: 100,
                        paddingAngle: 5,
                        cornerRadius: 5,
                        startAngle: -90,
                        endAngle: 180,
                        cx: 150,
                        cy: 150,
                      },
                    ]}
                    height={300}
                    width={400}
                  />
                  <div className="mt-4">
                    <strong>Total Expenses:</strong> ₹{totalSum}
                  </div>
                </div>
              )}
            </div>
            <div className="flex gap-4">
              <input
                type="text"
                placeholder="Search"
                className="p-[10px] w-[150px] border-2 border-[#444] border-solid"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <select
                className="p-[10px] border-2 border-[#444] border-solid"
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
              >
                <option value="all">All Time</option>
                <option value="week">This Week</option>
                <option value="month">This Month</option>
                <option value="year">This Year</option>
              </select>
            </div>
          </div>
          <div className="flex flex-col">
            {filteredExpenses.map((expense, index) => (
              <div
                key={expense._id} // Changed: Moved key to outermost element and using expense._id instead of index
                className="relative flex justify-between items-center w-[80vw] h-[100px] bg-[#f3edeb] my-[20px] py-[10px] rounded-lg hover:bg-[#ebe3e0] transition-colors duration-300 transform hover:scale-[1.01] hover:shadow-md"
              >
                <h2 className="m-[20px] text-[#555] text-[18px] font-medium hover:text-[#af8978] transition-colors duration-300">
                  {expense.label}
                </h2>
                <h2 className="m-[20px] text-[18px]">{expense.date}</h2>
                <h2 className="m-[20px] text-[18px] font-medium">
                  ₹{expense.value}
                </h2>

                <div className="flex gap-3">
                  <FaTrash
                    className="text-red-500 mr-[10px] cursor-pointer hover:text-red-600 transform hover:scale-110 transition-all duration-300"
                    onClick={() => handleDelete(expense._id)}
                  />
                  <FaEdit
                    className="text-[#555] my-[10px] cursor-pointer hover:text-[#af8978] transform hover:scale-110 transition-all duration-300"
                    onClick={() => handleUpdate(expense._id)}
                  />
                </div>
              </div>
            ))}
          </div>

          {update && (
            <div className="absolute z-[999] flex flex-col p-[10px] top-[25%] right-0 h-[500px] w-[500px] bg-white shadow-xl">
              <FaWindowClose
                className="flex justify-end items-end text-2xl text-red-500 cursor-pointer"
                onClick={handleUpdate}
              />
              <label htmlFor="" className="mt-[10px]font-semibold text-[18px]">
                Expense Name
              </label>
              <input
                type="text"
                placeholder="Birthday"
                className="border-[#444]  p-[10px] outline-none"
                onChange={(e) => setUpdatedLabel(e.target.value)}
              />
              <label htmlFor="" className="mt-[10px] font-semibold text-[18px]">
                Expense Amount
              </label>
              <input
                type="Number"
                placeholder="300"
                className="p-[10px] outline-none"
                onChange={(e) => setUpdatedAmount(e.target.value)}
              />
              <label htmlFor="" className="mt-[10px] font-semibold text-[18px]">
                Expense Date
              </label>
              <input
                type="text"
                placeholder="20/11/2024"
                className="p-[10px] outline-none"
                onChange={(e) => setUpdatedDate(e.target.value)}
              />

              <button
                className="bg-[#af8978] text-white p-[10px] border-none cursor-pointer my-10"
                onClick={updateExpense}
              >
                Update Expense
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default App;
