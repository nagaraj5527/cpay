import { Router } from 'express';
import {
  createTicket,
  getMyTickets,
  getAllTickets,
  getTicketDetails,
  addMessage,
  updateTicketStatus
} from '../controllers/support.controller.js';
import { authenticateToken, authorizeRoles } from '../middleware/auth.middleware.js';

const router = Router();

router.post('/tickets', authenticateToken, createTicket);
router.get('/tickets/my', authenticateToken, getMyTickets);
router.get('/tickets/all', authenticateToken, authorizeRoles('SUPER_ADMIN'), getAllTickets);
router.get('/tickets/:ticketId', authenticateToken, getTicketDetails);
router.post('/tickets/:ticketId/messages', authenticateToken, addMessage);
router.put('/tickets/:ticketId/status', authenticateToken, authorizeRoles('SUPER_ADMIN'), updateTicketStatus);

export default router;
