import {
  SESClient,
  SendEmailCommand,
  SendEmailCommandInput,
} from '@aws-sdk/client-ses';

// Initialize the AWS SES client
const ses = new SESClient({ region: 'us-east-1' });

export interface EmailProps {
  subject: string;
  html?: string;
  plainText: string;
  recipients: string[];
  source: string;
}

export const sendEmal = async ({
  source,
  recipients,
  subject,
  html,
  plainText,
}: EmailProps) => {
  // Construct email parameters
  const params: SendEmailCommandInput = {
    Destination: {
      ToAddresses: recipients,
    },
    Message: {
      Body: {
        Html: {
          Data: html,
        },
        Text: {
          Data: plainText,
        },
      },
      Subject: {
        Data: subject,
      },
    },
    Source: source,
  };

  // Send the email using SES
  const command = new SendEmailCommand(params);
  await ses.send(command);
};
