'use client'

import React from 'react'
import {
  FaGavel,
  FaUserCheck,
  FaBan,
  FaExclamationTriangle,
  FaFileContract,
} from 'react-icons/fa'
import {useTranslations} from 'next-intl';

export default function TermsOfUseComponent() {
  const t = useTranslations('terms');
  
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
            <FaGavel className="mr-3 text-xl text-blue-600 dark:text-blue-400" />
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
              {t('agreement.title')}
            </h2>
          </div>
          <p className="mb-4 text-gray-700 dark:text-gray-300">
            {t('agreement.paragraph1')}
          </p>
          <p className="mb-4 text-gray-700 dark:text-gray-300">
            {t('agreement.paragraph2')}
          </p>
        </div>
      </div>

      <div className="dark:bg-BlackLight mb-8 overflow-hidden rounded-lg bg-white shadow-md">
        <div className="p-6">
          <div className="mb-4 flex items-center">
            <FaUserCheck className="mr-3 text-xl text-blue-600 dark:text-blue-400" />
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
              {t('userAccounts.title')}
            </h2>
          </div>

          <p className="mb-4 text-gray-700 dark:text-gray-300">
            {t('userAccounts.paragraph1')}
          </p>
          <p className="mb-4 text-gray-700 dark:text-gray-300">
            {t('userAccounts.paragraph2')}
          </p>
          <p className="mb-4 text-gray-700 dark:text-gray-300">
            {t('userAccounts.paragraph3')}
          </p>
        </div>
      </div>

      <div className="dark:bg-BlackLight mb-8 overflow-hidden rounded-lg bg-white shadow-md">
        <div className="p-6">
          <div className="mb-4 flex items-center">
            <FaFileContract className="mr-3 text-xl text-blue-600 dark:text-blue-400" />
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
              {t('intellectualProperty.title')}
            </h2>
          </div>

          <p className="mb-4 text-gray-700 dark:text-gray-300">
            {t('intellectualProperty.paragraph1')}
          </p>
          <p className="mb-4 text-gray-700 dark:text-gray-300">
            {t('intellectualProperty.paragraph2')}
          </p>
        </div>
      </div>

      <div className="dark:bg-BlackLight mb-8 overflow-hidden rounded-lg bg-white shadow-md">
        <div className="p-6">
          <div className="mb-4 flex items-center">
            <FaBan className="mr-3 text-xl text-blue-600 dark:text-blue-400" />
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
              {t('prohibitedUses.title')}
            </h2>
          </div>

          <p className="mb-4 text-gray-700 dark:text-gray-300">
            {t('prohibitedUses.intro')}
          </p>
          <ul className="mb-4 list-disc pl-6 text-gray-700 dark:text-gray-300">
            <li className="mb-2">
              {t('prohibitedUses.item1')}
            </li>
            <li className="mb-2">
              {t('prohibitedUses.item2')}
            </li>
            <li className="mb-2">
              {t('prohibitedUses.item3')}
            </li>
            <li className="mb-2">
              {t('prohibitedUses.item4')}
            </li>
            <li className="mb-2">
              {t('prohibitedUses.item5')}
            </li>
            <li className="mb-2">
              {t('prohibitedUses.item6')}
            </li>
          </ul>
        </div>
      </div>

      <div className="dark:bg-BlackLight mb-8 overflow-hidden rounded-lg bg-white shadow-md">
        <div className="p-6">
          <h2 className="mb-4 text-2xl font-semibold text-gray-900 dark:text-white">
            {t('userContent.title')}
          </h2>

          <p className="mb-4 text-gray-700 dark:text-gray-300">
            {t('userContent.paragraph1')}
          </p>
          <p className="mb-4 text-gray-700 dark:text-gray-300">
            {t('userContent.paragraph2')}
          </p>
          <ul className="mb-4 list-disc pl-6 text-gray-700 dark:text-gray-300">
            <li className="mb-2">
              {t('userContent.item1')}
            </li>
            <li className="mb-2">
              {t('userContent.item2')}
            </li>
            <li className="mb-2">
              {t('userContent.item3')}
            </li>
            <li className="mb-2">
              {t('userContent.item4')}
            </li>
          </ul>
        </div>
      </div>

      <div className="dark:bg-BlackLight mb-8 overflow-hidden rounded-lg bg-white shadow-md">
        <div className="p-6">
          <h2 className="mb-4 text-2xl font-semibold text-gray-900 dark:text-white">
            {t('externalLinks.title')}
          </h2>

          <p className="mb-4 text-gray-700 dark:text-gray-300">
            {t('externalLinks.paragraph1')}
          </p>
          <p className="mb-4 text-gray-700 dark:text-gray-300">
            {t('externalLinks.paragraph2')}
          </p>
          <p className="mb-4 text-gray-700 dark:text-gray-300">
            {t('externalLinks.paragraph3')}
          </p>
        </div>
      </div>

      <div className="dark:bg-BlackLight mb-8 overflow-hidden rounded-lg bg-white shadow-md">
        <div className="p-6">
          <h2 className="mb-4 text-2xl font-semibold text-gray-900 dark:text-white">
            {t('termination.title')}
          </h2>

          <p className="mb-4 text-gray-700 dark:text-gray-300">
            {t('termination.paragraph1')}
          </p>
          <p className="mb-4 text-gray-700 dark:text-gray-300">
            {t('termination.paragraph2')}
          </p>
          <p className="mb-4 text-gray-700 dark:text-gray-300">
            {t('termination.paragraph3')}
          </p>
        </div>
      </div>

      <div className="dark:bg-BlackLight mb-8 overflow-hidden rounded-lg bg-white shadow-md">
        <div className="p-6">
          <div className="mb-4 flex items-center">
            <FaExclamationTriangle className="mr-3 text-xl text-blue-600 dark:text-blue-400" />
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
              {t('disclaimer.title')}
            </h2>
          </div>

          <p className="mb-4 text-gray-700 dark:text-gray-300">
            {t('disclaimer.paragraph1')}
          </p>
          <p className="mb-4 text-gray-700 dark:text-gray-300">
            {t('disclaimer.paragraph2')}
          </p>
        </div>
      </div>

      <div className="dark:bg-BlackLight mb-8 overflow-hidden rounded-lg bg-white shadow-md">
        <div className="p-6">
          <h2 className="mb-4 text-2xl font-semibold text-gray-900 dark:text-white">
            {t('liability.title')}
          </h2>

          <p className="mb-4 text-gray-700 dark:text-gray-300">
            {t('liability.paragraph1')}
          </p>
        </div>
      </div>

      <div className="dark:bg-BlackLight mb-8 overflow-hidden rounded-lg bg-white shadow-md">
        <div className="p-6">
          <h2 className="mb-4 text-2xl font-semibold text-gray-900 dark:text-white">
            {t('changes.title')}
          </h2>

          <p className="mb-4 text-gray-700 dark:text-gray-300">
            {t('changes.paragraph1')}
          </p>
          <p className="mb-4 text-gray-700 dark:text-gray-300">
            {t('changes.paragraph2')}
          </p>
        </div>
      </div>

      <div className="dark:bg-BlackLight mb-8 overflow-hidden rounded-lg bg-white shadow-md">
        <div className="p-6">
          <h2 className="mb-4 text-2xl font-semibold text-gray-900 dark:text-white">
            {t('governingLaw.title')}
          </h2>

          <p className="mb-4 text-gray-700 dark:text-gray-300">
            {t('governingLaw.paragraph1')}
          </p>
          <p className="mb-4 text-gray-700 dark:text-gray-300">
            {t('governingLaw.paragraph2')}
          </p>
        </div>
      </div>

      <div className="dark:bg-BlackLight mb-8 overflow-hidden rounded-lg bg-white shadow-md">
        <div className="p-6">
          <h2 className="mb-4 text-2xl font-semibold text-gray-900 dark:text-white">
            {t('contact.title')}
          </h2>

          <p className="mb-4 text-gray-700 dark:text-gray-300">
            {t('contact.paragraph1')}
          </p>
          <ul className="mb-4 list-none text-gray-700 dark:text-gray-300">
            <li className="mb-2">{t('contact.email')}</li>
          </ul>
        </div>
      </div>
    </div>
  )
}