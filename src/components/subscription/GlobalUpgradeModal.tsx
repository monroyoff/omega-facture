'use client';

import React from 'react';
import { useInvoices } from '@/lib/store/invoice-context';
import { UpgradePlanModal } from './UpgradePlanModal';

export const GlobalUpgradeModal: React.FC = () => {
  const { isUpgradeModalOpen, setIsUpgradeModalOpen, upgradeModalDefaultPlan } = useInvoices();

  return (
    <UpgradePlanModal
      isOpen={isUpgradeModalOpen}
      onClose={() => setIsUpgradeModalOpen(false)}
      defaultPlan={upgradeModalDefaultPlan}
    />
  );
};
