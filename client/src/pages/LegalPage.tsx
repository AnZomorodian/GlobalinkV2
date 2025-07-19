import { useState } from 'react';
import { ArrowLeft, Shield, FileText, Users, Eye } from 'lucide-react';
import { Link } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';

export default function LegalPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Header */}
      <header className="backdrop-blur-lg bg-white/80 dark:bg-gray-900/80 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Link href="/dashboard">
              <Button variant="ghost" size="sm" className="gap-2">
                <ArrowLeft className="w-4 h-4" />
                Back to Dashboard
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                Legal & Compliance
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Terms of Service and Privacy Policy
              </p>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <Tabs defaultValue="terms" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 max-w-md mx-auto">
            <TabsTrigger value="terms" className="gap-2">
              <FileText className="w-4 h-4" />
              Terms of Service
            </TabsTrigger>
            <TabsTrigger value="privacy" className="gap-2">
              <Shield className="w-4 h-4" />
              Privacy Policy
            </TabsTrigger>
          </TabsList>

          {/* Terms of Service */}
          <TabsContent value="terms">
            <Card className="max-w-4xl mx-auto backdrop-blur-md bg-white/90 dark:bg-gray-900/90 border-0 shadow-xl">
              <CardHeader className="text-center pb-8">
                <CardTitle className="flex items-center justify-center gap-3 text-3xl">
                  <FileText className="w-8 h-8 text-blue-600" />
                  Terms of Service
                </CardTitle>
                <CardDescription className="text-lg">
                  Last updated: {new Date().toLocaleDateString()}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[600px] pr-4">
                  <div className="prose prose-gray dark:prose-invert max-w-none space-y-6">
                    
                    <section>
                      <h3 className="text-xl font-semibold flex items-center gap-2 mb-4">
                        <Users className="w-5 h-5" />
                        1. Acceptance of Terms
                      </h3>
                      <p className="text-gray-700 dark:text-gray-300">
                        By accessing and using the GLOBALINK Corporate Messenger application, you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to abide by the above, please do not use this service.
                      </p>
                    </section>

                    <section>
                      <h3 className="text-xl font-semibold mb-4">2. Description of Service</h3>
                      <p className="text-gray-700 dark:text-gray-300 mb-4">
                        GLOBALINK Corporate Messenger is a professional communication platform designed for corporate teams and organizations. Our service includes:
                      </p>
                      <ul className="list-disc pl-6 space-y-2 text-gray-700 dark:text-gray-300">
                        <li>Real-time messaging capabilities</li>
                        <li>Voice and video calling features</li>
                        <li>Group chat and collaboration tools</li>
                        <li>File sharing and document collaboration</li>
                        <li>User management and team organization</li>
                        <li>Security and compliance features</li>
                      </ul>
                    </section>

                    <section>
                      <h3 className="text-xl font-semibold mb-4">3. User Responsibilities</h3>
                      <p className="text-gray-700 dark:text-gray-300 mb-4">
                        Users are responsible for:
                      </p>
                      <ul className="list-disc pl-6 space-y-2 text-gray-700 dark:text-gray-300">
                        <li>Maintaining the confidentiality of their account information</li>
                        <li>Using the service in compliance with all applicable laws</li>
                        <li>Respecting other users and maintaining professional conduct</li>
                        <li>Not sharing sensitive company information with unauthorized users</li>
                        <li>Reporting any security vulnerabilities or inappropriate behavior</li>
                      </ul>
                    </section>

                    <section>
                      <h3 className="text-xl font-semibold mb-4">4. Prohibited Uses</h3>
                      <p className="text-gray-700 dark:text-gray-300 mb-4">
                        The following activities are strictly prohibited:
                      </p>
                      <ul className="list-disc pl-6 space-y-2 text-gray-700 dark:text-gray-300">
                        <li>Harassment, abuse, or threatening behavior toward other users</li>
                        <li>Sharing malicious software, viruses, or harmful code</li>
                        <li>Attempting to gain unauthorized access to other accounts</li>
                        <li>Using the service for illegal activities or fraud</li>
                        <li>Spamming or sending unsolicited commercial messages</li>
                        <li>Reverse engineering or attempting to extract source code</li>
                      </ul>
                    </section>

                    <section>
                      <h3 className="text-xl font-semibold mb-4">5. Data Security and Backup</h3>
                      <p className="text-gray-700 dark:text-gray-300">
                        While we implement industry-standard security measures to protect your data, users are encouraged to maintain their own backups of important communications. We are not liable for data loss due to technical failures, security breaches, or user error.
                      </p>
                    </section>

                    <section>
                      <h3 className="text-xl font-semibold mb-4">6. Service Availability</h3>
                      <p className="text-gray-700 dark:text-gray-300">
                        We strive to maintain 99.9% uptime but cannot guarantee uninterrupted service. Maintenance windows and unexpected outages may occur. We will provide advance notice of scheduled maintenance when possible.
                      </p>
                    </section>

                    <section>
                      <h3 className="text-xl font-semibold mb-4">7. Limitation of Liability</h3>
                      <p className="text-gray-700 dark:text-gray-300">
                        GLOBALINK Corporation shall not be liable for any indirect, incidental, special, consequential, or punitive damages resulting from your use of the service. Our total liability shall not exceed the amount paid for the service in the preceding 12 months.
                      </p>
                    </section>

                    <section>
                      <h3 className="text-xl font-semibold mb-4">8. Changes to Terms</h3>
                      <p className="text-gray-700 dark:text-gray-300">
                        We reserve the right to modify these terms at any time. Users will be notified of significant changes via email or in-app notifications. Continued use of the service constitutes acceptance of the revised terms.
                      </p>
                    </section>

                    <section>
                      <h3 className="text-xl font-semibold mb-4">9. Contact Information</h3>
                      <p className="text-gray-700 dark:text-gray-300">
                        For questions regarding these terms, please contact us at:
                      </p>
                      <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg mt-2">
                        <p className="text-gray-700 dark:text-gray-300">
                          <strong>GLOBALINK Corporation</strong><br />
                          Legal Department<br />
                          Email: legal@globalink.com<br />
                          Phone: +1 (555) 123-4567
                        </p>
                      </div>
                    </section>
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Privacy Policy */}
          <TabsContent value="privacy">
            <Card className="max-w-4xl mx-auto backdrop-blur-md bg-white/90 dark:bg-gray-900/90 border-0 shadow-xl">
              <CardHeader className="text-center pb-8">
                <CardTitle className="flex items-center justify-center gap-3 text-3xl">
                  <Shield className="w-8 h-8 text-green-600" />
                  Privacy Policy
                </CardTitle>
                <CardDescription className="text-lg">
                  Last updated: {new Date().toLocaleDateString()}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[600px] pr-4">
                  <div className="prose prose-gray dark:prose-invert max-w-none space-y-6">
                    
                    <section>
                      <h3 className="text-xl font-semibold flex items-center gap-2 mb-4">
                        <Eye className="w-5 h-5" />
                        1. Information We Collect
                      </h3>
                      <p className="text-gray-700 dark:text-gray-300 mb-4">
                        We collect the following types of information to provide and improve our services:
                      </p>
                      
                      <h4 className="text-lg font-semibold mt-6 mb-3">Account Information</h4>
                      <ul className="list-disc pl-6 space-y-2 text-gray-700 dark:text-gray-300">
                        <li>Name, email address, and profile information</li>
                        <li>Job title, department, and company information</li>
                        <li>User-generated profile content and preferences</li>
                        <li>Authentication credentials and session data</li>
                      </ul>

                      <h4 className="text-lg font-semibold mt-6 mb-3">Communication Data</h4>
                      <ul className="list-disc pl-6 space-y-2 text-gray-700 dark:text-gray-300">
                        <li>Messages, files, and media shared through the platform</li>
                        <li>Call logs, duration, and participant information</li>
                        <li>Contact lists and group memberships</li>
                        <li>Read receipts and activity status</li>
                      </ul>

                      <h4 className="text-lg font-semibold mt-6 mb-3">Technical Information</h4>
                      <ul className="list-disc pl-6 space-y-2 text-gray-700 dark:text-gray-300">
                        <li>Device information, browser type, and operating system</li>
                        <li>IP addresses and connection information</li>
                        <li>Usage patterns and feature interactions</li>
                        <li>Error logs and performance data</li>
                      </ul>
                    </section>

                    <section>
                      <h3 className="text-xl font-semibold mb-4">2. How We Use Your Information</h3>
                      <p className="text-gray-700 dark:text-gray-300 mb-4">
                        We use collected information for the following purposes:
                      </p>
                      <ul className="list-disc pl-6 space-y-2 text-gray-700 dark:text-gray-300">
                        <li>Providing and maintaining the messaging service</li>
                        <li>Authenticating users and securing accounts</li>
                        <li>Facilitating communication between team members</li>
                        <li>Improving service features and user experience</li>
                        <li>Ensuring compliance with security policies</li>
                        <li>Providing customer support and technical assistance</li>
                        <li>Analyzing usage patterns for service optimization</li>
                      </ul>
                    </section>

                    <section>
                      <h3 className="text-xl font-semibold mb-4">3. Data Sharing and Disclosure</h3>
                      <p className="text-gray-700 dark:text-gray-300 mb-4">
                        We do not sell your personal information. We may share information in the following circumstances:
                      </p>
                      <ul className="list-disc pl-6 space-y-2 text-gray-700 dark:text-gray-300">
                        <li><strong>Within Your Organization:</strong> Messages and files are shared with intended recipients within your company</li>
                        <li><strong>Service Providers:</strong> Third-party services that help us operate the platform</li>
                        <li><strong>Legal Requirements:</strong> When required by law, court order, or legal process</li>
                        <li><strong>Security Purposes:</strong> To protect against fraud, security threats, or harmful activities</li>
                        <li><strong>Business Transfers:</strong> In case of merger, acquisition, or sale of assets</li>
                      </ul>
                    </section>

                    <section>
                      <h3 className="text-xl font-semibold mb-4">4. Data Security</h3>
                      <p className="text-gray-700 dark:text-gray-300 mb-4">
                        We implement comprehensive security measures to protect your information:
                      </p>
                      <ul className="list-disc pl-6 space-y-2 text-gray-700 dark:text-gray-300">
                        <li>End-to-end encryption for messages and calls</li>
                        <li>Secure data transmission using TLS/SSL protocols</li>
                        <li>Regular security audits and vulnerability assessments</li>
                        <li>Access controls and authentication mechanisms</li>
                        <li>Data backup and disaster recovery procedures</li>
                        <li>Employee training on data privacy and security</li>
                      </ul>
                    </section>

                    <section>
                      <h3 className="text-xl font-semibold mb-4">5. Data Retention</h3>
                      <p className="text-gray-700 dark:text-gray-300 mb-4">
                        We retain your information for as long as necessary to provide our services:
                      </p>
                      <ul className="list-disc pl-6 space-y-2 text-gray-700 dark:text-gray-300">
                        <li><strong>Account Data:</strong> Retained while your account is active</li>
                        <li><strong>Messages:</strong> Stored according to your organization's retention policy</li>
                        <li><strong>Call Logs:</strong> Retained for up to 2 years for billing and support</li>
                        <li><strong>Technical Logs:</strong> Automatically deleted after 90 days</li>
                      </ul>
                    </section>

                    <section>
                      <h3 className="text-xl font-semibold mb-4">6. Your Privacy Rights</h3>
                      <p className="text-gray-700 dark:text-gray-300 mb-4">
                        Depending on your location, you may have the following rights:
                      </p>
                      <ul className="list-disc pl-6 space-y-2 text-gray-700 dark:text-gray-300">
                        <li>Access to your personal information</li>
                        <li>Correction of inaccurate or incomplete data</li>
                        <li>Deletion of your personal information</li>
                        <li>Portability of your data</li>
                        <li>Restriction of processing in certain circumstances</li>
                        <li>Objection to processing based on legitimate interests</li>
                      </ul>
                    </section>

                    <section>
                      <h3 className="text-xl font-semibold mb-4">7. International Data Transfers</h3>
                      <p className="text-gray-700 dark:text-gray-300">
                        Your information may be transferred to and processed in countries other than your own. We ensure appropriate safeguards are in place through standard contractual clauses and adequacy decisions where applicable.
                      </p>
                    </section>

                    <section>
                      <h3 className="text-xl font-semibold mb-4">8. Updates to This Policy</h3>
                      <p className="text-gray-700 dark:text-gray-300">
                        We may update this privacy policy periodically to reflect changes in our practices or legal requirements. We will notify you of material changes via email or in-app notification.
                      </p>
                    </section>

                    <section>
                      <h3 className="text-xl font-semibold mb-4">9. Contact Us</h3>
                      <p className="text-gray-700 dark:text-gray-300">
                        For privacy-related questions or to exercise your rights, contact us at:
                      </p>
                      <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg mt-2">
                        <p className="text-gray-700 dark:text-gray-300">
                          <strong>Data Protection Officer</strong><br />
                          GLOBALINK Corporation<br />
                          Email: privacy@globalink.com<br />
                          Phone: +1 (555) 123-4567<br />
                          Address: 123 Corporate Blvd, Business City, BC 12345
                        </p>
                      </div>
                    </section>
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}