import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CreditCard, Lock, Check, ArrowLeft, Loader2 } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Separator } from '../components/ui/separator';
import { useAuth } from '../context/AuthContext';
import { toast } from 'sonner';

const CheckoutPage = () => {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [cardDetails, setCardDetails] = useState({
    number: '',
    expiry: '',
    cvc: '',
    name: '',
  });

  // Get pending order from localStorage
  const pendingOrder = JSON.parse(localStorage.getItem('pendingOrder') || 'null');

  if (!pendingOrder) {
    return (
      <div className="bg-black min-h-screen flex items-center justify-center">
        <Card className="bg-[#121212] border-white/10 rounded-none max-w-md w-full mx-4">
          <CardContent className="py-12 text-center">
            <h2 className="text-xl text-white mb-4">No order found</h2>
            <Button
              onClick={() => navigate('/services')}
              className="bg-[#00FFD1] text-black hover:bg-transparent hover:text-[#00FFD1] border-2 border-[#00FFD1] rounded-none"
            >
              Browse Services
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    // Simulate payment processing
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Clear pending order
    localStorage.removeItem('pendingOrder');

    toast.success('Payment successful!', {
      description: 'Your order has been placed. Check your dashboard for updates.',
    });

    setLoading(false);
    navigate('/dashboard');
  };

  const formatCardNumber = (value) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = (matches && matches[0]) || '';
    const parts = [];
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    return parts.length ? parts.join(' ') : value;
  };

  const formatExpiry = (value) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    if (v.length >= 2) {
      return v.substring(0, 2) + '/' + v.substring(2, 4);
    }
    return v;
  };

  return (
    <div className="bg-black min-h-screen py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <button
          onClick={() => navigate('/services')}
          className="flex items-center gap-2 text-white/60 hover:text-white mb-8 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to Services
        </button>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Order Summary */}
          <Card className="bg-[#121212] border-white/10 rounded-none h-fit">
            <CardHeader>
              <CardTitle className="text-white">Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-white mb-2">
                  {pendingOrder.service}
                </h3>
                <p className="text-[#00FFD1]">{pendingOrder.package.name}</p>
              </div>

              <Separator className="bg-white/10" />

              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-white/60">Package Price</span>
                  <span className="text-white">${pendingOrder.package.price}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/60">ETA</span>
                  <span className="text-white">{pendingOrder.package.eta}</span>
                </div>
              </div>

              <Separator className="bg-white/10" />

              <div className="flex justify-between text-lg">
                <span className="text-white font-semibold">Total</span>
                <span className="text-[#00FFD1] font-bold">${pendingOrder.package.price}</span>
              </div>

              <div className="p-4 bg-[#00FFD1]/10 border border-[#00FFD1]/30">
                <div className="flex items-start gap-3">
                  <Lock className="w-5 h-5 text-[#00FFD1] flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-white text-sm font-medium">Secure Payment</p>
                    <p className="text-white/60 text-sm">Your payment info is encrypted and secure</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Payment Form */}
          <Card className="bg-[#121212] border-white/10 rounded-none">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-[#00FFD1]" />
                Payment Details
              </CardTitle>
              <p className="text-white/60 text-sm">
                Demo checkout - no real payment processed
              </p>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label className="text-white">Cardholder Name</Label>
                  <Input
                    required
                    placeholder="John Doe"
                    value={cardDetails.name}
                    onChange={(e) => setCardDetails(p => ({ ...p, name: e.target.value }))}
                    className="bg-black border-white/10 text-white rounded-none h-12"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-white">Card Number</Label>
                  <Input
                    required
                    placeholder="4242 4242 4242 4242"
                    value={cardDetails.number}
                    onChange={(e) => setCardDetails(p => ({ ...p, number: formatCardNumber(e.target.value) }))}
                    maxLength={19}
                    className="bg-black border-white/10 text-white rounded-none h-12"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-white">Expiry Date</Label>
                    <Input
                      required
                      placeholder="MM/YY"
                      value={cardDetails.expiry}
                      onChange={(e) => setCardDetails(p => ({ ...p, expiry: formatExpiry(e.target.value) }))}
                      maxLength={5}
                      className="bg-black border-white/10 text-white rounded-none h-12"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-white">CVC</Label>
                    <Input
                      required
                      placeholder="123"
                      value={cardDetails.cvc}
                      onChange={(e) => setCardDetails(p => ({ ...p, cvc: e.target.value.replace(/\D/g, '').slice(0, 3) }))}
                      maxLength={3}
                      className="bg-black border-white/10 text-white rounded-none h-12"
                    />
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-[#00FFD1] text-black hover:bg-[#00FFD1]/80 rounded-none py-6 text-lg font-medium disabled:opacity-50"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      Pay ${pendingOrder.package.price}
                    </>
                  )}
                </Button>

                <p className="text-center text-white/40 text-sm">
                  By completing this purchase you agree to our Terms of Service
                </p>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;
