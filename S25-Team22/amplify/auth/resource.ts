import { defineAuth } from '@aws-amplify/backend';
import { referenceAuth } from '@aws-amplify/backend';

export const auth = referenceAuth({
  userPoolId: 'us-east-1_IWK6ObrXo',
  identityPoolId: 'us-east-1:4cd87f2d-0d6a-45cd-8a65-1ed131931d5e',
  authRoleArn: 'arn:aws:iam::274815321855:role/service-role/team22-authIDRole',
  unauthRoleArn: 'arn:aws:iam::274815321855:role/service-role/team22-unauthIDRole',
  userPoolClientId: '6nmvfvt8micn1h45sk8g4p8di7',
});

