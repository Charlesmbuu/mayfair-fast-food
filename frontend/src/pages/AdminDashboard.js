import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

const AdminDashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/admin/dashboard', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const data = await response.json();
      if (data.success) {
        setDashboardData(data.data);
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="loading-spinner"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        <h1 className="text-3xl font-bold mb-8">Admin Dashboard</h1>
        
        {dashboardData ? (
          <div className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-lg font-semibold text-gray-600">Total Orders</h3>
                <p className="text-3xl font-bold text-orange-600">{dashboardData.stats.totalOrders}</p>
              </div>
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-lg font-semibold text-gray-600">Total Revenue</h3>
                <p className="text-3xl font-bold text-green-600">KES {dashboardData.stats.totalRevenue}</p>
              </div>
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-lg font-semibold text-gray-600">Total Customers</h3>
                <p className="text-3xl font-bold text-blue-600">{dashboardData.stats.totalCustomers}</p>
              </div>
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-lg font-semibold text-gray-600">Menu Items</h3>
                <p className="text-3xl font-bold text-purple-600">{dashboardData.stats.totalMenuItems}</p>
              </div>
            </div>

            {/* Recent Orders */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold mb-4">Recent Orders</h2>
              {dashboardData.recentOrders.length > 0 ? (
                <div className="space-y-4">
                  {dashboardData.recentOrders.map(order => (
                    <div key={order.id} className="flex justify-between items-center py-3 border-b">
                      <div>
                        <p className="font-semibold">Order #{order.orderNumber}</p>
                        <p className="text-sm text-gray-600">{order.customerName || 'Customer'}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">KES {order.totalAmount}</p>
                        <span className={`px-2 py-1 rounded text-xs ${
                          order.status === 'delivered' ? 'bg-green-100 text-green-800' :
                          order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-blue-100 text-blue-800'
                        }`}>
                          {order.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-600">No recent orders</p>
              )}
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <h2 className="text-2xl font-semibold mb-4">Welcome to Admin Dashboard</h2>
            <p className="text-gray-600">Manage orders, view analytics, and oversee restaurant operations.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;