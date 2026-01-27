import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { FaQuestionCircle, FaChevronDown, FaArrowLeft, FaHome } from "react-icons/fa";
import { faqAPI } from "../services/api";

// Fallback FAQ data in case API fails
const fallbackFaqData = {
  General: [
    { q: "What types of laptop issues do you fix?", a: "We handle both hardware and software problems including slow performance, boot errors, and crashes." },
    { q: "What if my laptop doesn't turn on?", a: "We diagnose power, battery, motherboard, and charging issues." },
    { q: "Do you offer upgrades as well as repairs?", a: "Yes, we provide RAM, SSD upgrades, OS installation, and performance tuning." },
    { q: "Do you fix laptops of all brands?", a: "Yes, we repair Dell, HP, Lenovo, Acer, ASUS, and Apple laptops." }
  ],
  Support: [
    { q: "How does online laptop repair work?", a: "Our technician connects remotely and resolves software-related issues." },
    { q: "Do I need an account to use support?", a: "No, but creating an account helps track your service history." },
    { q: "Is on-site support available?", a: "Yes, on-site repair is available depending on your location." },
    { q: "What are your support hours?", a: "Support is available Monday to Friday, 9 AM to 6 PM." }
  ],
  Payment: [
    { q: "What payment methods do you accept?", a: "We accept cards, digital wallets, PayPal, and bank transfers." },
    { q: "Are there any hidden charges?", a: "No, pricing is transparent with no hidden fees." },
    { q: "Do you offer refunds?", a: "Yes, refunds are provided if the issue is not resolved." }
  ],
  Products: [
    { q: "What products do you supply?", a: "We supply laptop parts, chargers, batteries, and accessories." },
    { q: "Do products come with warranty?", a: "Yes, most products include manufacturer warranty." },
    { q: "Can I return a product if needed?", a: "Yes, returns are accepted within 30 days of purchase." }
  ]
};

export default function FAQ() {
  const navigate = useNavigate();
  const [faqData, setFaqData] = useState(fallbackFaqData);
  const [activeCategory, setActiveCategory] = useState("General");
  const [openIndex, setOpenIndex] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFAQs();
  }, []);

  const fetchFAQs = async () => {
    try {
      const response = await faqAPI.getAll();
      if (response.data && response.data.length > 0) {
        // Group FAQs by category
        const grouped = {};
        response.data.forEach(faq => {
          const category = faq.category || "General";
          if (!grouped[category]) {
            grouped[category] = [];
          }
          grouped[category].push({ q: faq.question, a: faq.answer });
        });
        if (Object.keys(grouped).length > 0) {
          setFaqData(grouped);
          setActiveCategory(Object.keys(grouped)[0]);
        }
      }
    } catch (error) {
      console.log("Using fallback FAQ data");
    } finally {
      setLoading(false);
    }
  };

  const categories = Object.keys(faqData);
  const faqs = faqData[activeCategory] || [];

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-16 relative overflow-hidden">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="absolute top-0 left-0 w-72 h-72 bg-white/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-purple-400/20 rounded-full blur-3xl"></div>
        <div className="max-w-4xl mx-auto px-4 relative z-10">
          <button 
            onClick={() => navigate(-1)} 
            className="flex items-center gap-2 text-white/80 hover:text-white mb-4 transition-colors group"
          >
            <FaArrowLeft className="group-hover:-translate-x-1 transition-transform" />
            <span>Back</span>
          </button>
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-white/20 backdrop-blur-sm rounded-full mb-4">
              <FaQuestionCircle className="text-3xl" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-3">Frequently Asked Questions</h1>
            <p className="text-blue-100 text-lg">Find answers to common questions about our services</p>
          </div>
        </div>
      </div>

      {/* Breadcrumb */}
      <div className="bg-white border-b">
        <div className="max-w-6xl mx-auto px-4 py-3">
          <div className="flex items-center gap-2 text-sm">
            <Link to="/" className="text-gray-500 hover:text-blue-600 flex items-center gap-1">
              <FaHome className="text-xs" /> Home
            </Link>
            <span className="text-gray-400">/</span>
            <span className="text-gray-800 font-medium">FAQ</span>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="flex flex-col md:flex-row gap-8">
          
          {/* Sidebar Categories */}
          <div className="md:w-64 order-2 md:order-1">
            <div className="bg-white rounded-2xl shadow-lg p-6 sticky top-24 border border-gray-100">
              <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">Categories</h4>
              <div className="space-y-2">
                {categories.map((item) => (
                  <button
                    key={item}
                    className={`w-full text-left px-4 py-3 rounded-xl transition-all duration-200 ${
                      activeCategory === item
                        ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold shadow-md"
                        : "text-gray-700 hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50"
                    }`}
                    onClick={() => {
                      setActiveCategory(item);
                      setOpenIndex(null);
                    }}
                  >
                    {item}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Main FAQ Section */}
          <div className="flex-1 order-1 md:order-2">
            <div className="flex items-center gap-2 text-sm text-gray-500 mb-6">
              <span className="hover:text-blue-600 cursor-pointer">Home</span>
              <span>•</span>
              <span className="text-gray-800 font-medium">FAQ</span>
              <span>•</span>
              <span className="text-blue-600">{activeCategory}</span>
            </div>

            <div className="space-y-4">
              {faqs.map((item, index) => (
                <div
                  key={index}
                  className={`bg-white rounded-2xl shadow-lg overflow-hidden transition-all duration-300 border border-gray-100 ${
                    openIndex === index ? "ring-2 ring-blue-200" : "hover:shadow-xl"
                  }`}
                >
                  <button
                    className="w-full flex justify-between items-center px-6 py-5 text-left"
                    onClick={() => setOpenIndex(openIndex === index ? null : index)}
                  >
                    <span className="font-semibold text-gray-800 pr-4">{item.q}</span>
                    <div className={`w-8 h-8 bg-gradient-to-r from-blue-100 to-purple-100 rounded-full flex items-center justify-center flex-shrink-0 transition-transform duration-300 ${
                      openIndex === index ? "rotate-180" : ""
                    }`}>
                      <FaChevronDown className={`text-sm ${openIndex === index ? "text-purple-600" : "text-blue-600"}`} />
                    </div>
                  </button>

                  <div
                    className={`overflow-hidden transition-all duration-300 ${
                      openIndex === index ? "max-h-96" : "max-h-0"
                    }`}
                  >
                    <div className="px-6 pb-5 text-gray-600 leading-relaxed border-t border-gray-100 pt-4">
                      {item.a}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Help Section */}
            <div className="mt-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 text-white text-center">
              <h3 className="text-2xl font-bold mb-2">Still have questions?</h3>
              <p className="text-blue-100 mb-6">Can't find the answer you're looking for? Our support team is here to help.</p>
              <a 
                href="/contact" 
                className="inline-block bg-white text-blue-600 font-semibold px-8 py-3 rounded-xl hover:bg-gray-100 transition-colors shadow-lg"
              >
                Contact Support
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}