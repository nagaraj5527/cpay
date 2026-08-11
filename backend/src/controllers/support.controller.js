import * as supportService from '../services/support.service.js';

export async function createTicket(req, res, next) {
  try {
    const userId = req.user.user_id;
    const { subject, description, priority } = req.body;

    if (!subject || !description) {
      return res.status(400).json({
        success: false,
        message: 'Subject and description are required'
      });
    }

    const ticket = await supportService.createSupportTicket({
      userId,
      subject,
      description,
      priority
    });

    return res.status(201).json({
      success: true,
      message: 'Support ticket created successfully',
      data: ticket
    });
  } catch (err) {
    next(err);
  }
}

export async function getMyTickets(req, res, next) {
  try {
    const userId = req.user.user_id;
    const tickets = await supportService.getUserTickets(userId);

    return res.status(200).json({
      success: true,
      data: tickets
    });
  } catch (err) {
    next(err);
  }
}

export async function getAllTickets(req, res, next) {
  try {
    const tickets = await supportService.getAllTickets();

    return res.status(200).json({
      success: true,
      data: tickets
    });
  } catch (err) {
    next(err);
  }
}

export async function getTicketDetails(req, res, next) {
  try {
    const { ticketId } = req.params;
    const ticket = await supportService.getTicketDetails(ticketId);

    if (!ticket) {
      return res.status(404).json({
        success: false,
        message: 'Ticket not found'
      });
    }

    return res.status(200).json({
      success: true,
      data: ticket
    });
  } catch (err) {
    next(err);
  }
}

export async function addMessage(req, res, next) {
  try {
    const senderId = req.user.user_id;
    const { ticketId } = req.params;
    const { message, attachmentUrl } = req.body;

    if (!message) {
      return res.status(400).json({
        success: false,
        message: 'Message content is required'
      });
    }

    const msg = await supportService.addSupportMessage({
      ticketId,
      senderId,
      message,
      attachmentUrl
    });

    return res.status(201).json({
      success: true,
      data: msg
    });
  } catch (err) {
    next(err);
  }
}

export async function updateTicketStatus(req, res, next) {
  try {
    const resolverId = req.user.user_id;
    const { ticketId } = req.params;
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({
        success: false,
        message: 'Status is required'
      });
    }

    const updated = await supportService.updateTicketStatus(ticketId, status, resolverId);
    return res.status(200).json({
      success: true,
      data: updated
    });
  } catch (err) {
    next(err);
  }
}
