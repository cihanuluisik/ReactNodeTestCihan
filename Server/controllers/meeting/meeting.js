const MeetingService = require('../../services/MeetingService');
const MeetingValidationService = require('../../services/MeetingValidationService');

// Create service instances
const meetingService = new MeetingService();
// MeetingValidationService is already exported as an instance

/**
 * @api {post} /api/meeting Create a new meeting
 * @apiName CreateMeeting
 * @apiGroup Meetings
 * @apiVersion 1.0.0
 * 
 * @apiDescription Create a new meeting with validation and role-based access control
 * 
 * @apiHeader {String} Authorization Bearer token for authentication
 * 
 * @apiBody {String} title Meeting title (required, max 200 chars)
 * @apiBody {String} [agenda] Meeting agenda (max 1000 chars)
 * @apiBody {String} dateTime Meeting date and time in ISO format (required)
 * @apiBody {Number} [duration] Meeting duration in minutes (15-480)
 * @apiBody {String} [location] Meeting location (max 200 chars)
 * @apiBody {String[]} [attendes] Array of contact attendee IDs
 * @apiBody {String[]} [attendesLead] Array of lead attendee IDs
 * 
 * @apiSuccess {Object} meeting Created meeting object
 * @apiSuccess {String} meeting._id Meeting ID
 * @apiSuccess {String} meeting.title Meeting title
 * @apiSuccess {String} meeting.agenda Meeting agenda
 * @apiSuccess {String} meeting.dateTime Meeting date and time
 * @apiSuccess {Number} meeting.duration Meeting duration
 * @apiSuccess {String} meeting.location Meeting location
 * @apiSuccess {Object} meeting.createBy Creator information
 * @apiSuccess {String} meeting.timestamp Creation timestamp
 * 
 * @apiError {String} error Validation error message
 * @apiError {String} error Internal server error message
 * 
 * @apiExample {curl} Example usage:
 *     curl -X POST http://localhost:5001/api/meeting \
 *       -H "Content-Type: application/json" \
 *       -H "Authorization: Bearer YOUR_JWT_TOKEN" \
 *       -d '{
 *         "title": "Team Standup",
 *         "agenda": "Daily team sync",
 *         "dateTime": "2024-01-15T10:00:00.000Z",
 *         "duration": 30,
 *         "location": "Conference Room A"
 *       }'
 */
