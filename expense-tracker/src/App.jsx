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
        <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-center mb-8 p-6 bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-300">
              <h1 className="text-3xl font-bold text-gray-800 mb-4 md:mb-0">
                Expense Tracker
              </h1>
              <div className="flex flex-wrap items-center justify-center gap-4">
                <div className="relative">
                  <button
                    onClick={() => setShowNotifications(!showNotifications)}
                    className="p-3 hover:bg-gray-100 rounded-full relative transition-colors duration-200"
                  >
                    <FaBell className="text-[#af8978] text-xl" />
                    {notifications.length > 0 && (
                      <span className="absolute top-0 right-0 bg-red-500 text-white rounded-full w-5 h-5 text-xs flex items-center justify-center border-2 border-white">
                        {notifications.length}
                      </span>
                    )}
                  </button>
                  {showNotifications && (
                    <div className="absolute right-0 mt-2 w-80 z-50">
                      <Notification
                        notifications={notifications}
                        onClose={(index) => {
                          removeNotification(index);
                          setShowNotifications(true);
                        }}
                        budgetLimit={userBudget}
                      />
                    </div>
                  )}
                </div>
                <span className="text-gray-600 font-medium hidden sm:block">{user.email}</span>
                <button
                  onClick={handleLogout}
                  className="bg-red-500 text-white px-6 py-2 rounded-lg hover:bg-red-600 transform hover:scale-105 transition-all duration-300 shadow-sm active:scale-95 font-medium"
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

            <div className="flex flex-col lg:flex-row items-center justify-between mt-8 gap-6 w-full">
              <div className="flex flex-wrap justify-center lg:justify-start gap-4 w-full lg:w-auto">
                <button
                  className="bg-[#af8978] px-6 py-3 text-white font-medium rounded-lg hover:bg-[#97756b] transform hover:scale-105 transition-all duration-300 active:scale-95 shadow-md flex items-center gap-2"
                  onClick={handleAddExpense}
                >
                  <span>+</span> Add Expense
                </button>
                <button
                  className="bg-blue-500 px-6 py-3 text-white font-medium rounded-lg hover:bg-blue-600 transform hover:scale-105 transition-all duration-300 active:scale-95 shadow-md"
                  onClick={handleShowChart}
                >
                  View Report
                </button>
                <button
                  className="bg-green-500 px-6 py-3 text-white font-medium rounded-lg hover:bg-green-600 transform hover:scale-105 transition-all duration-300 active:scale-95 shadow-md"
                  onClick={handleExportData}
                >
                  Export Excel
                </button>

                {addExpense && (
                  <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-fadeIn">
                      <div className="flex justify-between items-center p-6 border-b border-gray-100">
                        <h3 className="text-xl font-bold text-gray-800">Add New Expense</h3>
                        <button
                          onClick={handleAddExpense}
                          className="text-gray-400 hover:text-red-500 transition-colors"
                        >
                          <FaWindowClose className="text-xl" />
                        </button>
                      </div>

                      <div className="p-6 space-y-4">
                        <div className="space-y-2">
                          <label className="text-sm font-semibold text-gray-600">Expense Name</label>
                          <input
                            type="text"
                            value={label}
                            placeholder="e.g., Groceries"
                            className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#af8978] focus:border-transparent outline-none transition-all"
                            onChange={(e) => setLabel(e.target.value)}
                          />
                        </div>

                        <div className="space-y-2">
                          <label className="text-sm font-semibold text-gray-600">Category</label>
                          <select
                            value={category}
                            onChange={(e) => setCategory(e.target.value)}
                            className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#af8978] focus:border-transparent outline-none transition-all bg-white"
                          >
                            <option value="food">Food</option>
                            <option value="transport">Transport</option>
                            <option value="utilities">Utilities</option>
                            <option value="entertainment">Entertainment</option>
                            <option value="other">Other</option>
                          </select>
                        </div>

                        <div className="space-y-2">
                          <label className="text-sm font-semibold text-gray-600">Amount (₹)</label>
                          <input
                            type="number"
                            value={amount}
                            placeholder="0.00"
                            className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#af8978] focus:border-transparent outline-none transition-all"
                            onChange={(e) => setValue(e.target.value)}
                          />
                        </div>

                        <div className="space-y-2">
                          <label className="text-sm font-semibold text-gray-600">Date</label>
                          <input
                            type="date"
                            value={date}
                            className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#af8978] focus:border-transparent outline-none transition-all"
                            onChange={(e) => setDate(e.target.value)}
                          />
                        </div>

                        <button
                          className="w-full bg-[#af8978] text-white py-3 rounded-lg font-semibold hover:bg-[#97756b] transform active:scale-95 transition-all duration-200 mt-6"
                          onClick={handleExpense}
                        >
                          Add Expense
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {showChats && (
                  <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-fadeIn">
                      <div className="flex justify-between items-center p-6 border-b border-gray-100">
                        <h3 className="text-xl font-bold text-gray-800">Expense Analysis</h3>
                        <button
                          onClick={handleShowChart}
                          className="text-gray-400 hover:text-red-500 transition-colors"
                        >
                          <FaWindowClose className="text-xl" />
                        </button>
                      </div>
                      <div className="p-6 flex flex-col items-center">
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
                          width={300}
                        />
                        <div className="mt-6 p-4 bg-gray-50 rounded-lg w-full text-center">
                          <span className="text-gray-600">Total Expenses:</span>
                          <span className="text-2xl font-bold text-[#af8978] ml-2">₹{totalSum}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-4 w-full lg:w-auto">
              <input
                type="text"
                placeholder="Search expenses..."
                className="p-3 w-full sm:w-64 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#af8978] focus:border-transparent outline-none transition-all"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <select
                className="p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#af8978] focus:border-transparent outline-none transition-all bg-white cursor-pointer"
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
          <div className="flex flex-col gap-4 mt-8">
            {filteredExpenses.map((expense) => (
              <div
                key={expense._id}
                className="relative flex flex-col sm:flex-row justify-between items-center w-full bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-all duration-300 border border-gray-100 group"
              >
                <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-8 w-full sm:w-auto">
                  <div className="flex flex-col items-center sm:items-start">
                    <h2 className="text-lg font-bold text-gray-800 group-hover:text-[#af8978] transition-colors">
                      {expense.label}
                    </h2>
                    <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded mt-1">
                      {expense.category || 'Other'}
                    </span>
                  </div>
                  <div className="text-gray-600 font-medium">
                    {new Date(expense.date).toLocaleDateString()}
                  </div>
                </div>

                <div className="flex items-center gap-6 mt-4 sm:mt-0">
                  <h2 className="text-xl font-bold text-[#af8978]">
                    ₹{expense.value}
                  </h2>

                  <div className="flex gap-3 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    <button
                      onClick={() => handleUpdate(expense._id)}
                      className="p-2 text-gray-500 hover:text-[#af8978] hover:bg-gray-100 rounded-full transition-all"
                      title="Edit"
                    >
                      <FaEdit className="text-lg" />
                    </button>
                    <button
                      onClick={() => handleDelete(expense._id)}
                      className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-all"
                      title="Delete"
                    >
                      <FaTrash className="text-lg" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
            {filteredExpenses.length === 0 && (
              <div className="text-center py-12 text-gray-500 bg-white rounded-xl border border-dashed border-gray-300">
                <p className="text-lg">No expenses found</p>
              </div>
            )}
          </div>

          {update && (
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
              <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-fadeIn">
                <div className="flex justify-between items-center p-6 border-b border-gray-100">
                  <h3 className="text-xl font-bold text-gray-800">Update Expense</h3>
                  <button
                    onClick={() => handleUpdate(null)}
                    className="text-gray-400 hover:text-red-500 transition-colors"
                  >
                    <FaWindowClose className="text-xl" />
                  </button>
                </div>

                <div className="p-6 space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-gray-600">Expense Name</label>
                    <input
                      type="text"
                      placeholder="e.g., Birthday Gift"
                      className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#af8978] focus:border-transparent outline-none transition-all"
                      onChange={(e) => setUpdatedLabel(e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-gray-600">Amount (₹)</label>
                    <input
                      type="number"
                      placeholder="0.00"
                      className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#af8978] focus:border-transparent outline-none transition-all"
                      onChange={(e) => setUpdatedAmount(e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-gray-600">Date</label>
                    <input
                      type="date"
                      className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#af8978] focus:border-transparent outline-none transition-all"
                      onChange={(e) => setUpdatedDate(e.target.value)}
                    />
                  </div>

                  <button
                    className="w-full bg-[#af8978] text-white py-3 rounded-lg font-semibold hover:bg-[#97756b] transform active:scale-95 transition-all duration-200 mt-6"
                    onClick={updateExpense}
                  >
                    Update Expense
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default App;
