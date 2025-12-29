import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Package, Clock, MessageCircle, CheckCircle, AlertCircle, Loader } from 'lucide-react';
import { Progress } from '../components/ui/progress';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import axios from 'axios';
import { discordServer } from '../data/mock';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const statusConfig = {
  pending: { label: 'Pending', color: 'bg-yellow-500/20 text-yellow-400', icon: AlertCircle },
  in_progress: { label: 'In Progress', color: 'bg-blue-500/20 text-blue-400', icon: Loader },
  completed: { label: 'Completed', color: 'bg-[#00FFD1]/20 text-[#00FFD1]', icon: CheckCircle },
};

const DashboardPage = () => {
  const { user, token, isAuthenticated, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, authLoading, navigate]);

  useEffect(() => {
    const fetchOrders = async () => {
      if (!token) return;
      
      try {
        const response = await axios.get(`${API}/orders`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setOrders(response.data);
      } catch (error) {
        console.error('Failed to fetch orders:', error);
      } finally {
        setLoading(false);
      }
    };

    if (isAuthenticated && token) {
      fetchOrders();
    }
  }, [isAuthenticated, token]);

  const filteredOrders = activeTab === 'all' 
    ? orders 
    : orders.filter(o => o.status === activeTab);

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-[#00FFD1] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="bg-black min-h-screen">
      {/* Hero */}
      <section className="py-12 border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-6">
            <Avatar className="w-20 h-20 rounded-none border-2 border-[#00FFD1]">
              <AvatarImage src={user?.avatar} />
              <AvatarFallback className="bg-[#00FFD1] text-black text-2xl rounded-none">
                {user?.username?.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <div>
              <h1 className="text-3xl font-semibold text-white mb-2">
                Welcome back, {user?.username}!
              </h1>
              <p className="text-white/60">
                View and track all your orders
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Orders Section */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
            <TabsList className="bg-[#121212] border border-white/10 p-1 rounded-none">
              <TabsTrigger 
                value="all" 
                className="rounded-none data-[state=active]:bg-[#00FFD1] data-[state=active]:text-black px-6"
              >
                All Orders
              </TabsTrigger>
              <TabsTrigger 
                value="pending" 
                className="rounded-none data-[state=active]:bg-[#00FFD1] data-[state=active]:text-black px-6"
              >
                Pending
              </TabsTrigger>
              <TabsTrigger 
                value="in_progress" 
                className="rounded-none data-[state=active]:bg-[#00FFD1] data-[state=active]:text-black px-6"
              >
                In Progress
              </TabsTrigger>
              <TabsTrigger 
                value="completed" 
                className="rounded-none data-[state=active]:bg-[#00FFD1] data-[state=active]:text-black px-6"
              >
                Completed
              </TabsTrigger>
            </TabsList>

            <TabsContent value={activeTab} className="space-y-6">
              {filteredOrders.length === 0 ? (
                <Card className="bg-[#121212] border-white/10 rounded-none">
                  <CardContent className="py-12 text-center">
                    <Package className="w-16 h-16 text-white/20 mx-auto mb-4" />
                    <h3 className="text-xl text-white mb-2">No orders found</h3>
                    <p className="text-white/60 mb-6">Start by purchasing a service</p>
                    <Button 
                      onClick={() => navigate('/services')}
                      className="bg-[#00FFD1] text-black hover:bg-transparent hover:text-[#00FFD1] border-2 border-[#00FFD1] rounded-none"
                    >
                      Browse Services
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                filteredOrders.map((order) => {
                  const status = statusConfig[order.status] || statusConfig.pending;
                  const StatusIcon = status.icon;
                  return (
                    <Card key={order.id} className="bg-[#121212] border-white/10 rounded-none hover:border-[#00FFD1]/30 transition-all duration-300">
                      <CardContent className="p-6">
                        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                          {/* Order Info */}
                          <div className="flex-1">
                            <div className="flex items-center gap-4 mb-4">
                              {order.character_icon && (
                                <img 
                                  src={order.character_icon} 
                                  alt={order.character_name}
                                  className="w-12 h-12 object-cover"
                                />
                              )}
                              <div>
                                <h3 className="text-xl font-semibold text-white">
                                  {order.character_name}
                                </h3>
                                <p className="text-white/60 text-sm">
                                  {order.service_type === 'priority-farm' ? 'Priority Farm' : 'Lord Boosting'}
                                </p>
                              </div>
                              <Badge className={`${status.color} rounded-none ml-auto`}>
                                <StatusIcon className="w-3 h-3 mr-1" />
                                {status.label}
                              </Badge>
                            </div>
                            
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                              <div>
                                <span className="text-white/40 block">Order ID</span>
                                <span className="text-white font-mono text-xs">{order.id.slice(0, 8)}...</span>
                              </div>
                              <div>
                                <span className="text-white/40 block">Price</span>
                                <span className="text-[#00FFD1] font-semibold">${order.price}</span>
                              </div>
                              <div>
                                <span className="text-white/40 block">ETA</span>
                                <span className="text-white">{order.eta || 'TBD'}</span>
                              </div>
                              <div>
                                <span className="text-white/40 block">Created</span>
                                <span className="text-white">
                                  {new Date(order.created_at).toLocaleDateString()}
                                </span>
                              </div>
                            </div>

                            {/* Progress Bar */}
                            {order.status !== 'pending' && (
                              <div className="mt-6">
                                <div className="flex justify-between text-sm mb-2">
                                  <span className="text-white/60">Progress</span>
                                  <span className="text-[#00FFD1]">{order.progress}%</span>
                                </div>
                                <Progress 
                                  value={order.progress} 
                                  className="h-2 bg-white/10 rounded-none [&>div]:bg-[#00FFD1] [&>div]:rounded-none"
                                />
                              </div>
                            )}

                            {/* Notes */}
                            {order.notes && (
                              <div className="mt-4 p-4 bg-white/5 border-l-2 border-[#00FFD1]">
                                <p className="text-white/80 text-sm">{order.notes}</p>
                              </div>
                            )}
                          </div>

                          {/* Booster Info */}
                          <div className="flex flex-col items-center lg:items-end gap-4">
                            {order.booster_username ? (
                              <div className="text-center lg:text-right">
                                <span className="text-white/40 text-sm block">Assigned Booster</span>
                                <span className="text-white">{order.booster_username}</span>
                              </div>
                            ) : (
                              <div className="text-center lg:text-right">
                                <span className="text-white/40 text-sm block">Booster</span>
                                <span className="text-yellow-400">Awaiting Assignment</span>
                              </div>
                            )}
                            <Button
                              variant="outline"
                              className="border-white/20 text-white hover:bg-white hover:text-black rounded-none"
                              onClick={() => window.open(discordServer.inviteUrl, '_blank')}
                            >
                              <MessageCircle className="w-4 h-4 mr-2" />
                              Open Support Ticket
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })
              )}
            </TabsContent>
          </Tabs>
        </div>
      </section>
    </div>
  );
};

export default DashboardPage;
