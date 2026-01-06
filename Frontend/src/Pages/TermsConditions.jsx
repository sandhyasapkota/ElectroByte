const TermsConditions = () => {
  return (
    <>
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-4xl mx-auto px-4">
          <h1 className="text-3xl font-bold mb-8">Terms & Conditions</h1>
          
          <div className="bg-white rounded-lg shadow p-8 space-y-6">
            <section>
              <h2 className="text-xl font-semibold mb-3">1. Introduction</h2>
              <p className="text-gray-600">
                Welcome to ElectroByte. These terms and conditions outline the rules and regulations 
                for the use of our website and services. By accessing this website, we assume you 
                accept these terms and conditions in full.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">2. Products and Services</h2>
              <p className="text-gray-600">
                ElectroByte offers computer hardware, accessories, and repair services. All products 
                are subject to availability. We reserve the right to modify prices without prior notice.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">3. Orders and Payment</h2>
              <p className="text-gray-600">
                By placing an order, you agree to provide accurate information. We currently accept 
                Cash on Delivery (COD) as the payment method. Full payment is required upon delivery.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">4. Shipping and Delivery</h2>
              <p className="text-gray-600">
                Delivery times may vary based on location and product availability. We strive to 
                deliver within the estimated timeframe but are not liable for delays beyond our control.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">5. Returns and Refunds</h2>
              <p className="text-gray-600">
                Products may be returned within 7 days of delivery if found defective. Items must be 
                in original condition with packaging. Refunds will be processed within 7-14 business days.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">6. Repair Services</h2>
              <p className="text-gray-600">
                Repair estimates are provided after diagnosis. Final costs may vary based on actual 
                repairs needed. We are not responsible for data loss during repairs - please backup 
                your data before service.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">7. Warranty</h2>
              <p className="text-gray-600">
                Products come with manufacturer warranty as specified. Repair services have a 30-day 
                warranty on parts and labor for the same issue.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">8. Contact</h2>
              <p className="text-gray-600">
                For questions about these terms, please contact us at support@electrobyte.com
              </p>
            </section>

            <p className="text-sm text-gray-500 pt-4 border-t">
              Last updated: December 2024
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

export default TermsConditions;
