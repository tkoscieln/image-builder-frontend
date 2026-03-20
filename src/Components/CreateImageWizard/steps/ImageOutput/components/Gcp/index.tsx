import React, { useState } from 'react';

import {
  Form,
  FormGroup,
  MenuToggle,
  MenuToggleElement,
  Radio,
  Select,
  SelectList,
  SelectOption,
} from '@patternfly/react-core';

import { ValidatedInput } from '@/Components/CreateImageWizard/ValidatedInput';
import {
  isGcpDomainValid,
  isGcpEmailValid,
} from '@/Components/CreateImageWizard/validators';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {
  changeGcpAccountType,
  changeGcpEmail,
  changeGcpShareMethod,
  selectGcpAccountType,
  selectGcpEmail,
  selectGcpShareMethod,
} from '@/store/slices/wizard';

export type GcpShareMethod = 'withGoogle' | 'withInsights';
export type GcpAccountType =
  | 'user'
  | 'serviceAccount'
  | 'group'
  | 'domain'
  | undefined;

export const GCP_ACCOUNT_TYPE_OPTIONS = new Map([
  ['user', 'Google account'],
  ['serviceAccount', 'Service account'],
  ['group', 'Google group'],
  ['domain', 'Google Workspace domain'],
]);

const Gcp = () => {
  const dispatch = useAppDispatch();

  const accountType = useAppSelector(selectGcpAccountType);
  const shareMethod = useAppSelector(selectGcpShareMethod);
  const gcpEmail = useAppSelector(selectGcpEmail);
  const [isOpen, setIsOpen] = useState(false);

  const accountTypeOptions = GCP_ACCOUNT_TYPE_OPTIONS;

  const onToggleClick = () => {
    setIsOpen(!isOpen);
  };

  const toggle = (toggleRef: React.Ref<MenuToggleElement>) => (
    <MenuToggle
      ref={toggleRef}
      onClick={onToggleClick}
      isExpanded={isOpen}
      style={
        {
          minWidth: '50%',
          maxWidth: '100%',
        } as React.CSSProperties
      }
      data-testid='arch_select'
    >
      {accountType
        ? accountTypeOptions.get(accountType)
        : 'Select account type'}
    </MenuToggle>
  );

  return (
    <Form className='pf-v6-u-pb-md'>
      <FormGroup label='Select image sharing' isRequired>
        <Radio
          id='share-with-google'
          label='Share image with a Google account'
          name='gcp-share-method-type'
          isChecked={shareMethod === 'withGoogle'}
          onChange={() => {
            dispatch(changeGcpShareMethod('withGoogle'));
          }}
          autoFocus
        />
        <Radio
          id='share-with-insights'
          label={`Share image with Red Hat Lightspeed only`}
          name='gcp-share-method-type'
          isChecked={shareMethod === 'withInsights'}
          onChange={() => {
            dispatch(changeGcpShareMethod('withInsights'));
          }}
        />
      </FormGroup>
      {shareMethod === 'withGoogle' && (
        <>
          <FormGroup label='Account type' isRequired>
            <Select
              isOpen={isOpen}
              selected={accountType}
              onSelect={(_event, value) => {
                dispatch(changeGcpAccountType(value));
                setIsOpen(false);
              }}
              onOpenChange={(isOpen: boolean) => setIsOpen(isOpen)}
              toggle={toggle}
              shouldFocusToggleOnSelect
            >
              <SelectList>
                <SelectOption key='user' value='user'>
                  {accountTypeOptions.get('user')}
                </SelectOption>
                <SelectOption key='serviceAccount' value='serviceAccount'>
                  {accountTypeOptions.get('serviceAccount')}
                </SelectOption>
                <SelectOption key='group' value='group'>
                  {accountTypeOptions.get('group')}
                </SelectOption>
                <SelectOption key='domain' value='domain'>
                  {accountTypeOptions.get('domain')}
                </SelectOption>
              </SelectList>
            </Select>
          </FormGroup>
          <FormGroup
            label={
              accountType === 'domain' ? 'Domain' : 'Principal (e-mail address)'
            }
            isRequired
          >
            <ValidatedInput
              aria-label='google principal'
              value={gcpEmail || ''}
              validator={
                accountType === 'domain' ? isGcpDomainValid : isGcpEmailValid
              }
              onChange={(_event, value) => dispatch(changeGcpEmail(value))}
              helperText={
                !gcpEmail
                  ? accountType === 'domain'
                    ? 'Domain is required'
                    : 'E-mail address is required'
                  : accountType === 'domain'
                    ? 'Please enter a valid domain'
                    : 'Please enter a valid e-mail address'
              }
              handleClear={() => dispatch(changeGcpEmail(''))}
            />
          </FormGroup>
        </>
      )}
    </Form>
  );
};

export default Gcp;
