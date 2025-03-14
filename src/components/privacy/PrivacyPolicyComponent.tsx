'use client'

import React from 'react'
import { FaShieldAlt, FaLock, FaCookie, FaUserShield } from 'react-icons/fa'

export default function PrivacyPolicyComponent() {
  return (
    <div className="max-w-4xl mx-auto px-6 py-8">
      <div className="mb-8 text-center">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
          Privacy Policy
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Last updated: March 14, 2025
        </p>
      </div>

      <div className="bg-white dark:bg-BlackLight shadow-md rounded-lg overflow-hidden mb-8">
        <div className="p-6">
          <div className="flex items-center mb-4">
            <FaShieldAlt className="mr-3 text-blue-600 dark:text-blue-400 text-xl" />
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
              Our Commitment to Privacy
            </h2>
          </div>
          <p className="text-gray-700 dark:text-gray-300 mb-4">
            At Tarevity, we take your privacy seriously. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our task management application. Please read this privacy policy carefully. If you do not agree with the terms of this privacy policy, please do not access the application.
          </p>
        </div>
      </div>

      <div className="bg-white dark:bg-BlackLight shadow-md rounded-lg overflow-hidden mb-8">
        <div className="p-6">
          <div className="flex items-center mb-4">
            <FaUserShield className="mr-3 text-blue-600 dark:text-blue-400 text-xl" />
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
              Information We Collect
            </h2>
          </div>
          
          <h3 className="text-xl font-medium text-gray-800 dark:text-gray-200 mt-6 mb-3">Personal Data</h3>
          <p className="text-gray-700 dark:text-gray-300 mb-4">
            While using our application, we may ask you to provide us with certain personally identifiable information that can be used to contact or identify you. Personally identifiable information may include, but is not limited to:
          </p>
          <ul className="list-disc pl-6 mb-4 text-gray-700 dark:text-gray-300">
            <li className="mb-2">Email address</li>
            <li className="mb-2">First name and last name</li>
            <li className="mb-2">Profile picture (if provided)</li>
            <li className="mb-2">Usage data and application preferences</li>
          </ul>

          <h3 className="text-xl font-medium text-gray-800 dark:text-gray-200 mt-6 mb-3">Usage Data</h3>
          <p className="text-gray-700 dark:text-gray-300 mb-4">
            We may also collect information on how the application is accessed and used (&quot;Usage Data&quot;). This Usage Data may include information such as your device&apos;s IP address, browser type, browser version, the pages of our application that you visit, the time and date of your visit, the time spent on those pages, unique device identifiers, and other diagnostic data.
          </p>
        </div>
      </div>

      <div className="bg-white dark:bg-BlackLight shadow-md rounded-lg overflow-hidden mb-8">
        <div className="p-6">
          <div className="flex items-center mb-4">
            <FaLock className="mr-3 text-blue-600 dark:text-blue-400 text-xl" />
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
              How We Use Your Information
            </h2>
          </div>
          
          <p className="text-gray-700 dark:text-gray-300 mb-4">
            We use the collected data for various purposes:
          </p>
          <ul className="list-disc pl-6 mb-4 text-gray-700 dark:text-gray-300">
            <li className="mb-2">To provide and maintain our service</li>
            <li className="mb-2">To notify you about changes to our service</li>
            <li className="mb-2">To provide customer support</li>
            <li className="mb-2">To gather analysis or valuable information so that we can improve our service</li>
            <li className="mb-2">To monitor the usage of the service</li>
            <li className="mb-2">To detect, prevent and address technical issues</li>
          </ul>
        </div>
      </div>

      <div className="bg-white dark:bg-BlackLight shadow-md rounded-lg overflow-hidden mb-8">
        <div className="p-6">
          <div className="flex items-center mb-4">
            <FaCookie className="mr-3 text-blue-600 dark:text-blue-400 text-xl" />
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
              Cookies and Tracking Technologies
            </h2>
          </div>
          
          <p className="text-gray-700 dark:text-gray-300 mb-4">
            We use cookies and similar tracking technologies to track activity on our application and store certain information. Cookies are files with a small amount of data which may include an anonymous unique identifier. Cookies are sent to your browser from a website and stored on your device.
          </p>
          <p className="text-gray-700 dark:text-gray-300 mb-4">
            You can instruct your browser to refuse all cookies or to indicate when a cookie is being sent. However, if you do not accept cookies, you may not be able to use some portions of our application.
          </p>
          <p className="text-gray-700 dark:text-gray-300 mb-4">
            Examples of Cookies we use:
          </p>
          <ul className="list-disc pl-6 mb-4 text-gray-700 dark:text-gray-300">
            <li className="mb-2"><strong>Session Cookies:</strong> We use Session Cookies to operate our service.</li>
            <li className="mb-2"><strong>Preference Cookies:</strong> We use Preference Cookies to remember your preferences and various settings.</li>
            <li className="mb-2"><strong>Security Cookies:</strong> We use Security Cookies for security purposes.</li>
          </ul>
        </div>
      </div>

      <div className="bg-white dark:bg-BlackLight shadow-md rounded-lg overflow-hidden mb-8">
        <div className="p-6">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
            Data Security
          </h2>
          
          <p className="text-gray-700 dark:text-gray-300 mb-4">
            The security of your data is important to us, but remember that no method of transmission over the Internet, or method of electronic storage is 100% secure. While we strive to use commercially acceptable means to protect your Personal Data, we cannot guarantee its absolute security.
          </p>
          <p className="text-gray-700 dark:text-gray-300 mb-4">
            Our security measures include:
          </p>
          <ul className="list-disc pl-6 mb-4 text-gray-700 dark:text-gray-300">
            <li className="mb-2">End-to-end encryption for sensitive data</li>
            <li className="mb-2">Regular security audits</li>
            <li className="mb-2">Password breach checking via HIBP API</li>
            <li className="mb-2">Secure HTTP-only cookies</li>
            <li className="mb-2">Strict Content Security Policy (CSP) implementation</li>
          </ul>
        </div>
      </div>

      <div className="bg-white dark:bg-BlackLight shadow-md rounded-lg overflow-hidden mb-8">
        <div className="p-6">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
            Third-Party Authentication Providers
          </h2>
          
          <p className="text-gray-700 dark:text-gray-300 mb-4">
            Our application allows you to sign in using third-party authentication providers, such as Google and GitHub. When you choose to sign in using one of these services, we may collect personal information that your privacy settings on that service permit us to access.
          </p>
          <p className="text-gray-700 dark:text-gray-300 mb-4">
            We only use this information for authentication purposes and to create your user profile within our application. We do not share this information with additional third parties without your consent.
          </p>
        </div>
      </div>

      <div className="bg-white dark:bg-BlackLight shadow-md rounded-lg overflow-hidden mb-8">
        <div className="p-6">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
            Your Data Rights
          </h2>
          
          <p className="text-gray-700 dark:text-gray-300 mb-4">
            Depending on your location, you may have certain rights regarding your personal information, such as:
          </p>
          <ul className="list-disc pl-6 mb-4 text-gray-700 dark:text-gray-300">
            <li className="mb-2">The right to access personal information we hold about you</li>
            <li className="mb-2">The right to request correction of inaccurate data</li>
            <li className="mb-2">The right to request deletion of your data</li>
            <li className="mb-2">The right to withdraw consent</li>
            <li className="mb-2">The right to data portability</li>
          </ul>
          <p className="text-gray-700 dark:text-gray-300 mb-4">
            To exercise any of these rights, please contact us using the information provided below.
          </p>
        </div>
      </div>

      <div className="bg-white dark:bg-BlackLight shadow-md rounded-lg overflow-hidden mb-8">
        <div className="p-6">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
            Changes to This Privacy Policy
          </h2>
          
          <p className="text-gray-700 dark:text-gray-300 mb-4">
            We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the &quot;Last updated&quot; date.
          </p>
          <p className="text-gray-700 dark:text-gray-300 mb-4">
            You are advised to review this Privacy Policy periodically for any changes. Changes to this Privacy Policy are effective when they are posted on this page.
          </p>
        </div>
      </div>

      <div className="bg-white dark:bg-BlackLight shadow-md rounded-lg overflow-hidden mb-8">
        <div className="p-6">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
            Contact Us
          </h2>
          
          <p className="text-gray-700 dark:text-gray-300 mb-4">
            If you have any questions about this Privacy Policy, please contact me:
          </p>
          <ul className="list-none mb-4 text-gray-700 dark:text-gray-300">
            <li className="mb-2">By email: esdrasirion1@gmail.com</li>
          </ul>
        </div>
      </div>

    </div>
  )
}