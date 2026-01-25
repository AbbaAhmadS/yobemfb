import { Link } from 'react-router-dom';
import { Phone, Mail, MapPin } from 'lucide-react';
import yobemfbLogo from '@/assets/yobemfb-logo.jpeg';

export function Footer() {
  return <footer className="bg-primary text-primary-foreground">
      <div className="container mx-auto px-4 py-12">
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <img 
                src={yobemfbLogo} 
                alt="YobeMFB Logo" 
                className="h-12 w-auto object-contain rounded-lg bg-white p-1"
              />
            </div>
            <p className="text-sm text-primary-foreground/80">
              Empowering Yobe State and Local Governments civil servants with accessible and affordable loan solutions for over 20 years.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-display font-semibold text-lg mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/about" className="text-sm text-primary-foreground/80 hover:text-secondary transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link to="/auth?mode=signup" className="text-sm text-primary-foreground/80 hover:text-secondary transition-colors">
                  Apply for Loan
                </Link>
              </li>
              <li>
                <Link to="/auth?mode=signup" className="text-sm text-primary-foreground/80 hover:text-secondary transition-colors">
                  Open Account
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-sm text-primary-foreground/80 hover:text-secondary transition-colors">
                  Contact Us
                </Link>
              </li>
            </ul>
          </div>

          {/* Services */}
          <div>
            <h3 className="font-display font-semibold text-lg mb-4">Our Services</h3>
            <ul className="space-y-2">
              <li className="text-sm text-primary-foreground/80">Easy Solar All-in-One 1000</li>
              <li className="text-sm text-primary-foreground/80">Smart Solar 2000</li>
              <li className="text-sm text-primary-foreground/80">Savings Account</li>
              <li className="text-sm text-primary-foreground/80">Current Account</li>
              <li className="text-sm text-primary-foreground/80">Corporate Account</li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-display font-semibold text-lg mb-4">Contact Us</h3>
            <ul className="space-y-3">
              <li className="flex items-center gap-2 text-sm text-primary-foreground/80">
                <Phone className="h-4 w-4 text-secondary" />
                08142576613
              </li>
              
              <li className="flex items-start gap-2 text-sm text-primary-foreground/80">
                <MapPin className="h-4 w-4 text-secondary mt-0.5" />
                <span>Yobe State, Nigeria</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-primary-foreground/20 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-primary-foreground/60">
            © {new Date().getFullYear()} Yobe Microfinance Bank. All rights reserved.
          </p>
          <div className="flex gap-4">
            <Link to="/terms" className="text-sm text-primary-foreground/60 hover:text-secondary transition-colors">
              Terms & Conditions
            </Link>
            <Link to="/privacy" className="text-sm text-primary-foreground/60 hover:text-secondary transition-colors">
              Privacy Policy
            </Link>
          </div>
        </div>
      </div>
    </footer>;
}