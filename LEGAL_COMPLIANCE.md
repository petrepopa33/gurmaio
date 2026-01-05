# Gurmaio - Legal Documents for App Store Compliance

## Public URLs for App Store Submission

For iOS App Store and Google Play Store compliance, the following legal documents are publicly accessible at these URLs:

### Privacy Policy
**URL:** `https://your-domain.com/privacy`

This page includes:
- Information collection practices
- Data usage and sharing policies
- User rights (GDPR Article 17 - Right to Erasure)
- Children's privacy (COPPA compliance)
- Contact information
- Medical and AI disclaimers

### Terms of Service
**URL:** `https://your-domain.com/terms`

This page includes:
- Service description and limitations
- User eligibility (13+ age requirement)
- User responsibilities and prohibited conduct
- Medical and nutritional disclaimers
- Limitation of liability
- Intellectual property rights
- Privacy and data policies
- Third-party service integrations
- Contact information

## App Store Requirements Met

### iOS App Store (Apple)
✅ **Privacy Policy URL** - Required for App Store submission
✅ **Terms of Service URL** - Required for App Store submission
✅ Age restriction disclosure (13+)
✅ Medical disclaimer (not a substitute for professional advice)
✅ Data collection and usage transparency
✅ User data deletion capability (GDPR compliant)

### Google Play Store (Android)
✅ **Privacy Policy URL** - Required for Play Store submission
✅ **Terms of Service URL** - Required for Play Store submission
✅ Age restriction disclosure (13+)
✅ Medical disclaimer (not a substitute for professional advice)
✅ Data safety disclosure information
✅ User data deletion capability

## Implementation Details

### Routing
The app uses a simple client-side router (`/src/Router.tsx`) that handles:
- `/` - Main application
- `/privacy` - Privacy Policy page
- `/terms` - Terms of Service page

### Page Components
- `/src/pages/PrivacyPage.tsx` - Standalone Privacy Policy page
- `/src/pages/TermsPage.tsx` - Standalone Terms of Service page

### Features
- ✅ Fully accessible via direct URL
- ✅ No authentication required to view
- ✅ Mobile-responsive design
- ✅ Print-friendly layout
- ✅ Back navigation to main app
- ✅ Consistent branding and styling

## Important Notes for App Store Submission

1. **Replace placeholder URLs** with your actual deployed domain
2. **Update contact email** (support@gurmaio.app) with your actual support email
3. **Update copyright year** as needed
4. **Test all links** before app store submission
5. **Ensure pages are always publicly accessible** (no authentication required)

## Testing

Before app store submission, verify:
```bash
# Test Privacy Policy page
curl https://your-domain.com/privacy

# Test Terms of Service page
curl https://your-domain.com/terms
```

Both should return 200 OK status and display the full legal content.

## Compliance Checklist

- [x] Privacy Policy publicly accessible
- [x] Terms of Service publicly accessible
- [x] No authentication required to view legal pages
- [x] Age restrictions clearly stated (13+)
- [x] Medical disclaimers prominent
- [x] Data deletion process documented
- [x] Contact information provided
- [x] GDPR compliance (EU users)
- [x] COPPA compliance (children's privacy)
- [x] AI usage transparency

## Support

For questions about legal compliance or app store submission:
- Email: support@gurmaio.app
- Response time: Within 30 days
