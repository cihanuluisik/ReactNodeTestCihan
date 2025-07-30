const User = require('../../model/schema/user')
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { config } = require('../../config/environment');
const DynamicValidationService = require('../../services/DynamicValidationService');
const AuthValidationService = require('../../services/AuthValidationService');
const AuthService = require('../../services/AuthService');
const UserService = require('../../services/UserService');
const authService = new AuthService();

/**
 * @api {post} /api/user/admin-register Create Admin User
 * @apiName AdminRegister
 * @apiGroup Authentication
 * @apiVersion 1.0.0
 * 
 * @apiDescription Create a new admin user with elevated privileges
 * 
 * @apiBody {String} username User's email address
 * @apiBody {String} password User's password (minimum 6 characters)
 * @apiBody {String} firstName User's first name
 * @apiBody {String} lastName User's last name
 * @apiBody {Number} [phoneNumber] User's phone number (10 digits)
 * 
 * @apiSuccess {String} message Success message
 * 
 * @apiError {String} message Error message
 * @apiError {String} error Error details
 * 
 * @apiExample {curl} Example usage:
 *     curl -X POST http://localhost:5001/api/user/admin-register \
 *       -H "Content-Type: application/json" \
 *       -d '{
 *         "username": "admin@example.com",
 *         "password": "admin123",
 *         "firstName": "Admin",
 *         "lastName": "User",
 *         "phoneNumber": 1234567890
 *       }'
 */
const adminRegister = async (req, res) => {
    try {
        // Validate request body size
        if (!AuthValidationService.validateBodySize(req.body)) {
            return res.status(413).json({ error: 'Request body too large' });
        }

        // Sanitize and validate input
        const sanitizedData = AuthValidationService.sanitizeInput(req.body);
        const { error, value } = await AuthValidationService.validateAdminRegisterData(sanitizedData);
        
        if (error) {
            return res.status(400).json({ error: error.details[0].message });
        }

        const { username, password, firstName, lastName, phoneNumber } = value;
        
        // Use UserService for admin creation
        const result = await UserService.createAdminUser({ username, password, firstName, lastName, phoneNumber });
        
        if (!result.success) {
            return res.status(400).json({ message: result.error });
        }
        
        res.status(200).json({ message: 'Admin created successfully' });
    } catch (error) {
        console.error('Admin registration error:', error);
        res.status(500).json({ error: 'An error occurred during admin registration' });
    }
}

/**
 * @api {post} /api/user/register User Registration
 * @apiName Register
 * @apiGroup Authentication
 * @apiVersion 1.0.0
 * 
 * @apiDescription Register a new user account
 * 
 * @apiBody {String} username User's email address
 * @apiBody {String} password User's password (minimum 6 characters)
 * @apiBody {String} firstName User's first name
 * @apiBody {String} lastName User's last name
 * @apiBody {Number} [phoneNumber] User's phone number (10 digits)
 * 
 * @apiSuccess {String} message Success message
 * 
 * @apiError {String} error Validation error message
 * @apiError {String} message Error message
 * 
 * @apiExample {curl} Example usage:
 *     curl -X POST http://localhost:5001/api/user/register \
 *       -H "Content-Type: application/json" \
 *       -d '{
 *         "username": "user@example.com",
 *         "password": "password123",
 *         "firstName": "John",
 *         "lastName": "Doe",
 *         "phoneNumber": 1234567890
 *       }'
 */
const register = async (req, res) => {
    try {
        // Validate request body size
        if (!AuthValidationService.validateBodySize(req.body)) {
            return res.status(413).json({ error: 'Request body too large' });
        }

        // Sanitize and validate input
        const sanitizedData = AuthValidationService.sanitizeInput(req.body);
        const { error, value } = await AuthValidationService.validateRegisterData(sanitizedData);
        
        if (error) {
            return res.status(400).json({ error: error.details[0].message });
        }

        const { username, password, firstName, lastName, phoneNumber } = value;

        // Use UserService for user creation
        const result = await UserService.createUser({ username, password, firstName, lastName, phoneNumber });
        
        if (!result.success) {
            return res.status(401).json({ message: result.error });
        }

        res.status(200).json({ message: 'User created successfully' });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ error: 'An error occurred during registration' });
    }
}

const index = async (req, res) => {
    try {
        const query = { ...req.query, deleted: false };

        let user = await User.find(query).populate({
            path: 'roles'
        }).exec()

        res.status(200).json({ user });
    } catch (error) {
        res.status(500).json({ error });
    }
}

const view = async (req, res) => {
    try {
        const user = await UserService.findUserById(req.params.id);
        if (!user) return res.status(404).json({ message: "no Data Found." })
        res.status(200).json(user)
    } catch (error) {
        console.log(error)
        res.status(500).json({ error });
    }
}

