import { Button } from '@/components/ui/button';
import { ArrowLeft } from '@phosphor-icons/react';

export function TermsPage() {
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
          <h1 className="text-4xl font-heading font-bold mb-4">Terms of Service</h1>
          <p className="text-muted-foreground"><strong>Last Updated:</strong> January 2025</p>
          
          <section>
            <h2 className="text-2xl font-heading font-semibold mb-3 mt-8">Agreement to Terms</h2>
            <p>
              By accessing or using Gurmaio ("the App," "Service," "we," "us," or "our"), you agree to be bound by these Terms of Service ("Terms"). If you do not agree to these Terms, do not use the App.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-heading font-semibold mb-3 mt-8">1. Description of Service</h2>
            
            <h3 className="text-xl font-heading font-medium mt-4 mb-2">What Gurmaio Does</h3>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>Generates personalized meal plans based on your budget and dietary preferences</li>
              <li>Calculates estimated nutrition values (calories, protein, carbohydrates, fats)</li>
              <li>Estimates ingredient and meal costs</li>
              <li>Creates shopping lists</li>
              <li>Uses AI (OpenAI GPT-4) to suggest meal combinations</li>
            </ul>

            <h3 className="text-xl font-heading font-medium mt-4 mb-2">What Gurmaio is NOT</h3>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>❌ Medical advice or treatment</li>
              <li>❌ Nutritional counseling</li>
              <li>❌ A substitute for professional healthcare providers</li>
              <li>❌ A guarantee of specific health outcomes</li>
              <li>❌ A meal delivery service</li>
              <li>❌ A grocery store or price comparison tool</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-heading font-semibold mb-3 mt-8">2. Eligibility</h2>
            <p>
              You must be <strong>at least 13 years old</strong> to use Gurmaio. If you are under 18, you must have parental or guardian consent to use the Service.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-heading font-semibold mb-3 mt-8">3. User Responsibilities</h2>
            
            <h3 className="text-xl font-heading font-medium mt-4 mb-2">Your Obligations</h3>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>Provide accurate dietary information (allergies, restrictions)</li>
              <li>Use the App for lawful purposes only</li>
              <li>Consult healthcare professionals for medical/dietary advice</li>
              <li>Verify ingredient safety before consumption (especially for allergies)</li>
              <li>Keep your account credentials secure</li>
              <li>Comply with all applicable laws and regulations</li>
            </ul>

            <h3 className="text-xl font-heading font-medium mt-4 mb-2">Prohibited Conduct</h3>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>Using the App if you have medical conditions requiring supervised diets (without professional guidance)</li>
              <li>Relying solely on the App for managing serious allergies or health conditions</li>
              <li>Misusing, hacking, or attempting to gain unauthorized access to the Service</li>
              <li>Using automated scripts or bots to access the Service</li>
              <li>Violating any laws or regulations</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-heading font-semibold mb-3 mt-8">4. Disclaimers and Limitations</h2>
            
            <h3 className="text-xl font-heading font-medium mt-4 mb-2">No Medical Advice</h3>
            <p className="font-semibold">
              IMPORTANT: Gurmaio provides meal planning suggestions for informational purposes only. This is NOT medical, nutritional, or health advice.
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4 mt-3">
              <li>We are NOT healthcare providers</li>
              <li>We do NOT diagnose, treat, or prevent any medical conditions</li>
              <li>We do NOT provide personalized medical or nutritional counseling</li>
            </ul>
            <p className="mt-3 font-semibold">
              You MUST consult qualified healthcare professionals before making significant dietary changes or managing medical conditions through diet.
            </p>

            <h3 className="text-xl font-heading font-medium mt-4 mb-2">Estimates Only</h3>
            <p>All values provided by Gurmaio are <strong>estimates</strong> and may not be accurate.</p>
            <ul className="list-disc list-inside space-y-2 ml-4 mt-3">
              <li><strong>Nutrition Values:</strong> Based on USDA databases; may vary by brand and preparation</li>
              <li><strong>Cost Estimates:</strong> Based on average prices; actual costs may differ significantly by store, location, and season</li>
              <li><strong>Ingredient Suggestions:</strong> AI-generated; may contain errors or inappropriate combinations</li>
            </ul>

            <h3 className="text-xl font-heading font-medium mt-4 mb-2">AI-Generated Content</h3>
            <p>
              Meal suggestions are AI-assisted (using OpenAI GPT-4). AI-generated content may contain errors or inaccuracies and is NOT reviewed by nutritionists or chefs. <strong>You use AI suggestions at your own risk.</strong>
            </p>

            <h3 className="text-xl font-heading font-medium mt-4 mb-2">No Guarantees</h3>
            <p>We make NO guarantees regarding:</p>
            <ul className="list-disc list-inside space-y-2 ml-4 mt-3">
              <li>Weight loss or weight gain</li>
              <li>Health improvements or fitness outcomes</li>
              <li>Accuracy of nutrition or cost estimates</li>
              <li>Availability or price of ingredients</li>
              <li>Suitability for your specific health needs</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-heading font-semibold mb-3 mt-8">5. Limitation of Liability</h2>
            
            <h3 className="text-xl font-heading font-medium mt-4 mb-2">Use at Your Own Risk</h3>
            <p className="font-semibold">
              YOU USE GURMAIO AT YOUR OWN RISK. The Service is provided "AS IS" and "AS AVAILABLE" without warranties of any kind.
            </p>

            <h3 className="text-xl font-heading font-medium mt-4 mb-2">No Liability for Health Outcomes</h3>
            <p>To the maximum extent permitted by law, we are NOT liable for:</p>
            <ul className="list-disc list-inside space-y-2 ml-4 mt-3">
              <li>Adverse health effects from following meal plans</li>
              <li>Allergic reactions or food sensitivities</li>
              <li>Medical conditions worsened by dietary changes</li>
              <li>Inaccurate nutrition information</li>
              <li>Food poisoning or illness</li>
              <li>Grocery costs exceeding estimates</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-heading font-semibold mb-3 mt-8">6. Intellectual Property</h2>
            <p>
              Gurmaio and all its content (code, design, algorithms, logos, text) are owned by us or our licensors and protected by copyright, trademark, and other intellectual property laws.
            </p>
            <p className="mt-3">
              You retain ownership of your profile information, saved meal plans, and meal ratings. By using the Service, you grant us a non-exclusive, worldwide, royalty-free license to store and display your content.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-heading font-semibold mb-3 mt-8">7. Privacy and Data</h2>
            <p>
              Your use of Gurmaio is governed by our Privacy Policy. By using the Service, you consent to our collection, use, and sharing of your information as described in the Privacy Policy.
            </p>
            <p className="mt-3">
              You may delete your account and all associated data at any time through the App. Upon deletion, your profile, meal plans, ratings, and shopping lists will be permanently removed. This action is irreversible.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-heading font-semibold mb-3 mt-8">8. Third-Party Services</h2>
            <p>Gurmaio integrates with:</p>
            <ul className="list-disc list-inside space-y-2 ml-4 mt-3">
              <li><strong>GitHub OAuth:</strong> For authentication</li>
              <li><strong>OpenAI GPT-4:</strong> For AI meal suggestions</li>
              <li><strong>GitHub Spark Platform:</strong> For hosting and data storage</li>
            </ul>
            <p className="mt-3">
              Your use of third-party services is subject to their respective terms and privacy policies. We are not responsible for third-party service availability, data practices, or service quality.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-heading font-semibold mb-3 mt-8">9. Modifications to Service</h2>
            <p>We reserve the right to:</p>
            <ul className="list-disc list-inside space-y-2 ml-4 mt-3">
              <li>Add, modify, or remove features at any time</li>
              <li>Change pricing or introduce paid features</li>
              <li>Suspend or discontinue the Service</li>
              <li>Update algorithms or data sources</li>
            </ul>
            <p className="mt-3">
              Your continued use of the Service after changes constitutes acceptance of the modified Terms.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-heading font-semibold mb-3 mt-8">10. Termination</h2>
            <p>
              You may stop using the Service at any time by logging out, deleting your account, or uninstalling the App.
            </p>
            <p className="mt-3">
              We reserve the right to suspend or terminate your account for violating these Terms, discontinue the Service for any reason, or refuse service to anyone at any time.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-heading font-semibold mb-3 mt-8">11. Contact Information</h2>
            <p>If you have questions about these Terms, contact us:</p>
            <p className="mt-3">
              <strong>Email:</strong> support@gurmaio.app
            </p>
            <p className="mt-2 text-muted-foreground">
              We will respond to inquiries within 30 days.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-heading font-semibold mb-3 mt-8">12. Acknowledgment</h2>
            <p>By using Gurmaio, you acknowledge that:</p>
            <ul className="list-disc list-inside space-y-2 ml-4 mt-3">
              <li>You have read and understood these Terms</li>
              <li>You agree to be bound by these Terms</li>
              <li>You understand this is NOT medical advice</li>
              <li>You understand all values are estimates</li>
              <li>You will consult healthcare professionals for dietary advice</li>
              <li>You use the Service at your own risk</li>
            </ul>
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