const add = async (req, res) => {
  try {
    // Validate input data
    const validationResult = await MeetingValidationService.validateCreateMeeting(req.body);
    if (!validationResult.success) {
      return res.status(400).json({ error: validationResult.error });
    }

    // Create meeting - use userId from the JWT token
    const result = await meetingService.createMeeting(validationResult.data, req.user.userId);
    
    if (!result.success) {
      return res.status(500).json({ error: result.error });
    }

    return res.status(201).json(result.meeting);
  } catch (error) {
    console.error('Meeting creation error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * @api {get} /api/meeting Get all meetings
 * @apiName GetMeetings
 * @apiGroup Meetings
 * @apiVersion 1.0.0
 * 
 * @apiDescription Retrieve all meetings with role-based filtering (SuperAdmin sees all, others see only their own)
 * 
 * @apiHeader {String} Authorization Bearer token for authentication
 * 
 * @apiParam {Number} [page=1] Page number for pagination
 * @apiParam {Number} [limit=10] Number of items per page
 * 
 * @apiSuccess {Object[]} meetings Array of meeting objects
 * @apiSuccess {String} meetings._id Meeting ID
 * @apiSuccess {String} meetings.title Meeting title
 * @apiSuccess {String} meetings.agenda Meeting agenda
 * @apiSuccess {String} meetings.dateTime Meeting date and time
 * @apiSuccess {Number} meetings.duration Meeting duration
 * @apiSuccess {String} meetings.location Meeting location
 * @apiSuccess {Object} meetings.createBy Creator information
 * @apiSuccess {String} meetings.timestamp Creation timestamp
 * 
 * @apiError {String} error Validation error message
 * @apiError {String} error Internal server error message
 * 
 * @apiExample {curl} Example usage:
 *     curl -X GET http://localhost:5001/api/meeting \
 *       -H "Authorization: Bearer YOUR_JWT_TOKEN"
 */
const index = async (req, res) => {
  try {
    // Validate query parameters
    const queryValidation = MeetingValidationService.validateQueryParams(req.query);
    if (!queryValidation.success) {
      return res.status(400).json({ error: queryValidation.error });
    }

    // Get user role from request
    const userRole = req.user.roles?.[0]?.name || 'user';
    
    // Get meetings
    const result = await meetingService.getAllMeetings(req.user.userId, userRole);
    
    if (!result.success) {
      return res.status(500).json({ error: result.error });
    }

    // Add createdByName field to each meeting
    const meetingsWithNames = result.meetings.map(meeting => {
      const meetingObj = meeting.toObject ? meeting.toObject() : meeting;
      return {
        ...meetingObj,
        createdByName: meeting.createBy?.firstName && meeting.createBy?.lastName 
          ? `${meeting.createBy.firstName} ${meeting.createBy.lastName}`
          : meeting.createBy?.username || 'Unknown User'
      };
    });

    return res.status(200).json(meetingsWithNames);
  } catch (error) {
    console.error('Get meetings error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * @api {get} /api/meeting/:id Get meeting by ID
 * @apiName GetMeeting
 * @apiGroup Meetings
 * @apiVersion 1.0.0
 * 
 * @apiDescription Retrieve a specific meeting by ID with role-based access control
 * 
 * @apiHeader {String} Authorization Bearer token for authentication
 * 
 * @apiParam {String} id Meeting ID
 * 
 * @apiSuccess {Object} meeting Meeting object
 * @apiSuccess {String} meeting._id Meeting ID
 * @apiSuccess {String} meeting.title Meeting title
 * @apiSuccess {String} meeting.agenda Meeting agenda
 * @apiSuccess {String} meeting.dateTime Meeting date and time
 * @apiSuccess {Number} meeting.duration Meeting duration
 * @apiSuccess {String} meeting.location Meeting location
 * @apiSuccess {Object} meeting.createBy Creator information
 * @apiSuccess {String} meeting.timestamp Creation timestamp
 * 
 * @apiError {String} error Meeting not found
 * @apiError {String} error Validation error message
 * @apiError {String} error Internal server error message
 * 
 * @apiExample {curl} Example usage:
 *     curl -X GET http://localhost:5001/api/meeting/507f1f77bcf86cd799439011 \
 *       -H "Authorization: Bearer YOUR_JWT_TOKEN"
 */
const view = async (req, res) => {
  try {
    // Validate meeting ID
    const idValidation = MeetingValidationService.validateMeetingId(req.params.id);
    if (!idValidation.success) {
      return res.status(400).json({ error: idValidation.error });
    }

    // Get user role from request
    const userRole = req.user.roles?.[0]?.name || 'user';
    
    // Get meeting
    const result = await meetingService.getMeetingById(req.params.id, req.user.userId, userRole);
    
    if (!result.success) {
      return res.status(404).json({ error: result.error });
    }

    // Add createdByName field to match client expectations
    const meetingWithName = {
      ...result.meeting.toObject ? result.meeting.toObject() : result.meeting,
      createdByName: result.meeting.createBy?.firstName && result.meeting.createBy?.lastName 
        ? `${result.meeting.createBy.firstName} ${result.meeting.createBy.lastName}`
        : result.meeting.createBy?.username || 'Unknown User'
    };

    return res.status(200).json(meetingWithName);
  } catch (error) {
    console.error('Get meeting error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * @api {put} /api/meeting/:id Update meeting
 * @apiName UpdateMeeting
 * @apiGroup Meetings
 * @apiVersion 1.0.0
 * 
 * @apiDescription Update an existing meeting with role-based access control
 * 
 * @apiHeader {String} Authorization Bearer token for authentication
 * 
 * @apiParam {String} id Meeting ID
 * 
 * @apiBody {String} [title] Meeting title (max 200 chars)
 * @apiBody {String} [agenda] Meeting agenda (max 1000 chars)
 * @apiBody {String} [dateTime] Meeting date and time in ISO format
 * @apiBody {Number} [duration] Meeting duration in minutes (15-480)
 * @apiBody {String} [location] Meeting location (max 200 chars)
 * @apiBody {String[]} [attendes] Array of contact attendee IDs
 * @apiBody {String[]} [attendesLead] Array of lead attendee IDs
 * 
 * @apiSuccess {Object} meeting Updated meeting object
 * @apiSuccess {String} meeting._id Meeting ID
 * @apiSuccess {String} meeting.title Meeting title
 * @apiSuccess {String} meeting.agenda Meeting agenda
 * @apiSuccess {String} meeting.dateTime Meeting date and time
 * @apiSuccess {Number} meeting.duration Meeting duration
 * @apiSuccess {String} meeting.location Meeting location
 * @apiSuccess {Object} meeting.createBy Creator information
 * @apiSuccess {String} meeting.updatedDate Last update timestamp
 * 
 * @apiError {String} error Meeting not found or access denied
 * @apiError {String} error Validation error message
 * @apiError {String} error Internal server error message
 * 
 * @apiExample {curl} Example usage:
 *     curl -X PUT http://localhost:5001/api/meeting/507f1f77bcf86cd799439011 \
 *       -H "Content-Type: application/json" \
 *       -H "Authorization: Bearer YOUR_JWT_TOKEN" \
 *       -d '{
 *         "title": "Updated Team Standup",
 *         "duration": 45
 *       }'
 */
const edit = async (req, res) => {
  try {
    // Validate meeting ID
    const idValidation = MeetingValidationService.validateMeetingId(req.params.id);
    if (!idValidation.success) {
      return res.status(400).json({ error: idValidation.error });
    }

    // Validate update data
    const validationResult = await MeetingValidationService.validateUpdateMeeting(req.body);
    if (!validationResult.success) {
      return res.status(400).json({ error: validationResult.error });
    }

    // Get user role from request
    const userRole = req.user.roles?.[0]?.name || 'user';
    
    // Update meeting
    const result = await meetingService.updateMeeting(
      req.params.id, 
      validationResult.data, 
      req.user.userId, 
      userRole
    );
    
    if (!result.success) {
      return res.status(404).json({ error: result.error });
    }

    return res.status(200).json(result.meeting);
  } catch (error) {
    console.error('Update meeting error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * Delete single meeting
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
/**
 * @api {delete} /api/meeting/:id Delete meeting
 * @apiName DeleteMeeting
 * @apiGroup Meetings
 * @apiVersion 1.0.0
 * 
 * @apiDescription Soft delete a meeting with role-based access control
 * 
 * @apiHeader {String} Authorization Bearer token for authentication
 * 
 * @apiParam {String} id Meeting ID
 * 
 * @apiSuccess {String} message Success message
 * 
 * @apiError {String} error Meeting not found or access denied
 * @apiError {String} error Validation error message
 * @apiError {String} error Internal server error message
 * 
 * @apiExample {curl} Example usage:
 *     curl -X DELETE http://localhost:5001/api/meeting/507f1f77bcf86cd799439011 \
 *       -H "Authorization: Bearer YOUR_JWT_TOKEN"
 */
const deleteData = async (req, res) => {
  try {
    // Validate meeting ID
    const idValidation = MeetingValidationService.validateMeetingId(req.params.id);
    if (!idValidation.success) {
      return res.status(400).json({ error: idValidation.error });
    }

    // Get user role from request
    const userRole = req.user.roles?.[0]?.name || 'user';
    
    // Delete meeting
    const result = await meetingService.deleteMeeting(req.params.id, req.user.userId, userRole);
    
    if (!result.success) {
      return res.status(404).json({ error: result.error });
    }

    return res.status(200).json({ message: result.message });
  } catch (error) {
    console.error('Delete meeting error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * Delete multiple meetings
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
/**
 * @api {post} /api/meeting/delete-multiple Delete multiple meetings
 * @apiName DeleteMultipleMeetings
 * @apiGroup Meetings
 * @apiVersion 1.0.0
 * 
 * @apiDescription Soft delete multiple meetings with role-based access control
 * 
 * @apiHeader {String} Authorization Bearer token for authentication
 * 
 * @apiBody {String[]} meetingIds Array of meeting IDs to delete
 * 
 * @apiSuccess {String} message Success message with count of deleted meetings
 * 
 * @apiError {String} error No meetings found or access denied
 * @apiError {String} error Validation error message
 * @apiError {String} error Internal server error message
 * 
 * @apiExample {curl} Example usage:
 *     curl -X POST http://localhost:5001/api/meeting/delete-multiple \
 *       -H "Content-Type: application/json" \
 *       -H "Authorization: Bearer YOUR_JWT_TOKEN" \
 *       -d '{
 *         "meetingIds": ["507f1f77bcf86cd799439011", "507f1f77bcf86cd799439012"]
 *       }'
 */
const deleteMany = async (req, res) => {
  try {
    // Accept both 'meetingIds' and 'ids' for backward compatibility
    const meetingIds = req.body.meetingIds || req.body.ids;
    
    if (!meetingIds || !Array.isArray(meetingIds)) {
      return res.status(400).json({ error: 'Meeting IDs array is required' });
    }

    // Validate meeting IDs
    const idsValidation = MeetingValidationService.validateMeetingIds(meetingIds);
    if (!idsValidation.success) {
      return res.status(400).json({ error: idsValidation.error });
    }

    // Get user role from request
    const userRole = req.user.roles?.[0]?.name || 'user';
    
    // Delete meetings
    const result = await meetingService.deleteMultipleMeetings(
      idsValidation.validIds, 
      req.user.userId, 
      userRole
    );
    
    if (!result.success) {
      return res.status(404).json({ error: result.error });
    }

    return res.status(200).json({ message: result.message });
  } catch (error) {
    console.error('Delete multiple meetings error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = { add, index, view, edit, deleteData, deleteMany };