import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { SVGProps } from "react";
import '../../app/globals.css'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 md:py-32 flex flex-col items-center text-center">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-bold text-blue-900 mb-4">
            MyBank <span className="text-blue-600">SIM Services</span>
          </h1>
          <p className="text-xl text-muted-foreground mb-8">
            Secure SIM card registration and management for your mobile banking
          </p>
          
          <div className="flex gap-4 justify-center">
            <Button asChild size="lg" className="bg-blue-600 hover:bg-blue-700">
              <Link href="/register">Register SIM</Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href="/sim-swap">SIM Swap</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 pb-20">
        <div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto">
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <Icons.card className="h-10 w-10 mb-2 text-blue-600" />
              <CardTitle>Easy Registration</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Link your phone number to your account in minutes with our secure process.
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <Icons.swap className="h-10 w-10 mb-2 text-blue-600" />
              <CardTitle>Instant SIM Swap</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Transfer your number to a new SIM card instantly when needed.
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <Icons.shield className="h-10 w-10 mb-2 text-blue-600" />
              <CardTitle>Bank-Grade Security</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Military-grade encryption protects your SIM card transactions.
              </CardDescription>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-blue-600 text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-2xl md:text-3xl font-bold mb-4">
            Ready to secure your mobile banking?
          </h2>
          <p className="mb-6 max-w-2xl mx-auto text-blue-100">
            Join thousands of customers who trust our SIM card services for their financial security.
          </p>
          <Button asChild variant="secondary" size="lg">
            <Link href="/register">Get Started Now</Link>
          </Button>
        </div>
      </section>
    </div>
  );
}



export const Icons = {
  card: (props: SVGProps<SVGSVGElement>) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect width="20" height="14" x="2" y="5" rx="2" />
      <line x1="2" x2="22" y1="10" y2="10" />
    </svg>
  ),
  swap: (props: SVGProps<SVGSVGElement>) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 9h18v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V9Z" />
      <path d="m3 9 2.45-4.9A2 2 0 0 1 7.24 3h9.52a2 2 0 0 1 1.8 1.1L21 9" />
      <path d="M12 3v6" />
    </svg>
  ),
  shield: (props: SVGProps<SVGSVGElement>) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
  )
};