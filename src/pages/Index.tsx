
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { ChevronRight, BarChart3, CreditCard, Target, PieChart, CalendarDays, ArrowUpCircle, ArrowDownCircle } from "lucide-react";
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
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 z-0 bg-hero-pattern opacity-20"></div>
        <div className="container relative z-10 mx-auto px-4 py-12 md:py-24">
          <div className="flex flex-col items-center text-center">
            <motion.h1 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="text-4xl md:text-6xl font-bold tracking-tight mb-4 expense-gradient-text"
            >
              Fiscora
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-3xl"
            >
              Your personal finance manager. Take control of your financial future with intuitive budgeting, tracking, and planning tools.
            </motion.p>
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3, delay: 0.4 }}
              className="flex flex-col sm:flex-row gap-4"
            >
              <Button size="lg" onClick={() => navigate("/login")} className="expense-gradient text-white">
                Get Started <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
              <Button size="lg" variant="outline" onClick={() => navigate("/register")}>
                Create Account
              </Button>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Dashboard Preview */}
      <section className="py-12 md:py-24">
        <div className="container mx-auto px-4">
          <motion.div 
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="glass-card overflow-hidden rounded-xl shadow-2xl"
          >
            <div className="aspect-[16/9] bg-gradient-to-br from-expense-primary to-expense-secondary flex items-center justify-center p-6 md:p-12">
              <div className="w-full max-w-4xl glass-card rounded-lg p-4 md:p-6 shadow-lg">
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
      <section className="py-12 md:py-24 bg-accent/10">
        <div className="container mx-auto px-4">
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
                className="bg-card rounded-lg p-6 transition-all duration-300 hover:shadow-md"
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
              Join thousands of users who have transformed their financial health with Fiscora.
            </p>
            <Button size="lg" variant="outline" onClick={() => navigate("/register")} className="bg-white text-primary hover:bg-white/90">
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
              <h3 className="text-xl font-bold expense-gradient-text">Fiscora</h3>
            </div>
            <div className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} Fiscora. All rights reserved.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
