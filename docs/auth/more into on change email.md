AWS Cognito provides built-in support for much of the email change flow, but it doesn't handle everything out of the box. Here's what Cognito covers and what you might need to build:

---

### What AWS Cognito Provides for Email Changes

1. **Email Attribute Management**:
   - The `email` is a standard attribute in Cognito. You can update it using the `AdminUpdateUserAttributesCommand` or `UpdateUserAttributesCommand`.
   - When the email is updated, Cognito can optionally send a **verification email** to the new address if the `email_verified` attribute is set to `false`.

2. **Email Verification**:
   - Cognito sends an email with a verification link or code to the new email address automatically.
   - The verification status (`email_verified`) is updated to `true` upon confirmation.

3. **Security Notifications**:
   - Cognito can send notifications (to the new or old email) when attributes are updated, depending on your configuration.

4. **Session Management**:
   - Cognito automatically handles session invalidation for certain user actions (like password changes), but not necessarily for email changes. If required, you can explicitly revoke tokens using `AdminUserGlobalSignOut`.

---

### What You Need to Build

While Cognito simplifies the process, there are gaps where you'll need additional infrastructure or logic:

1. **Frontend to Collect New Email**:
   - You’ll need to build a UI for users to input the new email address and, optionally, a verification code.
   - This includes client-side validation for email format.

2. **Custom Validation Logic**:
   - Cognito does not natively check for email duplication across users. If required, you'll need to implement a mechanism (e.g., querying Cognito or a separate database) to ensure the new email isn't already in use.

3. **Optional Pre-Validation for Email**:
   - If you want to validate the email before updating it in Cognito (e.g., check MX records, ensure it's a real domain), you'll need to add infrastructure for this.

4. **Re-authentication Requirement**:
   - Cognito does not enforce re-authentication for attribute updates. If required for your app's security, you'll need to implement this using session checks or multi-factor authentication (MFA).

5. **Old Email Notification**:
   - Cognito does not automatically send a notification to the old email address. If you require this, you'll need to build custom logic (e.g., using an SNS or SES notification).

6. **Audit Logging**:
   - Cognito does not provide built-in logging for email change events. If you need an audit trail, you’ll need to integrate with AWS CloudWatch or build your own logging mechanism.

7. **Error Handling and Custom Messaging**:
   - Cognito does not handle messaging for frontend errors like token expiration or invalid verification codes. You’ll need to manage error handling and user feedback on your frontend.

---

### Custom Infrastructure You Might Need

1. **Lambda Triggers**:
   - **PreSignUp / PreAuthentication Trigger**:
     - Use to validate email uniqueness if necessary.
   - **PostConfirmation Trigger**:
     - Use to perform actions like sending a notification to the old email or logging changes.
   - **CustomMessage Trigger**:
     - Customize the email verification messages sent by Cognito.

2. **Email Notification Service**:
   - If you want to notify the old email address about the change, you can use Amazon SES or SNS to send a custom notification.

3. **Database for Additional Checks**:
   - If Cognito is not the sole source of truth for user data, you might need a database to track user email updates or perform cross-checks.

4. **CloudWatch Logs**:
   - Use to log user update actions for audit purposes.

---

### Minimal Infrastructure for a Basic Email Change Flow

If you want to keep the setup simple and rely heavily on Cognito:
1. Use `UpdateUserAttributesCommand` to update the email.
2. Set `email_verified` to `false` to trigger Cognito's built-in verification.
3. Build a UI for the user to input the new email and verify it.
4. Optionally, use Lambda triggers for custom notifications or validation.

---

### Additional Features You Might Build

1. **Email Change Confirmation by Old Email**:
   - Cognito does not require the old email's approval for an email change. If you need this extra security step, you'll need to implement it outside of Cognito.

2. **Resend Verification Code**:
   - While Cognito handles sending the initial verification email, you may want to add a "resend code" option in your frontend.

3. **Handling Verification Link Expiry**:
   - If the verification link expires, you’ll need logic for the user to re-initiate the process.

---

### Summary

- **Cognito Handles**:
  - Updating the `email` attribute.
  - Sending a verification email to the new address.
  - Marking the `email_verified` attribute as `true` upon confirmation.

- **You Need to Build**:
  - Frontend for collecting the new email.
  - Custom validation for duplicate emails or specific domain checks.
  - Notifications to the old email (if needed).
  - Optional logging or audit trail.

With Cognito, you won’t need to build the email verification flow from scratch, but additional features like old email notifications, duplicate checks, or re-authentication may require custom implementation.