let deleteData = async (req, res) => {
    try {
        const userId = req.params.id;

        // Assuming you have retrieved the user document using userId
        const user = await User.findById(userId);
        if (process.env.DEFAULT_USERS.includes(user?.username)) {
            return res.status(400).json({ message: `You don't have access to delete ${username}` })
        }
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found', });
        }
        if (user.role !== 'superAdmin') {
            // Update the user's 'deleted' field to true
            await User.updateOne({ _id: userId }, { $set: { deleted: true } });
            res.send({ message: 'Record deleted Successfully', });
        } else {
            res.status(404).json({ message: 'admin can not delete', });
        }
    } catch (error) {
        res.status(500).json({ error });
    }
}

const deleteMany = async (req, res) => {
    try {
        const userIds = req.body; // Assuming req.body is an array of user IDs
        const users = await User.find({ _id: { $in: userIds } });

        // Check for default users and filter them out
        const defaultUsers = process.env.DEFAULT_USERS;
        const filteredUsers = users.filter(user => !defaultUsers.includes(user.username));

        // Further filter out superAdmin users
        const nonSuperAdmins = filteredUsers.filter(user => user.role !== 'superAdmin');
        const nonSuperAdminIds = nonSuperAdmins.map(user => user._id);

        if (nonSuperAdminIds.length === 0) {
            return res.status(400).json({ message: "No users to delete or all users are protected." });
        }

        // Use UserService for bulk deletion
        const deletePromises = nonSuperAdminIds.map(userId => UserService.deleteUser(userId));
        const deleteResults = await Promise.all(deletePromises);

        const successfulDeletions = deleteResults.filter(result => result.success).length;
        res.status(200).json({ message: "done", deletedCount: successfulDeletions })
    } catch (err) {
        res.status(404).json({ message: "error", err })
    }
}

const edit = async (req, res) => {
    try {
        let { username, firstName, lastName, phoneNumber } = req.body

        const result = await UserService.updateUser(req.params.id, {
            username, firstName, lastName, phoneNumber
        });

        if (!result.success) {
            return res.status(400).json({ error: result.error });
        }

        res.status(200).json(result.result);
    } catch (err) {
        console.error('Failed to Update User:', err);
        res.status(400).json({ error: 'Failed to Update User' });
    }
}


/**
 * @api {post} /api/user/login User Login
 * @apiName Login
 * @apiGroup Authentication
 * @apiVersion 1.0.0
 * 
 * @apiDescription Authenticate user and return JWT token
 * 
 * @apiBody {String} username User's email address
 * @apiBody {String} password User's password
 * 
 * @apiSuccess {String} token JWT authentication token
 * @apiSuccess {Object} user User information
 * @apiSuccess {String} user._id User ID
 * @apiSuccess {String} user.username User's email
 * @apiSuccess {String} user.firstName User's first name
 * @apiSuccess {String} user.lastName User's last name
 * @apiSuccess {String} user.role User's role
 * 
 * @apiHeader {String} Authorization Bearer token
 * 
 * @apiError {String} error Validation error message
 * @apiError {String} error Authentication error message
 * 
 * @apiExample {curl} Example usage:
 *     curl -X POST http://localhost:5001/api/user/login \
 *       -H "Content-Type: application/json" \
 *       -d '{
 *         "username": "user@example.com",
 *         "password": "password123"
 *       }'
 */
const login = async (req, res) => {
    try {
        // Validate request body size
        if (!AuthValidationService.validateBodySize(req.body)) {
            return res.status(413).json({ error: 'Request body too large' });
        }

        // Sanitize and validate input
        const sanitizedData = AuthValidationService.sanitizeInput(req.body);
        const { error, value } = await AuthValidationService.validateLoginData(sanitizedData);
        
        if (error) {
            return res.status(400).json({ error: error.details[0].message });
        }

        const { username, password } = value;

        // Use AuthService for login logic
        const loginResult = await authService.login(username, password);
        
        if (!loginResult.success) {
            return res.status(401).json({ error: loginResult.error });
        }

        res.status(200)
            .setHeader('Authorization', `Bearer ${loginResult.token}`)
            .json({ token: loginResult.token, user: loginResult.user });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'An error occurred during login' });
    }
}

const changeRoles = async (req, res) => {
    try {
        const userId = req.params.id;

        let result = await User.updateOne({ _id: userId }, { $set: { roles: req.body } });

        res.status(200).json(result);

    } catch (error) {
        console.error('Failed to Change Role:', error);
        res.status(400).json({ error: 'Failed to Change Role' });
    }
}

module.exports = { register, login, adminRegister, index, deleteMany, view, deleteData, edit, changeRoles }