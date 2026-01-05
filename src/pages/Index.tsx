import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Shield, Clock, Users, CheckCircle, Banknote, FileText, MessageCircle, Bot, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

export default function Index() {
  const [showChatPrompt, setShowChatPrompt] = useState(false);

  useEffect(() => {
    // Show AI assistant prompt after 3 seconds
    const timer = setTimeout(() => {
      setShowChatPrompt(true);
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  const features = [
    {
      icon: Clock,
      title: 'Quick Processing',
      description: 'Loans are processed and disbursed at the last week of every month to match salary payment timing.',
    },
    {
      icon: Shield,
      title: 'Secure & Private',
      description: 'Your personal and financial information is protected with bank-grade security.',
    },
    {
      icon: Users,
      title: '20+ Years Experience',
      description: 'Trusted by thousands of Yobe State civil servants for over two decades.',
    },
  ];

  const loanTypes = [
    {
      title: 'Short Term Loans',
      description: 'Perfect for immediate needs with flexible repayment periods.',
      features: ['Quick approval', '3-12 months tenure'],
    },
    {
      title: 'Long Term Loans',
      description: 'For major investments and long-term financial goals.',
      features: ['Higher amounts', 'Extended tenure'],
    },
  ];

  const steps = [
    { icon: FileText, title: 'Apply Online', description: 'Fill out our simple application form' },
    { icon: CheckCircle, title: 'Get Approved', description: 'Quick review by our team' },
    { icon: Banknote, title: 'Receive Funds', description: 'Money credited to your account' },
  ];

  return (
    <div className="overflow-hidden">
      {/* AI Chat Prompt Popup */}
      {showChatPrompt && (
        <div className="fixed bottom-24 right-6 z-40 animate-bounce-in">
          <div className="relative bg-card border border-primary/20 rounded-2xl shadow-xl p-4 max-w-[280px]">
            <button 
              onClick={() => setShowChatPrompt(false)}
              className="absolute -top-2 -right-2 h-6 w-6 bg-muted rounded-full flex items-center justify-center text-muted-foreground hover:bg-muted/80"
            >
              ×
            </button>
            <div className="flex items-start gap-3">
              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                <Bot className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="font-medium text-sm mb-1">Hi there! 👋</p>
                <p className="text-xs text-muted-foreground">
                  Need help with loans? I'm available 24/7 to answer your questions!
                </p>
              </div>
            </div>
            <div className="mt-3 flex items-center gap-1 text-xs text-primary">
              <Sparkles className="h-3 w-3" />
              <span>Click the chat icon to start</span>
            </div>
          </div>
          {/* Arrow pointing to chat button */}
          <div className="absolute -bottom-2 right-8 w-4 h-4 bg-card border-b border-r border-primary/20 transform rotate-45" />
        </div>
      )}

      {/* Hero Section */}
      <section className="relative py-20 lg:py-32 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-secondary/10" />
        <div className="container mx-auto px-4 relative">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 bg-secondary/20 text-secondary-foreground px-4 py-2 rounded-full text-sm font-medium mb-6 animate-fade-in">
              <Shield className="h-4 w-4" />
              Trusted by Yobe State Civil Servants
            </div>
            <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-6 animate-slide-up">
              Access Affordable Loans{' '}
              <span className="text-primary">Designed for You</span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground mb-8 animate-slide-up" style={{ animationDelay: '0.1s' }}>
              Yobe Microfinance Bank offers quick, secure, and affordable loan solutions 
              exclusively for Yobe State civil servants. Apply online today — loans are disbursed at the last week of every month.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center animate-slide-up" style={{ animationDelay: '0.2s' }}>
              <Button size="lg" asChild className="text-lg px-8">
                <Link to="/auth?mode=signup">
                  Apply for Loan
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild className="text-lg px-8">
                <Link to="/about">Learn More</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* AI Assistant Banner */}
      <section className="py-8 bg-primary/5 border-y border-primary/10">
        <div className="container mx-auto px-4">
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 text-center sm:text-left">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-full bg-primary flex items-center justify-center animate-pulse-glow">
                <MessageCircle className="h-6 w-6 text-primary-foreground" />
              </div>
              <div>
                <p className="font-display font-semibold text-lg">24/7 AI Loan Assistant</p>
                <p className="text-sm text-muted-foreground">
                  Get instant answers to your loan questions anytime, anywhere
                </p>
              </div>
            </div>
            <Button variant="outline" className="border-primary text-primary hover:bg-primary hover:text-primary-foreground" onClick={() => {
              const chatButton = document.querySelector('[data-chat-trigger]') as HTMLButtonElement;
              if (chatButton) chatButton.click();
            }}>
              <Bot className="h-4 w-4 mr-2" />
              Chat Now
            </Button>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 bg-muted/50">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card key={feature.title} className="card-elevated border-0 animate-slide-up" style={{ animationDelay: `${index * 0.1}s` }}>
                <CardContent className="p-6">
                  <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                    <feature.icon className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="font-display text-xl font-semibold mb-2">{feature.title}</h3>
                  <p className="text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Loan Types */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="font-display text-3xl md:text-4xl font-bold mb-4">Our Loan Products</h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Choose the loan product that best fits your needs with competitive interest rates.
            </p>
          </div>
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {loanTypes.map((loan, index) => (
              <Card key={loan.title} className="card-elevated overflow-hidden group hover:border-primary/50 transition-colors">
                <CardContent className="p-0">
                  <div className="bg-gradient-to-r from-primary to-primary/80 p-6 text-primary-foreground">
                    <h3 className="font-display text-2xl font-bold">{loan.title}</h3>
                  </div>
                  <div className="p-6">
                    <p className="text-muted-foreground mb-4">{loan.description}</p>
                    <ul className="space-y-2">
                      {loan.features.map((feature) => (
                        <li key={feature} className="flex items-center gap-2 text-sm">
                          <CheckCircle className="h-4 w-4 text-success" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                    <Button className="w-full mt-6" asChild>
                      <Link to="/auth?mode=signup">Apply Now</Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-muted/50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="font-display text-3xl md:text-4xl font-bold mb-4">How It Works</h2>
            <p className="text-muted-foreground text-lg">Three simple steps to get your loan</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {steps.map((step, index) => (
              <div key={step.title} className="text-center">
                <div className="relative inline-flex">
                  <div className="h-16 w-16 rounded-full bg-primary flex items-center justify-center mb-4">
                    <step.icon className="h-8 w-8 text-primary-foreground" />
                  </div>
                  <span className="absolute -top-2 -right-2 h-8 w-8 rounded-full bg-secondary flex items-center justify-center text-secondary-foreground font-bold">
                    {index + 1}
                  </span>
                </div>
                <h3 className="font-display text-xl font-semibold mb-2">{step.title}</h3>
                <p className="text-muted-foreground">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-primary text-primary-foreground">
        <div className="container mx-auto px-4 text-center">
          <h2 className="font-display text-3xl md:text-4xl font-bold mb-4">
            Ready to Get Started?
          </h2>
          <p className="text-xl text-primary-foreground/80 mb-8 max-w-2xl mx-auto">
            Join thousands of Yobe State civil servants who have trusted us with their financial needs.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" variant="secondary" asChild className="text-lg px-8">
              <Link to="/auth?mode=signup">
                Create Account
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild className="text-lg px-8 border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10">
              <Link to="/contact">Contact Us</Link>
            </Button>
          </div>
          <p className="mt-6 text-sm text-primary-foreground/60">
            Have questions? Call us at <strong>08142576613</strong> or chat with our AI assistant 24/7
          </p>
        </div>
      </section>
    </div>
  );
}