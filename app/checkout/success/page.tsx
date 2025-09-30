"use client";
import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, Mail, Download, ArrowRight } from 'lucide-react';

const CheckoutSuccessPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Card className="text-center">
          <CardHeader>
            <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <CardTitle className="text-2xl font-bold text-gray-900">
              Payment Successful!
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <p className="text-gray-600 text-lg">
              Thank you for your purchase. Your guides have been sent to your email address.
            </p>
            
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center justify-center mb-2">
                <Mail className="h-5 w-5 text-blue-600 mr-2" />
                <span className="font-medium text-blue-900">Check Your Email</span>
              </div>
              <p className="text-blue-700 text-sm">
                Your guides should arrive in your inbox within the next few minutes. 
                Don't forget to check your spam folder if you don't see them.
              </p>
            </div>

            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-center mb-2">
                <Download className="h-5 w-5 text-gray-600 mr-2" />
                <span className="font-medium text-gray-900">What's Next?</span>
              </div>
              <p className="text-gray-600 text-sm">
                Download your PDF guides from the email and start your fitness journey. 
                If you have any questions, feel free to contact our support team.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/guides">
                <Button variant="outline" className="w-full sm:w-auto">
                  Browse More Guides
                </Button>
              </Link>
              <Link href="/">
                <Button className="w-full sm:w-auto bg-pink-600 hover:bg-pink-700">
                  Back to Home
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </Link>
            </div>

            <div className="pt-6 border-t border-gray-200">
              <p className="text-sm text-gray-500">
                Need help? Contact us at{' '}
                <a href="mailto:recoupyou@gmail.com" className="text-pink-600 hover:text-pink-700">
                  recoupyou@gmail.com
                </a>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CheckoutSuccessPage;