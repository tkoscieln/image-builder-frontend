import React from 'react';

import { Checkbox, Content, FormGroup } from '@patternfly/react-core';

import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { changeAapEnabled, selectAapEnabled } from '@/store/slices/wizard';

import AAPRegistration from './AAP';

const AnsibleAutomationPlatform = () => {
  const dispatch = useAppDispatch();
  const aapEnabled = useAppSelector(selectAapEnabled);

  return (
    <FormGroup label='Ansible Automation Platform'>
      <Content>
        <Checkbox
          label='Register to Ansible Automation Platform'
          isChecked={aapEnabled}
          onChange={(_event, checked) => {
            dispatch(changeAapEnabled(checked));
          }}
          id='register-aap'
          name='aap-registration'
          body={aapEnabled && <AAPRegistration />}
        />
      </Content>
    </FormGroup>
  );
};

export default AnsibleAutomationPlatform;
