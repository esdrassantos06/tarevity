'use client'

import React from 'react'
import { FaGavel, FaUserCheck, FaBan, FaExclamationTriangle, FaFileContract } from 'react-icons/fa'

export default function TermsOfUseComponent() {
  return (
    <div className="max-w-4xl mx-auto px-6 py-8">
      <div className="mb-8 text-center">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
          Terms of Use
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Last updated: March 14, 2025
        </p>
      </div>

      <div className="bg-white dark:bg-BlackLight shadow-md rounded-lg overflow-hidden mb-8">
        <div className="p-6">
          <div className="flex items-center mb-4">
            <FaGavel className="mr-3 text-blue-600 dark:text-blue-400 text-xl" />
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
              Agreement to Terms
            </h2>
          </div>
          <p className="text-gray-700 dark:text-gray-300 mb-4">
            These Terms of Use constitute a legally binding agreement made between you, whether personally or on behalf of an entity (&quot;you&quot;) and Tarevity (&quot;we,&quot; &quot;us&quot; or &quot;our&quot;), concerning your access to and use of the Tarevity task management application.
          </p>
          <p className="text-gray-700 dark:text-gray-300 mb-4">
            By accessing or using the application, you agree to be bound by these Terms of Use. If you disagree with any part of the terms, you may not access the application.
          </p>
        </div>
      </div>

      <div className="bg-white dark:bg-BlackLight shadow-md rounded-lg overflow-hidden mb-8">
        <div className="p-6">
          <div className="flex items-center mb-4">
            <FaUserCheck className="mr-3 text-blue-600 dark:text-blue-400 text-xl" />
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
              User Accounts
            </h2>
          </div>
          
          <p className="text-gray-700 dark:text-gray-300 mb-4">
            When you create an account with us, you guarantee that you are above the age of 13, and that the information you provide us is accurate, complete, and current at all times. Inaccurate, incomplete, or obsolete information may result in the immediate termination of your account on the application.
          </p>
          <p className="text-gray-700 dark:text-gray-300 mb-4">
            You are responsible for maintaining the confidentiality of your account and password, including but not limited to the restriction of access to your computer and/or account. You agree to accept responsibility for any and all activities or actions that occur under your account and/or password.
          </p>
          <p className="text-gray-700 dark:text-gray-300 mb-4">
            You must notify us immediately upon becoming aware of any breach of security or unauthorized use of your account.
          </p>
        </div>
      </div>

      <div className="bg-white dark:bg-BlackLight shadow-md rounded-lg overflow-hidden mb-8">
        <div className="p-6">
          <div className="flex items-center mb-4">
            <FaFileContract className="mr-3 text-blue-600 dark:text-blue-400 text-xl" />
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
              Intellectual Property
            </h2>
          </div>
          
          <p className="text-gray-700 dark:text-gray-300 mb-4">
            The application and its original content, features, and functionality are and will remain the exclusive property of Tarevity and its licensors. The application is protected by copyright, trademark, and other laws of both the United States and foreign countries. Our trademarks and trade dress may not be used in connection with any product or service without the prior written consent of Tarevity.
          </p>
          <p className="text-gray-700 dark:text-gray-300 mb-4">
            You retain ownership of any intellectual property rights that you hold in the content you create and store on Tarevity. By uploading content to Tarevity, you grant us a worldwide, non-exclusive, royalty-free license to use, reproduce, adapt, publish, translate, and distribute your content in any existing or future media. This license is for the purpose of operating and improving our services only.
          </p>
        </div>
      </div>

      <div className="bg-white dark:bg-BlackLight shadow-md rounded-lg overflow-hidden mb-8">
        <div className="p-6">
          <div className="flex items-center mb-4">
            <FaBan className="mr-3 text-blue-600 dark:text-blue-400 text-xl" />
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
              Prohibited Uses
            </h2>
          </div>
          
          <p className="text-gray-700 dark:text-gray-300 mb-4">
            You may use our application only for lawful purposes and in accordance with these Terms. You agree not to use the application:
          </p>
          <ul className="list-disc pl-6 mb-4 text-gray-700 dark:text-gray-300">
            <li className="mb-2">In any way that violates any applicable federal, state, local, or international law or regulation.</li>
            <li className="mb-2">For the purpose of exploiting, harming, or attempting to exploit or harm minors in any way.</li>
            <li className="mb-2">To send, knowingly receive, upload, download, use, or re-use any material that does not comply with these Terms.</li>
            <li className="mb-2">To transmit, or procure the sending of, any advertising or promotional material, including any &quot;junk mail,&quot; &quot;chain letter,&quot; &quot;spam,&quot; or any other similar solicitation.</li>
            <li className="mb-2">To impersonate or attempt to impersonate Tarevity, a Tarevity employee, another user, or any other person or entity.</li>
            <li className="mb-2">To engage in any other conduct that restricts or inhibits anyone&apos;s use or enjoyment of the application, or which, as determined by us, may harm Tarevity or users of the application, or expose them to liability.</li>
          </ul>
        </div>
      </div>

      <div className="bg-white dark:bg-BlackLight shadow-md rounded-lg overflow-hidden mb-8">
        <div className="p-6">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
            User Content
          </h2>
          
          <p className="text-gray-700 dark:text-gray-300 mb-4">
            Our application allows you to create, store, and share content such as tasks, descriptions, and other materials (collectively, &quot;User Content&quot;). You are solely responsible for your User Content and the consequences of posting or publishing it.
          </p>
          <p className="text-gray-700 dark:text-gray-300 mb-4">
            By providing User Content, you represent and warrant that:
          </p>
          <ul className="list-disc pl-6 mb-4 text-gray-700 dark:text-gray-300">
            <li className="mb-2">You own or have the necessary licenses, rights, consents, and permissions to use and authorize us to use all intellectual property rights in and to any User Content.</li>
            <li className="mb-2">Your User Content does not violate the privacy rights, publicity rights, copyrights, contractual rights, intellectual property rights, or any other rights of any person or entity.</li>
            <li className="mb-2">Your User Content does not contain any material that solicits personal information from anyone under the age of 18 or exploits people under the age of 18 in a sexual or violent manner.</li>
            <li className="mb-2">Your User Content does not violate any applicable law concerning child pornography, or otherwise intended to protect the health or well-being of minors.</li>
          </ul>
        </div>
      </div>

      <div className="bg-white dark:bg-BlackLight shadow-md rounded-lg overflow-hidden mb-8">
        <div className="p-6">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
            Links to Other Websites
          </h2>
          
          <p className="text-gray-700 dark:text-gray-300 mb-4">
            Our application may contain links to third-party websites or services that are not owned or controlled by Tarevity.
          </p>
          <p className="text-gray-700 dark:text-gray-300 mb-4">
            Tarevity has no control over, and assumes no responsibility for, the content, privacy policies, or practices of any third-party websites or services. You further acknowledge and agree that Tarevity shall not be responsible or liable, directly or indirectly, for any damage or loss caused or alleged to be caused by or in connection with the use of or reliance on any such content, goods, or services available on or through any such websites or services.
          </p>
          <p className="text-gray-700 dark:text-gray-300 mb-4">
            We strongly advise you to read the terms and conditions and privacy policies of any third-party websites or services that you visit.
          </p>
        </div>
      </div>

      <div className="bg-white dark:bg-BlackLight shadow-md rounded-lg overflow-hidden mb-8">
        <div className="p-6">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
            Termination
          </h2>
          
          <p className="text-gray-700 dark:text-gray-300 mb-4">
            We may terminate or suspend your account and bar access to the application immediately, without prior notice or liability, under our sole discretion, for any reason whatsoever and without limitation, including but not limited to a breach of the Terms.
          </p>
          <p className="text-gray-700 dark:text-gray-300 mb-4">
            If you wish to terminate your account, you may simply discontinue using the application or request account deletion through the application&apos;s settings.
          </p>
          <p className="text-gray-700 dark:text-gray-300 mb-4">
            All provisions of the Terms which by their nature should survive termination shall survive termination, including, without limitation, ownership provisions, warranty disclaimers, indemnity, and limitations of liability.
          </p>
        </div>
      </div>
      
      <div className="bg-white dark:bg-BlackLight shadow-md rounded-lg overflow-hidden mb-8">
        <div className="p-6">
          <div className="flex items-center mb-4">
            <FaExclamationTriangle className="mr-3 text-blue-600 dark:text-blue-400 text-xl" />
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
              Disclaimer
            </h2>
          </div>
          
          <p className="text-gray-700 dark:text-gray-300 mb-4">
            Your use of the application is at your sole risk. The application is provided on an &quot;AS IS&quot; and &quot;AS AVAILABLE&quot; basis. The application is provided without warranties of any kind, whether express or implied, including, but not limited to, implied warranties of merchantability, fitness for a particular purpose, non-infringement, or course of performance.
          </p>
          <p className="text-gray-700 dark:text-gray-300 mb-4">
            Tarevity, its subsidiaries, affiliates, and its licensors do not warrant that a) the application will function uninterrupted, secure, or available at any particular time or location; b) any errors or defects will be corrected; c) the application is free of viruses or other harmful components; or d) the results of using the application will meet your requirements.
          </p>
        </div>
      </div>

      <div className="bg-white dark:bg-BlackLight shadow-md rounded-lg overflow-hidden mb-8">
        <div className="p-6">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
            Limitation of Liability
          </h2>
          
          <p className="text-gray-700 dark:text-gray-300 mb-4">
            In no event shall Tarevity, nor its directors, employees, partners, agents, suppliers, or affiliates, be liable for any indirect, incidental, special, consequential, or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses, resulting from (i) your access to or use of or inability to access or use the application; (ii) any conduct or content of any third party on the application; (iii) any content obtained from the application; and (iv) unauthorized access, use, or alteration of your transmissions or content, whether based on warranty, contract, tort (including negligence), or any other legal theory, whether or not we have been informed of the possibility of such damage.
          </p>
        </div>
      </div>

      <div className="bg-white dark:bg-BlackLight shadow-md rounded-lg overflow-hidden mb-8">
        <div className="p-6">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
            Changes to Terms
          </h2>
          
          <p className="text-gray-700 dark:text-gray-300 mb-4">
            We reserve the right, at our sole discretion, to modify or replace these Terms at any time. We will provide notice of changes to these Terms by posting the updated terms on the application with the &quot;Last updated&quot; date revised accordingly. What constitutes a material change will be determined at our sole discretion.
          </p>
          <p className="text-gray-700 dark:text-gray-300 mb-4">
            By continuing to access or use our application after any revisions become effective, you agree to be bound by the revised terms. If you do not agree to the new terms, you are no longer authorized to use the application.
          </p>
        </div>
      </div>

      <div className="bg-white dark:bg-BlackLight shadow-md rounded-lg overflow-hidden mb-8">
        <div className="p-6">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
            Governing Law
          </h2>
          
          <p className="text-gray-700 dark:text-gray-300 mb-4">
            These Terms shall be governed and construed in accordance with the laws of Europe, without regard to its conflict of law provisions.
          </p>
          <p className="text-gray-700 dark:text-gray-300 mb-4">
            Our failure to enforce any right or provision of these Terms will not be considered a waiver of those rights. If any provision of these Terms is held to be invalid or unenforceable by a court, the remaining provisions of these Terms will remain in effect.
          </p>
        </div>
      </div>

      <div className="bg-white dark:bg-BlackLight shadow-md rounded-lg overflow-hidden mb-8">
        <div className="p-6">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
            Contact Us
          </h2>
          
          <p className="text-gray-700 dark:text-gray-300 mb-4">
            If you have any questions about these Terms, please contact me:
          </p>
          <ul className="list-none mb-4 text-gray-700 dark:text-gray-300">
            <li className="mb-2">By email: esdrasirion1@gmail.com</li>
          </ul>
        </div>
      </div>

    </div>
  )
}