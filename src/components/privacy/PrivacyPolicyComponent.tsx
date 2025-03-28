'use client'

import React from 'react'
import { FaShieldAlt, FaLock, FaCookie, FaUserShield } from 'react-icons/fa'
import { useTranslations } from 'next-intl'

export default function PrivacyPolicyComponent() {
  const t = useTranslations('privacy')
  
  return (
    <div className="mx-auto max-w-4xl px-6 py-8">
      <div className="mb-8 text-center">
        <h1 className="mb-4 text-3xl font-bold text-gray-900 md:text-4xl dark:text-white">
          {t('title')}
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          {t('lastUpdated')}
        </p>
      </div>

      <div className="dark:bg-BlackLight mb-8 overflow-hidden rounded-lg bg-white shadow-md">
        <div className="p-6">
          <div className="mb-4 flex items-center">
            <FaShieldAlt className="mr-3 text-xl text-blue-600 dark:text-blue-400" />
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
              {t('commitment.title')}
            </h2>
          </div>
          <p className="mb-4 text-gray-700 dark:text-gray-300">
            {t('commitment.description')}
          </p>
        </div>
      </div>

      <div className="dark:bg-BlackLight mb-8 overflow-hidden rounded-lg bg-white shadow-md">
        <div className="p-6">
          <div className="mb-4 flex items-center">
            <FaUserShield className="mr-3 text-xl text-blue-600 dark:text-blue-400" />
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
              {t('information.title')}
            </h2>
          </div>

          <h3 className="mt-6 mb-3 text-xl font-medium text-gray-800 dark:text-gray-200">
            {t('information.personalData.title')}
          </h3>
          <p className="mb-4 text-gray-700 dark:text-gray-300">
            {t('information.personalData.description')}
          </p>
          <ul className="mb-4 list-disc pl-6 text-gray-700 dark:text-gray-300">
            <li className="mb-2">{t('information.personalData.items.email')}</li>
            <li className="mb-2">{t('information.personalData.items.name')}</li>
            <li className="mb-2">{t('information.personalData.items.picture')}</li>
            <li className="mb-2">{t('information.personalData.items.usage')}</li>
          </ul>

          <h3 className="mt-6 mb-3 text-xl font-medium text-gray-800 dark:text-gray-200">
            {t('information.usageData.title')}
          </h3>
          <p className="mb-4 text-gray-700 dark:text-gray-300">
            {t('information.usageData.description')}
          </p>
        </div>
      </div>

      <div className="dark:bg-BlackLight mb-8 overflow-hidden rounded-lg bg-white shadow-md">
        <div className="p-6">
          <div className="mb-4 flex items-center">
            <FaLock className="mr-3 text-xl text-blue-600 dark:text-blue-400" />
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
              {t('usage.title')}
            </h2>
          </div>

          <p className="mb-4 text-gray-700 dark:text-gray-300">
            {t('usage.description')}
          </p>
          <ul className="mb-4 list-disc pl-6 text-gray-700 dark:text-gray-300">
            <li className="mb-2">{t('usage.items.provide')}</li>
            <li className="mb-2">{t('usage.items.notify')}</li>
            <li className="mb-2">{t('usage.items.support')}</li>
            <li className="mb-2">{t('usage.items.analysis')}</li>
            <li className="mb-2">{t('usage.items.monitor')}</li>
            <li className="mb-2">{t('usage.items.technical')}</li>
          </ul>
        </div>
      </div>

      <div className="dark:bg-BlackLight mb-8 overflow-hidden rounded-lg bg-white shadow-md">
        <div className="p-6">
          <div className="mb-4 flex items-center">
            <FaCookie className="mr-3 text-xl text-blue-600 dark:text-blue-400" />
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
              {t('cookies.title')}
            </h2>
          </div>

          <p className="mb-4 text-gray-700 dark:text-gray-300">
            {t('cookies.description1')}
          </p>
          <p className="mb-4 text-gray-700 dark:text-gray-300">
            {t('cookies.description2')}
          </p>
          <p className="mb-4 text-gray-700 dark:text-gray-300">
            {t('cookies.examples')}
          </p>
          <ul className="mb-4 list-disc pl-6 text-gray-700 dark:text-gray-300">
            <li className="mb-2">
              <strong>{t('cookies.items.session.title')}</strong> {t('cookies.items.session.description')}
            </li>
            <li className="mb-2">
              <strong>{t('cookies.items.preference.title')}</strong> {t('cookies.items.preference.description')}
            </li>
            <li className="mb-2">
              <strong>{t('cookies.items.security.title')}</strong> {t('cookies.items.security.description')}
            </li>
          </ul>
        </div>
      </div>

      <div className="dark:bg-BlackLight mb-8 overflow-hidden rounded-lg bg-white shadow-md">
        <div className="p-6">
          <h2 className="mb-4 text-2xl font-semibold text-gray-900 dark:text-white">
            {t('security.title')}
          </h2>

          <p className="mb-4 text-gray-700 dark:text-gray-300">
            {t('security.description1')}
          </p>
          <p className="mb-4 text-gray-700 dark:text-gray-300">
            {t('security.description2')}
          </p>
          <ul className="mb-4 list-disc pl-6 text-gray-700 dark:text-gray-300">
            <li className="mb-2">{t('security.items.encryption')}</li>
            <li className="mb-2">{t('security.items.audits')}</li>
            <li className="mb-2">{t('security.items.breach')}</li>
            <li className="mb-2">{t('security.items.cookies')}</li>
            <li className="mb-2">{t('security.items.csp')}</li>
          </ul>
        </div>
      </div>

      <div className="dark:bg-BlackLight mb-8 overflow-hidden rounded-lg bg-white shadow-md">
        <div className="p-6">
          <h2 className="mb-4 text-2xl font-semibold text-gray-900 dark:text-white">
            {t('thirdParty.title')}
          </h2>

          <p className="mb-4 text-gray-700 dark:text-gray-300">
            {t('thirdParty.description1')}
          </p>
          <p className="mb-4 text-gray-700 dark:text-gray-300">
            {t('thirdParty.description2')}
          </p>
        </div>
      </div>

      <div className="dark:bg-BlackLight mb-8 overflow-hidden rounded-lg bg-white shadow-md">
        <div className="p-6">
          <h2 className="mb-4 text-2xl font-semibold text-gray-900 dark:text-white">
            {t('rights.title')}
          </h2>

          <p className="mb-4 text-gray-700 dark:text-gray-300">
            {t('rights.description')}
          </p>
          <ul className="mb-4 list-disc pl-6 text-gray-700 dark:text-gray-300">
            <li className="mb-2">{t('rights.items.access')}</li>
            <li className="mb-2">{t('rights.items.correction')}</li>
            <li className="mb-2">{t('rights.items.deletion')}</li>
            <li className="mb-2">{t('rights.items.withdraw')}</li>
            <li className="mb-2">{t('rights.items.portability')}</li>
          </ul>
          <p className="mb-4 text-gray-700 dark:text-gray-300">
            {t('rights.contact')}
          </p>
        </div>
      </div>

      <div className="dark:bg-BlackLight mb-8 overflow-hidden rounded-lg bg-white shadow-md">
        <div className="p-6">
          <h2 className="mb-4 text-2xl font-semibold text-gray-900 dark:text-white">
            {t('changes.title')}
          </h2>

          <p className="mb-4 text-gray-700 dark:text-gray-300">
            {t('changes.description1')}
          </p>
          <p className="mb-4 text-gray-700 dark:text-gray-300">
            {t('changes.description2')}
          </p>
        </div>
      </div>

      <div className="dark:bg-BlackLight mb-8 overflow-hidden rounded-lg bg-white shadow-md">
        <div className="p-6">
          <h2 className="mb-4 text-2xl font-semibold text-gray-900 dark:text-white">
            {t('contact.title')}
          </h2>

          <p className="mb-4 text-gray-700 dark:text-gray-300">
            {t('contact.description')}
          </p>
          <ul className="mb-4 list-none text-gray-700 dark:text-gray-300">
            <li className="mb-2">{t('contact.email')}</li>
          </ul>
        </div>
      </div>
    </div>
  )
}