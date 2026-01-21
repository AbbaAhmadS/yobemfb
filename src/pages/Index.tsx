import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Shield, Clock, Users, CheckCircle, Sun, Zap, FileText, MessageCircle, Bot, Sparkles, Battery, Leaf, Tv, Lightbulb, Fan, Wind, Refrigerator, Cable, Gauge } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import smartSolarImage from '@/assets/smart-solar-combo.jpg';
import easySolarImage from '@/assets/easy-solar-combo.jpg';

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
      icon: Sun,
      title: 'Clean Energy',
      description: 'Power your home with reliable solar energy. Reduce your carbon footprint and enjoy uninterrupted power supply.',
    },
    {
      icon: Shield,
      title: 'Secure & Affordable',
      description: 'Flexible repayment options over 9 or 12 months. Your financial information is protected with bank-grade security.',
    },
    {
      icon: Users,
      title: '20+ Years Experience',
      description: 'Trusted by thousands of Yobe State civil servants for over two decades.',
    },
  ];

  const solarProducts = [
    {
      title: 'Easy Solar Combo',
      capacity: '1.2kWh',
      price: '₦790,000',
      image: easySolarImage,
      description: 'Perfect for small households with basic power needs.',
      specs: [
        { icon: Battery, label: 'Battery', value: '1.2kWh' },
        { icon: Sun, label: 'Solar Panels', value: '200W × 4' },
        { icon: Zap, label: 'Inverter', value: '200W' },
        { icon: Gauge, label: 'Controller', value: '60A' },
        { icon: Cable, label: 'DC Cable', value: '6mm (15m)' },
      ],
      powers: [
        { icon: Tv, label: 'TV', value: '× 1' },
        { icon: Lightbulb, label: 'Bulbs', value: '× 5' },
        { icon: Fan, label: 'Fan ACDC', value: '× 2' },
        { icon: Wind, label: 'Blender', value: '× 1' },
        { icon: Refrigerator, label: 'Fridge', value: '× 1 (day only)' },
      ],
      recommended: false,
    },
    {
      title: 'Smart Solar Combo',
      capacity: '2.6kWh',
      price: '₦950,000',
      image: smartSolarImage,
      description: 'Ideal for larger households with higher power requirements.',
      specs: [
        { icon: Battery, label: 'Battery', value: '2.6kWh' },
        { icon: Sun, label: 'Solar Panels', value: '200W × 6' },
        { icon: Zap, label: 'Inverter', value: '2000W' },
        { icon: Gauge, label: 'Controller', value: '80A' },
        { icon: Cable, label: 'DC Cable', value: '6mm' },
      ],
      powers: [
        { icon: Refrigerator, label: 'Fridge', value: '× 2 (day only)' },
        { icon: Tv, label: 'TV', value: '× 1' },
        { icon: Lightbulb, label: 'Bulbs', value: '× 8' },
        { icon: Fan, label: 'Fan', value: '× 2' },
        { icon: Wind, label: 'Blender, Iron etc.', value: '' },
      ],
      recommended: true,
    },
  ];

  const steps = [
    { icon: FileText, title: 'Apply Online', description: 'Fill out our simple application form' },
    { icon: CheckCircle, title: 'Get Approved', description: 'Quick review by our team' },
    { icon: Sun, title: 'Receive Your Solar', description: 'Solar system installed at your home' },
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
                  Need help with solar loans? I'm available 24/7 to answer your questions!
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
              <Sun className="h-4 w-4" />
              Solar Loan Solutions for Yobe State Civil Servants
            </div>
            <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-6 animate-slide-up">
              Power Your Home with{' '}
              <span className="text-primary">Solar Energy</span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground mb-8 animate-slide-up" style={{ animationDelay: '0.1s' }}>
              Yobe Microfinance Bank offers affordable solar loan solutions 
              exclusively for Yobe State and Local Governments Civil Servants. Get a complete solar system today and pay over 12 or 24 months.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center animate-slide-up" style={{ animationDelay: '0.2s' }}>
              <Button size="lg" asChild className="text-lg px-8">
                <Link to="/auth?mode=signup">
                  Apply for Solar Loan
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
                <p className="font-display font-semibold text-lg">24/7 AI Solar Loan Assistant</p>
                <p className="text-sm text-muted-foreground">
                  Get instant answers to your solar loan questions anytime, anywhere
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

      {/* Solar Products - Enhanced with Images */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium mb-4">
              <Battery className="h-4 w-4" />
              Renewable Energy Solutions
            </div>
            <h2 className="font-display text-3xl md:text-4xl font-bold mb-4">Our Solar Products</h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Choose the solar package that best fits your household needs. Both options come with professional installation and warranty.
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-10 max-w-6xl mx-auto">
            {solarProducts.map((product, index) => (
              <Card 
                key={product.title} 
                className={`card-elevated overflow-hidden group hover:shadow-2xl transition-all duration-300 relative ${product.recommended ? 'ring-2 ring-primary lg:scale-105' : ''}`}
              >
                {product.recommended && (
                  <div className="absolute top-4 right-4 z-10 bg-primary text-primary-foreground px-4 py-1.5 rounded-full text-sm font-semibold shadow-lg">
                    ⭐ Recommended
                  </div>
                )}
                
                <CardContent className="p-0">
                  {/* Product Image */}
                  <div className="relative overflow-hidden">
                    <img 
                      src={product.image} 
                      alt={product.title}
                      className="w-full h-64 object-cover object-top group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent" />
                    <div className="absolute bottom-4 left-4 right-4">
                      <h3 className="font-display text-2xl font-bold text-foreground">{product.title}</h3>
                      <p className="text-muted-foreground">{product.capacity} Battery Capacity</p>
                    </div>
                  </div>

                  {/* Price Banner */}
                  <div className="bg-gradient-to-r from-primary to-primary/80 py-4 px-6">
                    <div className="flex items-center justify-between">
                      <span className="text-primary-foreground/80 text-sm font-medium">Total Price</span>
                      <span className="text-3xl font-bold text-primary-foreground">{product.price}</span>
                    </div>
                    <p className="text-primary-foreground/70 text-sm mt-1">Flexible repayment over 12 or 24 months</p>
                  </div>

                  {/* Specifications */}
                  <div className="p-6">
                    <p className="text-muted-foreground mb-6">{product.description}</p>
                    
                    {/* System Components */}
                    <div className="mb-6">
                      <h4 className="font-semibold text-sm text-foreground mb-3 flex items-center gap-2">
                        <Zap className="h-4 w-4 text-primary" />
                        System Components
                      </h4>
                      <div className="grid grid-cols-2 gap-2">
                        {product.specs.map((spec) => (
                          <div key={spec.label} className="flex items-center gap-2 bg-muted/50 rounded-lg px-3 py-2">
                            <spec.icon className="h-4 w-4 text-primary flex-shrink-0" />
                            <div className="text-xs">
                              <span className="text-muted-foreground">{spec.label}:</span>
                              <span className="font-medium text-foreground ml-1">{spec.value}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* What It Powers */}
                    <div className="mb-6">
                      <h4 className="font-semibold text-sm text-foreground mb-3 flex items-center gap-2">
                        <Lightbulb className="h-4 w-4 text-primary" />
                        What It Powers
                      </h4>
                      <div className="grid grid-cols-2 gap-2">
                        {product.powers.map((item) => (
                          <div key={item.label} className="flex items-center gap-2 bg-success/10 rounded-lg px-3 py-2">
                            <item.icon className="h-4 w-4 text-success flex-shrink-0" />
                            <span className="text-xs text-foreground">
                              {item.label} {item.value && <span className="font-medium">{item.value}</span>}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Benefits */}
                    <div className="space-y-2 mb-6">
                      <div className="flex items-center gap-2 text-sm">
                        <CheckCircle className="h-4 w-4 text-success" />
                        <span>Complete solar system package</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <CheckCircle className="h-4 w-4 text-success" />
                        <span>Professional installation included</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <CheckCircle className="h-4 w-4 text-success" />
                        <span>Warranty included</span>
                      </div>
                    </div>

                    <Button className="w-full" size="lg" asChild>
                      <Link to="/auth?mode=signup">
                        Apply for {product.title}
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Why Solar Section */}
      <section className="py-16 bg-muted/50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="font-display text-3xl md:text-4xl font-bold mb-4">Why Choose Solar?</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="text-center">
              <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <Zap className="h-8 w-8 text-primary" />
              </div>
              <h3 className="font-display text-lg font-semibold mb-2">Reliable Power</h3>
              <p className="text-muted-foreground text-sm">Say goodbye to power outages and enjoy consistent electricity for your home.</p>
            </div>
            <div className="text-center">
              <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <Leaf className="h-8 w-8 text-primary" />
              </div>
              <h3 className="font-display text-lg font-semibold mb-2">Eco-Friendly</h3>
              <p className="text-muted-foreground text-sm">Reduce your carbon footprint and contribute to a cleaner environment.</p>
            </div>
            <div className="text-center">
              <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <Clock className="h-8 w-8 text-primary" />
              </div>
              <h3 className="font-display text-lg font-semibold mb-2">Long-Term Savings</h3>
              <p className="text-muted-foreground text-sm">Save money on electricity bills in the long run with free solar energy.</p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="font-display text-3xl md:text-4xl font-bold mb-4">How It Works</h2>
            <p className="text-muted-foreground text-lg">Three simple steps to get your solar system</p>
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
            Ready to Go Solar?
          </h2>
          <p className="text-xl text-primary-foreground/80 mb-8 max-w-2xl mx-auto">
            Join thousands of Yobe State civil servants who have powered their homes with our solar solutions.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" variant="secondary" asChild className="text-lg px-8">
              <Link to="/auth?mode=signup">
                Apply for Solar Loan
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
