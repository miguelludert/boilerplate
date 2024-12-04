When allowing a user to change their email address in an application, it's important to ensure security, usability, and proper handling of verification. Here's the best-practice application flow for changing an email address:

---

### 1. **Authorization**
   - **Ensure the user is authenticated**: Verify the user's session or authentication token before proceeding with any email change.
   - Use mechanisms like **JWT validation** (if you're using token-based authentication) or **session checks**.

---

### 2. **Request New Email**
   - **Frontend**:
     - Provide a form for the user to input their new email address.
     - Validate the email address format client-side for immediate feedback.
   - **Backend**:
     - Validate the email address format server-side to ensure it meets requirements.
     - Check that the new email does not already exist in your system (to prevent duplicates).

---

### 3. **Send Verification Code/Link**
   - **Generate a Verification Code or Token**:
     - Create a time-limited, unique token associated with the new email address.
     - Store this token in your database or as a short-lived, signed JWT.
   - **Send Verification Email**:
     - Email the user with a verification code or a link that includes the token.
     - The email should also explain why they are receiving the email (to reduce phishing concerns).

---

### 4. **Verification Step**
   - **Frontend**:
     - Provide an interface for the user to enter the verification code or handle token-based links to confirm the new email.
   - **Backend**:
     - Validate the code or token:
       - Check the token’s validity (e.g., not expired or tampered).
       - Ensure the token matches the expected new email address.
     - If valid, proceed to update the user's email in the database.

---

### 5. **Update Email in User Management System**
   - For **Cognito**, use the `AdminUpdateUserAttributesCommand` to set the `email` attribute and optionally `email_verified` to `false` (if re-verification is needed).
   - Example flow for Cognito:
     1. Update the `email` attribute in Cognito.
     2. Cognito can automatically send a verification email if the `email_verified` attribute is set to `false`.
     3. Wait for the user to verify the new email before fully enabling the email for login or communication.

---

### 6. **Post-Update Notifications**
   - **Notify both emails**:
     - Send a notification to the **old email** to inform the user that their email has been changed (security measure).
     - Send a confirmation to the **new email** confirming the change.
   - **Re-authentication** (optional):
     - Depending on your app's security requirements, you may log out the user or require re-authentication to continue using the app.

---

### 7. **Error Handling**
   - **Frontend**:
     - Show clear error messages for issues like invalid email, token expiration, or duplicate email.
   - **Backend**:
     - Rate-limit email change requests to prevent abuse.
     - Handle token expiration securely and allow token regeneration if necessary.

---

### Example Application Flow Diagram
1. **User inputs new email address** →  
2. **Backend validates and sends verification code/link** →  
3. **User confirms via verification code/link** →  
4. **Backend updates the email in the user management system** →  
5. **System sends confirmation emails to both old and new addresses**.

---

### Additional Best Practices
1. **Two-Factor Authentication (2FA)**:
   - Require 2FA for high-security applications to authorize the email change process.

2. **Email Verification Links**:
   - Use signed, time-limited tokens in verification links to prevent unauthorized access.

3. **Prevent Enumeration Attacks**:
   - Ensure that error responses don’t reveal whether an email exists in your system.

4. **Audit Trail**:
   - Log email change events for security and troubleshooting purposes.

---

This flow ensures that the email change process is secure, user-friendly, and aligns with industry best practices for authentication and verification.