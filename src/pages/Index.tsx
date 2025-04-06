import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { ChevronRight, BarChart3, CreditCard, Target, PieChart, CalendarDays, ArrowUpCircle, ArrowDownCircle, CheckCircle2, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import { useMediaQuery } from "@/hooks/useMediaQuery";

const Index = () => {
  const navigate = useNavigate();
  const isDesktop = useMediaQuery("(min-width: 768px)");

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  const features = [
    {
      icon: <BarChart3 className="h-8 w-8 text-primary" />,
      title: "Budget Tracking",
      description: "Create and manage your budgets with ease. Track your spending against your budget in real-time."
    },
    {
      icon: <CreditCard className="h-8 w-8 text-primary" />,
      title: "Transaction Management",
      description: "Categorize and monitor all your financial transactions in one place."
    },
    {
      icon: <Target className="h-8 w-8 text-primary" />,
      title: "Savings Goals",
      description: "Set financial goals and track your progress towards achieving them."
    },
    {
      icon: <PieChart className="h-8 w-8 text-primary" />,
      title: "Financial Reports",
      description: "Generate detailed reports to visualize your spending patterns and financial health."
    },
    {
      icon: <CalendarDays className="h-8 w-8 text-primary" />,
      title: "Financial Calendar",
      description: "Plan ahead with a dedicated calendar for bill payments and financial events."
    },
    {
      icon: <Sparkles className="h-8 w-8 text-primary" />,
      title: "Smart Insights",
      description: "Get personalized financial insights and recommendations to improve your financial well-being."
    }
  ];

  const testimonials = [
    {
      name: "Sarah Johnson",
      role: "Small Business Owner",
      content: "Fiscaleon completely transformed how I manage my business finances. The insights and tracking tools are invaluable!"
    },
    {
      name: "Michael Chen",
      role: "Freelance Designer",
      content: "As a freelancer, keeping track of my finances was always a challenge. Fiscaleon makes it simple and even enjoyable."
    },
    {
      name: "Emma Patel",
      role: "Family Budget Manager",
      content: "Our family budget has never been more organized. The savings goals feature helped us save for our dream vacation."
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted overflow-hidden">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 z-0 bg-hero-pattern opacity-20"></div>
        <div className="absolute top-0 right-0 w-full md:w-1/2 h-full bg-gradient-to-bl from-primary/10 to-transparent rounded-bl-full opacity-50"></div>
        <div className="container relative z-10 mx-auto px-4 py-12 md:py-24">
          <div className="flex flex-col items-center text-center max-w-5xl mx-auto">
            <motion.h1 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight mb-6 expense-gradient-text"
            >
              Fiscaleon
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-3xl leading-relaxed"
            >
              Your personal finance manager. Take control of your financial future with intuitive budgeting, tracking, and planning tools designed to bring clarity to your finances.
            </motion.p>
            
            {/* Enhanced Get Started Section */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3, delay: 0.4 }}
              className="w-full max-w-md mx-auto"
            >
              <div className="glass-card rounded-xl p-6 mb-6 backdrop-blur-md shadow-lg border border-white/20">
                <div className="text-center mb-4">
                  <h2 className="text-2xl font-bold mb-2 expense-gradient-text">Start Your Financial Journey</h2>
                  <p className="text-muted-foreground">Join thousands of users transforming their finances today</p>
                </div>
                
                <div className="space-y-4">
                  <Button 
                    size="lg" 
                    onClick={() => navigate("/login")} 
                    className="w-full expense-gradient text-white py-6 text-lg transition-all duration-300 hover:shadow-lg hover:translate-y-[-2px]"
                  >
                    Get Started <ChevronRight className="ml-2 h-5 w-5" />
                  </Button>
                  
                  <Button 
                    size="lg" 
                    variant="outline" 
                    onClick={() => navigate("/register")} 
                    className="w-full py-6 text-lg border-2 transition-all duration-300 hover:bg-accent/20"
                  >
                    Create Account
                  </Button>
                  
                  <div className="pt-4 text-sm text-center text-muted-foreground">
                    <div className="flex items-center justify-center space-x-2 mb-2">
                      <span className="w-8 h-[1px] bg-border"></span>
                      <span>Benefits</span>
                      <span className="w-8 h-[1px] bg-border"></span>
                    </div>
                    <div className="grid grid-cols-2 gap-3 mt-3">
                      <div className="flex items-center text-left">
                        <CheckCircle2 className="h-4 w-4 text-primary mr-2 flex-shrink-0" />
                        <span className="text-xs">Easy Budgeting</span>
                      </div>
                      <div className="flex items-center text-left">
                        <CheckCircle2 className="h-4 w-4 text-primary mr-2 flex-shrink-0" />
                        <span className="text-xs">Expense Tracking</span>
                      </div>
                      <div className="flex items-center text-left">
                        <CheckCircle2 className="h-4 w-4 text-primary mr-2 flex-shrink-0" />
                        <span className="text-xs">Savings Goals</span>
                      </div>
                      <div className="flex items-center text-left">
                        <CheckCircle2 className="h-4 w-4 text-primary mr-2 flex-shrink-0" />
                        <span className="text-xs">Financial Insights</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="text-center text-sm text-muted-foreground">
                <p>Already managing your finances with us? <a onClick={() => navigate("/login")} className="text-primary hover:underline cursor-pointer">Sign in</a></p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Rest of the sections */}
      {/* Dashboard Preview */}
      <section className="py-12 md:py-24">
        <div className="container mx-auto px-4">
          <motion.div 
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="glass-card overflow-hidden rounded-xl shadow-2xl transform -rotate-1 hover:rotate-0 transition-transform duration-500"
          >
            <div className="aspect-[16/9] bg-gradient-to-br from-expense-primary to-expense-secondary flex items-center justify-center p-6 md:p-12">
              <div className="w-full max-w-4xl glass-card rounded-lg p-4 md:p-6 shadow-lg transform hover:scale-[1.02] transition-transform duration-300">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-white/90 dark:bg-black/70 rounded-lg p-4 shadow-sm">
                    <h3 className="font-medium text-sm mb-1">Total Balance</h3>
                    <p className="text-2xl font-bold">$24,562.00</p>
                    <div className="mt-2 text-xs text-green-600 flex items-center">
                      <ArrowUpCircle className="h-3 w-3 mr-1" />
                      <span>+2.4% this month</span>
                    </div>
                  </div>
                  <div className="bg-white/90 dark:bg-black/70 rounded-lg p-4 shadow-sm">
                    <h3 className="font-medium text-sm mb-1">Monthly Spending</h3>
                    <p className="text-2xl font-bold">$3,426.00</p>
                    <div className="mt-2 text-xs text-red-500 flex items-center">
                      <ArrowDownCircle className="h-3 w-3 mr-1" />
                      <span>-4.5% vs budget</span>
                    </div>
                  </div>
                  <div className="bg-white/90 dark:bg-black/70 rounded-lg p-4 shadow-sm">
                    <h3 className="font-medium text-sm mb-1">Savings Goal</h3>
                    <p className="text-2xl font-bold">$12,000.00</p>
                    <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                      <div className="bg-primary h-2 rounded-full w-3/4"></div>
                    </div>
                    <p className="text-xs mt-1">75% completed</p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section className="py-12 md:py-24 bg-accent/10 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-secondary/5 z-0"></div>
        <div className="container relative z-10 mx-auto px-4">
          <div className="text-center mb-12">
            <motion.h2 
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
              className="text-3xl md:text-4xl font-bold mb-4"
            >
              Features That Empower Your Finances
            </motion.h2>
            <motion.p 
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              viewport={{ once: true }}
              className="text-muted-foreground max-w-2xl mx-auto"
            >
              Everything you need to manage your finances in one place, designed to be intuitive and powerful.
            </motion.p>
          </div>

          <motion.div 
            variants={container}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8"
          >
            {features.map((feature, index) => (
              <motion.div 
                key={index}
                variants={item}
                className="bg-card rounded-lg p-6 transition-all duration-300 hover:shadow-md hover:translate-y-[-5px]"
              >
                <div className="mb-4 p-3 bg-primary/10 rounded-full w-fit">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-12 md:py-24 relative">
        <div className="container mx-auto px-4">
          <motion.h2
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="text-3xl md:text-4xl font-bold mb-12 text-center"
          >
            What Our Users Say
          </motion.h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="bg-card p-6 rounded-lg shadow-sm relative"
              >
                <div className="absolute top-4 right-4 text-primary/20">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="48"
                    height="48"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M3 21c3 0 7-1 7-8V5c0-1.25-.756-2.017-2-2H4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2 1 0 1 0 1 1v1c0 1-1 2-2 2s-1 .008-1 1.031V20c0 1 0 1 1 1z" />
                    <path d="M15 21c3 0 7-1 7-8V5c0-1.25-.757-2.017-2-2h-4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2h.75c0 2.25.25 4-2.75 4v3c0 1 0 1 1 1z" />
                  </svg>
                </div>
                <p className="mb-4 text-muted-foreground relative z-10">{testimonial.content}</p>
                <div className="flex items-center">
                  <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">
                    {testimonial.name.charAt(0)}
                  </div>
                  <div className="ml-3">
                    <h4 className="font-semibold">{testimonial.name}</h4>
                    <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-12 md:py-24 bg-gradient-to-br from-primary/5 to-secondary/5">
        <div className="container mx-auto px-4">
          <div className="flex flex-col lg:flex-row items-center gap-12">
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
              className="lg:w-1/2"
            >
              <h2 className="text-3xl md:text-4xl font-bold mb-6">Why Choose Fiscaleon?</h2>
              <p className="text-muted-foreground mb-8">Our platform is designed with you in mind, making financial management accessible to everyone regardless of your financial literacy level.</p>
              
              <div className="space-y-4">
                {[
                  "Easy-to-use interface that simplifies complex financial tracking",
                  "Personalized insights tailored to your spending habits",
                  "Secure and private - your financial data stays protected",
                  "Accessible anywhere - track your finances on any device",
                  "Time-saving automations that do the work for you"
                ].map((point, index) => (
                  <div key={index} className="flex items-start">
                    <CheckCircle2 className="h-5 w-5 text-primary mr-2 mt-0.5 flex-shrink-0" />
                    <span>{point}</span>
                  </div>
                ))}
              </div>
            </motion.div>
            
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
              className="lg:w-1/2"
            >
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-primary to-secondary rounded-xl opacity-20 blur-xl"></div>
                <div className="glass-card p-6 rounded-xl relative z-10">
                  <div className="space-y-6">
                    <div className="flex items-center justify-between border-b pb-4">
                      <div>
                        <h3 className="font-semibold">Financial Health Score</h3>
                        <p className="text-sm text-muted-foreground">Based on your spending habits</p>
                      </div>
                      <div className="text-2xl font-bold expense-gradient-text">85/100</div>
                    </div>
                    
                    <div>
                      <h3 className="font-semibold mb-3">Monthly Overview</h3>
                      <div className="h-16 flex items-end space-x-2">
                        {[40, 65, 45, 70, 55, 80, 60, 90, 75, 85, 65, 70].map((height, i) => (
                          <div 
                            key={i} 
                            className="h-full flex-1 flex flex-col justify-end"
                          >
                            <div 
                              style={{height: `${height}%`}} 
                              className="bg-gradient-to-t from-primary to-secondary rounded-t-sm"
                            ></div>
                          </div>
                        ))}
                      </div>
                      <div className="flex justify-between text-xs text-muted-foreground mt-2">
                        <span>Jan</span>
                        <span>Dec</span>
                      </div>
                    </div>
                    
                    <Button className="w-full expense-gradient text-white">
                      Get Your Free Analysis
                    </Button>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-12 md:py-24">
        <div className="container mx-auto px-4">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="bg-gradient-to-r from-expense-primary to-expense-secondary rounded-xl p-8 md:p-12 text-center text-white"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to Take Control of Your Finances?</h2>
            <p className="text-lg md:text-xl opacity-90 mb-8 max-w-2xl mx-auto">
              Join thousands of users who have transformed their financial health with Fiscaleon.
            </p>
            <Button size="lg" variant="outline" onClick={() => navigate("/register")} className="bg-white text-primary hover:bg-white/90 px-8 py-6 text-lg">
              Start Your Free Account
            </Button>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 md:py-12 border-t">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center mb-4 md:mb-0">
              <h3 className="text-xl font-bold expense-gradient-text">Fiscaleon</h3>
            </div>
            <div className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} Fiscaleon. All rights reserved.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
