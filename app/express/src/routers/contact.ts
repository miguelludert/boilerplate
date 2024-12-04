import { Router, Request, Response } from 'express';
import { sendEmal } from '../services/email';
import { getContactFormRecipient, getContactFormSource } from '../constants';

export const contactRouter = Router();

// POST route to handle form submission
contactRouter.post('/', async (req: Request, res: Response) => {
  try {
    // Extract form data from the request body
    const { name, email, subject, message } = req.body;

    // Validate required fields
    if (!name || !email || !subject || !message) {
      return res.status(400).json({
        error: 'Missing required fields: name, email, subject, or message',
      });
    }

    await sendEmal({
      source: getContactFormSource(),
      recipients: [getContactFormRecipient()],
      subject: `Contact Form: ${subject} from ${name}`,
      plainText: message,
    });

    // Respond with a success message
    res.status(200).json({ message: 'Your message was sent successfully!' });
  } catch (error: any) {
    console.error('Error sending email:', error);
    res.status(500).json({
      error: 'Failed to send your message. Please try again later.',
    });
  }
});
