const path = require('path');
const fs = require('fs');
const apidoc = require('apidoc');

/**
 * Middleware to serve apidoc documentation
 * Generates documentation automatically from JSDoc comments
 */
const serveApiDoc = (req, res) => {
    try {
        // Generate documentation
        const result = apidoc.createDoc({
            src: path.join(__dirname, '../controllers'),
            dest: path.join(__dirname, '../public/docs'),
            template: path.join(__dirname, '../node_modules/apidoc/template'),
            config: path.join(__dirname, '../apidoc.json'),
            apiprivate: false,
            verbose: false,
            debug: false,
            single: false,
            colorize: false,
            markdown: false,
            config: path.join(__dirname, '../apidoc.json')
        });

        if (result === false) {
            return res.status(500).json({ error: 'Failed to generate API documentation' });
        }

        // Serve the generated documentation
        const indexPath = path.join(__dirname, '../public/docs/index.html');
        
        if (fs.existsSync(indexPath)) {
            res.sendFile(indexPath);
        } else {
            res.status(404).json({ error: 'Documentation not found' });
        }
    } catch (error) {
        console.error('Error serving API documentation:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

/**
 * Generate documentation and serve static files
 */
const generateAndServeDocs = (req, res) => {
    try {
        // Ensure docs directory exists
        const docsDir = path.join(__dirname, '../public/docs');
        if (!fs.existsSync(docsDir)) {
            fs.mkdirSync(docsDir, { recursive: true });
        }

        // Generate documentation
        const result = apidoc.createDoc({
            src: path.join(__dirname, '../controllers'),
            dest: docsDir,
            template: path.join(__dirname, '../node_modules/apidoc/template'),
            config: path.join(__dirname, '../apidoc.json'),
            apiprivate: false,
            verbose: false,
            debug: false,
            single: false,
            colorize: false,
            markdown: false
        });

        if (result === false) {
            return res.status(500).json({ error: 'Failed to generate API documentation' });
        }

        // Serve the index.html file
        const indexPath = path.join(docsDir, 'index.html');
        if (fs.existsSync(indexPath)) {
            res.sendFile(indexPath);
        } else {
            res.status(404).json({ error: 'Documentation not found' });
        }
    } catch (error) {
        console.error('Error generating API documentation:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

module.exports = {
    serveApiDoc,
    generateAndServeDocs
}; 