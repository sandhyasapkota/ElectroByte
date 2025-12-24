import { useState } from "react";

const faqData = {
  General: [
    {
      q: "What types of laptop issues do you fix?",
      a: "We handle both hardware and software problems including slow performance, boot errors, and crashes."
    },
    {
      q: "What if my laptop doesn't turn on?",
      a: "We diagnose power, battery, motherboard, and charging issues."
    },
    {
      q: "Do you offer upgrades as well as repairs?",
      a: "Yes, we provide RAM, SSD upgrades, OS installation, and performance tuning."
    },
    {
      q: "Do you fix laptops of all brands?",
      a: "Yes, we repair Dell, HP, Lenovo, Acer, ASUS, and Apple laptops."
    }
  ],

  Support: [
    {
      q: "How does online laptop repair work?",
      a: "Our technician connects remotely and resolves software-related issues."
    },
    {
      q: "Do I need an account to use support?",
      a: "No, but creating an account helps track your service history."
    },
    {
      q: "Is on-site support available?",
      a: "Yes, on-site repair is available depending on your location."
    },
    {
      q: "What are your support hours?",
      a: "Support is available Monday to Friday, 9 AM to 6 PM."
    }
  ],

  PaymentInfo: [
    {
      q: "What payment methods do you accept?",
      a: "We accept cards, digital wallets, PayPal, and bank transfers."
    },
    {
      q: "Are there any hidden charges?",
      a: "No, pricing is transparent with no hidden fees."
    },
    {
      q: "Do you offer refunds?",
      a: "Yes, refunds are provided if the issue is not resolved."
    },
    {
      q: "Can I get a discount for multiple repairs?",
      a: "Yes, we offer discounts for bulk repair services."
    }
  ],

  ProductsSuppliedInfo: [
    {
      q: "What products do you supply?",
      a: "We supply laptop parts, chargers, batteries, and accessories."
    },
    {
      q: "Do products come with warranty?",
      a: "Yes, most products include manufacturer warranty."
    },
    {
      q: "Can I return a product if needed?",
      a: "Yes, returns are accepted within 30 days of purchase."
    },
    {
      q: "Do you offer bulk purchase discounts?",
      a: "Yes, we provide discounts for bulk orders."
    }
  ]
};

export default function FAQ() {
  const [activeCategory, setActiveCategory] = useState("General");
  const [openIndex, setOpenIndex] = useState(null);

  const categories = Object.keys(faqData);
  const faqs = faqData[activeCategory];

  return (
    <div className="min-h-screen bg-white text-gray-900 font-sans">
      <div className="px-[60px] py-[60px]">
        <div className="flex gap-10 max-w-6xl mx-auto">
          
          {/* Main FAQ Section */}
          <div className="flex-3">
            <h4 className="text-sm text-gray-600 mb-2.5">Home • FAQ</h4>
            <h1 className="text-3xl font-semibold mb-2">FREQUENTLY ASKED QUESTIONS</h1>
            <p className="font-medium text-gray-700 mb-7">YOUR PROBLEMS MEANS OUR PROBLEMS</p>

            {faqs.map((item, index) => (
              <div
                key={index}
                className={`bg-gray-100 rounded-2xl px-8 py-7 mb-5 transition-all duration-300 cursor-pointer ${
                  openIndex === index ? "active" : ""
                }`}
              >
                <div
                  className="flex justify-between items-center text-base font-semibold"
                  onClick={() =>
                    setOpenIndex(openIndex === index ? null : index)
                  }
                >
                  <span>{item.q}</span>
                  <span className={`text-xl transition-transform duration-300 ${
                    openIndex === index ? "rotate-180" : ""
                  }`}>
                    {openIndex === index ? "–" : "+"}
                  </span>
                </div>

                <div
                  className={`overflow-hidden opacity-0 transition-all duration-400 mt-3.5 text-gray-600 leading-relaxed ${
                    openIndex === index ? "max-h-80 opacity-100" : "max-h-0"
                  }`}
                >
                  {item.a}
                </div>
              </div>
            ))}
          </div>

          {/* Sidebar */}
          <div className="flex-1 bg-blue-50 px-6 py-5.5 rounded-2xl h-fit">
            <h4 className="text-sm font-semibold mb-3">Definitions & Interpretation</h4>

            {categories.map((item) => (
              <div
                key={item}
                className={`px-3.5 py-3 rounded-lg mb-2 cursor-pointer transition-all duration-200 ${
                  activeCategory === item
                    ? "bg-blue-200 font-semibold"
                    : "hover:bg-blue-100 hover:translate-x-1"
                }`}
                onClick={() => {
                  setActiveCategory(item);
                  setOpenIndex(null);
                }}
              >
                {item}
              </div>
            ))}
          </div>

        </div>
      </div>
    </div>
  );
}