import React from 'react';

import {
  Radio,
  Text,
  Form,
  Title,
  FormGroup,
  TextInput,
  Gallery,
  GalleryItem,
  HelperText,
  HelperTextItem,
  Button,
} from '@patternfly/react-core';
import { ExternalLinkAltIcon } from '@patternfly/react-icons';

import { AwsAccountId } from './AwsAccountId';
import { AwsSourcesSelect } from './AwsSourcesSelect';

import { useAppDispatch, useAppSelector } from '../../../../../store/hooks';
import {
  changeAwsAccountId,
  changeAwsShareMethod,
  changeAwsSource,
  selectAwsAccountId,
  selectAwsShareMethod,
} from '../../../../../store/wizardSlice';
import { ValidatedTextInput } from '../../../ValidatedTextInput';
import { isAwsAccountIdValid } from '../../../validators';

export type AwsShareMethod = 'manual' | 'sources';

// The Sources API only defines a V1ListSourceResponseItem[] type
export type V1ListSourceResponseItem = {
  id?: string;
  name?: string;
  source_type_id?: string;
  uid?: string;
};

const SourcesButton = () => {
  return (
    <Button
      component="a"
      target="_blank"
      variant="link"
      icon={<ExternalLinkAltIcon />}
      iconPosition="right"
      isInline
      href={'settings/sources'}
    >
      Create and manage sources here
    </Button>
  );
};

const Aws = () => {
  const dispatch = useAppDispatch();

  const shareMethod = useAppSelector((state) => selectAwsShareMethod(state));
  const shareWithAccount = useAppSelector((state) => selectAwsAccountId(state));

  return (
    <Form>
      <Title headingLevel="h2">Target environment - Amazon Web Services</Title>
      <Text>
        Your image will be uploaded to AWS and shared with the account you
        provide below.
      </Text>
      <Text>
        <b>The shared image will expire within 14 days.</b> To permanently
        access the image, copy the image, which will be shared to your account
        by Red Hat, to your own AWS account.
      </Text>
      <FormGroup label="Share method:">
        <Radio
          id="radio-with-description"
          label="Use an account configured from Sources."
          name="radio-7"
          description="Use a configured sources to launch environments directly from the console."
          isChecked={shareMethod === 'sources'}
          onChange={() => {
            dispatch(changeAwsSource(undefined));
            dispatch(changeAwsAccountId(undefined));
            dispatch(changeAwsShareMethod('sources'));
          }}
        />
        <Radio
          id="radio"
          label="Manually enter an account ID."
          name="radio-8"
          isChecked={shareMethod === 'manual'}
          onChange={() => {
            dispatch(changeAwsSource(undefined));
            dispatch(changeAwsAccountId(undefined));
            dispatch(changeAwsShareMethod('manual'));
          }}
        />
      </FormGroup>
      {shareMethod === 'sources' && (
        <>
          <AwsSourcesSelect />
          <SourcesButton />
          <Gallery hasGutter>
            <GalleryItem>
              <TextInput
                readOnlyVariant="default"
                isRequired
                id="someid"
                value="us-east-1"
              />
              <HelperText>
                <HelperTextItem component="div" variant="indeterminate">
                  Images are built in the default region but can be copied to
                  other regions later.
                </HelperTextItem>
              </HelperText>
            </GalleryItem>
            <GalleryItem>
              <AwsAccountId />
            </GalleryItem>
          </Gallery>
        </>
      )}
      {shareMethod === 'manual' && (
        <>
          <FormGroup label="AWS account ID" isRequired>
            <ValidatedTextInput
              ariaLabel="aws account id"
              value={shareWithAccount || ''}
              validator={isAwsAccountIdValid}
              onChange={(_event, value) => dispatch(changeAwsAccountId(value))}
              helperText="Should be 12 characters long."
            />
          </FormGroup>
          <FormGroup label="Default Region" isRequired>
            <TextInput
              value={'us-east-1'}
              type="text"
              aria-label="default region"
              readOnlyVariant="default"
            />
          </FormGroup>
        </>
      )}
    </Form>
  );
};

export default Aws;