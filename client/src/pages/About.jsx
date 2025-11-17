import { motion } from "framer-motion";
import { StarsBackground } from "../components/ui/stars-background";
import { ShootingStars } from "../components/ui/shooting-stars";
import { Brain, LineChart, Database, Scan, Target, MessageSquare, Camera, Calculator, Utensils, Barcode } from "lucide-react";
import { Link } from "react-router-dom";
import { useReviews } from "../utils/ReviewsContext";
import TestimonialCarousel from "../components/ui/testimonial-carousel";

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

  // Default avatar for all users
  const DEFAULT_AVATAR = "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=2080&auto=format&fit=crop&ixlib=rb-4.0.3";

  // Convert reviews to testimonial format for ScrollX UI
  const testimonialData = reviews.map(review => ({
    description: review.description,
    image: DEFAULT_AVATAR,
    name: review.name,
    handle: `⭐ ${review.rating}/5`,
    rating: review.rating
  }));

  // Calculate live statistics
  const totalReviews = reviews.length;
  const averageRating = totalReviews > 0 
    ? (reviews.reduce((sum, review) => sum + review.rating, 0) / totalReviews).toFixed(1)
    : "0.0";

  const displayTestimonials = testimonialData;

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
                accurate, fast, and accessible for everyone.
              </p>
            </motion.div>

            {/* Story Section */}
            <motion.div
              variants={fadeInUp}
              className="group"
            >
              <div className="bg-gradient-to-br from-blue-500/10 to-cyan-500/5 border border-blue-500/20 rounded-3xl p-8 h-full">
                <div className="flex items-center gap-4 mb-6">
                  <div className="p-3 bg-blue-500/20 rounded-2xl">
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
                    Most nutrition apps are built for Western foods. Indian foods like 
                    <span className="text-blue-300 font-semibold"> roti, dal, chicken, chawal, paneer, sabji, rajma, and curries</span> often 
                    do not exist in global databases or are estimated incorrectly.
                  </p>
                  
                  <p>
                    I wanted to build something that truly understands Indian meals. 
                    Something accurate, fast, and helpful — especially for people tracking 
                    fitness, health, or diet goals.
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
                <div className="bg-gradient-to-br from-red-500/10 to-red-600/5 border border-red-500/20 rounded-3xl p-8 h-full">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="p-3 bg-red-500/20 rounded-2xl">
                      <Target className="w-8 h-8 text-red-400" />
                    </div>
                    <div>
                      <h2 className="text-2xl md:text-3xl font-bold text-white">
                        The Problem
                      </h2>
                      <div className="w-16 h-1 bg-red-400 rounded-full mt-2"></div>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <p className="text-lg text-gray-300 leading-relaxed">
                      Most popular apps rely on global nutrition datasets. This creates problems:
                    </p>
                    
                    <div className="space-y-3">
                      {[
                        "Indian foods are missing",
                        "Data is not verified from Indian sources", 
                        "Nutritional values vary drastically from Indian cooking styles",
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
                  </div>
                </div>
              </motion.div>

              {/* Solution Card */}
              <motion.div
                variants={fadeInUp}
                className="group"
              >
                <div className="bg-gradient-to-br from-purple-500/10 to-pink-500/5 border border-purple-500/20 rounded-3xl p-8 h-full">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="p-3 bg-purple-500/20 rounded-2xl">
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
                      We combined powerful datasets:
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
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Features Section */}
            <motion.div
              variants={fadeInUp}
              className="text-center"
            >
              <h3 className="text-3xl md:text-4xl font-bold text-white mb-4">
                Our Powerful Features
              </h3>
              <p className="text-gray-400 text-lg mb-12 max-w-2xl mx-auto">
                Comprehensive tools for all your nutrition tracking needs
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                  { 
                    icon: <Camera className="w-10 h-10" />, 
                    title: "Image Recognition", 
                    description: "Snap a photo of your food and get instant nutrition analysis",
                    gradient: "from-green-400 to-emerald-500",
                    link: "/image"
                  },
                  { 
                    icon: <Barcode className="w-10 h-10" />, 
                    title: "Barcode Scanner", 
                    description: "Scan product barcodes for instant nutritional information",
                    gradient: "from-blue-400 to-cyan-500",
                    link: "/scan"
                  },
                  { 
                    icon: <Calculator className="w-10 h-10" />, 
                    title: "Calorie Calculator", 
                    description: "Personalized calorie and macro calculations for your goals",
                    gradient: "from-purple-400 to-pink-500",
                    link: "/calculator"
                  },
                  { 
                    icon: <Utensils className="w-10 h-10" />, 
                    title: "Log Meals", 
                    description: "Track your daily food intake with detailed nutrition breakdown",
                    gradient: "from-orange-400 to-red-500",
                    link: "/logmeals"
                  }
                ].map((feature, index) => (
                  <motion.div
                    key={feature.title}
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1.4 + index * 0.1 }}
                    className="group"
                  >
                    <Link to={feature.link}>
                      <div className="bg-zinc-900/80 backdrop-blur-sm border border-zinc-700/50 rounded-2xl p-6 h-full transform transition-all duration-300 hover:scale-105 hover:border-zinc-600/80">
                        <div className={`p-4 rounded-2xl bg-gradient-to-r ${feature.gradient} w-fit mb-6 mx-auto`}>
                          {feature.icon}
                        </div>
                        <h4 className="text-xl font-bold text-white mb-3">{feature.title}</h4>
                        <p className="text-gray-400 leading-relaxed">{feature.description}</p>
                      </div>
                    </Link>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Detailed Features Sections */}
            <div className="space-y-8">
              {/* Image Recognition Section */}
              <motion.div
                variants={fadeInUp}
                className="group"
              >
                <div className="bg-gradient-to-br from-green-500/10 to-emerald-500/5 border border-green-500/20 rounded-3xl p-8 h-full">
                  <div className="flex flex-col lg:flex-row items-center gap-8">
                    <div className="lg:w-1/3 text-center lg:text-left">
                      <div className="p-4 bg-green-500/20 rounded-2xl w-fit mb-6 mx-auto lg:mx-0">
                        <Camera className="w-12 h-12 text-green-400" />
                      </div>
                      <h3 className="text-2xl md:text-3xl font-bold text-white mb-4">
                        AI Image Recognition
                      </h3>
                      <p className="text-gray-300 leading-relaxed">
                        Simply take a photo of your food and let our advanced AI identify the dish, 
                        estimate portion sizes, and provide detailed nutritional information.
                      </p>
                      <Link 
                        to="/image"
                        className="inline-block mt-4 bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
                      >
                        Try Image Scan
                      </Link>
                    </div>
                    <div className="lg:w-2/3 grid grid-cols-1 md:grid-cols-2 gap-4">
                      {[
                        { feature: "Instant Food Identification", desc: "Recognizes 1000+ Indian dishes" },
                        { feature: "Portion Size Estimation", desc: "AI-powered size detection" },
                        { feature: "Nutrition Analysis", desc: "Calories, macros, and micronutrients" },
                        { feature: "Health Score", desc: "Get a health rating for your meal" }
                      ].map((item, index) => (
                        <div key={index} className="bg-zinc-800/50 p-4 rounded-lg border border-green-500/20">
                          <div className="flex items-center gap-3 mb-2">
                            <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                            <span className="font-semibold text-green-300">{item.feature}</span>
                          </div>
                          <p className="text-gray-400 text-sm">{item.desc}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Barcode Scanner Section */}
              <motion.div
                variants={fadeInUp}
                className="group"
              >
                <div className="bg-gradient-to-br from-blue-500/10 to-cyan-500/5 border border-blue-500/20 rounded-3xl p-8 h-full">
                  <div className="flex flex-col lg:flex-row items-center gap-8">
                    <div className="lg:w-2/3 grid grid-cols-1 md:grid-cols-2 gap-4">
                      {[
                        { feature: "Instant Product Lookup", desc: "Access 1M+ products database" },
                        { feature: "Indian Product Focus", desc: "Specialized in Indian brands" },
                        { feature: "Health Alternatives", desc: "Get healthier product suggestions" },
                        { feature: "Allergen Detection", desc: "Identify potential allergens" }
                      ].map((item, index) => (
                        <div key={index} className="bg-zinc-800/50 p-4 rounded-lg border border-blue-500/20">
                          <div className="flex items-center gap-3 mb-2">
                            <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                            <span className="font-semibold text-blue-300">{item.feature}</span>
                          </div>
                          <p className="text-gray-400 text-sm">{item.desc}</p>
                        </div>
                      ))}
                    </div>
                    <div className="lg:w-1/3 text-center lg:text-right">
                      <div className="p-4 bg-blue-500/20 rounded-2xl w-fit mb-6 mx-auto lg:ml-auto">
                        <Barcode className="w-12 h-12 text-blue-400" />
                      </div>
                      <h3 className="text-2xl md:text-3xl font-bold text-white mb-4">
                        Barcode Scanner
                      </h3>
                      <p className="text-gray-300 leading-relaxed">
                        Scan any packaged food product to instantly get its nutritional information, 
                        ingredients, and healthier alternatives.
                      </p>
                      <Link 
                        to="/scan"
                        className="inline-block mt-4 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
                      >
                        Start Scanning
                      </Link>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Calorie Calculator Section */}
              <motion.div
                variants={fadeInUp}
                className="group"
              >
                <div className="bg-gradient-to-br from-purple-500/10 to-pink-500/5 border border-purple-500/20 rounded-3xl p-8 h-full">
                  <div className="flex flex-col lg:flex-row items-center gap-8">
                    <div className="lg:w-1/3 text-center lg:text-left">
                      <div className="p-4 bg-purple-500/20 rounded-2xl w-fit mb-6 mx-auto lg:mx-0">
                        <Calculator className="w-12 h-12 text-purple-400" />
                      </div>
                      <h3 className="text-2xl md:text-3xl font-bold text-white mb-4">
                        Smart Calorie Calculator
                      </h3>
                      <p className="text-gray-300 leading-relaxed">
                        Get personalized calorie and macronutrient targets based on your goals, 
                        body metrics, and activity level.
                      </p>
                      <Link 
                        to="/calculator"
                        className="inline-block mt-4 bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
                      >
                        Calculate Now
                      </Link>
                    </div>
                    <div className="lg:w-2/3 grid grid-cols-1 md:grid-cols-2 gap-4">
                      {[
                        { feature: "Personalized Plans", desc: "Customized for your body and goals" },
                        { feature: "Macro Tracking", desc: "Protein, carbs, fats breakdown" },
                        { feature: "Goal Setting", desc: "Weight loss, maintenance, or muscle gain" },
                        { feature: "Weekly Progress", desc: "Track your journey over time" }
                      ].map((item, index) => (
                        <div key={index} className="bg-zinc-800/50 p-4 rounded-lg border border-purple-500/20">
                          <div className="flex items-center gap-3 mb-2">
                            <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                            <span className="font-semibold text-purple-300">{item.feature}</span>
                          </div>
                          <p className="text-gray-400 text-sm">{item.desc}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Log Meals Section */}
              <motion.div
                variants={fadeInUp}
                className="group"
              >
                <div className="bg-gradient-to-br from-orange-500/10 to-red-500/5 border border-orange-500/20 rounded-3xl p-8 h-full">
                  <div className="flex flex-col lg:flex-row items-center gap-8">
                    <div className="lg:w-2/3 grid grid-cols-1 md:grid-cols-2 gap-4">
                      {[
                        { feature: "Daily Tracking", desc: "Log all your meals and snacks" },
                        { feature: "Nutrition Summary", desc: "See daily totals and progress" },
                        { feature: "Food Database", desc: "Access to Indian food database" },
                        { feature: "Meal History", desc: "Review your eating patterns" }
                      ].map((item, index) => (
                        <div key={index} className="bg-zinc-800/50 p-4 rounded-lg border border-orange-500/20">
                          <div className="flex items-center gap-3 mb-2">
                            <div className="w-2 h-2 bg-orange-400 rounded-full"></div>
                            <span className="font-semibold text-orange-300">{item.feature}</span>
                          </div>
                          <p className="text-gray-400 text-sm">{item.desc}</p>
                        </div>
                      ))}
                    </div>
                    <div className="lg:w-1/3 text-center lg:text-right">
                      <div className="p-4 bg-orange-500/20 rounded-2xl w-fit mb-6 mx-auto lg:ml-auto">
                        <Utensils className="w-12 h-12 text-orange-400" />
                      </div>
                      <h3 className="text-2xl md:text-3xl font-bold text-white mb-4">
                        Meal Logging
                      </h3>
                      <p className="text-gray-300 leading-relaxed">
                        Easily track everything you eat with our comprehensive meal logging system 
                        designed specifically for Indian diets.
                      </p>
                      <Link 
                        to="/logmeals"
                        className="inline-block mt-4 bg-orange-600 hover:bg-orange-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
                      >
                        Log Your Meals
                      </Link>
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
              <div className="bg-gradient-to-br from-green-500/10 to-emerald-500/5 border border-green-500/20 rounded-3xl p-8 h-full">
                <div className="flex items-center gap-4 mb-6">
                  <div className="p-3 bg-green-500/20 rounded-2xl">
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
                  
                  <div className="grid md:grid-cols-2 gap-4">
                    {[
                      "Indian recipe nutrition analysis",
                      "Personalized AI diet plans",
                      "Integration with food delivery apps",
                      "Fitness tracker integration",
                      "Offline nutrition calculation",
                      "AI chatbot for diet guidance"
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
                </div>
              </div>
            </motion.div>

            {/* Indian Food Showcase */}
            <motion.div
              variants={fadeInUp}
              className="text-center"
            >
              <h3 className="text-3xl md:text-4xl font-bold text-white mb-4">
                Foods We Understand Perfectly
              </h3>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 max-w-4xl mx-auto">
                {[
                  { emoji: "🍛", name: "Curry" },
                  { emoji: "🫓", name: "Roti" },
                  { emoji: "🍚", name: "Chawal" },
                  { emoji: "🥘", name: "Dal" },
                  { emoji: "🥗", name: "Sabji" },
                  { emoji: "🫘", name: "Rajma" },
                  { emoji: "🍲", name: "Sambar" },
                  { emoji: "🥣", name: "Kadhi" },
                  { emoji: "🥠", name: "Samosa" },
                  { emoji: "🍮", name: "Kheer" },
                  { emoji: "🧆", name: "Chole" }
                ].map((food, index) => (
                  <motion.div
                    key={food.name}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 1.6 + index * 0.05, duration: 0.4 }}
                    className="text-center p-4 bg-zinc-900/50 backdrop-blur-sm rounded-2xl border border-zinc-700/50"
                  >
                    <div className="text-4xl mb-3">
                      {food.emoji}
                    </div>
                    <p className="text-sm font-semibold text-gray-300">{food.name}</p>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* User Reviews Section */}
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
                    Real experiences from our community
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

              <div className="relative bg-zinc-900/50 backdrop-blur-sm border border-zinc-700/50 rounded-3xl p-8 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-green-500/5 via-blue-500/5 to-purple-500/5 rounded-3xl"></div>
                
                <div className="relative z-10">
                  {displayTestimonials.length > 0 ? (
                    <TestimonialCarousel
                      borderType="solid"
                      data={displayTestimonials}
                    />
                  ) : (
                    <div className="text-center py-12">
                      <MessageSquare className="w-16 h-16 text-gray-500 mx-auto mb-4" />
                      <h4 className="text-xl font-semibold text-gray-400 mb-2">No Reviews Yet</h4>
                      <p className="text-gray-500">Be the first to share your experience!</p>
                      <Link
                        to="/review"
                        className="inline-block mt-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-2 rounded-lg font-medium hover:from-blue-700 hover:to-purple-700 transition-all duration-200"
                      >
                        Write First Review
                      </Link>
                    </div>
                  )}
                </div>
              </div>

              {/* Live Statistics */}
              <div className="grid grid-cols-2 gap-6 mt-8 text-center max-w-md mx-auto">
                <div>
                  <div className="text-2xl font-bold text-white">{totalReviews}</div>
                  <div className="text-gray-400 text-sm">User Reviews</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-white">{averageRating}</div>
                  <div className="text-gray-400 text-sm">Average Rating</div>
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
                  &quot;We believe everyone deserves accurate nutritional information for the foods they actually eat.&quot;
                </p>
                
                <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                  <Link
                    to="/scan"
                    className="bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white font-bold py-4 px-8 rounded-2xl transition-all duration-300 text-lg flex items-center gap-3"
                  >
                    <Scan className="w-5 h-5" />
                    Start Scanning Now
                  </Link>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default About;