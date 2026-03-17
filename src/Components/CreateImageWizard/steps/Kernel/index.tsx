import React from 'react';

import { Content, Form, Label, Title } from '@patternfly/react-core';
import { InfoCircleIcon } from '@patternfly/react-icons';

import { useGetOscapCustomizationsQuery } from '@/store/api/backend';
import { useAppSelector } from '@/store/hooks';
import { asDistribution } from '@/store/typeGuards';
import {
  selectComplianceProfileID,
  selectDistribution,
} from '@/store/wizardSlice';

import KernelArguments from './components/KernelArguments';
import KernelName from './components/KernelName';

import { CustomizationLabels } from '../../../sharedComponents/CustomizationLabels';

const KernelStep = () => {
  const release = useAppSelector(selectDistribution);
  const complianceProfileID = useAppSelector(selectComplianceProfileID);

  const { data: oscapProfileInfo } = useGetOscapCustomizationsQuery(
    {
      distribution: asDistribution(release),
      // @ts-ignore if complianceProfileID is undefined the query is going to get skipped, so it's safe here to ignore the linter here
      profile: complianceProfileID,
    },
    {
      skip: !complianceProfileID,
    },
  );

  const requiredByOpenSCAPCount =
    oscapProfileInfo?.kernel?.append?.split(' ').length;

  return (
    <Form>
      <CustomizationLabels customization='kernel' />
      <Title
        headingLevel='h1'
        size='xl'
        className='pf-v6-u-display-flex pf-v6-u-align-items-center'
      >
        Kernel
        {requiredByOpenSCAPCount && (
          <Label icon={<InfoCircleIcon />} className='pf-v6-u-ml-sm'>
            {requiredByOpenSCAPCount} Added by OpenSCAP
          </Label>
        )}
      </Title>
      <Content>
        Choose a kernel package and append specific boot parameters to customize
        how your image initializes its core operating environment.
      </Content>
      <KernelName />
      <KernelArguments />
    </Form>
  );
};

export default KernelStep;
