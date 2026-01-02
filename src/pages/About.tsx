import { Building2, Users, Target, Award } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

export default function About() {
  return (
    <div className="py-16">
      <div className="container mx-auto px-4">
        {/* Hero */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h1 className="font-display text-4xl md:text-5xl font-bold mb-6">About Yobe Microfinance Bank</h1>
          <p className="text-lg text-muted-foreground">
            Serving Yobe State civil servants with affordable financial solutions for over 20 years.
          </p>
        </div>

        {/* Mission & Vision */}
        <div className="grid md:grid-cols-2 gap-8 mb-16">
          <Card className="card-elevated">
            <CardContent className="p-8">
              <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                <Target className="h-6 w-6 text-primary" />
              </div>
              <h2 className="font-display text-2xl font-bold mb-4">Our Mission</h2>
              <p className="text-muted-foreground">
                To provide accessible, affordable, and reliable financial services to Yobe State 
                civil servants, empowering them to achieve their financial goals and improve 
                their quality of life.
              </p>
            </CardContent>
          </Card>
          <Card className="card-elevated">
            <CardContent className="p-8">
              <div className="h-12 w-12 rounded-lg bg-secondary/20 flex items-center justify-center mb-4">
                <Award className="h-6 w-6 text-secondary" />
              </div>
              <h2 className="font-display text-2xl font-bold mb-4">Our Vision</h2>
              <p className="text-muted-foreground">
                To be the leading microfinance institution in Yobe State, recognized for 
                excellence in customer service, innovation, and commitment to the financial 
                well-being of our community.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Values */}
        <div className="bg-muted/50 rounded-2xl p-8 md:p-12 mb-16">
          <h2 className="font-display text-3xl font-bold text-center mb-8">Our Core Values</h2>
          <div className="grid md:grid-cols-4 gap-6">
            {[
              { title: 'Integrity', desc: 'We operate with honesty and transparency in all our dealings.' },
              { title: 'Excellence', desc: 'We strive for the highest standards in service delivery.' },
              { title: 'Customer Focus', desc: 'Our customers are at the heart of everything we do.' },
              { title: 'Innovation', desc: 'We embrace technology to improve our services.' },
            ].map((value) => (
              <div key={value.title} className="text-center">
                <h3 className="font-display text-lg font-semibold mb-2">{value.title}</h3>
                <p className="text-sm text-muted-foreground">{value.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          {[
            { value: '20+', label: 'Years of Service' },
            { value: '10,000+', label: 'Happy Customers' },
            { value: '₦1B+', label: 'Loans Disbursed' },
            { value: '98%', label: 'Customer Satisfaction' },
          ].map((stat) => (
            <Card key={stat.label} className="card-elevated">
              <CardContent className="p-6">
                <p className="font-display text-3xl font-bold text-primary">{stat.value}</p>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
