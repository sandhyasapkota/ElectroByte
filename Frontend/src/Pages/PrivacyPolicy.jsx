const PrivacyPolicy = () => {
  return (
    <>
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-4xl mx-auto px-4">
          <h1 className="text-3xl font-bold mb-8">Privacy Policy</h1>
          
          <div className="bg-white rounded-lg shadow p-8 space-y-6">
            <section>
              <h2 className="text-xl font-semibold mb-3">1. Information We Collect</h2>
              <p className="text-gray-600">
                We collect information you provide directly to us, including name, email address, 
                phone number, and shipping address when you create an account, place an order, 
                or contact us.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">2. How We Use Your Information</h2>
              <p className="text-gray-600 mb-2">We use the information we collect to:</p>
              <ul className="list-disc list-inside text-gray-600 space-y-1">
                <li>Process and fulfill your orders</li>
                <li>Send order confirmations and updates</li>
                <li>Respond to your comments and questions</li>
                <li>Provide customer support</li>
                <li>Send promotional communications (with your consent)</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">3. Information Sharing</h2>
              <p className="text-gray-600">
                We do not sell, trade, or rent your personal information to third parties. 
                We may share information with service providers who assist in our operations, 
                such as delivery partners.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">4. Data Security</h2>
              <p className="text-gray-600">
                We implement appropriate security measures to protect your personal information. 
                However, no method of transmission over the Internet is 100% secure, and we 
                cannot guarantee absolute security.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">5. Your Rights</h2>
              <p className="text-gray-600 mb-2">You have the right to:</p>
              <ul className="list-disc list-inside text-gray-600 space-y-1">
                <li>Access your personal data</li>
                <li>Correct inaccurate information</li>
                <li>Delete your account and data</li>
                <li>Opt out of marketing communications</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">6. Cookies</h2>
              <p className="text-gray-600">
                We use cookies to enhance your experience on our website. You can set your 
                browser to refuse all cookies, but some features may not function properly.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">7. Changes to This Policy</h2>
              <p className="text-gray-600">
                We may update this privacy policy from time to time. We will notify you of 
                any changes by posting the new policy on this page.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">8. Contact Us</h2>
              <p className="text-gray-600">
                If you have questions about this privacy policy, please contact us at 
                privacy@electrobyte.com
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

export default PrivacyPolicy;
