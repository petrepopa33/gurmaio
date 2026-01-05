import { Button } from '@/components/ui/button';
import { ArrowLeft } from '@phosphor-icons/react';

export function PrivacyPage() {
  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 bg-background/95 backdrop-blur border-b">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <h1 className="font-heading text-2xl font-bold text-primary">Gurmaio</h1>
            <Button
              variant="outline"
              onClick={() => window.location.href = '/'}
            >
              <ArrowLeft className="mr-2" />
              Back to App
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-12 max-w-4xl">
        <div className="prose prose-sm max-w-none space-y-6">
          <h1 className="text-4xl font-heading font-bold mb-4">Privacy Policy</h1>
          <p className="text-muted-foreground"><strong>Last Updated:</strong> January 2025</p>
          
          <section>
            <h2 className="text-2xl font-heading font-semibold mb-3 mt-8">Introduction</h2>
            <p>
              Welcome to Gurmaio ("we," "our," or "us"). We are committed to protecting your privacy and being transparent about how we collect, use, and share your information.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-heading font-semibold mb-3 mt-8">1. Information We Collect</h2>
            
            <h3 className="text-xl font-heading font-medium mt-4 mb-2">1.1 Information You Provide Directly</h3>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li><strong>Account Information:</strong> GitHub username, email address, profile picture (via GitHub OAuth)</li>
              <li><strong>Dietary Preferences:</strong> Dietary restrictions, allergens, cuisine preferences</li>
              <li><strong>Physical Information (optional):</strong> Weight, height, age, sex, activity level (for calorie calculations)</li>
              <li><strong>Budget Information:</strong> Budget amount and period (daily/weekly)</li>
              <li><strong>Meal Plan Data:</strong> Generated meal plans, saved meal plans, meal ratings</li>
              <li><strong>Shopping Lists:</strong> Ingredient lists with owned/deleted status</li>
            </ul>

            <h3 className="text-xl font-heading font-medium mt-4 mb-2">1.2 Information We Collect Automatically</h3>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li><strong>Usage Data:</strong> How you interact with the app (features used, generation frequency)</li>
              <li><strong>Device Information:</strong> Browser type, operating system, device type</li>
              <li><strong>Log Data:</strong> IP address, access times, pages viewed, errors encountered</li>
            </ul>

            <h3 className="text-xl font-heading font-medium mt-4 mb-2">1.3 Information from Third Parties</h3>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li><strong>GitHub OAuth:</strong> We receive your GitHub username, email, and avatar URL when you log in</li>
              <li><strong>AI Services:</strong> We send your dietary preferences and meal requirements to OpenAI GPT-4 to generate meal suggestions (anonymized, no personal identifiers sent)</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-heading font-semibold mb-3 mt-8">2. How We Use Your Information</h2>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>Generate personalized meal plans based on your budget, dietary preferences, and nutritional goals</li>
              <li>Calculate nutrition (calories, protein, carbohydrates, fats)</li>
              <li>Estimate costs based on average market prices</li>
              <li>Generate shopping lists by aggregating ingredients</li>
              <li>Save your data for future sessions</li>
              <li>Improve our service through usage analysis</li>
              <li>Ensure security and prevent fraud</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-heading font-semibold mb-3 mt-8">3. How We Share Your Information</h2>
            
            <h3 className="text-xl font-heading font-medium mt-4 mb-2">Third-Party Service Providers</h3>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li><strong>OpenAI:</strong> Your dietary preferences, budget, and nutritional goals are sent to OpenAI GPT-4. <strong>No personal identifiers (name, email, GitHub username) are sent.</strong></li>
              <li><strong>GitHub:</strong> For authentication via GitHub OAuth</li>
              <li><strong>Hosting Provider:</strong> Data stored securely in database infrastructure</li>
            </ul>

            <h3 className="text-xl font-heading font-medium mt-4 mb-2">We Do NOT Share Your Data With:</h3>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>❌ Advertisers or marketing companies</li>
              <li>❌ Insurance companies</li>
              <li>❌ Healthcare providers</li>
              <li>❌ Data brokers</li>
              <li>❌ Social media platforms (except GitHub for authentication)</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-heading font-semibold mb-3 mt-8">4. Data Storage and Security</h2>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li><strong>Encryption:</strong> All data transmitted between your device and our servers is encrypted using TLS/SSL</li>
              <li><strong>Access Controls:</strong> Only authorized systems have access to user data</li>
              <li><strong>Authentication:</strong> GitHub OAuth provides secure authentication</li>
              <li><strong>No Payment Data:</strong> We do not collect or store credit card or payment information</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-heading font-semibold mb-3 mt-8">5. Your Rights and Choices</h2>
            
            <h3 className="text-xl font-heading font-medium mt-4 mb-2">Delete Your Data (Right to Erasure)</h3>
            <p>You can permanently delete your account and all associated data at any time:</p>
            <ol className="list-decimal list-inside space-y-2 ml-4 mt-3">
              <li>Click "Delete My Data" in the footer</li>
              <li>Review the deletion confirmation dialog</li>
              <li>Click "Yes, Delete Everything"</li>
              <li>Your data will be immediately deleted</li>
            </ol>
            
            <p className="mt-4"><strong>What Gets Deleted:</strong></p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>Your user profile and preferences</li>
              <li>All saved meal plans</li>
              <li>Meal ratings and history</li>
              <li>Shopping lists and item tracking</li>
              <li>All associated data in our system</li>
            </ul>

            <p className="mt-4 font-semibold">This complies with GDPR Article 17 (Right to Erasure) and CCPA Section 1798.105 (Right to Delete).</p>
          </section>

          <section>
            <h2 className="text-2xl font-heading font-semibold mb-3 mt-8">6. Children's Privacy</h2>
            <p>
              Gurmaio is <strong>not intended for children under 13 years old</strong>. We do not knowingly collect information from children under 13. If you believe we have collected information from a child under 13, please contact us immediately at <strong>support@gurmaio.app</strong> and we will delete it.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-heading font-semibold mb-3 mt-8">7. GDPR Rights (EU Users)</h2>
            <p>If you are located in the European Economic Area (EEA), you have the following rights:</p>
            <ul className="list-disc list-inside space-y-2 ml-4 mt-3">
              <li><strong>Right to Access:</strong> Request a copy of your personal data</li>
              <li><strong>Right to Rectification:</strong> Correct inaccurate personal data</li>
              <li><strong>Right to Erasure:</strong> Request deletion of your personal data</li>
              <li><strong>Right to Restriction:</strong> Limit how we use your personal data</li>
              <li><strong>Right to Portability:</strong> Receive your data in a machine-readable format</li>
              <li><strong>Right to Object:</strong> Object to processing of your personal data</li>
            </ul>
            <p className="mt-3">To exercise these rights, contact us at <strong>support@gurmaio.app</strong></p>
          </section>

          <section>
            <h2 className="text-2xl font-heading font-semibold mb-3 mt-8">8. Important Disclaimers</h2>
            
            <h3 className="text-xl font-heading font-medium mt-4 mb-2">Not Medical Advice</h3>
            <p>
              Gurmaio provides meal planning suggestions <strong>for informational purposes only</strong>. This is <strong>NOT medical, nutritional, or health advice</strong>. Always consult a qualified healthcare professional before making significant dietary changes.
            </p>

            <h3 className="text-xl font-heading font-medium mt-4 mb-2">Estimates Only</h3>
            <p>
              All nutrition values and cost estimates are <strong>approximations</strong> based on USDA nutrition databases and average grocery prices. <strong>Actual values may vary</strong> based on brands, stores, preparation methods, and regional pricing.
            </p>

            <h3 className="text-xl font-heading font-medium mt-4 mb-2">AI Usage</h3>
            <p>
              We use <strong>AI (OpenAI GPT-4)</strong> to suggest meal combinations. However:
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4 mt-3">
              <li>AI does <strong>NOT</strong> calculate nutrition values (deterministic algorithms do)</li>
              <li>AI does <strong>NOT</strong> calculate costs (deterministic algorithms do)</li>
              <li>AI <strong>ONLY</strong> suggests ingredient combinations</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-heading font-semibold mb-3 mt-8">9. Contact Us</h2>
            <p>
              If you have questions about this Privacy Policy or your data, please contact us at:
            </p>
            <p className="mt-3">
              <strong>Email:</strong> support@gurmaio.app
            </p>
            <p className="mt-2 text-muted-foreground">
              We will respond to your inquiry within 30 days.
            </p>
          </section>

          <div className="mt-12 pt-8 border-t">
            <Button
              variant="outline"
              onClick={() => window.location.href = '/'}
              size="lg"
            >
              <ArrowLeft className="mr-2" />
              Back to Gurmaio
            </Button>
          </div>
        </div>
      </main>

      <footer className="border-t py-8 mt-12">
        <div className="container mx-auto px-6 text-center text-sm text-muted-foreground">
          <p>© 2025 Gurmaio. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
