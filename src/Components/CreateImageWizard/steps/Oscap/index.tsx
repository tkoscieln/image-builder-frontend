import React, { useEffect } from 'react';

import {
  Button,
  Form,
  FormGroup,
  Radio,
  Text,
  Title,
} from '@patternfly/react-core';
import { ExternalLinkAltIcon } from '@patternfly/react-icons';
import useChrome from '@redhat-cloud-services/frontend-components/useChrome';

import OscapOnPremSpinner from './components/OnPremSpinner';
import OscapOnPremWarning from './components/OnPremWarning';
import Oscap from './Oscap';
import { removeBetaFromRelease } from './removeBetaFromRelease';

import {
  COMPLIANCE_AND_VULN_SCANNING_URL,
  COMPLIANCE_URL,
} from '../../../../constants';
import {
  useBackendPrefetch,
  useGetOscapCustomizationsQuery,
} from '../../../../store/backendApi';
import { useAppDispatch, useAppSelector } from '../../../../store/hooks';
import {
  ComplianceType,
  selectComplianceProfileID,
  changeCompliance,
  changeComplianceType,
  changeEnabledServices,
  changeMaskedServices,
  changeDisabledServices,
  removePackage,
  changeFileSystemConfigurationType,
  selectDistribution,
  selectComplianceType,
  clearKernelAppend,
} from '../../../../store/wizardSlice';
import {
  useFlag,
  useGetEnvironment,
} from '../../../../Utilities/useGetEnvironment';
import { useOnPremOpenSCAPAvailable } from '../../../../Utilities/useOnPremOpenSCAP';

const OscapContent = () => {
  const dispatch = useAppDispatch();
  const { analytics } = useChrome();
  const { isFedoraEnv } = useGetEnvironment();
  const complianceEnabled = useFlag('image-builder.compliance.enabled');
  const complianceType = useAppSelector(selectComplianceType);
  const profileID = useAppSelector(selectComplianceProfileID);
  const prefetchOscapProfile = useBackendPrefetch('getOscapProfiles', {});
  const release = removeBetaFromRelease(useAppSelector(selectDistribution));

  const { data: currentProfileData } = useGetOscapCustomizationsQuery(
    {
      distribution: release,
      // @ts-ignore if openScapProfile is undefined the query is going to get skipped
      profile: profileID,
    },
    { skip: !profileID }
  );

  useEffect(() => {
    prefetchOscapProfile({ distribution: release });
    // This useEffect hook should run *only* on mount and therefore has an empty
    // dependency array. eslint's exhaustive-deps rule does not support this use.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleTypeChange = (complianceType: string) => {
    dispatch(changeComplianceType(complianceType as ComplianceType));

    // Avoid showing profile information when switching between types by
    // clearing the compliance data.
    dispatch(
      changeCompliance({
        profileID: undefined,
        policyID: undefined,
        policyTitle: undefined,
      })
    );
    const pkgs = currentProfileData?.packages || [];
    for (const pkg of pkgs) {
      dispatch(removePackage(pkg));
    }
    dispatch(changeFileSystemConfigurationType('automatic'));
    dispatch(changeEnabledServices([]));
    dispatch(changeMaskedServices([]));
    dispatch(changeDisabledServices([]));
    dispatch(clearKernelAppend());
  };

  if (!process.env.IS_ON_PREMISE && !isFedoraEnv) {
    if (complianceEnabled) {
      analytics.screen('ib-createimagewizard-step-security-compliance');
    } else {
      analytics.screen('ib-createimagewizard-step-security-openscap');
    }
  }

  return (
    <Form>
      <Title headingLevel="h1" size="xl">
        {complianceEnabled ? 'Compliance' : 'OpenSCAP profile'}
      </Title>
      {complianceEnabled && (
        <FormGroup>
          <Radio
            id="openscap radio openscap type"
            label="OpenSCAP"
            name="oscap-radio-openscap"
            isChecked={complianceType === 'openscap'}
            onChange={() => handleTypeChange('openscap')}
          />
          <Radio
            id="openscap radio compliance type"
            label="Insights compliance"
            name="oscap-radio-compliance"
            isChecked={complianceType === 'compliance'}
            onChange={() => handleTypeChange('compliance')}
          />
        </FormGroup>
      )}
      {(!complianceEnabled || complianceType === 'openscap') && (
        <Text>
          OpenSCAP enables you to automatically monitor the adherence of your
          registered RHEL systems to a selected regulatory compliance profile.
          <br />
          <Button
            component="a"
            target="_blank"
            variant="link"
            icon={<ExternalLinkAltIcon />}
            iconPosition="right"
            isInline
            href={COMPLIANCE_AND_VULN_SCANNING_URL}
          >
            Documentation
          </Button>
        </Text>
      )}
      {complianceType === 'compliance' && (
        <Text>
          Insights compliance enables you to monitor the adherence of your
          registered RHEL systems to a selected compliance policy.
          <br />
          <Button
            component="a"
            target="_blank"
            variant="link"
            icon={<ExternalLinkAltIcon />}
            iconPosition="right"
            isInline
            href={COMPLIANCE_URL}
          >
            Define new policies in Insights Compliance
          </Button>
          <br />
          <Button
            component="a"
            target="_blank"
            variant="link"
            icon={<ExternalLinkAltIcon />}
            iconPosition="right"
            isInline
            href={COMPLIANCE_AND_VULN_SCANNING_URL}
          >
            Documentation
          </Button>
        </Text>
      )}
      <Oscap />
    </Form>
  );
};

const OnPremOscapStep = () => {
  const [onPremOpenSCAPAvailable, isLoading] = useOnPremOpenSCAPAvailable();

  if (isLoading) {
    return <OscapOnPremSpinner />;
  }

  if (!onPremOpenSCAPAvailable) {
    return <OscapOnPremWarning />;
  }

  return <OscapContent />;
};

const OscapStep = process.env.IS_ON_PREMISE ? OnPremOscapStep : OscapContent;

export default OscapStep;
