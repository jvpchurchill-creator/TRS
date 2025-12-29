import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Shield, Package, CheckCircle, AlertCircle, Loader, Clock,
  Edit, Search, Filter
} from 'lucide-react';
import { Progress } from '../components/ui/progress';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/avatar';
import { Input } from '../components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '../components/ui/dialog';
import { Textarea } from '../components/ui/textarea';
import { Label } from '../components/ui/label';
import axios from 'axios';
import { toast } from 'sonner';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const statusConfig = {
  pending: { label: 'Pending', color: 'bg-yellow-500/20 text-yellow-400', icon: AlertCircle },
  in_progress: { label: 'In Progress', color: 'bg-blue-500/20 text-blue-400', icon: Loader },
  completed: { label: 'Completed', color: 'bg-[#00FFD1]/20 text-[#00FFD1]', icon: CheckCircle },
};

const AdminDashboard = () => {
  const { user, token, isAuthenticated, isAdmin, isBooster, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [boosters, setBoosters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editForm, setEditForm] = useState({
    status: '',
    booster_id: '',
    notes: '',
    progress: 0,
    eta: ''
  });

  useEffect(() => {
    if (!authLoading && (!isAuthenticated || (!isAdmin && !isBooster))) {
      navigate('/');
      toast.error('Access denied. Admin or Booster role required.');
    }
  }, [isAuthenticated, isAdmin, isBooster, authLoading, navigate]);

  useEffect(() => {
    const fetchData = async () => {
      if (!token) return;
      
      try {
        const [ordersRes, boostersRes] = await Promise.all([
          axios.get(`${API}/admin/orders`, {
            headers: { Authorization: `Bearer ${token}` }
          }),
          axios.get(`${API}/admin/boosters`, {
            headers: { Authorization: `Bearer ${token}` }
          })
        ]);
        setOrders(ordersRes.data.orders || []);
        setBoosters(boostersRes.data || []);
      } catch (error) {
        console.error('Failed to fetch data:', error);
        toast.error('Failed to load orders');
      } finally {
        setLoading(false);
      }
    };

    if (isAuthenticated && token && (isAdmin || isBooster)) {
      fetchData();
    }
  }, [isAuthenticated, token, isAdmin, isBooster]);

  const filteredOrders = orders.filter(order => {
    const matchesSearch = 
      order.id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.character_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.discord_username?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const stats = {
    total: orders.length,
    pending: orders.filter(o => o.status === 'pending').length,
    inProgress: orders.filter(o => o.status === 'in_progress').length,
    completed: orders.filter(o => o.status === 'completed').length,
  };

  const handleEditOrder = (order) => {
    setSelectedOrder(order);
    setEditForm({
      status: order.status,
      booster_id: order.booster_id || '',
      notes: order.notes || '',
      progress: order.progress || 0,
      eta: order.eta || ''
    });
    setEditDialogOpen(true);
  };

  const handleSaveOrder = async () => {
    try {
      const response = await axios.patch(
        `${API}/orders/${selectedOrder.id}`,
        editForm,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      // Update local state
      setOrders(prev => prev.map(o => 
        o.id === selectedOrder.id ? response.data : o
      ));
      
      setEditDialogOpen(false);
      toast.success('Order updated successfully!');
    } catch (error) {
      console.error('Failed to update order:', error);
      toast.error('Failed to update order');
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-[#00FFD1] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="bg-black min-h-screen">
      {/* Header */}
      <section className="py-8 border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-[#00FFD1] flex items-center justify-center">
              <Shield className="w-8 h-8 text-black" />
            </div>
            <div>
              <h1 className="text-2xl font-semibold text-white">Admin Dashboard</h1>
              <p className="text-white/60">Manage all orders and assignments</p>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-8 border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'Total Orders', value: stats.total, icon: Package, color: 'text-white' },
              { label: 'Pending', value: stats.pending, icon: Clock, color: 'text-yellow-400' },
              { label: 'In Progress', value: stats.inProgress, icon: Loader, color: 'text-blue-400' },
              { label: 'Completed', value: stats.completed, icon: CheckCircle, color: 'text-[#00FFD1]' },
            ].map((stat, index) => (
              <Card key={index} className="bg-[#121212] border-white/10 rounded-none">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-white/60 text-sm">{stat.label}</p>
                      <p className={`text-3xl font-bold ${stat.color}`}>{stat.value}</p>
                    </div>
                    <stat.icon className={`w-8 h-8 ${stat.color} opacity-50`} />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Filters */}
      <section className="py-6 border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
              <Input
                placeholder="Search orders..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-[#121212] border-white/10 text-white rounded-none h-12"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-48 bg-[#121212] border-white/10 text-white rounded-none h-12">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent className="bg-[#121212] border-white/10 rounded-none">
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="in_progress">In Progress</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </section>

      {/* Orders Table */}
      <section className="py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Card className="bg-[#121212] border-white/10 rounded-none overflow-hidden">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-white/10 hover:bg-transparent">
                    <TableHead className="text-white/60">Order ID</TableHead>
                    <TableHead className="text-white/60">Customer</TableHead>
                    <TableHead className="text-white/60">Character</TableHead>
                    <TableHead className="text-white/60">Status</TableHead>
                    <TableHead className="text-white/60">Booster</TableHead>
                    <TableHead className="text-white/60">Progress</TableHead>
                    <TableHead className="text-white/60">Price</TableHead>
                    <TableHead className="text-white/60">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredOrders.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center text-white/60 py-12">
                        No orders found
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredOrders.map((order) => {
                      const status = statusConfig[order.status] || statusConfig.pending;
                      return (
                        <TableRow key={order.id} className="border-white/10 hover:bg-white/5">
                          <TableCell className="text-white font-mono text-xs">
                            {order.id?.slice(0, 8)}...
                          </TableCell>
                          <TableCell className="text-white">
                            {order.discord_username || 'Unknown'}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              {order.character_icon && (
                                <img src={order.character_icon} alt="" className="w-8 h-8" />
                              )}
                              <div>
                                <span className="text-white">{order.character_name}</span>
                                <span className="text-white/40 text-xs block capitalize">
                                  {order.service_type?.replace('-', ' ')}
                                </span>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge className={`${status.color} rounded-none`}>
                              {status.label}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {order.booster_username ? (
                              <span className="text-white text-sm">{order.booster_username}</span>
                            ) : (
                              <span className="text-yellow-400 text-sm">Unassigned</span>
                            )}
                          </TableCell>
                          <TableCell>
                            <div className="w-24">
                              <Progress 
                                value={order.progress || 0} 
                                className="h-2 bg-white/10 rounded-none [&>div]:bg-[#00FFD1] [&>div]:rounded-none"
                              />
                              <span className="text-white/60 text-xs">{order.progress || 0}%</span>
                            </div>
                          </TableCell>
                          <TableCell className="text-[#00FFD1] font-semibold">
                            ${order.price}
                          </TableCell>
                          <TableCell>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEditOrder(order)}
                              className="text-white hover:text-[#00FFD1] hover:bg-white/10 rounded-none"
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </div>
          </Card>
        </div>
      </section>

      {/* Edit Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="bg-[#121212] border-white/10 rounded-none max-w-md">
          <DialogHeader>
            <DialogTitle className="text-white">Edit Order</DialogTitle>
            <DialogDescription className="text-white/60">
              Update order for {selectedOrder?.character_name}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-6 py-4">
            <div className="space-y-2">
              <Label className="text-white">Status</Label>
              <Select value={editForm.status} onValueChange={(v) => setEditForm(p => ({ ...p, status: v }))}>
                <SelectTrigger className="bg-black border-white/10 text-white rounded-none">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-[#121212] border-white/10 rounded-none">
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-white">Assign Booster</Label>
              <Select value={editForm.booster_id} onValueChange={(v) => setEditForm(p => ({ ...p, booster_id: v }))}>
                <SelectTrigger className="bg-black border-white/10 text-white rounded-none">
                  <SelectValue placeholder="Select booster" />
                </SelectTrigger>
                <SelectContent className="bg-[#121212] border-white/10 rounded-none">
                  {boosters.map(booster => (
                    <SelectItem key={booster.id} value={booster.id}>
                      {booster.username} ({booster.orders_completed} completed)
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-white">Progress (%)</Label>
              <Input
                type="number"
                min="0"
                max="100"
                value={editForm.progress}
                onChange={(e) => setEditForm(p => ({ ...p, progress: parseInt(e.target.value) || 0 }))}
                className="bg-black border-white/10 text-white rounded-none"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-white">ETA</Label>
              <Input
                value={editForm.eta}
                onChange={(e) => setEditForm(p => ({ ...p, eta: e.target.value }))}
                placeholder="e.g., 24-48 hours"
                className="bg-black border-white/10 text-white rounded-none"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-white">Notes</Label>
              <Textarea
                value={editForm.notes}
                onChange={(e) => setEditForm(p => ({ ...p, notes: e.target.value }))}
                placeholder="Add notes about this order..."
                className="bg-black border-white/10 text-white rounded-none min-h-[100px]"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="ghost"
              onClick={() => setEditDialogOpen(false)}
              className="text-white hover:bg-white/10 rounded-none"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSaveOrder}
              className="bg-[#00FFD1] text-black hover:bg-[#00FFD1]/80 rounded-none"
            >
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminDashboard;
