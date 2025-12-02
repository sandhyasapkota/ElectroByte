import React from 'react'; // Import React to use JSX for icons
import { FaQuestionCircle, FaUserShield, FaTags } from 'react-icons/fa'; // Import icons

// --- Import all images needed for the data ---
import banner from "../Images/banner.png";
import laptop from "../Images/laptop.png";
import legion from "../Images/legion.png";
import customBuildsBanner from "../Images/customBuildsBanner.png";
import laptopsBanner from "../Images/laptopsBanner.png";
import desktopsBanner from "../Images/desktopsBanner.png";
import monitorsBanner from "../Images/monitorsBanner.png";
import pcCase from "../Images/pcCase.png";
import monitor from "../Images/monitor.png";
import brandMsi from '../Images/brandMsi.png';
import brandRazer from '../Images/brandRazer.png';
import brandGigabyte from '../Images/brandGigabyte.png';
import insta1 from '../Images/insta1.png';
import insta2 from '../Images/insta2.png';

// --- Define all your product data here ---
const newProducts = [
    { id: 101, name: "EX DISPLAY : MSI Pro 16 Flex-036AU 15.6 MULTITOUCH All-In-On...", image: monitor, price: "NPR. 50,000.00", oldPrice: "NPR. 70,000.00", rating: 4, reviews: 4 },
    { id: 102, name: "White Mid-Tower ATX Case", image: pcCase, price: "NPR. 50,000.00", oldPrice: "NPR. 70,000.00", rating: 4, reviews: 4 },
    { id: 103, name: "Gaming PC Tower", image: pcCase, price: "NPR. 50,000.00", oldPrice: "NPR. 70,000.00", rating: 4, reviews: 4 },
    { id: 104, name: "MSI Gaming Laptop", image: laptop, price: "NPR. 50,000.00", oldPrice: "NPR. 70,000.00", rating: 4, reviews: 4 },
    { id: 105, name: "Another Gaming PC", image: pcCase, price: "NPR. 50,000.00", oldPrice: "NPR. 70,000.00", rating: 4, reviews: 4 },
    { id: 106, name: "Final Gaming PC", image: pcCase, price: "NPR. 50,000.00", oldPrice: "NPR. 70,000.00", rating: 4, reviews: 4 },
];
const customBuilds = [
    { id: 1, name: "CHARLIE V5", image: pcCase, price: "NPR. 58,000.00", rating: 4, reviews: 4 },
    { id: 2, name: "BRAVO V8", image: pcCase, price: "NPR. 65,000.00", rating: 5, reviews: 10 },
];
const laptops = [
    { id: 1, name: "MSI GF63 Thin", image: laptop, price: "NPR. 98,000.00", rating: 4, reviews: 15 },
    { id: 2, name: "Lenovo Legion 5", image: legion, price: "NPR. 1,50,000.00", rating: 5, reviews: 22 },
];
const desktops = [...customBuilds].reverse();
const monitors = [
    { id: 1, name: "MSI G244F 24-inch", image: monitor, price: "NPR. 28,000.00", rating: 5, reviews: 11 },
    { id: 2, name: "MSI G27CQ4 27-inch", image: monitor, price: "NPR. 45,000.00", rating: 5, reviews: 19 },
];

// --- This object defines the entire page structure ---
export const pageData = {
    mainBanner: banner,
    sections: [
        { type: 'simple', title: 'New Products', seeAllLink: '#', seeAllText: 'See All New Products', products: newProducts },
        { type: 'withBanner', title: 'Custom Builds', bannerImg: customBuildsBanner, seeAllLink: '#', products: customBuilds },
        { type: 'withBanner', title: 'MSI Laptops', bannerImg: laptopsBanner, seeAllLink: '#', products: laptops, subNav: ["GF63 Series", "GT77 Series", "Modern Series"] },
        { type: 'withBanner', title: 'Desktops', bannerImg: desktopsBanner, seeAllLink: '#', products: desktops },
        { type: 'withBanner', title: 'Gaming Monitors', bannerImg: monitorsBanner, seeAllLink: '#', products: monitors },
    ],
    brands: [brandMsi, brandRazer, brandGigabyte, brandMsi, brandRazer, brandGigabyte],
    instagram: {
        title: 'Follow us on Instagram for News, Offers & More',
        posts: [
            { id: 1, img: insta1, caption: 'Our new setup is clean and ready for gaming!', date: '2 days ago' },
            { id: 2, img: insta2, caption: 'RGB makes everything better. Check out this build.', date: '3 days ago' },
            { id: 3, img: insta1, caption: 'Another happy customer with their new rig.', date: '4 days ago' },
            { id: 4, img: insta2, caption: 'The ultimate gaming keyboard has arrived.', date: '5 days ago' },
        ],
    },
    testimonials: [
        { quote: "My first order arrived today, in perfect condition. From the time I sent in a question about the item to making the purchase to the shipping and now the delivery, your company has stayed in touch. Such great service, I look forward to shopping on your site in the future and would highly recommend it.", author: "- Happy Buyer" },
        { quote: "Absolutely fantastic service and the PC is a beast! It runs everything I throw at it flawlessly. The team was super helpful.", author: "- Thrilled Gamer" },
        { quote: "The delivery was faster than expected and the packaging was top-notch. Everything was secure. Highly professional.", author: "- Satisfied Customer" },
    ],
    features: [
        { icon: <FaQuestionCircle />, title: 'Product Support', description: 'Up to 3 years on-site warranty available for your peace of mind.' },
        { icon: <FaUserShield />, title: 'Personal Account', description: 'With big discounts, free delivery and a dedicated support specialist.' },
        { icon: <FaTags />, title: 'Amazing Savings', description: 'Up to 70% off new products, you can be sure of the best price.' },
    ]
};