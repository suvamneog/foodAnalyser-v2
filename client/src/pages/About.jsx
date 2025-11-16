import { motion } from "framer-motion";
import { StarsBackground } from "../components/ui/stars-background";
import { ShootingStars } from "../components/ui/shooting-stars";
import { Brain, LineChart, Database, Scan, Users, Award, Target, Shield, Zap, MessageSquare } from "lucide-react";
import { Link } from "react-router-dom";
import { useReviews } from "../utils/ReviewsContext";
import TestimonialCarousel from "@/components/ui/testimonial-carousel";
import "./testimonial-carousel.css";

const About = () => {
  const { reviews } = useReviews();
  
  const fadeInUp = {
    initial: { opacity: 0, y: 60 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.8, ease: "easeOut" }
  };

  const staggerChildren = {
    animate: {
      transition: {
        staggerChildren: 0.2
      }
    }
  };

  // Convert reviews to testimonial format for ScrollX UI
  const testimonialData = reviews.map(review => ({
    description: review.description,
    image: review.image,
    name: review.name,
    handle: `⭐ ${review.rating}/5`,
    rating: review.rating
  }));

  // Default testimonials if no reviews exist
  const defaultTestimonials = [
    {
      description: "Food Analyzer x fit has completely transformed how I track my nutrition. The Indian food database is incredibly accurate and comprehensive!",
      image: "https://images.unsplash.com/photo-1494790108755-2616b612b786?q=80&w=2080&auto=format&fit=crop&ixlib=rb-4.0.3",
      name: "Priya Sharma",
      handle: "⭐ 5/5",
      rating: 5
    },
    {
      description: "Finally, an app that understands Indian cuisine! The IFCT 2017 data makes all the difference for accurate nutritional tracking.",
      image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3",
      name: "Rahul Verma",
      handle: "⭐ 5/5",
      rating: 5
    },
    {
      description: "As a nutritionist, I recommend this app to all my Indian clients. The data is scientifically verified and incredibly reliable.",
      image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3",
      name: "Dr. Anjali Mehta",
      handle: "⭐ 5/5",
      rating: 5
    },
    {
      description: "The ability to search with specific quantities like '200g chicken' makes meal planning so much easier. Love this app!",
      image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3",
      name: "Arjun Patel",
      handle: "⭐ 5/5",
      rating: 5
    },
    {
      description: "Being able to track authentic Indian dishes like biryani, paneer, and dal accurately has been a game-changer for my fitness journey.",
      image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3",
      name: "Neha Kapoor",
      handle: "⭐ 5/5",
      rating: 5
    }
  ];

  const displayTestimonials = testimonialData.length > 0 ? testimonialData : defaultTestimonials;

  return (
    <div className="relative min-h-screen bg-black text-white overflow-hidden">
      {/* Enhanced Background */}
      <div className="absolute inset-0 pointer-events-none">
        <StarsBackground />
        <ShootingStars />
        {/* Gradient Orbs */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-green-500/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-purple-500/5 rounded-full blur-2xl"></div>
      </div>

      {/* Content */}
      <div className="relative z-20 min-h-screen flex items-center justify-center px-4 py-20">
        <div className="max-w-7xl mx-auto w-full">
          <motion.div
            initial="initial"
            animate="animate"
            variants={staggerChildren}
            className="space-y-16"
          >
            {/* Hero Section */}
            <motion.div
              variants={fadeInUp}
              className="text-center"
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.2, duration: 0.8 }}
                className="inline-flex items-center gap-3 bg-gradient-to-r from-green-500/20 to-blue-500/20 border border-green-400/30 rounded-full px-6 py-3 mb-8"
              >
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <span className="text-green-400 font-medium">AI-Powered Indian Nutrition</span>
              </motion.div>

              <h1 className="text-5xl md:text-7xl font-bold mb-6">
                About <span className="bg-gradient-to-r from-green-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">FoodAnalyser × Fit</span>
              </h1>
              
              <div className="w-32 h-1 bg-gradient-to-r from-green-400 to-blue-400 mx-auto rounded-full mb-8"></div>
              
              <p className="text-xl md:text-2xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
                An AI-powered Indian nutrition analysis tool built to make healthy eating 
                accurate, fast, and accessible for everyone — students, working professionals, 
                athletes, and families.
              </p>
            </motion.div>

            {/* Story Section */}
            <motion.div
              variants={fadeInUp}
              className="group"
            >
              <div className="bg-gradient-to-br from-blue-500/10 to-cyan-500/5 border border-blue-500/20 rounded-3xl p-8 h-full transform transition-all duration-500 hover:scale-105 hover:border-blue-400/40">
                <div className="flex items-center gap-4 mb-6">
                  <div className="p-3 bg-blue-500/20 rounded-2xl group-hover:scale-110 transition-transform duration-300">
                    <Brain className="w-8 h-8 text-blue-400" />
                  </div>
                  <div>
                    <h2 className="text-2xl md:text-3xl font-bold text-white">
                      Our Story
                    </h2>
                    <div className="w-16 h-1 bg-blue-400 rounded-full mt-2"></div>
                  </div>
                </div>
                
                <div className="space-y-4 text-gray-300 leading-relaxed">
                  <p>
                    Most nutrition apps are built for Western foods — burgers, pancakes, salads. 
                    Indian foods like <span className="text-blue-300 font-semibold">roti, dal, chicken, chawal, paneer, sabji, rajma, and curries</span> often 
                    do not exist in global databases or are estimated incorrectly.
                  </p>
                  
                  <p>
                    I wanted to build something that truly understands Indian meals. 
                    Something accurate, fast, and helpful — especially for people tracking 
                    fitness, health, or diet goals.
                  </p>
                  
                  <p className="text-blue-300 font-medium">
                    This is how FoodAnalyser × Fit was created.
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Problem & Solution Cards */}
            <div className="grid lg:grid-cols-2 gap-8">
              {/* Problem Card */}
              <motion.div
                variants={fadeInUp}
                className="group"
              >
                <div className="bg-gradient-to-br from-red-500/10 to-red-600/5 border border-red-500/20 rounded-3xl p-8 h-full transform transition-all duration-500 hover:scale-105 hover:border-red-400/40">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="p-3 bg-red-500/20 rounded-2xl group-hover:scale-110 transition-transform duration-300">
                      <Target className="w-8 h-8 text-red-400" />
                    </div>
                    <div>
                      <h2 className="text-2xl md:text-3xl font-bold text-white">
                        The Problem We Saw
                      </h2>
                      <div className="w-16 h-1 bg-red-400 rounded-full mt-2"></div>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <p className="text-lg text-gray-300 leading-relaxed">
                      Most popular apps like MyFitnessPal, HealthifyMe, and Cronometer 
                      rely on global nutrition datasets. This creates problems:
                    </p>
                    
                    <div className="space-y-3">
                      {[
                        "Indian foods are missing",
                        "Data is not verified from Indian sources", 
                        "Nutritional values vary drastically from Indian cooking styles",
                        "Users have to guess calories manually",
                        "No single 'Indian-first' food database exists"
                      ].map((item, index) => (
                        <motion.div
                          key={item}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.8 + index * 0.1 }}
                          className="flex items-center gap-3 text-red-200"
                        >
                          <div className="w-2 h-2 bg-red-400 rounded-full flex-shrink-0"></div>
                          <span>{item}</span>
                        </motion.div>
                      ))}
                    </div>
                    
                    <div className="bg-red-500/20 border border-red-500/30 rounded-xl p-4 mt-4">
                      <p className="text-red-200 text-center font-medium">
                        For millions of Indian users, nutrition tracking becomes inaccurate.
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Solution Card */}
              <motion.div
                variants={fadeInUp}
                className="group"
              >
                <div className="bg-gradient-to-br from-purple-500/10 to-pink-500/5 border border-purple-500/20 rounded-3xl p-8 h-full transform transition-all duration-500 hover:scale-105 hover:border-purple-400/40">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="p-3 bg-purple-500/20 rounded-2xl group-hover:scale-110 transition-transform duration-300">
                      <Database className="w-8 h-8 text-purple-400" />
                    </div>
                    <div>
                      <h2 className="text-2xl md:text-3xl font-bold text-white">
                        Our Solution
                      </h2>
                      <div className="w-16 h-1 bg-purple-400 rounded-full mt-2"></div>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <p className="text-lg text-gray-300 leading-relaxed">
                      FoodAnalyser × Fit is built with a simple goal: Provide the most accurate nutrition data for Indian foods.
                    </p>
                    
                    <p className="text-purple-300 font-medium">
                      We combined three powerful datasets:
                    </p>
                    
                    <div className="space-y-3">
                      {[
                        "IFCT 2017 (ICMR-NIN) — 542 scientifically measured Indian foods",
                        "INDB (Indian Nutrient Databank) — 1,014 Indian recipes", 
                        "CalorieNinja (global fallback only when needed)"
                      ].map((item, index) => (
                        <motion.div
                          key={item}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 1 + index * 0.1 }}
                          className="flex items-center gap-3 text-purple-200"
                        >
                          <div className="w-2 h-2 bg-purple-400 rounded-full flex-shrink-0"></div>
                          <span>{item}</span>
                        </motion.div>
                      ))}
                    </div>
                    
                    <div className="bg-purple-500/20 border border-purple-500/30 rounded-xl p-4 mt-4">
                      <div className="text-purple-200 text-center">
                        <p className="font-medium">Priority → IFCT → INDB → CalorieNinja</p>
                        <p className="text-sm mt-1">Ensuring Indian-first, reliable, and verified results</p>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Vision Section */}
            <motion.div
              variants={fadeInUp}
              className="group"
            >
              <div className="bg-gradient-to-br from-green-500/10 to-emerald-500/5 border border-green-500/20 rounded-3xl p-8 h-full transform transition-all duration-500 hover:scale-105 hover:border-green-400/40">
                <div className="flex items-center gap-4 mb-6">
                  <div className="p-3 bg-green-500/20 rounded-2xl group-hover:scale-110 transition-transform duration-300">
                    <LineChart className="w-8 h-8 text-green-400" />
                  </div>
                  <div>
                    <h2 className="text-2xl md:text-3xl font-bold text-white">
                      Our Vision
                    </h2>
                    <div className="w-16 h-1 bg-green-400 rounded-full mt-2"></div>
                  </div>
                </div>
                
                <div className="space-y-4 text-gray-300 leading-relaxed">
                  <p>
                    To build India&apos;s most accurate, AI-driven nutrition ecosystem 
                    that understands Indian food diversity and supports 
                    personalized health, diet, and fitness goals.
                  </p>
                  
                  <p className="text-green-300 font-medium">
                    We plan to expand into:
                  </p>
                  
                  <div className="grid md:grid-cols-2 gap-4">
                    {[
                      "Indian recipe nutrition analysis",
                      "Personalized AI diet plans",
                      "Barcode scanning for Indian products", 
                      "Fitness tracker integration (Fitbit, Apple Health)",
                      "Offline nutrition calculation",
                      "AI chatbot for diet & workout guidance"
                    ].map((item, index) => (
                      <motion.div
                        key={item}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 1.2 + index * 0.1 }}
                        className="flex items-center gap-3 text-green-200"
                      >
                        <div className="w-2 h-2 bg-green-400 rounded-full flex-shrink-0"></div>
                        <span>{item}</span>
                      </motion.div>
                    ))}
                  </div>
                  
                  <p className="text-green-300 font-medium text-center mt-6">
                    And eventually — make nutrition simple for every Indian household.
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Features Grid */}
            <motion.div
              variants={fadeInUp}
              className="text-center"
            >
              <h3 className="text-3xl md:text-4xl font-bold text-white mb-4">
                Why Choose FoodAnalyser × Fit
              </h3>
              <p className="text-gray-400 text-lg mb-12 max-w-2xl mx-auto">
                Built with cutting-edge technology and authentic Indian food data
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                  { 
                    icon: <Award className="w-10 h-10" />, 
                    title: "Built for Indian Foods", 
                    description: "Built specifically for Indian cuisine with verified data sources",
                    gradient: "from-green-400 to-emerald-500"
                  },
                  { 
                    icon: <Zap className="w-10 h-10" />, 
                    title: "AI-Powered", 
                    description: "Advanced algorithms for accurate nutrition analysis",
                    gradient: "from-blue-400 to-cyan-500"
                  },
                  { 
                    icon: <Shield className="w-10 h-10" />, 
                    title: "Verified Data", 
                    description: "IFCT 2017 & INDB datasets for scientific accuracy",
                    gradient: "from-purple-400 to-pink-500"
                  },
                  { 
                    icon: <Users className="w-10 h-10" />, 
                    title: "For Everyone", 
                    description: "Students, professionals, athletes, and families",
                    gradient: "from-orange-400 to-red-500"
                  }
                ].map((feature, index) => (
                  <motion.div
                    key={feature.title}
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1.4 + index * 0.1 }}
                    className="group"
                  >
                    <div className="bg-zinc-900/80 backdrop-blur-sm border border-zinc-700/50 rounded-2xl p-6 h-full transform transition-all duration-500 hover:scale-105 hover:border-zinc-600/80 hover:shadow-2xl">
                      <div className={`p-4 rounded-2xl bg-gradient-to-r ${feature.gradient} w-fit mb-6 mx-auto transform group-hover:scale-110 transition-transform duration-300`}>
                        {feature.icon}
                      </div>
                      <h4 className="text-xl font-bold text-white mb-3">{feature.title}</h4>
                      <p className="text-gray-400 leading-relaxed">{feature.description}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Indian Food Showcase */}
            <motion.div
              variants={fadeInUp}
              className="text-center"
            >
              <h3 className="text-3xl md:text-4xl font-bold text-white mb-4">
                Examples of Foods We Understand Perfectly
              </h3>
              <p className="text-gray-400 text-lg mb-8">
                No more guessing games with your favorite dishes
              </p>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 max-w-4xl mx-auto">
                {[
                  { emoji: "🍛", name: "Curry", color: "border-yellow-500/30 hover:border-yellow-400/60" },
                  { emoji: "🫓", name: "Roti", color: "border-amber-500/30 hover:border-amber-400/60" },
                  { emoji: "🍚", name: "Chawal", color: "border-white/30 hover:border-white/60" },
                  { emoji: "🥘", name: "Dal", color: "border-orange-500/30 hover:border-orange-400/60" },
                  { emoji: "🥗", name: "Sabji", color: "border-green-500/30 hover:border-green-400/60" },
                  { emoji: "🫘", name: "Rajma", color: "border-red-500/30 hover:border-red-400/60" },
                  { emoji: "🍲", name: "Sambar", color: "border-orange-400/30 hover:border-orange-300/60" },
                  { emoji: "🥣", name: "Kadhi", color: "border-yellow-400/30 hover:border-yellow-300/60" },
                  { emoji: "🥠", name: "Samosa", color: "border-amber-400/30 hover:border-amber-300/60" },
                  { emoji: "🍮", name: "Kheer", color: "border-pink-400/30 hover:border-pink-300/60" },
                  { emoji: "🧆", name: "Chole", color: "border-brown-400/30 hover:border-brown-300/60" }
                ].map((food, index) => (
                  <motion.div
                    key={food.name}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 1.6 + index * 0.05, duration: 0.4 }}
                    className={`text-center p-4 bg-zinc-900/50 backdrop-blur-sm rounded-2xl border ${food.color} transition-all duration-300 hover:scale-110 hover:shadow-lg`}
                  >
                    <div className="text-4xl mb-3 transform group-hover:scale-110 transition-transform duration-300">
                      {food.emoji}
                    </div>
                    <p className="text-sm font-semibold text-gray-300">{food.name}</p>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* User Reviews Section with ScrollX UI Carousel */}
            <motion.div
              variants={fadeInUp}
              className="text-center"
            >
              <div className="flex flex-col lg:flex-row items-center justify-between mb-8 gap-4">
                <div className="text-left">
                  <h3 className="text-3xl md:text-4xl font-bold text-white mb-2">
                    What Our Users Say
                  </h3>
                  <p className="text-gray-400 text-lg">
                    Real experiences from our community of health enthusiasts
                  </p>
                </div>
                <Link
                  to="/review"
                  className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-lg font-medium hover:from-blue-700 hover:to-purple-700 transition-all duration-200 flex items-center gap-2 whitespace-nowrap"
                >
                  <MessageSquare className="w-5 h-5" />
                  Share Your Experience
                </Link>
              </div>

              {/* ScrollX UI Testimonial Carousel with Neon Effects */}
              <div className="testimonial-carousel-enhanced bg-zinc-900/50 backdrop-blur-sm border border-zinc-700/50 rounded-3xl p-8 relative overflow-hidden">
                {/* Background Glow Effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-green-500/5 via-blue-500/5 to-purple-500/5 rounded-3xl"></div>
                
                {/* Animated Border */}
                <div className="absolute inset-0 rounded-3xl opacity-0 hover:opacity-100 transition-opacity duration-500">
                  <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-green-400 via-blue-400 to-purple-400 animate-pulse"></div>
                  <div className="absolute inset-[1px] rounded-3xl bg-zinc-900/95"></div>
                </div>

                <div className="relative z-10">
                  <TestimonialCarousel
                    borderType="solid"
                    data={displayTestimonials}
                    className="scrollx-testimonial-carousel"
                  />
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-6 mt-8 text-center max-w-md mx-auto">
                <div>
                  <div className="text-2xl font-bold text-white">{reviews.length}+</div>
                  <div className="text-gray-400 text-sm">User Reviews</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-white">4.8</div>
                  <div className="text-gray-400 text-sm">Average Rating</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-white">10K+</div>
                  <div className="text-gray-400 text-sm">Happy Users</div>
                </div>
              </div>
            </motion.div>

            {/* Mission & CTA */}
            <motion.div
              variants={fadeInUp}
              className="text-center"
            >
              <div className="bg-gradient-to-r from-green-500/10 via-blue-500/10 to-purple-500/10 border border-green-400/20 rounded-3xl p-12 max-w-4xl mx-auto">
                <div className="text-6xl mb-6">🌟</div>
                <h3 className="text-3xl md:text-4xl font-bold text-white mb-6">
                  Your Health Journey Starts Here
                </h3>
                <p className="text-xl text-gray-300 leading-relaxed mb-8 max-w-2xl mx-auto">
                  &quot;We believe everyone deserves accurate nutritional information for the foods they actually eat. 
                  No more compromises, no more guesswork — just authentic data for authentic Indian meals.&quot;
                </p>
                
                <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                  <motion.button 
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => window.location.href = '/scanner'}
                    className="bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white font-bold py-4 px-8 rounded-2xl transition-all duration-300 shadow-lg hover:shadow-xl text-lg flex items-center gap-3"
                  >
                    <Scan className="w-5 h-5" />
                    Start Scanning Now
                  </motion.button>
                  
                  <motion.button 
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => window.location.href = '/search'}
                    className="border border-green-400/50 text-green-400 hover:bg-green-400/10 font-semibold py-4 px-8 rounded-2xl transition-all duration-300"
                  >
                    Search Foods
                  </motion.button>
                </div>
                
                <p className="text-gray-400 mt-6 text-sm">
                  Start one &quot;WHEY&quot; to your healthy life!
                </p>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default About;